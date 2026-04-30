import { Injectable } from '@angular/core';
import { Product } from '../../../features/ecommerce/models/product.model';

export interface RecentlyViewedProduct {
  id: number;
  name: string;
  imageUrl?: string | null;
  categoryName?: string | null;
  price: number;
  viewedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecentlyViewedProductsService {
  private readonly storageKey = 'crediguard_recently_viewed_products';
  private readonly maxItems = 6;

  getAll(): RecentlyViewedProduct[] {
    if (!this.canUseStorage()) {
      return [];
    }

    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw) as RecentlyViewedProduct[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  add(product: Product): RecentlyViewedProduct[] {
    const item: RecentlyViewedProduct = {
      id: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      categoryName: product.categoryName,
      price: product.finalPrice ?? product.currentPrice ?? product.basePrice,
      viewedAt: new Date().toISOString()
    };

    const next = [
      item,
      ...this.getAll().filter(existing => existing.id !== product.id)
    ].slice(0, this.maxItems);

    if (this.canUseStorage()) {
      localStorage.setItem(this.storageKey, JSON.stringify(next));
    }

    return next;
  }

  clear(): void {
    if (this.canUseStorage()) {
      localStorage.removeItem(this.storageKey);
    }
  }

  private canUseStorage(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }
}

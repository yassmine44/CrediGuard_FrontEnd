import { Injectable } from '@angular/core';
import { Product } from '../../../features/ecommerce/models/product.model';

export interface WishlistProduct {
  id: number;
  name: string;
  imageUrl?: string | null;
  categoryName?: string | null;
  price: number;
  savedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class WishlistProductsService {
  private readonly storageKey = 'crediguard_wishlist_products';

  getAll(): WishlistProduct[] {
    if (!this.canUseStorage()) {
      return [];
    }

    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw) as WishlistProduct[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  isSaved(productId: number): boolean {
    return this.getAll().some(item => item.id === productId);
  }

  toggle(product: Product): WishlistProduct[] {
    const existing = this.getAll();

    const next = existing.some(item => item.id === product.id)
      ? existing.filter(item => item.id !== product.id)
      : [
          this.toWishlistProduct(product),
          ...existing
        ];

    if (this.canUseStorage()) {
      localStorage.setItem(this.storageKey, JSON.stringify(next));
    }

    return next;
  }

  remove(productId: number): WishlistProduct[] {
    const next = this.getAll().filter(item => item.id !== productId);

    if (this.canUseStorage()) {
      localStorage.setItem(this.storageKey, JSON.stringify(next));
    }

    return next;
  }

  private toWishlistProduct(product: Product): WishlistProduct {
    return {
      id: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      categoryName: product.categoryName,
      price: product.finalPrice ?? product.currentPrice ?? product.basePrice,
      savedAt: new Date().toISOString()
    };
  }

  private canUseStorage(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }
}

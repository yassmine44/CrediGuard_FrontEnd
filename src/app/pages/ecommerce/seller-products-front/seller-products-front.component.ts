import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ProductService } from '../../../features/ecommerce/services/product.service';
import { Product } from '../../../features/ecommerce/models/product.model';

@Component({
  selector: 'app-seller-products-front',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe],
  templateUrl: './seller-products-front.component.html',
  styleUrl: './seller-products-front.component.scss'
})
export class SellerProductsFrontComponent implements OnInit {
  private productService = inject(ProductService);

  products = signal<Product[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  deletingId = signal<number | null>(null);

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading.set(true);
    this.error.set(null);

    this.productService.getMine().subscribe({
      next: (data) => {
        this.products.set(data);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        console.error('Failed to load seller products:', err);
        this.error.set('Failed to load your products.');
        this.loading.set(false);
      }
    });
  }

  deleteProduct(id: number): void {
    const confirmed = window.confirm('Are you sure you want to delete this product?');
    if (!confirmed) return;

    this.deletingId.set(id);
    this.error.set(null);

    this.productService.delete(id).subscribe({
      next: () => {
        this.products.set(this.products().filter(product => product.id !== id));
        this.deletingId.set(null);
      },
      error: (err: unknown) => {
        console.error('Failed to delete product:', err);
        this.error.set('Failed to delete product.');
        this.deletingId.set(null);
      }
    });
  }

  getDisplayPrice(product: Product): number {
    return product.currentPrice ?? product.basePrice ?? 0;
  }

  getImageUrl(imageUrl?: string | null): string {
    return this.productService.getImageUrl(imageUrl);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/default-product.png';
  }

  trackByProductId(index: number, product: Product): number {
    return product.id;
  }
}
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { CartService } from '../services/cart.service';
import { Cart } from '../models/cart.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit {
  private cartService = inject(CartService);

  cart = signal<Cart | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  actionLoading = signal(false);

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.loading.set(true);
    this.error.set(null);

    this.cartService.getMyCart().subscribe({
      next: (data) => {
        this.cart.set(data);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        console.error('Failed to load cart:', err);
        this.error.set('Failed to load cart.');
        this.loading.set(false);
      }
    });
  }

  increaseQuantity(itemId: number, currentQuantity: number): void {
    this.actionLoading.set(true);

    this.cartService.updateItem(itemId, {
      quantity: currentQuantity + 1
    }).subscribe({
      next: (data) => {
        this.cart.set(data);
        this.actionLoading.set(false);
      },
      error: (err: unknown) => {
        console.error('Failed to increase quantity:', err);
        this.error.set('Failed to update quantity.');
        this.actionLoading.set(false);
      }
    });
  }

  decreaseQuantity(itemId: number, currentQuantity: number): void {
    if (currentQuantity <= 1) {
      this.removeItem(itemId);
      return;
    }

    this.actionLoading.set(true);

    this.cartService.updateItem(itemId, {
      quantity: currentQuantity - 1
    }).subscribe({
      next: (data) => {
        this.cart.set(data);
        this.actionLoading.set(false);
      },
      error: (err: unknown) => {
        console.error('Failed to decrease quantity:', err);
        this.error.set('Failed to update quantity.');
        this.actionLoading.set(false);
      }
    });
  }

  removeItem(itemId: number): void {
    this.actionLoading.set(true);

    this.cartService.removeItem(itemId).subscribe({
      next: (data) => {
        this.cart.set(data);
        this.actionLoading.set(false);
      },
      error: (err: unknown) => {
        console.error('Failed to remove item:', err);
        this.error.set('Failed to remove item.');
        this.actionLoading.set(false);
      }
    });
  }

  clearCart(): void {
    this.actionLoading.set(true);

    this.cartService.clearCart().subscribe({
      next: (data) => {
        this.cart.set(data);
        this.actionLoading.set(false);
      },
      error: (err: unknown) => {
        console.error('Failed to clear cart:', err);
        this.error.set('Failed to clear cart.');
        this.actionLoading.set(false);
      }
    });
  }

  getImageUrl(imageUrl?: string | null): string {
    if (!imageUrl || !imageUrl.trim()) {
      return 'assets/default-product.png';
    }

    const value = imageUrl.trim().replace(/^"+|"+$/g, '');

    if (value.startsWith('http://') || value.startsWith('https://')) {
      return value;
    }

    if (value.startsWith('/uploads/')) {
      return `http://localhost:8089/api${value}`;
    }

    return 'assets/default-product.png';
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/default-product.png';
  }
}
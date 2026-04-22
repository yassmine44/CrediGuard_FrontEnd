import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ProductService } from '../../../features/ecommerce/services/product.service';
import { CartService } from '../services/cart.service';
import { Product } from '../../../features/ecommerce/models/product.model';

@Component({
  selector: 'app-product-detail-front',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './product-detail-front.component.html',
  styleUrl: './product-detail-front.component.scss'
})
export class ProductDetailFrontComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cartService = inject(CartService);

  product = signal<Product | null>(null);
  sellerProducts = signal<Product[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  quantity = 1;
  addingToCart = false;
  addToCartMessage = '';

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));

      if (!id) {
        this.error.set('Invalid product id.');
        return;
      }

      this.loadProduct(id);
    });
  }

  loadProduct(id: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.product.set(null);
    this.sellerProducts.set([]);
    this.addToCartMessage = '';
    this.quantity = 1;

    this.productService.getById(id).subscribe({
      next: (data) => {
        this.product.set(data);
        this.loading.set(false);

        if (data.sellerId) {
          this.loadSellerProducts(data.sellerId, data.id);
        }
      },
      error: (err: unknown) => {
        console.error('Failed to load product:', err);
        this.error.set('Failed to load product details.');
        this.loading.set(false);
      }
    });
  }

  loadSellerProducts(sellerId: number, currentProductId: number): void {
    this.productService.getBySeller(sellerId).subscribe({
      next: (data: Product[]) => {
        this.sellerProducts.set(data.filter(p => p.id !== currentProductId));
      },
      error: (err: unknown) => {
        console.error('Failed to load seller products:', err);
      }
    });
  }

 addToCart(productId: number): void {
  if (this.quantity < 1) {
    this.addToCartMessage = 'Quantity must be at least 1.';
    return;
  }

  this.addingToCart = true;
  this.addToCartMessage = '';

  this.cartService.addItem({
    productId,
    quantity: this.quantity
  }).subscribe({
    next: () => {
      this.addToCartMessage = 'Product added to cart successfully.';
      this.addingToCart = false;
    },
    error: (err: unknown) => {
      console.error('Failed to add product to cart:', err);
      this.addToCartMessage = 'Failed to add product to cart.';
      this.addingToCart = false;
    }
  });
}

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/default-product.png';
  }

  getImageUrl(imageUrl?: string | null): string {
    return this.productService.getImageUrl(imageUrl);
  }
}
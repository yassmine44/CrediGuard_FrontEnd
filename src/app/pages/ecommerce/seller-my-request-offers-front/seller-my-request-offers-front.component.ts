import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ProductRequestService } from '../../../pages/ecommerce/services/product-request.service';
import { ProductRequestOffer, ProductRequestOfferStatus } from '../../../pages/ecommerce/models/product-request.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-seller-my-request-offers-front',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, CurrencyPipe],
  templateUrl: './seller-my-request-offers-front.component.html',
  styleUrl: './seller-my-request-offers-front.component.scss'
})
export class SellerMyRequestOffersFrontComponent implements OnInit {
  private productRequestService = inject(ProductRequestService);
  private authService = inject(AuthService);

  loading = signal(false);
  error = signal<string | null>(null);
  offers = signal<ProductRequestOffer[]>([]);

  ngOnInit(): void {
    this.loadMyOffers();
  }

  loadMyOffers(): void {
    this.loading.set(true);
    this.error.set(null);

    const sellerId = this.getCurrentSellerId();
    if (!sellerId) {
      this.error.set('Unable to identify the current seller.');
      this.loading.set(false);
      return;
    }

    this.productRequestService.getMyOffers(sellerId).subscribe({
      next: (data) => {
        this.offers.set(data ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load seller offers', err);
        this.error.set('Failed to load your offers.');
        this.loading.set(false);
      }
    });
  }

  getStatusClass(status: ProductRequestOfferStatus): string {
    switch (status) {
      case 'PENDING':
        return 'status-pending';
      case 'ACCEPTED':
        return 'status-accepted';
      case 'REJECTED':
        return 'status-rejected';
      default:
        return '';
    }
  }

  private getCurrentSellerId(): number | null {
    const user = this.authService.getUser();
    if (!user) return 2; // temporaire si currentUser n'a pas id

    const id = user['id'] ?? user['userId'] ?? user['userid'];
    const numericId = Number(id);

    return Number.isFinite(numericId) && numericId > 0 ? numericId : 2;
  }
}
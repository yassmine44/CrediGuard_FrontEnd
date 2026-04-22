import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ProductRequestService } from '../../../pages/ecommerce/services/product-request.service';
import {
  ProductRequest,
  ProductRequestOffer
} from '../../../pages/ecommerce/models/product-request.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-product-request-detail-front',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, CurrencyPipe],
  templateUrl: './product-request-detail-front.component.html',
  styleUrl: './product-request-detail-front.component.scss'
})
export class ProductRequestDetailFrontComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productRequestService = inject(ProductRequestService);
  private authService = inject(AuthService);

  request = signal<ProductRequest | null>(null);
  offers = signal<ProductRequestOffer[]>([]);

  loading = signal(false);
  offersLoading = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  actionOfferId = signal<number | null>(null);

  requestId: number | null = null;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));

      if (!id || Number.isNaN(id)) {
        this.error.set('Invalid request id.');
        return;
      }

      this.requestId = id;
      this.loadRequest(id);
      this.loadOffers(id);
    });
  }

  loadRequest(requestId: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.productRequestService.getRequestById(requestId).subscribe({
      next: (data) => {
        this.request.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load request details', err);
        this.error.set(err?.error?.error || 'Failed to load request details.');
        this.loading.set(false);
      }
    });
  }

  loadOffers(requestId: number): void {
    this.offersLoading.set(true);

    this.productRequestService.getOffersForRequest(requestId).subscribe({
      next: (data) => {
        this.offers.set(data ?? []);
        this.offersLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load offers', err);
        this.error.set(err?.error?.error || 'Failed to load offers.');
        this.offersLoading.set(false);
      }
    });
  }

  acceptOffer(offerId: number): void {
    const clientId = this.getCurrentClientId();

    if (!clientId) {
      this.error.set('Client not identified.');
      return;
    }

    const confirmed = window.confirm('Do you want to accept this offer and continue to checkout?');
    if (!confirmed) return;

    this.actionOfferId.set(offerId);
    this.error.set(null);
    this.successMessage.set(null);

    this.productRequestService.acceptOffer(offerId, clientId).subscribe({
      next: () => {
        this.actionOfferId.set(null);
        this.successMessage.set('Offer accepted. Product added to cart. Redirecting to checkout...');

        setTimeout(() => {
          this.router.navigate(['/front/checkout']);
        }, 800);
      },
      error: (err) => {
        console.error('Failed to accept offer', err);
        this.actionOfferId.set(null);
        this.error.set(err?.error?.error || err?.error?.message || 'Failed to accept offer.');
      }
    });
  }

  rejectOffer(offerId: number): void {
    const clientId = this.getCurrentClientId();

    if (!clientId) {
      this.error.set('Client not identified.');
      return;
    }

    const confirmed = window.confirm('Do you want to reject this offer?');
    if (!confirmed) return;

    this.actionOfferId.set(offerId);
    this.error.set(null);
    this.successMessage.set(null);

    this.productRequestService.rejectOffer(offerId, clientId).subscribe({
      next: () => {
        this.actionOfferId.set(null);
        this.successMessage.set('Offer rejected successfully.');

        if (this.requestId) {
          this.loadOffers(this.requestId);
          this.loadRequest(this.requestId);
        }
      },
      error: (err) => {
        console.error('Failed to reject offer', err);
        this.actionOfferId.set(null);
        this.error.set(err?.error?.error || 'Failed to reject offer.');
      }
    });
  }

  canAcceptOrRejectRequest(status: string | null | undefined): boolean {
    if (!status) return false;
    return status === 'OPEN' || status === 'OFFERED';
  }

  canRejectOffer(status: string | null | undefined): boolean {
    return status === 'PENDING';
  }

  getRequestStatusClass(status: string | null | undefined): string {
    switch (status) {
      case 'OPEN':
        return 'status-open';
      case 'OFFERED':
        return 'status-offered';
      case 'ACCEPTED':
        return 'status-accepted';
      case 'REJECTED':
        return 'status-rejected';
      case 'CANCELLED':
        return 'status-cancelled';
      case 'CLOSED':
        return 'status-closed';
      default:
        return 'status-default';
    }
  }

  getOfferStatusClass(status: string | null | undefined): string {
    switch (status) {
      case 'PENDING':
        return 'status-pending';
      case 'ACCEPTED':
        return 'status-accepted';
      case 'REJECTED':
        return 'status-rejected';
      default:
        return 'status-default';
    }
  }

  private getCurrentClientId(): number | null {
    const user = this.authService.getUser();
    if (!user) return null;

    const id = user['id'] ?? user['userId'] ?? user['userid'];
    const numericId = Number(id);

    return Number.isFinite(numericId) && numericId > 0 ? numericId : null;
  }
}
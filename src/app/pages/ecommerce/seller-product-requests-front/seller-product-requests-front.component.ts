import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ProductRequestService } from '../../../pages/ecommerce/services/product-request.service';
import { ProductRequest, ProductRequestStatus } from '../../../pages/ecommerce/models/product-request.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-seller-product-requests-front',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, CurrencyPipe],
  templateUrl: './seller-product-requests-front.component.html',
  styleUrl: './seller-product-requests-front.component.scss'
})
export class SellerProductRequestsFrontComponent implements OnInit {
  private productRequestService = inject(ProductRequestService);
  private authService = inject(AuthService);

  loading = signal(false);
  error = signal<string | null>(null);
  requests = signal<ProductRequest[]>([]);

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.loading.set(true);
    this.error.set(null);

    const sellerId = this.getCurrentSellerId();

    this.productRequestService.getOpenRequests().subscribe({
      next: (openRequests) => {
        if (!sellerId) {
          this.requests.set(openRequests ?? []);
          this.loading.set(false);
          return;
        }

        this.productRequestService.getRequestsForTargetSeller(sellerId).subscribe({
          next: (targetedRequests) => {
            const openList = openRequests ?? [];
            const targetedList = targetedRequests ?? [];

            const merged = [...openList];

            for (const targeted of targetedList) {
              if (!merged.some(r => r.id === targeted.id)) {
                merged.push(targeted);
              }
            }

            this.requests.set(merged);
            this.loading.set(false);
          },
          error: (err) => {
            console.error('Failed to load targeted requests', err);
            this.requests.set(openRequests ?? []);
            this.loading.set(false);
          }
        });
      },
      error: (err) => {
        console.error('Failed to load seller product requests', err);
        this.error.set('Failed to load product requests.');
        this.loading.set(false);
      }
    });
  }

  getStatusClass(status: ProductRequestStatus): string {
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
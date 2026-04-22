import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ProductRequestService } from '../../../pages/ecommerce/services/product-request.service';
import { ProductRequest, ProductRequestStatus } from '../../../pages/ecommerce/models/product-request.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-my-product-requests-front',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, CurrencyPipe],
  templateUrl: './my-product-requests-front.component.html',
  styleUrl: './my-product-requests-front.component.scss'
})
export class MyProductRequestsFrontComponent implements OnInit {
  private productRequestService = inject(ProductRequestService);
  private authService = inject(AuthService);

  loading = signal(false);
  cancellingId = signal<number | null>(null);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  requests = signal<ProductRequest[]>([]);

  ngOnInit(): void {
    this.loadMyRequests();
  }

  loadMyRequests(): void {
    this.error.set(null);
    this.successMessage.set(null);

    const clientId = this.getCurrentUserId();
    if (!clientId) {
      this.error.set('You must be logged in to view your product requests.');
      return;
    }

    this.loading.set(true);

    this.productRequestService.getMyRequests(clientId).subscribe({
      next: (data) => {
        this.requests.set(data ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load my product requests', err);
        this.error.set('Failed to load your product requests.');
        this.loading.set(false);
      }
    });
  }

  cancelRequest(requestId: number): void {
    const clientId = this.getCurrentUserId();
    if (!clientId) {
      this.error.set('You must be logged in to cancel a request.');
      return;
    }

    const confirmed = window.confirm('Are you sure you want to cancel this request?');
    if (!confirmed) return;

    this.cancellingId.set(requestId);
    this.error.set(null);
    this.successMessage.set(null);

    this.productRequestService.cancelRequest(requestId, clientId).subscribe({
      next: () => {
        this.successMessage.set('Request cancelled successfully.');
        this.cancellingId.set(null);
        this.loadMyRequests();
      },
      error: (err) => {
        console.error('Failed to cancel request', err);
        this.error.set(err?.error?.message || 'Failed to cancel the request.');
        this.cancellingId.set(null);
      }
    });
  }

  canCancel(status: ProductRequestStatus): boolean {
    return status === 'OPEN' || status === 'OFFERED';
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

  private getCurrentUserId(): number | null {
    const user = this.authService.getUser();
    if (!user) return null;

    const id = user['id'] ?? user['userId'] ?? user['userid'];
    const numericId = Number(id);

    return Number.isFinite(numericId) && numericId > 0 ? numericId : null;
  }
}
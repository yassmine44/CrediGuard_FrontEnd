import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ProductRequestAdminService } from '../../../services/product-request-admin.service';
import {
  ProductRequestResponse,
  ProductRequestStatus
} from '../../../models/product-request.model';

@Component({
  selector: 'app-admin-product-requests',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, DatePipe, CurrencyPipe],
  templateUrl: './admin-product-requests.component.html',
  styleUrl: './admin-product-requests.component.scss'
})
export class AdminProductRequestsComponent implements OnInit {
  private service = inject(ProductRequestAdminService);

  loading = signal(false);
  actionLoadingId = signal<number | null>(null);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  requests = signal<ProductRequestResponse[]>([]);

  selectedStatus = signal<ProductRequestStatus | 'ALL'>('ALL');
  searchTerm = signal('');

  readonly statuses: Array<ProductRequestStatus | 'ALL'> = [
    'ALL',
    'OPEN',
    'OFFERED',
    'ACCEPTED',
    'REJECTED',
    'CANCELLED',
    'CLOSED'
  ];

  readonly kpis = computed(() => {
    const data = this.requests();

    const total = data.length;
    const open = data.filter(r => r.status === 'OPEN').length;
    const offered = data.filter(r => r.status === 'OFFERED').length;
    const accepted = data.filter(r => r.status === 'ACCEPTED').length;
    const cancelled = data.filter(r => r.status === 'CANCELLED').length;
    const closed = data.filter(r => r.status === 'CLOSED').length;

    return [
      {
        title: 'Total Requests',
        value: total,
        subtitle: 'All client requests',
        cssClass: 'neutral'
      },
      {
        title: 'Open',
        value: open,
        subtitle: 'Waiting for offers',
        cssClass: 'open'
      },
      {
        title: 'Offered',
        value: offered,
        subtitle: 'Offers received',
        cssClass: 'offered'
      },
      {
        title: 'Accepted',
        value: accepted,
        subtitle: 'Accepted by clients',
        cssClass: 'accepted'
      },
      {
        title: 'Cancelled',
        value: cancelled,
        subtitle: 'Cancelled requests',
        cssClass: 'cancelled'
      },
      {
        title: 'Closed',
        value: closed,
        subtitle: 'Closed by admin',
        cssClass: 'closed'
      }
    ];
  });

  filteredRequests = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();

    return this.requests().filter(r => {
      const matchesSearch =
        !term ||
        r.title?.toLowerCase().includes(term) ||
        r.clientName?.toLowerCase().includes(term) ||
        r.categoryName?.toLowerCase().includes(term) ||
        r.targetSellerName?.toLowerCase().includes(term);

      return matchesSearch;
    });
  });

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.loading.set(true);
    this.error.set(null);

    const status = this.selectedStatus() === 'ALL'
      ? undefined
      : this.selectedStatus() as ProductRequestStatus;

    this.service.getAll(status).subscribe({
      next: (data: ProductRequestResponse[]) => {
        this.requests.set(data || []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading admin requests:', err);
        this.error.set('Unable to load product requests.');
        this.loading.set(false);
      }
    });
  }

  onStatusChange(value: string): void {
    this.selectedStatus.set(value as ProductRequestStatus | 'ALL');
    this.loadRequests();
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
  }

  trackByRequestId(_: number, item: ProductRequestResponse): number {
    return item.id;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'OPEN': return 'open';
      case 'OFFERED': return 'offered';
      case 'ACCEPTED': return 'accepted';
      case 'REJECTED': return 'rejected';
      case 'CANCELLED': return 'cancelled';
      case 'CLOSED': return 'closed';
      default: return 'default';
    }
  }

  canClose(request: ProductRequestResponse): boolean {
    return request.status === 'OPEN' || request.status === 'OFFERED';
  }

  canCancel(request: ProductRequestResponse): boolean {
    return request.status === 'OPEN' || request.status === 'OFFERED';
  }

  closeRequest(request: ProductRequestResponse): void {
    if (!this.canClose(request)) return;

    const confirmed = window.confirm(`Close request #${request.id} - "${request.title}" ?`);
    if (!confirmed) return;

    this.updateRequestStatus(request.id, 'CLOSED', 'Request closed successfully.');
  }

  cancelRequest(request: ProductRequestResponse): void {
    if (!this.canCancel(request)) return;

    const confirmed = window.confirm(`Cancel request #${request.id} - "${request.title}" ?`);
    if (!confirmed) return;

    this.updateRequestStatus(request.id, 'CANCELLED', 'Request cancelled successfully.');
  }

  private updateRequestStatus(
    requestId: number,
    status: ProductRequestStatus,
    successMessage: string
  ): void {
    this.actionLoadingId.set(requestId);
    this.error.set(null);
    this.successMessage.set(null);

    this.service.updateStatus(requestId, status).subscribe({
      next: (updated: ProductRequestResponse) => {
        this.requests.update(current =>
          current.map(item => item.id === updated.id ? updated : item)
        );
        this.successMessage.set(successMessage);
        this.actionLoadingId.set(null);
      },
      error: (err) => {
        console.error('Error updating request status:', err);
        this.error.set(err?.error?.message || 'Unable to update request status.');
        this.actionLoadingId.set(null);
      }
    });
  }
}
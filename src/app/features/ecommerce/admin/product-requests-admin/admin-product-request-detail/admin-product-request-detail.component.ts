import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ProductRequestAdminService } from '../../../services/product-request-admin.service';
import {
  ProductRequestOfferResponse,
  ProductRequestResponse,
  ProductRequestStatus
} from '../../../models/product-request.model';

@Component({
  selector: 'app-admin-product-request-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, DatePipe, CurrencyPipe],
  templateUrl: './admin-product-request-detail.component.html',
  styleUrl: './admin-product-request-detail.component.scss'
})
export class AdminProductRequestDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private service = inject(ProductRequestAdminService);

  loading = signal(false);
  actionLoading = signal(false);
  error = signal<string | null>(null);

  request = signal<ProductRequestResponse | null>(null);
  offers = signal<ProductRequestOfferResponse[]>([]);

  selectedStatus = signal<ProductRequestStatus | null>(null);

  readonly adminStatuses: ProductRequestStatus[] = [
    'OPEN',
    'OFFERED',
    'REJECTED',
    'CANCELLED',
    'CLOSED'
  ];

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error.set('Invalid request id.');
      return;
    }
    this.loadData(id);
  }

  loadData(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.service.getById(id).subscribe({
      next: (requestData) => {
        this.request.set(requestData);
        this.selectedStatus.set(requestData.status);

        this.service.getOffersByRequestId(id).subscribe({
          next: (offersData) => {
            this.offers.set(offersData || []);
            this.loading.set(false);
          },
          error: (err) => {
            console.error('Error loading offers:', err);
            this.error.set('Unable to load request offers.');
            this.loading.set(false);
          }
        });
      },
      error: (err) => {
        console.error('Error loading request details:', err);
        this.error.set('Unable to load request details.');
        this.loading.set(false);
      }
    });
  }

  updateStatus(): void {
    const current = this.request();
    const newStatus = this.selectedStatus();

    if (!current || !newStatus || current.status === newStatus) {
      return;
    }

    this.actionLoading.set(true);

    this.service.updateStatus(current.id, newStatus).subscribe({
      next: (updated) => {
        this.request.set(updated);
        this.actionLoading.set(false);
      },
      error: (err) => {
        console.error('Error updating request status:', err);
        this.error.set(err?.error?.message || 'Unable to update request status.');
        this.actionLoading.set(false);
      }
    });
  }

  getOfferStatusClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'pending';
      case 'ACCEPTED': return 'accepted';
      case 'REJECTED': return 'rejected';
      default: return 'default';
    }
  }
}
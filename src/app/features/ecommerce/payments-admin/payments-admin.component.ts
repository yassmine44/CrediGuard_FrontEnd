import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../services/payment.service';
import {
  PaymentResponse,
  PaymentStatus
} from '../models/payment.model';

@Component({
  selector: 'app-payments-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, CurrencyPipe],
  templateUrl: './payments-admin.component.html',
  styleUrl: './payments-admin.component.scss'
})
export class PaymentsAdminComponent implements OnInit {
  private paymentService = inject(PaymentService);

  payments = signal<PaymentResponse[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  editingId: number | null = null;
  paymentStatus: PaymentStatus = 'PENDING';
  transactionRef = '';

  ngOnInit(): void {
    this.loadPayments();
  }
  goBack(): void {
  window.history.back();
}

  loadPayments(): void {
    this.loading.set(true);
    this.error.set(null);

    this.paymentService.getAll().subscribe({
      next: (data) => {
        this.payments.set(data);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        console.error(err);
        this.error.set('Failed to load payments.');
        this.loading.set(false);
      }
    });
  }

  editPayment(payment: PaymentResponse): void {
    this.editingId = payment.id;
    this.paymentStatus = payment.paymentStatus;
    this.transactionRef = payment.transactionRef ?? '';
  }

  updatePayment(): void {
    if (!this.editingId) {
      return;
    }

    this.error.set(null);
    this.success.set(null);

    this.paymentService.update(this.editingId, {
      paymentStatus: this.paymentStatus,
      transactionRef: this.transactionRef.trim() || null
    }).subscribe({
      next: () => {
        this.success.set('Payment updated successfully.');
        this.resetForm();
        this.loadPayments();
      },
      error: (err: unknown) => {
        console.error(err);
        this.error.set('Failed to update payment.');
      }
    });
  }

  deletePayment(id: number): void {
    if (!confirm('Delete this payment?')) {
      return;
    }

    this.paymentService.delete(id).subscribe({
      next: () => {
        this.success.set('Payment deleted.');
        this.loadPayments();
      },
      error: (err: unknown) => {
        console.error(err);
        this.error.set('Failed to delete payment.');
      }
    });
  }

  resetForm(): void {
    this.editingId = null;
    this.paymentStatus = 'PENDING';
    this.transactionRef = '';
  }

  statusClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'badge pending';
      case 'PAID':
        return 'badge paid';
      case 'FAILED':
        return 'badge failed';
      case 'REFUNDED':
        return 'badge refunded';
      default:
        return 'badge';
    }
  }
}
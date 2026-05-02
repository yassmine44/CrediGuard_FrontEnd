import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeliveryService } from '../services/delivery.service';
import {
  DeliveryResponse,
  DeliveryStatus,
  DeliveryType,
  DeliverySlot
} from '../models/delivery.model';

@Component({
  selector: 'app-deliveries-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, CurrencyPipe],
  templateUrl: './deliveries-admin.component.html',
  styleUrl: './deliveries-admin.component.scss'
})
export class DeliveriesAdminComponent implements OnInit {
  private deliveryService = inject(DeliveryService);

  deliveries = signal<DeliveryResponse[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  editingId: number | null = null;

  deliveryType: DeliveryType = 'STANDARD';
  deliveryStatus: DeliveryStatus = 'PENDING';
  deliverySlot: DeliverySlot = 'MORNING';
  deliveryFee: number | null = null;
  scheduledAt = '';
  shippedAt = '';
  deliveredAt = '';
  trackingNumber = '';
  carrier = '';

  ngOnInit(): void {
    this.loadDeliveries();
  }

  loadDeliveries(): void {
    this.loading.set(true);
    this.error.set(null);

    this.deliveryService.getAll().subscribe({
      next: (data) => {
        this.deliveries.set(data);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        console.error(err);
        this.error.set('Failed to load deliveries.');
        this.loading.set(false);
      }
    });
  }
goBack(): void {
  window.history.back();
}
  editDelivery(delivery: DeliveryResponse): void {
    this.editingId = delivery.id;
    this.deliveryType = delivery.deliveryType;
    this.deliveryStatus = delivery.deliveryStatus;
    this.deliverySlot = delivery.deliverySlot;
    this.deliveryFee = delivery.deliveryFee;
    this.scheduledAt = delivery.scheduledAt ? delivery.scheduledAt.substring(0, 16) : '';
    this.shippedAt = delivery.shippedAt ? delivery.shippedAt.substring(0, 16) : '';
    this.deliveredAt = delivery.deliveredAt ? delivery.deliveredAt.substring(0, 16) : '';
    this.trackingNumber = delivery.trackingNumber ?? '';
    this.carrier = delivery.carrier ?? '';
  }

  updateDelivery(): void {
    if (!this.editingId) {
      return;
    }

    this.error.set(null);
    this.success.set(null);

    this.deliveryService.updateAdmin(this.editingId, {
      deliveryType: this.deliveryType,
      deliveryStatus: this.deliveryStatus,
      deliverySlot: this.deliverySlot,
      deliveryFee: this.deliveryFee,
      scheduledAt: this.scheduledAt || null,
      shippedAt: this.shippedAt || null,
      deliveredAt: this.deliveredAt || null,
      trackingNumber: this.trackingNumber.trim() || null,
      carrier: this.carrier.trim() || null
    }).subscribe({
      next: () => {
        this.success.set('Delivery updated successfully.');
        this.resetForm();
        this.loadDeliveries();
      },
      error: (err: unknown) => {
        console.error(err);
        this.error.set('Failed to update delivery.');
      }
    });
  }

  cancelDelivery(id: number): void {
    if (!confirm('Cancel this delivery?')) {
      return;
    }

    this.deliveryService.cancelAdmin(id).subscribe({
      next: () => {
        this.success.set('Delivery cancelled.');
        this.loadDeliveries();
      },
      error: (err: unknown) => {
        console.error(err);
        this.error.set('Failed to cancel delivery.');
      }
    });
  }

  resetForm(): void {
    this.editingId = null;
    this.deliveryType = 'STANDARD';
    this.deliveryStatus = 'PENDING';
    this.deliverySlot = 'MORNING';
    this.deliveryFee = null;
    this.scheduledAt = '';
    this.shippedAt = '';
    this.deliveredAt = '';
    this.trackingNumber = '';
    this.carrier = '';
  }

  
  statusClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'badge pending';
      case 'PENDING_REVIEW':
        return 'badge waiting';
      case 'WAITING_STOCK':
        return 'badge waiting';
      case 'IN_TRANSIT':
        return 'badge transit';
      case 'DELIVERED':
        return 'badge delivered';
      case 'CANCELLED':
        return 'badge cancelled';
      default:
        return 'badge';
    }
  }
  
}

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { OrderService } from '../services/order.service';
import { DeliveryService } from '../services/delivery.service';
import { PaymentService } from '../services/payment.service';

import { OrderResponse } from '../models/order.model';
import { DeliveryResponse } from '../models/delivery.model';
import { PaymentResponse } from '../models/payment.model';

@Component({
  selector: 'app-orders-front',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './orders-front.component.html',
  styleUrl: './orders-front.component.scss'
})
export class OrdersFrontComponent implements OnInit {

  private orderService = inject(OrderService);
  private deliveryService = inject(DeliveryService);
  private paymentService = inject(PaymentService);

  // Signals
  orders = signal<OrderResponse[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  selectedStatus = signal<string>('ALL');

  // Pagination
  currentPage = signal(1);
  itemsPerPage = signal(8);   // Tu peux changer ce nombre (6, 8, 10, 12...)

  deliveries = signal<Record<number, DeliveryResponse | null>>({});
  payments = signal<Record<number, PaymentResponse | null>>({});

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.error.set(null);

    this.orderService.getMyOrders().subscribe({
      next: (data) => {
        this.orders.set(data);
        this.loading.set(false);

        // Charger les infos de livraison et paiement
        data.forEach(order => {
          this.loadDelivery(order.id);
          this.loadPayment(order.id);
        });
      },
      error: (err: unknown) => {
        console.error('Failed to load orders:', err);
        this.error.set('Failed to load orders.');
        this.loading.set(false);
      }
    });
  }

  // Filtrage par statut
  filteredOrders = computed<OrderResponse[]>(() => {
    const allOrders = this.orders();
    const status = this.selectedStatus();

    if (status === 'ALL') {
      return allOrders;
    }

    return allOrders.filter(order => order.status === status);
  });

  // Pagination calculée
  paginatedOrders = computed<OrderResponse[]>(() => {
    const filtered = this.filteredOrders();
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    return filtered.slice(start, start + this.itemsPerPage());
  });

  totalPages = computed<number>(() => {
    return Math.ceil(this.filteredOrders().length / this.itemsPerPage());
  });

  pageNumbers = computed<number[]>(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
    return pages;
  });

  // Méthodes de pagination
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  selectStatus(status: string): void {
    this.selectedStatus.set(status);
    this.currentPage.set(1);   // Retour à la première page quand on change de filtre
  }

  // Chargement des données associées
  loadDelivery(orderId: number): void {
    this.deliveryService.getByOrderId(orderId).subscribe({
      next: (delivery) => {
        this.deliveries.update(current => ({ ...current, [orderId]: delivery }));
      },
      error: () => {
        this.deliveries.update(current => ({ ...current, [orderId]: null }));
      }
    });
  }

  loadPayment(orderId: number): void {
    this.paymentService.getByOrder(orderId).subscribe({
      next: (payment) => {
        this.payments.update(current => ({ ...current, [orderId]: payment }));
      },
      error: () => {
        this.payments.update(current => ({ ...current, [orderId]: null }));
      }
    });
  }

  getDelivery(orderId: number): DeliveryResponse | null {
    return this.deliveries()[orderId] ?? null;
  }

  getPayment(orderId: number): PaymentResponse | null {
    return this.payments()[orderId] ?? null;
  }

  hasOrders(): boolean {
    return this.orders().length > 0;
  }

  // Classes pour les statuts
  getOrderStatusClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'badge pending';
      case 'CONFIRMED': return 'badge confirmed';
      case 'CANCELLED': return 'badge cancelled';
      default: return 'badge';
    }
  }

  deliveryStatusClass(status?: string | null): string {
    switch (status) {
      case 'PENDING': return 'badge pending';
      case 'WAITING_STOCK': return 'badge waiting';
      case 'IN_TRANSIT': return 'badge transit';
      case 'DELIVERED': return 'badge delivered';
      case 'CANCELLED': return 'badge cancelled';
      default: return 'badge';
    }
  }

  paymentStatusClass(status?: string | null): string {
    switch (status) {
      case 'PENDING': return 'badge pending';
      case 'PAID': return 'badge paid';
      case 'FAILED': return 'badge failed';
      case 'REFUNDED': return 'badge refunded';
      default: return 'badge';
    }
  }
}
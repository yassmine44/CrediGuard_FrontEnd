import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { OrderService } from '../services/order.service';
import { DeliveryService } from '../services/delivery.service';
import { PaymentService } from '../services/payment.service';

import { OrderResponse, OrderItemResponse } from '../models/order.model';
import { DeliveryResponse } from '../models/delivery.model';
import { PaymentResponse } from '../models/payment.model';


@Component({
  selector: 'app-order-detail-front',
  standalone: true,
 imports: [CommonModule, RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './order-detail-front.component.html',
  styleUrl: './order-detail-front.component.scss'
})
export class OrderDetailFrontComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  private deliveryService = inject(DeliveryService);
  private paymentService = inject(PaymentService);

  order = signal<OrderResponse | null>(null);
  delivery = signal<DeliveryResponse | null>(null);
  payment = signal<PaymentResponse | null>(null);

  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const orderId = Number(params.get('id'));
      if (!orderId) {
        this.error.set('Invalid order ID');
        return;
      }
      this.loadOrderDetail(orderId);
    });
  }

  private loadOrderDetail(orderId: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.orderService.getOrderById(orderId).subscribe({
      next: (orderData) => {
        this.order.set(orderData);
        this.loading.set(false);

        this.loadDelivery(orderId);
        this.loadPayment(orderId);
      },
      error: (err) => {
        console.error('Failed to load order:', err);
        this.error.set('Failed to load order details.');
        this.loading.set(false);
      }
    });
  }

  private loadDelivery(orderId: number): void {
    this.deliveryService.getByOrderId(orderId).subscribe({
      next: (data) => this.delivery.set(data),
      error: () => this.delivery.set(null)
    });
  }

  private loadPayment(orderId: number): void {
    this.paymentService.getByOrder(orderId).subscribe({
      next: (data) => this.payment.set(data),
      error: () => this.payment.set(null)
    });
  }

  // Helper pour récupérer l'image depuis OrderItemResponse
  getImageUrl(item: OrderItemResponse): string {
    // Si ton modèle OrderItemResponse n'a pas imageUrl, on retourne l'image par défaut
    // Tu peux modifier cette logique plus tard si tu ajoutes imageUrl dans le backend
    return 'assets/default-product.png';
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/default-product.png';
  }

  getOrderStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PENDING':    return 'badge pending';
      case 'CONFIRMED':  return 'badge confirmed';
      case 'CANCELLED':  return 'badge cancelled';
      case 'COMPLETED':  return 'badge delivered';
      default:           return 'badge';
    }
  }

  deliveryStatusClass(status?: string | null): string {
    switch (status?.toUpperCase()) {
      case 'PENDING':      return 'badge pending';
      case 'IN_TRANSIT':   return 'badge transit';
      case 'DELIVERED':    return 'badge delivered';
      case 'CANCELLED':    return 'badge cancelled';
      default:             return 'badge';
    }
  }

  paymentStatusClass(status?: string | null): string {
    switch (status?.toUpperCase()) {
      case 'PENDING': return 'badge pending';
      case 'PAID':    return 'badge paid';
      case 'FAILED':  return 'badge failed';
      default:        return 'badge';
    }
  }
}
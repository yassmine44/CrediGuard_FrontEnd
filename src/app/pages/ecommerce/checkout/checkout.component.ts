import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { CartService } from '../services/cart.service';
import { DeliveryAddressService } from '../services/delivery-address.service';
import { CheckoutService } from '../services/checkout.service';

import { Cart } from '../models/cart.model';
import { DeliveryAddressResponse } from '../models/delivery-address.model';
import { DeliverySlot, DeliveryType } from '../models/delivery.model';
import { PaymentType } from '../models/payment.model';
import { CheckoutResponse } from '../models/checkout.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, CurrencyPipe],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit {
  private cartService = inject(CartService);
  private deliveryAddressService = inject(DeliveryAddressService);
  private checkoutService = inject(CheckoutService);
  private router = inject(Router);

  cart = signal<Cart | null>(null);
  loading = signal(false);
  placingOrder = signal(false);
  savingAddress = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  savedAddress = signal<DeliveryAddressResponse | null>(null);
  checkoutResult = signal<CheckoutResponse | null>(null);

  promoCode = '';

  fullName = '';
  phone = '';
  city = '';
  addressLine = '';
  additionalInfo = '';

  deliveryType: DeliveryType = 'STANDARD';
  deliverySlot: DeliverySlot = 'MORNING';
  paymentType: PaymentType = 'CARD';
  scheduledAt = '';

  deliveryFee = computed(() => this.deliveryType === 'EXPRESS' ? 15 : 8);

  productsTotal = computed(() => this.cart()?.total ?? 0);

finalTotal = computed(() => this.productsTotal() + this.deliveryFee());

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.loading.set(true);
    this.error.set(null);

    this.cartService.getMyCart().subscribe({
      next: (data) => {
        this.cart.set(data);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        console.error('Failed to load cart:', err);
        this.error.set('Failed to load cart.');
        this.loading.set(false);
      }
    });
  }

  saveDeliveryAddress(): void {
    if (!this.fullName.trim() || !this.phone.trim() || !this.city.trim() || !this.addressLine.trim()) {
      this.error.set('Please fill in all required delivery address fields.');
      return;
    }

    this.savingAddress.set(true);
    this.error.set(null);
    this.successMessage.set(null);

    this.deliveryAddressService.create({
      fullName: this.fullName.trim(),
      phone: this.phone.trim(),
      city: this.city.trim(),
      addressLine: this.addressLine.trim(),
      additionalInfo: this.additionalInfo.trim() || null
    }).subscribe({
      next: (address) => {
        this.savedAddress.set(address);
        this.successMessage.set('Delivery address saved successfully.');
        this.savingAddress.set(false);
      },
      error: (err: unknown) => {
        console.error('Failed to save delivery address:', err);
        this.error.set('Failed to save delivery address.');
        this.savingAddress.set(false);
      }
    });
  }

  placeOrder(): void {
    const currentCart = this.cart();
    const address = this.savedAddress();

    if (!currentCart || !currentCart.items.length) {
      this.error.set('Your cart is empty.');
      return;
    }

    if (!address) {
      this.error.set('Please save a delivery address first.');
      return;
    }

    this.placingOrder.set(true);
    this.error.set(null);
    this.successMessage.set(null);

    this.checkoutService.checkout({
      addressId: address.id,
      paymentType: this.paymentType,
      deliveryType: this.deliveryType,
      deliverySlot: this.deliverySlot,
      scheduledAt: this.scheduledAt ? this.scheduledAt : null,
      promoCode: this.promoCode.trim() || null
    }).subscribe({
      next: (result) => {
        this.checkoutResult.set(result);
        this.successMessage.set('Checkout completed successfully.');
        this.placingOrder.set(false);

        this.loadCart();

        setTimeout(() => {
          this.router.navigate(['/front/orders']);
        }, 1200);
      },
      error: (err: any) => {
        console.error('Checkout failed:', err);
        this.error.set(err?.error?.message || 'Checkout failed.');
        this.placingOrder.set(false);
      }
    });
  }

  getImageUrl(imageUrl?: string | null): string {
    if (!imageUrl || !imageUrl.trim()) {
      return 'assets/default-product.png';
    }

    const value = imageUrl.trim().replace(/^"+|"+$/g, '');

    if (value.startsWith('http://') || value.startsWith('https://')) {
      return value;
    }

    if (value.startsWith('/uploads/')) {
      return `http://localhost:8089/api${value}`;
    }

    return 'assets/default-product.png';
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/default-product.png';
  }
  
}
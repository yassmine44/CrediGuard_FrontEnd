import { Component, OnDestroy, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import type * as Leaflet from 'leaflet';

import { CartService } from '../services/cart.service';
import { DeliveryAddressService } from '../services/delivery-address.service';
import { CheckoutService } from '../services/checkout.service';
import { DeliveryZoneService } from '../services/delivery-zone.service';
import { StripeCheckoutService } from '../services/stripe-checkout.service';

import { Cart } from '../models/cart.model';
import { DeliveryAddressResponse } from '../models/delivery-address.model';
import { DeliverySlot, DeliveryType } from '../models/delivery.model';
import { PaymentType } from '../models/payment.model';
import { CheckoutResponse } from '../models/checkout.model';
import { DeliveryFeeCheckResponse } from '../models/delivery-zone.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, CurrencyPipe],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit, OnDestroy {
  private cartService = inject(CartService);
  private deliveryAddressService = inject(DeliveryAddressService);
  private checkoutService = inject(CheckoutService);
  private deliveryZoneService = inject(DeliveryZoneService);
  private stripeCheckoutService = inject(StripeCheckoutService);
  private router = inject(Router);

  cart = signal<Cart | null>(null);
  loading = signal(false);
  placingOrder = signal(false);
  savingAddress = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  savedAddress = signal<DeliveryAddressResponse | null>(null);
  checkoutResult = signal<CheckoutResponse | null>(null);
  selectedLatitude = signal<number | null>(null);
  selectedLongitude = signal<number | null>(null);
  deliveryFeeInfo = signal<DeliveryFeeCheckResponse | null>(null);
  zoneChecking = signal(false);
  mapLoading = signal(false);
  geocoding = signal(false);

  promoCode = '';

  fullName = '';
  phone = '';
  city = '';
  governorate = '';
  delegation = '';
  locality = '';
  addressLine = '';
  additionalInfo = '';

  deliveryType: DeliveryType = 'STANDARD';
  deliverySlot: DeliverySlot = 'MORNING';
  paymentType: PaymentType = 'CARD';
  scheduledAt = '';

  private leaflet: typeof Leaflet | null = null;
  private map: Leaflet.Map | null = null;
  private locationMarker: Leaflet.CircleMarker | null = null;
  private addressLookupTimer: ReturnType<typeof setTimeout> | null = null;

  baseDeliveryFee = computed(() => this.deliveryFeeInfo()?.deliveryFee ?? 8);
  deliveryFee = computed(() => this.baseDeliveryFee());

  productsTotal = computed(() => this.cart()?.total ?? 0);

finalTotal = computed(() => this.productsTotal() + this.deliveryFee());

  ngOnInit(): void {
    this.loadCart();
  }

  ngOnDestroy(): void {
    if (this.addressLookupTimer) {
      clearTimeout(this.addressLookupTimer);
    }

    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  loadCart(): void {
    this.loading.set(true);
    this.error.set(null);

    this.cartService.getMyCart().subscribe({
      next: (data) => {
        this.cart.set(data);
        this.loading.set(false);
        setTimeout(() => this.initDeliveryMap());
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
      governorate: this.governorate.trim() || null,
      delegation: this.delegation.trim() || null,
      locality: this.locality.trim() || null,
      addressLine: this.addressLine.trim(),
      additionalInfo: this.additionalInfo.trim() || null,
      latitude: this.selectedLatitude(),
      longitude: this.selectedLongitude()
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

        if (this.paymentType === 'CARD') {
          this.startStripeCheckout(result.payment.id);
          return;
        }

        this.successMessage.set('Checkout completed successfully.');
        this.placingOrder.set(false);
        this.loadCart();

        setTimeout(() => {
          this.router.navigate(['/front/orders']);
        }, 1200);
      },
      error: (err: any) => {
        console.error('Checkout failed:', err);
        this.error.set(this.extractApiError(err, 'Checkout failed.'));
        this.placingOrder.set(false);
      }
    });
  }

  getImageUrl(imageUrl?: string | null): string {
    if (!imageUrl || !imageUrl.trim()) {
      return 'assets/default-product.png';
    }

    const value = imageUrl.trim().replace(/^"+|"+$/g, '').replace(/\\/g, '/');

    if (
      value.startsWith('http://') ||
      value.startsWith('https://') ||
      value.startsWith('data:') ||
      value.startsWith('blob:')
    ) {
      return value;
    }

    if (value.startsWith('/api/uploads/')) {
      return `http://localhost:8089${value}`;
    }

    if (value.startsWith('api/uploads/')) {
      return `http://localhost:8089/${value}`;
    }

    if (value.startsWith('/uploads/')) {
      return `http://localhost:8089/api${value}`;
    }

    if (value.startsWith('uploads/')) {
      return `http://localhost:8089/api/${value}`;
    }

    if (value.startsWith('assets/')) {
      return value;
    }

    return `http://localhost:8089/api/uploads/${value}`;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/default-product.png';
  }

  private async initDeliveryMap(): Promise<void> {
    if (typeof window === 'undefined' || this.map) return;

    const mapContainer = document.getElementById('delivery-map');
    if (!mapContainer) return;

    this.mapLoading.set(true);

    try {
      const L = await import('leaflet');
      this.leaflet = L;

      this.map = L.map('delivery-map', {
        center: [34.0, 9.4],
        zoom: 6,
        scrollWheelZoom: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.map);

      this.map.on('click', (event: any) => {
        this.selectDeliveryLocation(event.latlng.lat, event.latlng.lng);
      });

      this.checkDeliveryByAddress();
    } catch (err) {
      console.error('Failed to initialize delivery map:', err);
      this.error.set('Failed to load delivery map.');
    } finally {
      this.mapLoading.set(false);
    }
  }

  onAddressChanged(): void {
    if (this.addressLookupTimer) {
      clearTimeout(this.addressLookupTimer);
    }

    this.addressLookupTimer = setTimeout(() => {
      this.checkDeliveryByAddress();
      this.geocodeAddressOnMap();
    }, 700);
  }

  private selectDeliveryLocation(latitude: number, longitude: number): void {
    this.setMapLocation(latitude, longitude, false);
  }

  private checkDeliveryByAddress(): void {
    if (!this.city.trim() && !this.governorate.trim()) return;

    this.zoneChecking.set(true);

    this.deliveryZoneService.checkAddress({
      governorate: this.governorate.trim() || null,
      city: this.city.trim() || null,
      delegation: this.delegation.trim() || null,
      locality: this.locality.trim() || null,
      addressLine: this.addressLine.trim() || null
    }).subscribe({
      next: (response) => {
        this.deliveryFeeInfo.set(response);
        this.zoneChecking.set(false);
      },
      error: (err) => {
        console.error('Failed to check delivery fee:', err);
        this.zoneChecking.set(false);
      }
    });
  }

  private startStripeCheckout(paymentId: number): void {
    this.successMessage.set('Redirecting to secure Stripe payment...');

    this.stripeCheckoutService.createCheckoutSession({ paymentId }).subscribe({
      next: (session) => {
        if (!session.url) {
          this.error.set('Stripe checkout session was created without a redirect URL.');
          this.placingOrder.set(false);
          return;
        }

        window.location.href = session.url;
      },
      error: (err: any) => {
        console.error('Stripe checkout failed:', err);
        this.error.set(this.extractApiError(err, 'Failed to start Stripe payment.'));
        this.placingOrder.set(false);
      }
    });
  }

  private extractApiError(err: any, fallback: string): string {
    const apiError = err?.error;

    if (typeof apiError === 'string' && apiError.trim()) {
      return apiError;
    }

    if (apiError?.message) {
      return apiError.message;
    }

    if (apiError?.error) {
      return apiError.error;
    }

    return fallback;
  }

  private async geocodeAddressOnMap(): Promise<void> {
    if (!this.map) return;

    const parts = [
      this.addressLine,
      this.locality,
      this.delegation,
      this.governorate,
      this.city,
      'Tunisia'
    ].map(part => part.trim()).filter(Boolean);

    if (parts.length < 2) return;

    this.geocoding.set(true);

    try {
      const query = encodeURIComponent(parts.join(', '));
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${query}`);
      const results = await response.json();

      if (!Array.isArray(results) || !results.length) {
        this.geocoding.set(false);
        return;
      }

      const latitude = Number(results[0].lat);
      const longitude = Number(results[0].lon);

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        this.geocoding.set(false);
        return;
      }

      this.setMapLocation(latitude, longitude, true);
    } catch (err) {
      console.error('Failed to geocode address:', err);
    } finally {
      this.geocoding.set(false);
    }
  }

  private setMapLocation(latitude: number, longitude: number, moveMap: boolean): void {
    if (!this.map || !this.leaflet) return;

    this.selectedLatitude.set(Number(latitude.toFixed(6)));
    this.selectedLongitude.set(Number(longitude.toFixed(6)));

    if (this.locationMarker) {
      this.map.removeLayer(this.locationMarker);
    }

    this.locationMarker = this.leaflet.circleMarker([latitude, longitude], {
      radius: 8,
      color: '#1d4ed8',
      fillColor: '#3b82f6',
      fillOpacity: 0.9,
      weight: 3
    }).addTo(this.map);

    if (moveMap) {
      this.map.setView([latitude, longitude], 14);
    }
  }

}

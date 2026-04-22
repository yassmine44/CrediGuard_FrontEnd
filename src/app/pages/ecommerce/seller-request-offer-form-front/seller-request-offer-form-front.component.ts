import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ProductRequestService } from '../../../pages/ecommerce/services/product-request.service';
import { ProductRequest } from '../../../pages/ecommerce/models/product-request.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-seller-request-offer-form-front',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './seller-request-offer-form-front.component.html',
  styleUrl: './seller-request-offer-form-front.component.scss'
})
export class SellerRequestOfferFormFrontComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productRequestService = inject(ProductRequestService);
  private authService = inject(AuthService);

  request = signal<ProductRequest | null>(null);
  sellerProducts = signal<any[]>([]);
  loading = signal(false);
  submitting = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  requestId: number | null = null;

  form = this.fb.group({
    proposedPrice: [null as number | null, [Validators.required, Validators.min(0.01)]],
    proposedQuantity: [null as number | null, [Validators.required, Validators.min(1)]],
    estimatedDeliveryDays: [null as number | null, [Validators.required, Validators.min(1)]],
    message: ['', [Validators.maxLength(2000)]],
    productId: [null as number | null, [Validators.required]]
  });

  ngOnInit(): void {
    const sellerId = this.getCurrentSellerId();
    if (!sellerId) {
      this.error.set('Unable to identify the current seller.');
      return;
    }

    this.loadSellerProducts();

    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (!id) {
        this.error.set('Invalid request id.');
        return;
      }

      this.requestId = id;
      this.loadRequest(id);
    });
  }

  loadRequest(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.productRequestService.getRequestById(id).subscribe({
      next: (data) => {
        this.request.set(data);
        this.loading.set(false);

        this.form.patchValue({
          proposedQuantity: data.requestedQuantity ?? null,
          proposedPrice: data.maxBudget ?? null
        });
      },
      error: (err) => {
        console.error('Failed to load request details', err);
        this.error.set(err?.error?.error || 'Failed to load request details.');
        this.loading.set(false);
      }
    });
  }

loadSellerProducts(): void {
  this.productRequestService.getMyProducts().subscribe({
    next: (products) => {
      this.sellerProducts.set(products ?? []);
    },
    error: (err) => {
      console.error('Failed to load seller products', err);
      this.error.set(err?.error?.error || 'Failed to load seller products.');
    }
  });
}

  submit(): void {
    this.error.set(null);
    this.successMessage.set(null);

    if (!this.requestId) {
      this.error.set('Invalid request id.');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const sellerId = this.getCurrentSellerId();
    if (!sellerId) {
      this.error.set('Unable to identify the current seller.');
      return;
    }

    const raw = this.form.getRawValue();

    const body = {
      proposedPrice: raw.proposedPrice ?? null,
      proposedQuantity: raw.proposedQuantity ?? null,
      estimatedDeliveryDays: raw.estimatedDeliveryDays ?? null,
      message: raw.message?.trim() || null,
      productId: raw.productId ?? null
    };

    this.submitting.set(true);

    this.productRequestService.createOffer(this.requestId, sellerId, body).subscribe({
      next: () => {
        this.submitting.set(false);
        this.successMessage.set('Offer submitted successfully.');

        setTimeout(() => {
          this.router.navigate(['/front/seller/my-request-offers']);
        }, 800);
      },
      error: (err) => {
        console.error('Failed to submit offer', err);
        this.error.set(err?.error?.error || 'Failed to submit the offer.');
        this.submitting.set(false);
      }
    });
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.touched && control.hasError(errorName);
  }

  private getCurrentSellerId(): number | null {
    const user = this.authService.getUser();
    if (!user) return null;

    const id = user['id'] ?? user['userId'] ?? user['userid'];
    const numericId = Number(id);

    return Number.isFinite(numericId) && numericId > 0 ? numericId : null;
  }
  
}
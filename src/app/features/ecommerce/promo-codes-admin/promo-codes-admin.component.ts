import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PromoCodeService } from '../services/promo-code.service';
import {
  DiscountType,
  PromoCodeResponse,
  PromoCodeValidateResponse
} from '../models/promo-code.model';

@Component({
  selector: 'app-promo-codes-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './promo-codes-admin.component.html',
  styleUrl: './promo-codes-admin.component.scss'
})
export class PromoCodesAdminComponent implements OnInit {
  private promoCodeService = inject(PromoCodeService);

  promoCodes = signal<PromoCodeResponse[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  editingId: number | null = null;

  code = '';
  discountType: DiscountType = 'PERCENTAGE';
  discountValue = 10;
  active = true;
  maxUses = 100;
  minOrderAmount: number | null = null;
  maxDiscountAmount: number | null = null;
  startAt = '';
  endAt = '';

  validateCode = '';
  validateAmount: number | null = null;
  validateResult = signal<PromoCodeValidateResponse | null>(null);

  ngOnInit(): void {
    this.loadPromoCodes();
  }

  loadPromoCodes(): void {
    this.loading.set(true);
    this.error.set(null);

    this.promoCodeService.getAll().subscribe({
      next: (data) => {
        this.promoCodes.set(data);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        console.error(err);
        this.error.set('Failed to load promo codes.');
        this.loading.set(false);
      }
    });
  }

  savePromoCode(): void {
    this.error.set(null);
    this.success.set(null);

    const payload = {
      code: this.code.trim(),
      discountType: this.discountType,
      discountValue: this.discountValue,
      active: this.active,
      maxUses: this.maxUses,
      minOrderAmount: this.minOrderAmount,
      maxDiscountAmount: this.maxDiscountAmount,
      startAt: this.startAt || null,
      endAt: this.endAt || null
    };

    if (!payload.code) {
      this.error.set('Code is required.');
      return;
    }

    const request$ = this.editingId
      ? this.promoCodeService.update(this.editingId, payload)
      : this.promoCodeService.create(payload);

    request$.subscribe({
      next: () => {
        this.success.set(this.editingId ? 'Promo code updated.' : 'Promo code created.');
        this.resetForm();
        this.loadPromoCodes();
      },
      error: (err: unknown) => {
        console.error(err);
        this.error.set('Failed to save promo code.');
      }
    });
  }

  editPromoCode(promo: PromoCodeResponse): void {
    this.editingId = promo.id;
    this.code = promo.code;
    this.discountType = promo.discountType;
    this.discountValue = promo.discountValue;
    this.active = promo.active;
    this.maxUses = promo.maxUses;
    this.minOrderAmount = promo.minOrderAmount ?? null;
    this.maxDiscountAmount = promo.maxDiscountAmount ?? null;
    this.startAt = promo.startAt ? promo.startAt.substring(0, 16) : '';
    this.endAt = promo.endAt ? promo.endAt.substring(0, 16) : '';
  }

  deletePromoCode(id: number): void {
    if (!confirm('Delete this promo code?')) {
      return;
    }

    this.promoCodeService.delete(id).subscribe({
      next: () => {
        this.success.set('Promo code deactivated.');
        this.loadPromoCodes();
      },
      error: (err: unknown) => {
        console.error(err);
        this.error.set('Failed to delete promo code.');
      }
    });
  }

  resetForm(): void {
    this.editingId = null;
    this.code = '';
    this.discountType = 'PERCENTAGE';
    this.discountValue = 10;
    this.active = true;
    this.maxUses = 100;
    this.minOrderAmount = null;
    this.maxDiscountAmount = null;
    this.startAt = '';
    this.endAt = '';
  }

  runValidation(): void {
    if (!this.validateCode.trim() || this.validateAmount == null) {
      this.error.set('Validation code and amount are required.');
      return;
    }

    this.error.set(null);
    this.validateResult.set(null);

    this.promoCodeService.validate({
      code: this.validateCode.trim(),
      orderAmount: this.validateAmount
    }).subscribe({
      next: (res) => this.validateResult.set(res),
      error: (err: unknown) => {
        console.error(err);
        this.error.set('Failed to validate promo code.');
      }
    });
  }
  goBack(): void {
  window.history.back();
}
}
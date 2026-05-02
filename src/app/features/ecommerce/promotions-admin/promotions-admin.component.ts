import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, NgClass } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import {
  Promotion,
  PromotionType,
  DiscountType,
  PromotionTargetType
} from '../../../features/ecommerce/models/promotion.model';
import { PromotionService } from '../../../features/ecommerce/services/promotion.service';
import { CalendarEventService } from '../../../features/ecommerce/services/calendar-event.service';
import { CategoryService } from '../../../features/ecommerce/services/category.service';
import { ProductService } from '../../../features/ecommerce/services/product.service';

import { CalendarEvent } from '../../../features/ecommerce/models/calendar-event.model';
import { Category } from '../../../features/ecommerce/models/category.model';
import { Product } from '../../../features/ecommerce/models/product.model';

@Component({
  selector: 'app-promotions-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe, NgClass, MatIconModule],
  templateUrl: './promotions-admin.component.html',
  styleUrl: './promotions-admin.component.scss'
})
export class PromotionsAdminComponent implements OnInit {
  private fb = inject(FormBuilder);
  private promotionService = inject(PromotionService);
  private calendarEventService = inject(CalendarEventService);
  private categoryService = inject(CategoryService);
  private productService = inject(ProductService);

  promotions = signal<Promotion[]>([]);
  events = signal<CalendarEvent[]>([]);
  categories = signal<Category[]>([]);
  products = signal<Product[]>([]);

  loading = signal(false);
  saving = signal(false);
  auxLoading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  showCreateForm = signal(false);

  promotionTypes: PromotionType[] = ['SEASONAL', 'HOLIDAY', 'FLASH', 'CLEARANCE'];
  discountTypes: DiscountType[] = ['PERCENTAGE', 'FIXED_AMOUNT'];
  targetTypes: PromotionTargetType[] = ['ALL_PRODUCTS', 'CATEGORY', 'PRODUCT'];

  targetType = signal<PromotionTargetType>('ALL_PRODUCTS');

 activePromotions = computed(() => this.promotions().filter(p => p.active));
linkedToEventsCount = computed(() =>
  this.promotions().filter(p => p.calendarEventId != null).length
);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    description: ['', [Validators.maxLength(500)]],
    promotionType: [null as PromotionType | null, Validators.required],
    discountType: [null as DiscountType | null, Validators.required],
    targetType: ['ALL_PRODUCTS' as PromotionTargetType, Validators.required],
    discountValue: [null as number | null, [Validators.required, Validators.min(0.01)]],
    minOrderAmount: [null as number | null],
    maxDiscountAmount: [null as number | null],
    active: [true],
    priority: [0, [Validators.min(0)]],
    autoApply: [true],
    stackable: [false],
    startDate: [''],
    endDate: [''],
    categoryId: [null as number | null],
    productId: [null as number | null],
    calendarEventId: [null as number | null]
  });

  ngOnInit(): void {
    this.loadPromotions();
    this.loadAuxData();

    this.form.controls.targetType.valueChanges.subscribe(value => {
      const target = value ?? 'ALL_PRODUCTS';
      this.targetType.set(target);
      this.adjustTargetFields(target);
    });

    this.form.controls.calendarEventId.valueChanges.subscribe(value => {
      const hasCalendarEvent = value != null;
      if (hasCalendarEvent) {
        this.form.patchValue({ startDate: '', endDate: '' }, { emitEvent: false });
      }
    });
  }

  loadPromotions(): void {
    this.loading.set(true);
    this.error.set(null);

    this.promotionService.getAll().subscribe({
      next: (data) => {
        const sorted = [...(data ?? [])].sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.promotions.set(sorted);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load promotions', err);
        this.error.set('Failed to load promotions.');
        this.loading.set(false);
      }
    });
  }

  loadAuxData(): void {
    this.auxLoading.set(true);

    this.calendarEventService.getAll().subscribe({
      next: (events) => this.events.set(events ?? []),
      error: (err) => console.error('Failed to load events', err)
    });

    this.categoryService.getAll().subscribe({
      next: (categories) => this.categories.set(categories ?? []),
      error: (err) => console.error('Failed to load categories', err)
    });

    this.productService.getAll().subscribe({
      next: (products) => {
        this.products.set(products ?? []);
        this.auxLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load products', err);
        this.auxLoading.set(false);
      }
    });
  }

  toggleCreateForm(): void {
    this.showCreateForm.set(!this.showCreateForm());
    this.error.set(null);
    this.success.set(null);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    if (raw.targetType === 'CATEGORY' && !raw.categoryId) {
      this.error.set('Please select a category for CATEGORY target.');
      return;
    }

    if (raw.targetType === 'PRODUCT' && !raw.productId) {
      this.error.set('Please select a product for PRODUCT target.');
      return;
    }

    if (!raw.calendarEventId && raw.startDate && raw.endDate) {
      if (new Date(this.toLocalDateTime(raw.endDate)).getTime() < new Date(this.toLocalDateTime(raw.startDate)).getTime()) {
        this.error.set('End date must be after start date.');
        return;
      }
    }

    const payload = {
      name: raw.name!.trim(),
      description: raw.description?.trim() || null,
      promotionType: raw.promotionType!,
      discountType: raw.discountType!,
      targetType: raw.targetType!,
      discountValue: Number(raw.discountValue),
      minOrderAmount: raw.minOrderAmount != null ? Number(raw.minOrderAmount) : null,
      maxDiscountAmount: raw.maxDiscountAmount != null ? Number(raw.maxDiscountAmount) : null,
      active: !!raw.active,
      priority: raw.priority != null ? Number(raw.priority) : 0,
      autoApply: !!raw.autoApply,
      stackable: !!raw.stackable,
      startDate: raw.calendarEventId ? null : (raw.startDate ? this.toLocalDateTime(raw.startDate) : null),
      endDate: raw.calendarEventId ? null : (raw.endDate ? this.toLocalDateTime(raw.endDate) : null),
      categoryId: raw.targetType === 'CATEGORY' ? raw.categoryId : null,
      productId: raw.targetType === 'PRODUCT' ? raw.productId : null,
      calendarEventId: raw.calendarEventId ?? null
    };

    this.saving.set(true);
    this.error.set(null);
    this.success.set(null);

    this.promotionService.create(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.success.set('Promotion created successfully.');
        this.resetForm();
        this.showCreateForm.set(false);
        this.loadPromotions();
      },
      error: (err) => {
        console.error('Failed to create promotion', err);
        this.error.set('Failed to create promotion.');
        this.saving.set(false);
      }
    });
  }

  formatLabel(value: string): string {
    return value
      .toLowerCase()
      .split('_')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  private adjustTargetFields(target: PromotionTargetType): void {
    if (target !== 'CATEGORY') {
      this.form.patchValue({ categoryId: null }, { emitEvent: false });
    }

    if (target !== 'PRODUCT') {
      this.form.patchValue({ productId: null }, { emitEvent: false });
    }
  }

  private resetForm(): void {
    this.form.reset({
      name: '',
      description: '',
      promotionType: null,
      discountType: null,
      targetType: 'ALL_PRODUCTS',
      discountValue: null,
      minOrderAmount: null,
      maxDiscountAmount: null,
      active: true,
      priority: 0,
      autoApply: true,
      stackable: false,
      startDate: '',
      endDate: '',
      categoryId: null,
      productId: null,
      calendarEventId: null
    });
    this.targetType.set('ALL_PRODUCTS');
  }

  private toLocalDateTime(value: string): string {
    return value.length === 16 ? `${value}:00` : value;
  }
  getPromotionStatus(promotion: any): 'LIVE' | 'SCHEDULED' | 'EXPIRED' | 'DISABLED' {
  if (promotion.status) return promotion.status;

  if (!promotion.active) return 'DISABLED';

  const now = Date.now();

  // Cas avec event lié
  if (promotion.calendarEvent) {
    const start = new Date(promotion.calendarEvent.startDate).getTime();
    const end = new Date(promotion.calendarEvent.endDate).getTime();

    if (now < start) return 'SCHEDULED';
    if (now > end) return 'EXPIRED';
    return 'LIVE';
  }

  // Cas sans event → utiliser dates de la promo
  const start = promotion.startDate ? new Date(promotion.startDate).getTime() : null;
  const end = promotion.endDate ? new Date(promotion.endDate).getTime() : null;

  if (start && now < start) return 'SCHEDULED';
  if (end && now > end) return 'EXPIRED';

  return 'LIVE';
}
}

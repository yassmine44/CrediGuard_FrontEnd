import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { ProductRequestService } from '../../../pages/ecommerce/services/product-request.service';
import { CategoryService } from '../../../features/ecommerce/services/category.service';
import { AuthService } from '../../../core/services/auth.service';

interface CategoryOption {
  id: number;
  name: string;
}

@Component({
  selector: 'app-request-product-front',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './request-product-front.component.html',
  styleUrl: './request-product-front.component.scss'
})
export class RequestProductFrontComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productRequestService = inject(ProductRequestService);
  private categoryService = inject(CategoryService);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  categoriesLoading = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  categories = signal<CategoryOption[]>([]);

  form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(150)]],
    description: ['', [Validators.maxLength(3000)]],
    categoryId: [null as number | null],
    requestedQuantity: [1 as number | null, [Validators.required, Validators.min(1)]],
    maxBudget: [null as number | null, [Validators.min(0)]],
    desiredDate: ['']
  });

  ngOnInit(): void {
    this.loadCategories();
  }

  private loadCategories(): void {
    this.categoriesLoading.set(true);

    this.categoryService.getAll().subscribe({
      next: (data: any[]) => {
        this.categories.set(
          (data ?? []).map(cat => ({
            id: Number(cat.id),
            name: String(cat.name)
          }))
        );
        this.categoriesLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load categories', err);
        this.categoriesLoading.set(false);
      }
    });
  }

  submit(): void {
    this.error.set(null);
    this.successMessage.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const clientId = this.getCurrentUserId();
    if (!clientId) {
      this.error.set('You must be logged in to submit a product request.');
      return;
    }

    const raw = this.form.getRawValue();

    const body = {
      title: raw.title?.trim() || '',
      description: raw.description?.trim() || null,
      categoryId: raw.categoryId ?? null,
      requestedQuantity: raw.requestedQuantity ?? null,
      maxBudget: raw.maxBudget ?? null,
      desiredDate: raw.desiredDate ? this.toLocalDateTime(raw.desiredDate) : null,
      targetSellerId: null,
      imageUrl: null
    };

    this.loading.set(true);

    this.productRequestService.createRequest(clientId, body).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMessage.set('Your product request has been submitted successfully.');

        this.form.reset({
          title: '',
          description: '',
          categoryId: null,
          requestedQuantity: 1,
          maxBudget: null,
          desiredDate: ''
        });

        setTimeout(() => {
          this.router.navigate(['/front/my-product-requests']);
        }, 900);
      },
      error: (err) => {
        console.error('Failed to create product request', err);
        this.loading.set(false);
        this.error.set(
          err?.error?.message || 'Failed to submit your request. Please try again.'
        );
      }
    });
  }

  private toLocalDateTime(value: string): string {
    return value ? `${value}:00` : '';
  }

  private getCurrentUserId(): number | null {
    const user = this.authService.getUser();
    if (!user) return null;

    const id = user['id'] ?? user['userId'] ?? user['userid'];
    const numericId = Number(id);

    return Number.isFinite(numericId) && numericId > 0 ? numericId : null;
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.touched && control.hasError(errorName);
  }
}
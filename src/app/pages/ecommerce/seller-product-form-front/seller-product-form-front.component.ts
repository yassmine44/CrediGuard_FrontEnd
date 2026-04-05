import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ProductService } from '../../../features/ecommerce/services/product.service';
import { CategoryService } from '../../../features/ecommerce/services/category.service';
import {
  Product,
  ProductCreateRequest,
  ProductUpdateRequest,
  SaleMode
} from '../../../features/ecommerce/models/product.model';
import { Category } from '../../../features/ecommerce/models/category.model';

@Component({
  selector: 'app-seller-product-form-front',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './seller-product-form-front.component.html',
  styleUrl: './seller-product-form-front.component.scss'
})
export class SellerProductFormFrontComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  loading = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);
  categories = signal<Category[]>([]);
  imagePreview = signal<string>('assets/default-product.png');
  selectedImageUrl = signal<string | null>(null);

  productId: number | null = null;
  isEditMode = false;
pricingStrategies = ['MIXED', 'EARLY_BIRD', 'DEMAND_BASED'] as const;
  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    categoryId: [0, [Validators.required, Validators.min(1)]],
    basePrice: [0, [Validators.required, Validators.min(0.001)]],
    saleType: ['STANDARD' as SaleMode, [Validators.required]],
    stockQuantity: [0, [Validators.min(0)]],
    preorderQuota: [null as number | null],
    dynamicPricingEnabled: [false],
    pricingStrategy: [''],
    paymentMode: ['CARD'],
    depositPercentage: [0, [Validators.min(0), Validators.max(100)]],
    expressDeliveryAvailable: [false],
    expressDeliveryFee: [0, [Validators.min(0)]],
    preorderStartDate: [''],
    preorderEndDate: [''],
    expectedReleaseDate: ['']
  });

  ngOnInit(): void {
    this.loadCategories();

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.productId = id;
      this.isEditMode = true;
      this.loadProduct(id);
    }
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (data) => {
        this.categories.set(data ?? []);
      },
      error: (err: unknown) => {
        console.error('Failed to load categories:', err);
        this.error.set('Failed to load categories.');
      }
    });
  }

  loadProduct(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.productService.getById(id).subscribe({
      next: (product: Product) => {
        this.form.patchValue({
          name: product.name ?? '',
          description: product.description ?? '',
          categoryId: product.categoryId ?? 0,
          basePrice: product.basePrice ?? 0,
          saleType: product.saleType ?? 'STANDARD',
          stockQuantity: product.stockQuantity ?? 0,
          preorderQuota: product.preorderQuota ?? 0,
          dynamicPricingEnabled: product.dynamicPricingEnabled ?? false,
          pricingStrategy: product.pricingStrategy ?? '',
          paymentMode: product.paymentMode ?? '',
          depositPercentage: product.depositPercentage ?? 0,
          expressDeliveryAvailable: product.expressDeliveryAvailable ?? false,
          expressDeliveryFee: product.expressDeliveryFee ?? 0,
          preorderStartDate: product.preorderStartDate ?? '',
          preorderEndDate: product.preorderEndDate ?? '',
          expectedReleaseDate: product.expectedReleaseDate ?? ''
        });

        this.selectedImageUrl.set(product.imageUrl ?? null);
        this.imagePreview.set(this.productService.getImageUrl(product.imageUrl));

        this.loading.set(false);
      },
      error: (err: unknown) => {
        console.error('Failed to load product:', err);
        this.error.set('Failed to load product.');
        this.loading.set(false);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    const localPreview = URL.createObjectURL(file);
    this.imagePreview.set(localPreview);

    this.productService.uploadImage(file).subscribe({
      next: (imageUrl: string) => {
        this.selectedImageUrl.set(imageUrl);
      },
      error: (err: unknown) => {
        console.error('Failed to upload image:', err);
        this.error.set('Image upload failed.');
      }
    });
  }

 submit(): void {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  if (!this.selectedImageUrl()) {
    this.error.set('Please upload a product image.');
    return;
  }

  this.saving.set(true);
  this.error.set(null);

  const raw = this.form.getRawValue();
  const isPreorder = raw.saleType === 'PREORDER';

  if (this.isEditMode && this.productId) {
    const payload: ProductUpdateRequest = {
      name: raw.name,
      description: raw.description || null,
      categoryId: raw.categoryId,
      basePrice: raw.basePrice,
      imageUrl: this.selectedImageUrl(),
      saleType: raw.saleType,
      stockQuantity: raw.stockQuantity,
      preorderQuota: isPreorder ? raw.preorderQuota : null,
      dynamicPricingEnabled: raw.dynamicPricingEnabled,
      pricingStrategy: raw.pricingStrategy || null,
      paymentMode: raw.paymentMode || 'CARD',
      depositPercentage: raw.depositPercentage,
      expressDeliveryAvailable: raw.expressDeliveryAvailable,
      expressDeliveryFee: raw.expressDeliveryFee,
      preorderStartDate: isPreorder ? (raw.preorderStartDate || null) : null,
      preorderEndDate: isPreorder ? (raw.preorderEndDate || null) : null,
      expectedReleaseDate: isPreorder ? (raw.expectedReleaseDate || null) : null
    };

    this.productService.update(this.productId, payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/front/seller/products']);
      },
      error: (err: any) => {
        console.error('Failed to update product:', err);
        console.error('Backend error body:', err?.error);
        this.error.set(err?.error?.message || 'Failed to update product.');
        this.saving.set(false);
      }
    });

    return;
  }

  const payload: ProductCreateRequest = {
    categoryId: raw.categoryId,
    name: raw.name,
    description: raw.description || null,
    basePrice: raw.basePrice,
    imageUrl: this.selectedImageUrl(),
    dynamicPricingEnabled: raw.dynamicPricingEnabled,
    pricingStrategy: raw.pricingStrategy || null,
    saleType: raw.saleType,
    stockQuantity: raw.stockQuantity,
    preorderQuota: isPreorder ? raw.preorderQuota : null,
    paymentMode: raw.paymentMode || 'CARD',
    depositPercentage: raw.depositPercentage,
    expressDeliveryAvailable: raw.expressDeliveryAvailable,
    expressDeliveryFee: raw.expressDeliveryFee,
    preorderStartDate: isPreorder ? (raw.preorderStartDate || null) : null,
    preorderEndDate: isPreorder ? (raw.preorderEndDate || null) : null,
    expectedReleaseDate: isPreorder ? (raw.expectedReleaseDate || null) : null
  };

  console.log('CREATE PRODUCT PAYLOAD =', payload);

  this.productService.create(payload).subscribe({
    next: () => {
      this.saving.set(false);
      this.router.navigate(['/front/seller/products']);
    },
    error: (err: any) => {
      console.error('Failed to create product:', err);
      console.error('Backend error body:', err?.error);
      this.error.set(err?.error?.message || 'Failed to create product.');
      this.saving.set(false);
    }
  });
}

  get isPreorder(): boolean {
    return this.form.controls.saleType.value === 'PREORDER';
  }

 
}
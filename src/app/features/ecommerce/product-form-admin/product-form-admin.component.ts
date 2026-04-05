import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CategoryService } from '../services/category.service';
import { ProductService } from '../services/product.service';
import { Category } from '../models/category.model';
import {
  Product,
  ProductCreateRequest,
  ProductUpdateRequest,
  SaleMode
} from '../models/product.model';
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-product-form-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIcon],
  templateUrl: './product-form-admin.component.html',
  styleUrl: './product-form-admin.component.scss'
})
export class ProductFormAdminComponent implements OnInit, OnDestroy {
  private categoryService = inject(CategoryService);
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private previewObjectUrl: string | null = null;

  categories = signal<Category[]>([]);
  loading = signal(false);
  saving = signal(false);
  error = signal('');
  success = signal('');
  isEditMode = signal(false);
  productId = signal<number | null>(null);

  selectedFile: File | null = null;
  imagePreview = signal<string>('');

  paymentTypes = [
    'CARD',
    'CASH_ON_DELIVERY',
    'BANK_TRANSFER',
    'WALLET'
  ];

  saleTypes: SaleMode[] = ['STANDARD', 'PREORDER'];

  formData: ProductCreateRequest = {
    categoryId: null,
    name: '',
    description: '',
    basePrice: null,
    imageUrl: '',
    dynamicPricingEnabled: false,
    pricingStrategy: null,
    saleType: 'STANDARD',
    stockQuantity: 0,
    preorderQuota: null,
    paymentMode: null,
    depositPercentage: null,
    expressDeliveryAvailable: false,
    expressDeliveryFee: 0,
    preorderStartDate: null,
    preorderEndDate: null,
    expectedReleaseDate: null
  };

  ngOnInit(): void {
    this.loadCategories();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode.set(true);
      this.productId.set(Number(idParam));
      this.loadProduct(Number(idParam));
    }
  }

  ngOnDestroy(): void {
    this.revokePreviewObjectUrl();
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (data) => this.categories.set(data),
      error: (err) => {
        console.error('Error loading categories:', err);
        this.error.set('Unable to load categories.');
      }
    });
  }

  loadProduct(id: number): void {
    this.loading.set(true);
    this.error.set('');

    this.productService.getById(id).subscribe({
      next: (product) => {
        this.patchForm(product);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading product:', err);
        this.error.set(this.extractErrorMessage(err, 'Unable to load product.'));
        this.loading.set(false);
      }
    });
  }

  patchForm(product: Product): void {
    this.revokePreviewObjectUrl();
    this.selectedFile = null;

    this.formData = {
      categoryId: product.categoryId,
      name: product.name,
      description: product.description,
      basePrice: product.basePrice,
      imageUrl: this.productService.normalizeImageValue(product.imageUrl) || '',
      dynamicPricingEnabled: product.dynamicPricingEnabled,
      pricingStrategy: product.pricingStrategy,
      saleType: product.saleType,
      stockQuantity: product.stockQuantity,
      preorderQuota: product.preorderQuota,
      paymentMode: product.paymentMode,
      depositPercentage: product.depositPercentage,
      expressDeliveryAvailable: product.expressDeliveryAvailable,
      expressDeliveryFee: product.expressDeliveryFee,
      preorderStartDate: this.toDatetimeLocal(product.preorderStartDate),
      preorderEndDate: this.toDatetimeLocal(product.preorderEndDate),
      expectedReleaseDate: this.toDatetimeLocal(product.expectedReleaseDate)
    };

    this.imagePreview.set(this.productService.getImageUrl(product.imageUrl));
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files.length > 0 ? input.files[0] : null;

    if (!file) {
      this.selectedFile = null;
      this.revokePreviewObjectUrl();
      this.imagePreview.set(
        this.formData.imageUrl ? this.productService.getImageUrl(this.formData.imageUrl) : ''
      );
      return;
    }

    this.selectedFile = file;
    this.revokePreviewObjectUrl();
    this.previewObjectUrl = URL.createObjectURL(file);
    this.imagePreview.set(this.previewObjectUrl);
  }

  onImagePreviewError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = this.productService.getImageUrl();
  }

  onSaleTypeChange(): void {
    if (this.formData.saleType === 'STANDARD') {
      this.formData.preorderQuota = null;
      this.formData.preorderStartDate = null;
      this.formData.preorderEndDate = null;
      this.formData.expectedReleaseDate = null;
    } else if (this.formData.saleType === 'PREORDER') {
      if (this.formData.stockQuantity == null) {
        this.formData.stockQuantity = 0;
      }
    }
  }

  saveProduct(): void {
    this.error.set('');
    this.success.set('');

    const validationError = this.validateForm();
    if (validationError) {
      this.error.set(validationError);
      return;
    }

    this.saving.set(true);

    if (this.selectedFile) {
      this.productService.uploadImage(this.selectedFile).subscribe({
        next: (imageUrl) => {
          this.formData.imageUrl = imageUrl;
          this.saveProductData();
        },
        error: (err) => {
          console.error('Error uploading image:', err);
          this.error.set('Image upload failed.');
          this.saving.set(false);
        }
      });
    } else {
      this.saveProductData();
    }
  }

  private saveProductData(): void {
    const payload = this.buildPayload();
    const id = this.productId();

    if (this.isEditMode() && id !== null) {
      const updatePayload: ProductUpdateRequest = { ...payload };

      this.productService.update(id, updatePayload).subscribe({
        next: () => {
          this.saving.set(false);
          this.success.set('Product updated successfully.');
          setTimeout(() => {
            this.router.navigate(['/admin/ecommerce/products']);
          }, 700);
        },
        error: (err) => {
          console.error('Error updating product:', err);
          this.error.set(this.extractErrorMessage(err, 'Error while updating product.'));
          this.saving.set(false);
        }
      });
    } else {
      this.productService.create(payload).subscribe({
        next: () => {
          this.saving.set(false);
          this.success.set('Product created successfully.');
          setTimeout(() => {
            this.router.navigate(['/admin/ecommerce/products']);
          }, 700);
        },
        error: (err) => {
          console.error('Error creating product:', err);
          this.error.set(this.extractErrorMessage(err, 'Error while creating product.'));
          this.saving.set(false);
        }
      });
    }
  }

  cancel(): void {
    this.clearSelectedFile();
    this.router.navigate(['/admin/ecommerce/products']);
  }

  private validateForm(): string | null {
    if (!this.formData.categoryId) return 'Category is required.';
    if (!this.formData.name?.trim()) return 'Product name is required.';
    if (this.formData.name.trim().length < 2) {
      return 'Product name must contain at least 2 characters.';
    }
    if (this.formData.basePrice == null || this.formData.basePrice <= 0) {
      return 'Base price must be greater than 0.';
    }
    if (!this.formData.saleType) return 'Sale type is required.';

    if (this.formData.saleType === 'PREORDER') {
      const preorderQuota = this.formData.preorderQuota;
      if (preorderQuota == null || preorderQuota <= 0) {
        return 'Preorder quota must be greater than 0 for PREORDER products.';
      }
    }

    const depositPercentage = this.formData.depositPercentage;
    if (depositPercentage != null && (depositPercentage <= 0 || depositPercentage > 1)) {
      return 'Deposit percentage must be between 0 and 1.';
    }

    const expressDeliveryFee = this.formData.expressDeliveryFee;
    if (expressDeliveryFee != null && expressDeliveryFee < 0) {
      return 'Express delivery fee must be greater than or equal to 0.';
    }

    return null;
  }

  private buildPayload(): ProductCreateRequest {
    return {
      categoryId: this.formData.categoryId,
      name: this.formData.name.trim(),
      description: this.formData.description?.trim() || null,
      basePrice: Number(this.formData.basePrice),
      imageUrl: this.productService.normalizeImageValue(this.formData.imageUrl),
      dynamicPricingEnabled: !!this.formData.dynamicPricingEnabled,
      pricingStrategy: this.formData.pricingStrategy || null,
      saleType: this.formData.saleType,
      stockQuantity: this.formData.stockQuantity != null ? Number(this.formData.stockQuantity) : null,
      preorderQuota:
        this.formData.saleType === 'PREORDER' && this.formData.preorderQuota != null
          ? Number(this.formData.preorderQuota)
          : null,
      paymentMode: this.formData.paymentMode || null,
      depositPercentage:
        this.formData.depositPercentage != null ? Number(this.formData.depositPercentage) : null,
      expressDeliveryAvailable: !!this.formData.expressDeliveryAvailable,
      expressDeliveryFee:
        this.formData.expressDeliveryFee != null ? Number(this.formData.expressDeliveryFee) : null,
      preorderStartDate:
        this.formData.saleType === 'PREORDER'
          ? this.toIsoOrNull(this.formData.preorderStartDate)
          : null,
      preorderEndDate:
        this.formData.saleType === 'PREORDER'
          ? this.toIsoOrNull(this.formData.preorderEndDate)
          : null,
      expectedReleaseDate:
        this.formData.saleType === 'PREORDER'
          ? this.toIsoOrNull(this.formData.expectedReleaseDate)
          : null
    };
  }

  private toIsoOrNull(value: string | null | undefined): string | null {
    if (!value) return null;
    return new Date(value).toISOString();
  }

  private toDatetimeLocal(value: string | null): string | null {
    if (!value) return null;

    const date = new Date(value);
    const pad = (n: number) => String(n).padStart(2, '0');

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  private clearSelectedFile(): void {
    this.selectedFile = null;
    this.revokePreviewObjectUrl();
    this.imagePreview.set('');
  }

  private revokePreviewObjectUrl(): void {
    if (this.previewObjectUrl) {
      URL.revokeObjectURL(this.previewObjectUrl);
      this.previewObjectUrl = null;
    }
  }

  private extractErrorMessage(err: any, fallback: string): string {
    if (err?.error?.message) return err.error.message;
    if (typeof err?.error === 'string') return err.error;
    return fallback;
  }
}

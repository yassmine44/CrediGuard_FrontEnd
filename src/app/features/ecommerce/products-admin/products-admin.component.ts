import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ProductService } from '../services/product.service';
import { CategoryService } from '../services/category.service';
import { Product } from '../models/product.model';
import { Category } from '../models/category.model';


type SortOption =
  | 'name-asc'
  | 'name-desc'
  | 'price-asc'
  | 'price-desc'
  | 'date-desc'
  | 'date-asc';


@Component({
  selector: 'app-products-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe, FormsModule],
  templateUrl: './products-admin.component.html',
  styleUrl: './products-admin.component.scss'
})
export class ProductsAdminComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private router = inject(Router);


  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(false);
  error = signal('');
  success = signal('');


  searchTerm = signal('');
  selectedCategoryId = signal<number | null>(null);
  selectedSaleType = signal<string>('ALL');
  selectedStatus = signal<string>('ALL');
  sortBy = signal<SortOption>('date-desc');


  currentPage = signal(1);
  pageSize = signal(5);


  filteredProducts = computed(() => {
    let data = [...this.products()];


    const search = this.searchTerm().trim().toLowerCase();
    const categoryId = this.selectedCategoryId();
    const saleType = this.selectedSaleType();
    const status = this.selectedStatus();
    const sort = this.sortBy();


    if (search) {
      data = data.filter(product =>
        product.name.toLowerCase().includes(search) ||
        (product.description || '').toLowerCase().includes(search) ||
        String(product.id).includes(search) ||
        (product.sellerName || '').toLowerCase().includes(search)
      );
    }


    if (categoryId !== null) {
      data = data.filter(product => product.categoryId === categoryId);
    }


    if (saleType !== 'ALL') {
      data = data.filter(product => product.saleType === saleType);
    }


    if (status !== 'ALL') {
      const isActive = status === 'ACTIVE';
      data = data.filter(product => product.active === isActive);
    }


    data.sort((a, b) => {
      switch (sort) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price-asc':
          return (a.basePrice ?? 0) - (b.basePrice ?? 0);
        case 'price-desc':
          return (b.basePrice ?? 0) - (a.basePrice ?? 0);
        case 'date-asc':
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case 'date-desc':
        default:
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });


    return data;
  });


  totalPages = computed(() => {
    const total = this.filteredProducts().length;
    return Math.max(1, Math.ceil(total / this.pageSize()));
  });


  paginatedProducts = computed(() => {
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    const end = start + size;
    return this.filteredProducts().slice(start, end);
  });


  startItem = computed(() => {
    const total = this.filteredProducts().length;
    if (total === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });


  endItem = computed(() => {
    return Math.min(this.currentPage() * this.pageSize(), this.filteredProducts().length);
  });


  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }


  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (data) => this.categories.set(data),
      error: (err) => console.error('Error loading categories:', err)
    });
  }


  loadProducts(): void {
    this.loading.set(true);
    this.error.set('');


    this.productService.getAll().subscribe({
      next: (data) => {
        this.products.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.error.set(this.extractErrorMessage(err, 'Unable to load products.'));
        this.loading.set(false);
      }
    });
  }


  openCreateForm(): void {
    this.router.navigate(['/admin/ecommerce/products/new']);
  }


  openEditForm(id: number): void {
    this.router.navigate(['/admin/ecommerce/products/edit', id]);
  }


  deleteProduct(id: number): void {
    const confirmed = confirm('Are you sure you want to delete this product?');
    if (!confirmed) return;


    this.error.set('');
    this.success.set('');


    this.productService.delete(id).subscribe({
      next: () => {
        this.success.set('Product deleted successfully.');
        this.loadProducts();
      },
      error: (err) => {
        console.error('Error deleting product:', err);
        this.error.set(this.extractErrorMessage(err, 'Error while deleting product.'));
      }
    });
  }


 getCategoryName(categoryId: number | null | undefined): string {
  if (categoryId == null) return '—';


  const category = this.categories().find(c => c.id === categoryId);
  return category?.name ?? 'Unknown category';
}


  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.currentPage.set(1);
  }


  onCategoryChange(value: string): void {
    this.selectedCategoryId.set(value ? Number(value) : null);
    this.currentPage.set(1);
  }


  onSaleTypeChange(value: string): void {
    this.selectedSaleType.set(value);
    this.currentPage.set(1);
  }


  onStatusChange(value: string): void {
    this.selectedStatus.set(value);
    this.currentPage.set(1);
  }


  onSortChange(value: SortOption): void {
    this.sortBy.set(value);
    this.currentPage.set(1);
  }


  onPageSizeChange(value: string): void {
    this.pageSize.set(Number(value));
    this.currentPage.set(1);
  }


  goToPreviousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(v => v - 1);
    }
  }


  goToNextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(v => v + 1);
    }
  }


  resetFilters(): void {
    this.searchTerm.set('');
    this.selectedCategoryId.set(null);
    this.selectedSaleType.set('ALL');
    this.selectedStatus.set('ALL');
    this.sortBy.set('date-desc');
    this.pageSize.set(5);
    this.currentPage.set(1);
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
 


  private extractErrorMessage(err: any, fallback: string): string {
    if (err?.error?.message) return err.error.message;
    if (typeof err?.error === 'string') return err.error;
    return fallback;
  }
}






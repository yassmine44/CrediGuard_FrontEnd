import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';


import { ProductService } from './services/product.service';
import { CategoryService } from './services/category.service';
import { Product } from './models/product.model';
import { Category } from './models/category.model';


import { EcommerceFinanceStatsService } from './services/ecommerce-finance-stats.service';
import { EcommerceFinanceOverview } from './models/ecommerce-finance-overview.model';


interface KpiCard {
  title: string;
  value: string | number;
  subtitle: string;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  icon: string;
}


interface ModuleCard {
  title: string;
  description: string;
  icon: string;
  route: string;
  action: string;
}
interface QuickAction {
  label: string;
  route: string;
  icon: string;
}
@Component({
  selector: 'app-ecommerce',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, CurrencyPipe],
  templateUrl: './ecommerce.component.html',
  styleUrl: './ecommerce.component.scss'
})
export class EcommerceComponent implements OnInit {


  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private financeStatsService = inject(EcommerceFinanceStatsService);


  financeOverview = signal<EcommerceFinanceOverview | null>(null);
  financeLoading = signal(false);


  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(false);
  error = signal('');


  totalProducts = computed(() => this.products().length);
  totalCategories = computed(() => this.categories().length);
  activeProducts = computed(() => this.products().filter(p => p.active).length);
  preorderProducts = computed(() => this.products().filter(p => p.saleType === 'PREORDER').length);
  outOfStockProducts = computed(() => this.products().filter(p => (p.stockQuantity ?? 0) <= 0).length);


  kpis = computed<KpiCard[]>(() => [
    {
      title: 'Total Products',
      value: this.totalProducts(),
      subtitle: 'Products in catalog',
      trend: `${this.activeProducts()} active`,
      trendType: 'positive',
      icon: 'inventory_2'
    },
    {
      title: 'Categories',
      value: this.totalCategories(),
      subtitle: 'Product categories',
      trend: 'Well organized',
      trendType: 'neutral',
      icon: 'category'
    },
    {
      title: 'Preorders',
      value: this.preorderProducts(),
      subtitle: 'Products in preorder',
      trend: `${this.preorderProducts()} active`,
      trendType: 'neutral',
      icon: 'shopping_cart'
    },
    {
      title: 'Out of Stock',
      value: this.outOfStockProducts(),
      subtitle: 'Need attention',
      trend: this.outOfStockProducts() > 0 ? 'Critical' : 'Healthy',
      trendType: this.outOfStockProducts() > 0 ? 'negative' : 'positive',
      icon: 'warning'
    }
  ]);


  modules: ModuleCard[] = [
    {
      title: 'Products',
      description: 'Manage catalog, stock, visibility and pricing',
      icon: 'inventory_2',
      route: '/admin/ecommerce/products',
      action: 'Manage Products'
    },
    {
      title: 'Categories',
      description: 'Create and organize product categories',
      icon: 'category',
      route: '/admin/ecommerce/categories',
      action: 'Manage Categories'
    },
    {
      title: 'Orders',
      description: 'Track and process customer orders',
      icon: 'receipt_long',
      route: '/admin/ecommerce/orders',
      action: 'View Orders'
    },
    {
      title: 'Payments',
      description: 'Monitor transactions and payment status',
      icon: 'payments',
      route: '/admin/ecommerce/payments',
      action: 'Manage Payments'
    },
    {
      title: 'Deliveries',
      description: 'Track shipments and delivery status',
      icon: 'local_shipping',
      route: '/admin/ecommerce/deliveries',
      action: 'Manage Deliveries'
    },
    {
      title: 'Promo Codes',
      description: 'Create and control promotional codes',
      icon: 'local_offer',
      route: '/admin/ecommerce/promo-codes',
      action: 'Manage Promo Codes'
    },
    {
      title: 'Finance Dashboard',
      description: 'Analyze revenue, orders, and financial performance',
      icon: 'insights',
      route: '/admin/ecommerce/finance-dashboard',
      action: 'View Finance'
    },
    {
      title: 'Calendar Events',
      description: 'Manage seasonal events and campaign periods',
      icon: 'event',
      route: '/admin/ecommerce/calendar-events',
      action: 'Manage Events'
    },
    {
      title: 'Promotions',
      description: 'Create and manage discount campaigns',
      icon: 'sell',
      route: '/admin/ecommerce/promotions',
      action: 'Manage Promotions'
    },
    {
      title: 'Product Requests',
      description: 'Monitor client requests, offers, and moderation actions',
      icon: 'request_quote',
      route: '/admin/ecommerce/product-requests',
      action: 'Manage Requests'
    }
  ];


  quickActions: QuickAction[] = [
    {
      label: 'Add Product',
      route: '/admin/ecommerce/products/new',
      icon: 'add'
    },
    {
      label: 'View All Products',
      route: '/admin/ecommerce/products',
      icon: 'inventory_2'
    },
    {
      label: 'Manage Categories',
      route: '/admin/ecommerce/categories',
      icon: 'category'
    },
    {
      label: 'View Orders',
      route: '/admin/ecommerce/orders',
      icon: 'shopping_cart'
    },
    {
      label: 'Promo Codes',
      route: '/admin/ecommerce/promo-codes',
      icon: 'local_offer'
    },
    {
      label: 'Finance Dashboard',
      route: '/admin/ecommerce/finance-dashboard',
      icon: 'insights'
    },
    {
      label: 'Calendar Events',
      route: '/admin/ecommerce/calendar-events',
      icon: 'event'
    },
    {
      label: 'Promotions',
      route: '/admin/ecommerce/promotions',
      icon: 'sell'
    },
    {
      label: 'Product Requests',
      route: '/admin/ecommerce/product-requests',
      icon: 'request_quote'
    }
  ];


  ngOnInit(): void {
    this.loadDashboardData();
    this.loadFinanceOverview();
  }


  loadFinanceOverview(): void {
    this.financeLoading.set(true);


    this.financeStatsService.getOverview().subscribe({
      next: (data) => {
        this.financeOverview.set(data);
        this.financeLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading finance overview:', err);
        this.financeLoading.set(false);
      }
    });
  }


  loadDashboardData(): void {
    this.loading.set(true);
    this.error.set('');


    this.productService.getAll().subscribe({
      next: (productData) => {
        this.products.set(productData || []);


        this.categoryService.getAll().subscribe({
          next: (categoryData) => {
            this.categories.set(categoryData || []);
            this.loading.set(false);
          },
          error: (err) => {
            console.error('Error loading categories:', err);
            this.error.set('Unable to load categories.');
            this.loading.set(false);
          }
        });
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.error.set('Unable to load dashboard data.');
        this.loading.set(false);
      }
    });
  }
}
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
import { ProductIntelligenceService } from './services/product-intelligence.service';
import {
  ProductIntelligence,
  ProductIntelligenceModelInfo,
  ProductPerformanceLabel,
  ProductRiskLevel,
  ProductSuggestedAction
} from './models/product-intelligence.model';


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

interface ModuleGroup {
  title: string;
  subtitle: string;
  icon: string;
  modules: ModuleCard[];
}

interface QuickAction {
  label: string;
  route: string;
  icon: string;
}

interface AttentionItem {
  title: string;
  description: string;
  icon: string;
  metric?: string | number;
  route?: string;
  actionLabel?: string;
  tone: 'success' | 'warning' | 'danger' | 'info';
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
  private productIntelligenceService = inject(ProductIntelligenceService);


  financeOverview = signal<EcommerceFinanceOverview | null>(null);
  financeLoading = signal(false);
  productIntelligence = signal<ProductIntelligence[]>([]);
  productIntelligenceModelInfo = signal<ProductIntelligenceModelInfo | null>(null);
  intelligenceLoading = signal(false);
  intelligenceAnalyzing = signal(false);


  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(false);
  error = signal('');


  totalProducts = computed(() => this.products().length);
  totalCategories = computed(() => this.categories().length);
  activeProducts = computed(() => this.products().filter(p => p.active).length);
  preorderProducts = computed(() => this.products().filter(p => p.saleType === 'PREORDER').length);
  outOfStockProducts = computed(() => this.products().filter(p => (p.stockQuantity ?? 0) <= 0).length);
  inactiveProducts = computed(() => this.products().filter(p => !p.active).length);
  catalogHealth = computed(() => {
    const total = this.totalProducts();
    return total ? Math.round((this.activeProducts() / total) * 100) : 0;
  });
  highRiskProducts = computed(() =>
    this.productIntelligence().filter(item => item.riskLevel === 'HIGH').length
  );
  restockActions = computed(() =>
    this.productIntelligence().filter(item => item.suggestedAction === 'RESTOCK').length
  );
  promoteActions = computed(() =>
    this.productIntelligence().filter(item => item.suggestedAction === 'PROMOTE').length
  );
  confidentMlDecisions = computed(() =>
    this.productIntelligence().filter(item =>
      (item.riskConfidence ?? 0) >= 80 &&
      (item.actionConfidence ?? 0) >= 80
    ).length
  );
  monthlyRevenueShare = computed(() => {
    const stats = this.financeOverview();

    if (!stats?.totalRevenue) {
      return 0;
    }

    return Math.min(100, Math.round((stats.monthlyRevenue / stats.totalRevenue) * 100));
  });
  intelligencePreview = computed(() =>
    [...this.productIntelligence()]
      .sort((a, b) => {
        const riskOrder: Record<ProductRiskLevel, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        return riskOrder[a.riskLevel] - riskOrder[b.riskLevel] || a.daysToStockout - b.daysToStockout;
      })
      .slice(0, 3)
  );


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
    },
    {
      title: 'Product Intelligence',
      description: 'Review ML stock risk, performance scores, and suggested actions',
      icon: 'psychology',
      route: '/admin/ecommerce/product-intelligence',
      action: 'View Intelligence'
    }
  ];

  moduleGroups = computed<ModuleGroup[]>(() => [
    {
      title: 'Catalog',
      subtitle: 'Products, pricing, stock and categories',
      icon: 'inventory_2',
      modules: this.modules.filter(module => ['Products', 'Categories'].includes(module.title))
    },
    {
      title: 'Sales Operations',
      subtitle: 'Orders, payments and delivery follow-up',
      icon: 'receipt_long',
      modules: this.modules.filter(module => ['Orders', 'Payments', 'Deliveries'].includes(module.title))
    },
    {
      title: 'Marketing',
      subtitle: 'Promotions, promo codes and seasonal campaigns',
      icon: 'campaign',
      modules: this.modules.filter(module => ['Promo Codes', 'Promotions', 'Calendar Events'].includes(module.title))
    },
    {
      title: 'Finance & Requests',
      subtitle: 'Revenue analytics and customer product requests',
      icon: 'insights',
      modules: this.modules.filter(module => ['Finance Dashboard', 'Product Requests', 'Product Intelligence'].includes(module.title))
    }
  ]);

  attentionItems = computed<AttentionItem[]>(() => {
    const items: AttentionItem[] = [];
    const finance = this.financeOverview();

    if (this.highRiskProducts() > 0) {
      items.push({
        title: 'ML high-risk products',
        description: 'Product Intelligence detected products that need a stock or sales decision.',
        icon: 'psychology',
        metric: this.highRiskProducts(),
        route: '/admin/ecommerce/product-intelligence',
        actionLabel: 'Review ML',
        tone: 'danger'
      });
    }

    if (this.restockActions() > 0) {
      items.push({
        title: 'Restock actions suggested',
        description: 'The model recommends restocking items before availability becomes a sales blocker.',
        icon: 'inventory',
        metric: this.restockActions(),
        route: '/admin/ecommerce/product-intelligence',
        actionLabel: 'Open actions',
        tone: 'warning'
      });
    }

    if (this.outOfStockProducts() > 0) {
      items.push({
        title: `${this.outOfStockProducts()} product${this.outOfStockProducts() > 1 ? 's' : ''} out of stock`,
        description: 'Review stock levels before customers reach unavailable items.',
        icon: 'priority_high',
        metric: this.outOfStockProducts(),
        route: '/admin/ecommerce/products',
        actionLabel: 'Fix stock',
        tone: 'danger'
      });
    }

    if (this.promoteActions() > 0) {
      items.push({
        title: 'Promotion opportunities',
        description: 'Some products are slow moving and may benefit from a discount or campaign push.',
        icon: 'campaign',
        metric: this.promoteActions(),
        route: '/admin/ecommerce/promotions',
        actionLabel: 'Prepare promo',
        tone: 'info'
      });
    }

    if (finance && finance.paidOrders === 0) {
      items.push({
        title: 'No paid orders detected',
        description: 'Finance snapshot has no paid orders yet, so check checkout, payment status or campaign traffic.',
        icon: 'payments',
        metric: '0',
        route: '/admin/ecommerce/finance-dashboard',
        actionLabel: 'View finance',
        tone: 'warning'
      });
    }

    if (this.inactiveProducts() > 0) {
      items.push({
        title: `${this.inactiveProducts()} inactive product${this.inactiveProducts() > 1 ? 's' : ''}`,
        description: 'Check hidden catalog entries and publish the ready ones.',
        icon: 'visibility_off',
        metric: this.inactiveProducts(),
        route: '/admin/ecommerce/products',
        actionLabel: 'Review catalog',
        tone: 'warning'
      });
    }

    if (this.preorderProducts() > 0) {
      items.push({
        title: `${this.preorderProducts()} preorder campaign${this.preorderProducts() > 1 ? 's' : ''}`,
        description: 'Keep release dates, stock expectations and customer messaging aligned.',
        icon: 'event_available',
        metric: this.preorderProducts(),
        route: '/admin/ecommerce/products',
        actionLabel: 'View products',
        tone: 'info'
      });
    }

    if (!items.length) {
      items.push({
        title: 'Catalog looks healthy',
        description: 'No urgent stock, ML or finance issue detected right now.',
        icon: 'check_circle',
        metric: 'OK',
        tone: 'success'
      });
    }

    return items.slice(0, 5);
  });


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
    },
    {
      label: 'Product Intelligence',
      route: '/admin/ecommerce/product-intelligence',
      icon: 'psychology'
    }
  ];


  ngOnInit(): void {
    this.loadDashboardData();
    this.loadFinanceOverview();
    this.loadProductIntelligence();
    this.loadProductIntelligenceModelInfo();
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

  loadProductIntelligence(): void {
    this.intelligenceLoading.set(true);

    this.productIntelligenceService.getAll().subscribe({
      next: (data) => {
        this.productIntelligence.set(data || []);
        this.intelligenceLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading product intelligence:', err);
        this.intelligenceLoading.set(false);
      }
    });
  }

  loadProductIntelligenceModelInfo(): void {
    this.productIntelligenceService.getModelInfo().subscribe({
      next: (data) => this.productIntelligenceModelInfo.set(data),
      error: (err) => console.error('Error loading product intelligence model info:', err)
    });
  }

  analyzeProductIntelligence(): void {
    this.intelligenceAnalyzing.set(true);

    this.productIntelligenceService.analyzeAll().subscribe({
      next: (data) => {
        this.productIntelligence.set(data || []);
        this.loadProductIntelligenceModelInfo();
        this.intelligenceAnalyzing.set(false);
      },
      error: (err) => {
        console.error('Error analyzing product intelligence:', err);
        this.intelligenceAnalyzing.set(false);
      }
    });
  }

  formatRiskLevel(level: ProductRiskLevel): string {
    return level.toLowerCase();
  }

  formatPerformanceLabel(label: ProductPerformanceLabel): string {
    return label.toLowerCase().replace(/_/g, ' ');
  }

  formatSuggestedAction(action: ProductSuggestedAction): string {
    return action.toLowerCase();
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

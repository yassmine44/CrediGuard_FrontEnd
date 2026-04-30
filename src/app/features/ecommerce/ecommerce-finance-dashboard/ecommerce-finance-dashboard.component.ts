import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { PaymentMethodStats } from '../models/payment-method-stats.model';
import { EcommerceFinanceStatsService } from '../services/ecommerce-finance-stats.service';
import { EcommerceFinanceOverview } from '../models/ecommerce-finance-overview.model';
import { RevenueByMonth } from '../models/revenue-by-month.model';
import { TopProductStats } from '../models/top-product-stats.model';
import { LowStockProduct } from '../models/low-stock-product.model';
import { RevenueByCategory } from '../models/revenue-by-category.model';
@Component({
  selector: 'app-ecommerce-finance-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, MatIconModule, BaseChartDirective],
  templateUrl: './ecommerce-finance-dashboard.component.html',
  styleUrl: './ecommerce-finance-dashboard.component.scss'
})
export class EcommerceFinanceDashboardComponent implements OnInit {
  private financeStatsService = inject(EcommerceFinanceStatsService);

  loading = signal(false);
  error = signal<string | null>(null);
  overview = signal<EcommerceFinanceOverview | null>(null);
  revenueByMonth = signal<RevenueByMonth[]>([]);
  paymentMethodStats = signal<PaymentMethodStats[]>([]);
  revenueByCategory = signal<RevenueByCategory[]>([]);
  topProducts = signal<TopProductStats[]>([]);
  revenueChartType: 'bar' = 'bar';
  paymentChartType: 'doughnut' = 'doughnut';
  categoryChartType: 'bar' = 'bar';
  lowStockProducts = signal<LowStockProduct[]>([]);

  totalPaymentVolume = computed(() =>
    this.paymentMethodStats().reduce((sum, item) => sum + item.totalAmount, 0)
  );

  totalPaymentCount = computed(() =>
    this.paymentMethodStats().reduce((sum, item) => sum + item.count, 0)
  );

  bestProduct = computed(() => this.topProducts()[0] ?? null);
  criticalStockCount = computed(() =>
    this.lowStockProducts().filter(item => item.stockQuantity <= 2).length
  );

  revenueChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Revenue',
        data: [],
        backgroundColor: '#2563eb',
        borderRadius: 8,
        maxBarThickness: 42
      }
    ]
  };

  paymentChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: ['#2563eb', '#059669', '#f59e0b', '#7c3aed'],
        borderColor: '#ffffff',
        borderWidth: 4
      }
    ]
  };

  categoryChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Revenue by category',
        data: [],
        backgroundColor: '#059669',
        borderRadius: 8,
        maxBarThickness: 34
      }
    ]
  };

  revenueChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => `TND ${Number(context.raw).toFixed(3)}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `TND ${Number(value).toFixed(0)}`
        }
      }
    }
  };

  paymentChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '62%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 18
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = Number(context.raw);
            return ` ${context.label}: ${value} payments`;
          }
        }
      }
    }
  };

  categoryChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => `TND ${Number(context.raw).toFixed(3)}`
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `TND ${Number(value).toFixed(0)}`
        }
      }
    }
  };

  ngOnInit(): void {
  this.loadOverview();
  this.loadRevenueByMonth();
  this.loadPaymentMethodDistribution();
  this.loadTopProducts();
  this.loadLowStockProducts();
  this.loadRevenueByCategory();
}
loadRevenueByCategory(): void {
  this.financeStatsService.getRevenueByCategory().subscribe({
    next: (data) => {
      const items = data ?? [];
      this.revenueByCategory.set(items);
      this.categoryChartData = {
        labels: items.map(item => item.categoryName),
        datasets: [
          {
            label: 'Revenue by category',
            data: items.map(item => item.revenue),
            backgroundColor: '#059669',
            borderRadius: 8,
            maxBarThickness: 34
          }
        ]
      };
    },
    error: (err) => {
      console.error('Failed to load revenue by category:', err);
    }
  });
}
loadTopProducts(): void {
  this.financeStatsService.getTopProducts().subscribe({
    next: (data) => {
      this.topProducts.set(data ?? []);
    },
    error: (err) => {
      console.error('Failed to load top products:', err);
    }
  });
}
loadLowStockProducts(): void {
  this.financeStatsService.getLowStockProducts().subscribe({
    next: (data) => {
      this.lowStockProducts.set(data ?? []);
    },
    error: (err) => {
      console.error('Failed to load low stock products:', err);
    }
  });
}
loadPaymentMethodDistribution(): void {
  this.financeStatsService.getPaymentMethodDistribution().subscribe({
    next: (data) => {
      const items = data ?? [];
      this.paymentMethodStats.set(items);
      this.paymentChartData = {
        labels: items.map(item => this.formatPaymentMethod(item.paymentMethod)),
        datasets: [
          {
            data: items.map(item => item.count),
            backgroundColor: ['#2563eb', '#059669', '#f59e0b', '#7c3aed'],
            borderColor: '#ffffff',
            borderWidth: 4
          }
        ]
      };
    },
    error: (err) => {
      console.error('Failed to load payment method distribution:', err);
    }
  });
}
formatPaymentMethod(method: string): string {
  return method
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}
  loadOverview(): void {
    this.loading.set(true);
    this.error.set(null);

    this.financeStatsService.getOverview().subscribe({
      next: (data) => {
        this.overview.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load finance overview:', err);
        this.error.set('Failed to load finance statistics.');
        this.loading.set(false);
      }
    });
  }

  loadRevenueByMonth(): void {
    this.financeStatsService.getRevenueByMonth().subscribe({
      next: (data) => {
        const items = data ?? [];
        this.revenueByMonth.set(items);

        this.revenueChartData = {
          labels: items.map(item => item.month),
          datasets: [
            {
              label: 'Revenue',
              data: items.map(item => item.revenue),
              backgroundColor: '#2563eb',
              borderRadius: 8,
              maxBarThickness: 42
            }
          ]
        };
      },
      error: (err) => {
        console.error('Failed to load revenue by month:', err);
      }
    });
  }
  goBack(): void {
  window.history.back();
}
}

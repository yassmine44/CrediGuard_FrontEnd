import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import {
  ProductIntelligence,
  ProductIntelligenceHistory,
  ProductIntelligenceModelInfo,
  ProductPerformanceLabel,
  ProductRiskLevel,
  ProductSuggestedAction
} from '../models/product-intelligence.model';
import { ProductIntelligenceService } from '../services/product-intelligence.service';

@Component({
  selector: 'app-product-intelligence-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIconModule],
  templateUrl: './product-intelligence-admin.component.html',
  styleUrl: './product-intelligence-admin.component.scss'
})
export class ProductIntelligenceAdminComponent implements OnInit {
  private productIntelligenceService = inject(ProductIntelligenceService);

  items = signal<ProductIntelligence[]>([]);
  modelInfo = signal<ProductIntelligenceModelInfo | null>(null);
  loading = signal(false);
  analyzing = signal(false);
  error = signal('');
  selectedInsight = signal<ProductIntelligence | null>(null);
  selectedHistory = signal<ProductIntelligenceHistory[]>([]);
  historyLoading = signal(false);
  searchTerm = signal('');
  riskFilter = signal<'ALL' | ProductRiskLevel>('ALL');
  actionFilter = signal<'ALL' | ProductSuggestedAction>('ALL');
  modelFilter = signal<'ALL' | 'ML' | 'FALLBACK'>('ALL');

  totalAnalyzed = computed(() => this.items().length);
  highRiskCount = computed(() => this.items().filter(item => item.riskLevel === 'HIGH').length);
  restockCount = computed(() => this.items().filter(item => item.suggestedAction === 'RESTOCK').length);
  promoteCount = computed(() => this.items().filter(item => item.suggestedAction === 'PROMOTE').length);
  criticalRestockCount = computed(() =>
    this.items().filter(item => item.riskLevel === 'HIGH' && item.suggestedAction === 'RESTOCK').length
  );
  confidentMlCount = computed(() =>
    this.items().filter(item =>
      (item.riskConfidence ?? 0) >= 80 &&
      (item.actionConfidence ?? 0) >= 80
    ).length
  );
  needsReviewCount = computed(() =>
    this.items().filter(item =>
      item.riskConfidence === null ||
      item.riskConfidence === undefined ||
      item.riskConfidence < 60 ||
      (item.actionConfidence !== null && item.actionConfidence !== undefined && item.actionConfidence < 60)
    ).length
  );
  trendSummary = computed(() => {
    const history = this.selectedHistory();

    if (history.length < 2) {
      return null;
    }

    const latest = history[0];
    const oldest = history[history.length - 1];
    const scoreDelta = latest.performanceScore - oldest.performanceScore;
    const riskTrend = this.compareRisk(latest.riskLevel, oldest.riskLevel);

    return {
      scoreDelta,
      riskTrend,
      latestAction: latest.suggestedAction,
      count: history.length
    };
  });

  filteredItems = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();

    return this.items().filter(item => {
      const matchesSearch = !search ||
        item.productName.toLowerCase().includes(search) ||
        (item.categoryName || '').toLowerCase().includes(search);
      const matchesRisk = this.riskFilter() === 'ALL' || item.riskLevel === this.riskFilter();
      const matchesAction = this.actionFilter() === 'ALL' || item.suggestedAction === this.actionFilter();
      const isMl = item.riskConfidence !== null && item.riskConfidence !== undefined;
      const matchesModel =
        this.modelFilter() === 'ALL' ||
        (this.modelFilter() === 'ML' && isMl) ||
        (this.modelFilter() === 'FALLBACK' && !isMl);

      return matchesSearch && matchesRisk && matchesAction && matchesModel;
    });
  });

  sortedItems = computed(() => {
    const riskOrder: Record<ProductRiskLevel, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return [...this.filteredItems()].sort((a, b) =>
      riskOrder[a.riskLevel] - riskOrder[b.riskLevel] ||
      a.daysToStockout - b.daysToStockout ||
      b.performanceScore - a.performanceScore
    );
  });

  ngOnInit(): void {
    this.loadData();
    this.loadModelInfo();
  }

  loadModelInfo(): void {
    this.productIntelligenceService.getModelInfo().subscribe({
      next: (data) => this.modelInfo.set(data),
      error: (err) => console.error('Failed to load model info:', err)
    });
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set('');

    this.productIntelligenceService.getAll().subscribe({
      next: (data) => {
        this.items.set(data || []);
        this.syncSelectedInsight(data || []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load product intelligence:', err);
        this.error.set('Failed to load product intelligence.');
        this.loading.set(false);
      }
    });
  }

  analyzeAll(): void {
    this.analyzing.set(true);
    this.error.set('');

    this.productIntelligenceService.analyzeAll().subscribe({
      next: (data) => {
        this.items.set(data || []);
        this.syncSelectedInsight(data || []);
        this.loadModelInfo();
        this.analyzing.set(false);
      },
      error: (err) => {
        console.error('Failed to analyze product intelligence:', err);
        this.error.set('Failed to run product intelligence analysis.');
        this.analyzing.set(false);
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

  selectInsight(item: ProductIntelligence): void {
    this.selectedInsight.set(item);
    this.loadHistory(item.productId);
  }

  closeInsight(): void {
    this.selectedInsight.set(null);
    this.selectedHistory.set([]);
  }

  scoreDelta(item: ProductIntelligenceHistory, index: number): number | null {
    const previous = this.selectedHistory()[index + 1];
    return previous ? item.performanceScore - previous.performanceScore : null;
  }

  riskTrend(item: ProductIntelligenceHistory, index: number): 'improved' | 'worsened' | 'stable' | null {
    const previous = this.selectedHistory()[index + 1];

    if (!previous) {
      return null;
    }

    return this.compareRisk(item.riskLevel, previous.riskLevel);
  }

  private compareRisk(current: ProductRiskLevel, previous: ProductRiskLevel): 'improved' | 'worsened' | 'stable' {
    const order: Record<ProductRiskLevel, number> = { LOW: 0, MEDIUM: 1, HIGH: 2 };
    const delta = order[current] - order[previous];

    if (delta < 0) {
      return 'improved';
    }

    if (delta > 0) {
      return 'worsened';
    }

    return 'stable';
  }

  actionChanged(item: ProductIntelligenceHistory, index: number): string | null {
    const previous = this.selectedHistory()[index + 1];

    if (!previous || previous.suggestedAction === item.suggestedAction) {
      return null;
    }

    return `${this.formatSuggestedAction(previous.suggestedAction)} -> ${this.formatSuggestedAction(item.suggestedAction)}`;
  }

  resetFilters(): void {
    this.searchTerm.set('');
    this.riskFilter.set('ALL');
    this.actionFilter.set('ALL');
    this.modelFilter.set('ALL');
  }

  loadHistory(productId: number): void {
    this.historyLoading.set(true);

    this.productIntelligenceService.getHistory(productId).subscribe({
      next: (history) => {
        this.selectedHistory.set(history || []);
        this.historyLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load product intelligence history:', err);
        this.selectedHistory.set([]);
        this.historyLoading.set(false);
      }
    });
  }

  showCriticalRestock(): void {
    this.searchTerm.set('');
    this.riskFilter.set('HIGH');
    this.actionFilter.set('RESTOCK');
    this.modelFilter.set('ALL');
  }

  showPromotionCandidates(): void {
    this.searchTerm.set('');
    this.riskFilter.set('ALL');
    this.actionFilter.set('PROMOTE');
    this.modelFilter.set('ALL');
  }

  showConfidentMl(): void {
    this.searchTerm.set('');
    this.riskFilter.set('ALL');
    this.actionFilter.set('ALL');
    this.modelFilter.set('ML');
  }

  showNeedsReview(): void {
    this.searchTerm.set('');
    this.riskFilter.set('ALL');
    this.actionFilter.set('ALL');
    this.modelFilter.set('ALL');
  }

  exportCsv(): void {
    const rows = this.sortedItems();
    const headers = [
      'Product',
      'Category',
      'Risk',
      'Risk Confidence',
      'Score',
      'Performance',
      'Action',
      'Action Confidence',
      'Stock',
      'Days To Stockout',
      'Sales 7d',
      'Sales 30d',
      'Recommendation',
      'ML Decision',
      'Main Drivers',
      'Model Type',
      'Analyzed At'
    ];

    const csvRows = [
      headers,
      ...rows.map(item => [
        item.productName,
        item.categoryName || 'Uncategorized',
        item.riskLevel,
        item.riskConfidence ?? '',
        item.performanceScore,
        this.formatPerformanceLabel(item.performanceLabel),
        item.suggestedAction,
        item.actionConfidence ?? '',
        item.currentStock,
        item.daysToStockout >= 999 ? 'No stockout risk' : item.daysToStockout,
        item.salesLast7Days,
        item.salesLast30Days,
        item.businessRecommendation || '',
        item.mlDecision || '',
        (item.mainDrivers || []).join(' | '),
        item.modelType || '',
        item.analyzedAt
      ])
    ];

    const csv = csvRows.map(row => row.map(value => this.escapeCsv(value)).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `product-intelligence-${date}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  private escapeCsv(value: unknown): string {
    const text = String(value ?? '');
    return `"${text.replace(/"/g, '""')}"`;
  }

  private syncSelectedInsight(items: ProductIntelligence[]): void {
    const selected = this.selectedInsight();

    if (!selected) {
      this.selectedInsight.set(items[0] || null);
      if (items[0]) {
        this.loadHistory(items[0].productId);
      }
      return;
    }

    const nextSelected = items.find(item => item.productId === selected.productId) || items[0] || null;
    this.selectedInsight.set(nextSelected);
    if (nextSelected) {
      this.loadHistory(nextSelected.productId);
    }
  }
}

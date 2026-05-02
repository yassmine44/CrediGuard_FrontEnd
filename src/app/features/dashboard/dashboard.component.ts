import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, CurrencyPipe, PercentPipe, DecimalPipe } from '@angular/common';
import { FinanceService, FinanceSummary } from '../../services/finance';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule, CommonModule, CurrencyPipe, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private readonly financeService = inject(FinanceService);
  protected readonly Math = Math;

  readonly stats = signal<FinanceSummary | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  // Chart Configuration
  public lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Revenus',
        backgroundColor: 'rgba(40, 167, 69, 0.2)',
        borderColor: '#28a745',
        pointBackgroundColor: '#28a745',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(40, 167, 69, 1)',
        fill: 'origin',
      },
      {
        data: [],
        label: 'Dépenses',
        backgroundColor: 'rgba(220, 53, 69, 0.2)',
        borderColor: '#dc3545',
        pointBackgroundColor: '#dc3545',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(220, 53, 69, 1)',
        fill: 'origin',
      }
    ]
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      line: { tension: 0.4 }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' }
      },
      x: {
        grid: { display: false }
      }
    },
    plugins: {
      legend: { display: true, position: 'top' },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1a1a1a',
        bodyColor: '#4a4a4a',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        boxPadding: 4
      }
    }
  };

  public lineChartType: ChartType = 'line';

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading.set(true);
    this.financeService.getFinanceSummary().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.updateChart(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading dashboard stats:', err);
        this.error.set('Impossible de charger les statistiques.');
        this.loading.set(false);
      }
    });
  }

  private updateChart(data: FinanceSummary): void {
    if (!data.monthlyRevenue || !data.monthlyExpenses) return;

    const labels = Object.keys(data.monthlyRevenue);
    const revenueValues = Object.values(data.monthlyRevenue);
    const expenseValues = Object.values(data.monthlyExpenses);

    this.lineChartData = {
      labels: labels,
      datasets: [
        { ...this.lineChartData.datasets[0], data: revenueValues },
        { ...this.lineChartData.datasets[1], data: expenseValues }
      ]
    };
  }
}
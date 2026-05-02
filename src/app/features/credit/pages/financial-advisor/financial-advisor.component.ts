import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartOptions } from 'chart.js';
import { FinancialAdvisorService } from '../../services/financial-advisor.service';
import { FinancialAdvisorResponse } from '../../models/financial-advisor.model';

@Component({
  selector: 'app-financial-advisor',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './financial-advisor.component.html',
  styleUrl: './financial-advisor.component.scss',
})
export class FinancialAdvisorComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private advisorService = inject(FinancialAdvisorService);

  demandeId = Number(this.route.snapshot.paramMap.get('demandeId'));

  advisor = signal<FinancialAdvisorResponse | null>(null);
  loading = signal(false);
  error = signal('');

  scoreChartData = signal<ChartData<'bar'>>({
    labels: [],
    datasets: [],
  });

  riskChartData = signal<ChartData<'line'>>({
    labels: [],
    datasets: [],
  });

  impactChartData = signal<ChartData<'bar'>>({
    labels: [],
    datasets: [],
  });

  scoreChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { color: '#475569' },
        grid: { color: '#e2e8f0' },
      },
      x: {
        ticks: { color: '#475569' },
        grid: { display: false },
      },
    },
  };

  riskChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { color: '#475569' },
        grid: { color: '#e2e8f0' },
      },
      x: {
        ticks: { color: '#475569' },
        grid: { display: false },
      },
    },
  };

  impactChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { color: '#475569' },
        grid: { color: '#e2e8f0' },
      },
      y: {
        ticks: { color: '#475569' },
        grid: { display: false },
      },
    },
  };

  ngOnInit(): void {
    if (!this.demandeId) {
      this.error.set('Invalid credit request.');
      return;
    }

    this.loadAdvisor();
  }

  loadAdvisor(): void {
    this.loading.set(true);
    this.error.set('');

    this.advisorService.getByDemande(this.demandeId).subscribe({
      next: (data) => {
        this.advisor.set(data);
        this.buildCharts(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set(err?.error?.error || 'Unable to load financial advisor.');
        this.loading.set(false);
      },
    });
  }

  buildCharts(data: FinancialAdvisorResponse): void {
    const scorePoints = data.chartData?.scorePath || [];
    const riskPoints = data.chartData?.riskPath || [];
    const impactPoints = data.chartData?.impactRanking || [];

    this.scoreChartData.set({
      labels: scorePoints.map(point => point.label),
      datasets: [
        {
          data: scorePoints.map(point => point.value),
          backgroundColor: ['#0f3f7f', '#2563eb', '#dc1748', '#38bdf8', '#7c3aed', '#0f766e'],
          borderRadius: 12,
        },
      ],
    });

    this.riskChartData.set({
      labels: riskPoints.map(point => point.label),
      datasets: [
        {
          data: riskPoints.map(point => point.value),
          borderColor: '#dc1748',
          backgroundColor: 'rgba(220, 23, 72, 0.12)',
          pointBackgroundColor: '#0f3f7f',
          pointBorderColor: '#ffffff',
          pointRadius: 5,
          fill: true,
          tension: 0.35,
        },
      ],
    });

    this.impactChartData.set({
      labels: impactPoints.map(point => point.label),
      datasets: [
        {
          data: impactPoints.map(point => point.scoreGain),
          backgroundColor: '#0f3f7f',
          borderRadius: 10,
        },
      ],
    });
  }

  riskPercent(value: number | null | undefined): number {
    return Math.round((value || 0) * 10000) / 100;
  }

  goBack(): void {
    this.router.navigate(['/admin/credit/demandes', this.demandeId, 'evaluation']);
  }

  goToModalite(): void {
    this.router.navigate(['/admin/credit/demandes', this.demandeId, 'modalite']);
  }
}

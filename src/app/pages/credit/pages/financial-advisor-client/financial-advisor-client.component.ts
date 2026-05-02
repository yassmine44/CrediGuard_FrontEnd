import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { FinancialAdvisorClientService } from '../../services/financial-advisor-client.service';
import {
  ClientBankingPath,
  ClientBankingPlan,
  FinancialAdvisorClientResponse,
} from '../../models/financial-advisor-client.model';

@Component({
  selector: 'app-financial-advisor-client',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './financial-advisor-client.component.html',
  styleUrl: './financial-advisor-client.component.scss',
})
export class FinancialAdvisorClientComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private advisorService = inject(FinancialAdvisorClientService);

  demandeId = Number(this.route.snapshot.paramMap.get('demandeId'));

  loading = signal(false);
  error = signal('');
  advisor = signal<FinancialAdvisorClientResponse | null>(null);
  selectedPath = signal<ClientBankingPath | null>(null);

  plan = computed<ClientBankingPlan | null>(() => {
    return this.advisor()?.clientBankingPlan ?? null;
  });

  primaryPath = computed<ClientBankingPath | null>(() => {
    const paths = this.plan()?.paths ?? [];
    return paths.length > 0 ? paths[0] : null;
  });

  ngOnInit(): void {
    if (!this.demandeId || Number.isNaN(this.demandeId)) {
      this.error.set('Invalid credit request.');
      return;
    }

    this.loadAdvisor();
  }

  loadAdvisor(): void {
    this.loading.set(true);
    this.error.set('');

    this.advisorService.getAdvisor(this.demandeId).subscribe({
      next: (response) => {
        this.advisor.set(response);

        const firstPath = response.clientBankingPlan?.paths?.[0] ?? null;
        this.selectedPath.set(firstPath);

        this.loading.set(false);
      },
      error: (err) => {
        console.error('FINANCIAL ADVISOR ERROR =>', err);
        this.error.set(
          err?.error?.error ||
            err?.error?.message ||
            'Unable to load the financial advisor report.'
        );
        this.loading.set(false);
      },
    });
  }

  selectPath(path: ClientBankingPath): void {
    this.selectedPath.set(path);
  }

  money(value: number | null | undefined): string {
    const amount = Number(value ?? 0);

    return `${amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })} TND`;
  }

  goBack(): void {
    this.router.navigate(['/front/credit/history']);
  }
}

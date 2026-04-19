import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EcheanceService } from '../../services/echeance.service';
import { EcheanceResponse } from '../../models/echeance.model';
@Component({
  selector: 'app-echeance-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './echeance-list.component.html',
  styleUrl: './echeance-list.component.scss',
})
export class EcheanceListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private echeanceService = inject(EcheanceService);

  creditId = Number(this.route.snapshot.paramMap.get('creditId'));

  echeances = signal<EcheanceResponse[]>([]);
  loading = signal(false);
  error = signal('');
  success = signal('');
  payingId = signal<number | null>(null);

  ngOnInit(): void {
    if (!this.creditId) {
      this.error.set('Invalid credit.');
      return;
    }

    this.loadEcheances();
  }

  goBack(): void {
    this.router.navigate(['/front/credit/wallet']);
  }

  loadEcheances(): void {
    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    this.echeanceService.getByCredit(this.creditId).subscribe({
      next: (data) => {
        const sorted = [...(data ?? [])].sort(
          (a, b) =>
            new Date(a.dateEcheance).getTime() - new Date(b.dateEcheance).getTime()
        );
        this.echeances.set(sorted);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Unable to load repayment schedule.');
        this.loading.set(false);
      },
    });
  }

  getTotalDue(echeance: EcheanceResponse): number {
    return (echeance.capitalDu ?? 0) + (echeance.interetDu ?? 0);
  }

  canPay(echeance: EcheanceResponse): boolean {
    return echeance.statut === 'A_PAYER' || echeance.statut === 'EN_RETARD';
  }

  payEcheance(echeance: EcheanceResponse): void {
    const total = this.getTotalDue(echeance);

    this.payingId.set(echeance.id);
    this.error.set('');
    this.success.set('');

    this.echeanceService.pay(echeance.id, { montantPaye: total }).subscribe({
      next: () => {
        this.success.set(`Installment #${echeance.id} paid successfully.`);
        this.payingId.set(null);
        this.loadEcheances();
      },
      error: (err) => {
        console.error(err);
        this.error.set(
          err?.error?.message ||
            err?.error?.error ||
            'Unable to complete payment.'
        );
        this.payingId.set(null);
      },
    });
  }

  trackById(index: number, item: EcheanceResponse): number {
    return item.id;
  }
}
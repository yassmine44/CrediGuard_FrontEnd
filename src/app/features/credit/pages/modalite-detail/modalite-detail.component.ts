import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DemandeCreditService } from '../../services/demande-credit.service';
import { ModaliteService } from '../../services/modalite.service';
import { DemandeCreditResponse } from '../../models/demande-credit.model';
import {
  LigneAmortissement,
  ModaliteResponse,
  TypeModalite,
} from '../../models/modalite.model';

@Component({
  selector: 'app-modalite-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modalite-detail.component.html',
  styleUrl: './modalite-detail.component.scss',
})
export class ModaliteDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private demandeService = inject(DemandeCreditService);
  private modaliteService = inject(ModaliteService);

  demandeId = Number(this.route.snapshot.paramMap.get('demandeId'));

  demande = signal<DemandeCreditResponse | null>(null);
  modalite = signal<ModaliteResponse | null>(null);
  amortissement = signal<LigneAmortissement[]>([]);

  loading = signal(false);
  generating = signal(false);
  saving = signal(false);
  pdfLoading = signal(false);

  error = signal('');
  success = signal('');
  notFound = signal(false);

  selectedModalite: TypeModalite | null = null;
  commentaireAdmin = '';
  choisiePar = 'admin';

  ngOnInit(): void {
    if (!this.demandeId) {
      this.error.set('Invalid credit request.');
      return;
    }

    this.loadPage();
  }

  loadPage(): void {
    this.loading.set(true);
    this.error.set('');
    this.success.set('');
    this.notFound.set(false);

    this.demandeService.getById(this.demandeId).subscribe({
      next: (demande) => {
        this.demande.set(demande);
        this.loadModalite();
      },
      error: () => {
        this.error.set('Failed to load credit request.');
        this.loading.set(false);
      },
    });
  }

  loadModalite(): void {
    this.modaliteService.getByDemande(this.demandeId).subscribe({
      next: (modalite) => {
        this.applyModalite(modalite);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 404) {
          this.notFound.set(true);
        } else {
          this.error.set(err?.error?.error || 'Failed to load modalite.');
        }

        this.loading.set(false);
      },
    });
  }

  generateModalite(): void {
    this.generating.set(true);
    this.error.set('');
    this.success.set('');

    this.modaliteService.generate(this.demandeId).subscribe({
      next: (modalite) => {
        this.applyModalite(modalite);
        this.notFound.set(false);
        this.success.set('Modalite generated successfully.');
        this.generating.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(
          err?.error?.error ||
          'Unable to generate modalite. Run ML prediction first.'
        );
        this.generating.set(false);
      },
    });
  }

  chooseModalite(): void {
    if (!this.selectedModalite) {
      this.error.set('Please choose a modalite.');
      return;
    }

    this.saving.set(true);
    this.error.set('');
    this.success.set('');

    this.modaliteService.choose(this.demandeId, {
      modaliteChoisie: this.selectedModalite,
      commentaireAdmin: this.commentaireAdmin || null,
      choisiePar: this.choisiePar || 'admin',
    }).subscribe({
      next: (modalite) => {
        this.applyModalite(modalite);
        this.success.set('Modalite saved successfully.');
        this.saving.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err?.error?.error || 'Unable to save modalite.');
        this.saving.set(false);
      },
    });
  }

  loadAmortissement(): void {
    const current = this.modalite();

    if (!current || current.decision === 'REFUS') {
      this.amortissement.set([]);
      return;
    }

    this.modaliteService.getAmortissement(this.demandeId).subscribe({
      next: (rows) => this.amortissement.set(rows || []),
      error: () => this.amortissement.set([]),
    });
  }

  downloadAmortissementPdf(): void {
    this.pdfLoading.set(true);
    this.error.set('');

    this.modaliteService.downloadAmortissementPdf(this.demandeId).subscribe({
      next: (blob) => {
        const file = new Blob([blob], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(file);

        const link = document.createElement('a');
        link.href = url;
        link.download = `tableau-amortissement-demande-${this.demandeId}.pdf`;
        link.click();

        window.URL.revokeObjectURL(url);
        this.pdfLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err?.error?.error || 'Failed to download amortization PDF.');
        this.pdfLoading.set(false);
      },
    });
  }

  applyModalite(modalite: ModaliteResponse): void {
    this.modalite.set(modalite);

    this.selectedModalite =
      modalite.modaliteChoisie ||
      (modalite.modaliteRecommandee !== 'REFUS'
        ? modalite.modaliteRecommandee
        : 'REFUS');

    this.commentaireAdmin = modalite.commentaireAdmin || '';
    this.choisiePar = modalite.choisiePar || 'admin';

    this.loadAmortissement();
  }

  availableModalites(): TypeModalite[] {
    const current = this.modalite();

    if (!current || current.decision === 'REFUS') {
      return ['REFUS'];
    }

    return ['AMORTISSABLE', 'IN_FINE'];
  }

  selectedMonthlyAmount(): number {
    const current = this.modalite();

    if (!current || !this.selectedModalite) return 0;

    if (this.selectedModalite === 'AMORTISSABLE') {
      return current.mensualiteAmortissable || 0;
    }

    if (this.selectedModalite === 'IN_FINE') {
      return current.mensualiteInFine || 0;
    }

    return 0;
  }

  selectedTotalCost(): number {
    const current = this.modalite();

    if (!current || !this.selectedModalite) return 0;

    if (this.selectedModalite === 'AMORTISSABLE') {
      return current.coutTotalAmortissable || 0;
    }

    if (this.selectedModalite === 'IN_FINE') {
      return current.coutTotalInFine || 0;
    }

    return 0;
  }

  selectedExplanation(): string {
    if (this.selectedModalite === 'AMORTISSABLE') {
      return 'Le client paie une mensualite reguliere composee de capital et interets. Le capital diminue progressivement chaque mois.';
    }

    if (this.selectedModalite === 'IN_FINE') {
      return 'Le client paie uniquement les interets chaque mois, puis rembourse tout le capital a la derniere echeance.';
    }

    return 'Aucune modalite de remboursement ne peut etre proposee pour cette demande.';
  }

  goBack(): void {
    this.router.navigate(['/admin/credit/demandes', this.demandeId, 'evaluation']);
  }

  goToDossier(): void {
    this.router.navigate(['/admin/credit/demandes', this.demandeId]);
  }
}
    
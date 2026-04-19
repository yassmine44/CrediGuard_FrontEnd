import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DemandeCreditService } from '../../services/demande-credit.service';
import { EvaluationRisqueService } from '../../services/evaluation-risque.service';
import { DemandeCreditResponse } from '../../models/demande-credit.model';
import { EvaluationRisqueResponse } from '../../models/evaluation-risque.model';

@Component({
  selector: 'app-evaluation-risque-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './evaluation-risque-detail.component.html',
  styleUrl: './evaluation-risque-detail.component.scss',
})
export class EvaluationRisqueDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private demandeService = inject(DemandeCreditService);
  private evaluationService = inject(EvaluationRisqueService);

  demandeId = Number(this.route.snapshot.paramMap.get('demandeId'));

  demande = signal<DemandeCreditResponse | null>(null);
  evaluation = signal<EvaluationRisqueResponse | null>(null);

  loading = signal(false);
  error = signal('');
  notFound = signal(false);

  ngOnInit(): void {
    if (!this.demandeId) {
      this.error.set('Invalid request id.');
      return;
    }

    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set('');
    this.notFound.set(false);

    this.demandeService.getById(this.demandeId).subscribe({
      next: (demande) => {
        this.demande.set(demande);
        this.loadEvaluation();
      },
      error: () => {
        this.error.set('Failed to load request dossier.');
        this.loading.set(false);
      },
    });
  }

  loadEvaluation(): void {
    this.evaluationService.getByDemande(this.demandeId).subscribe({
      next: (evaluation) => {
        this.evaluation.set(evaluation);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 404) {
          this.notFound.set(true);
        } else {
          this.error.set('Failed to load prediction result.');
        }
        this.loading.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/credit/demandes', this.demandeId]);
  }

  goToProfil(): void {
    this.router.navigate(['/admin/credit/demandes', this.demandeId, 'profil']);
  }

  downloadPdf(): void {
    // Intentionally empty for now.
  }
}

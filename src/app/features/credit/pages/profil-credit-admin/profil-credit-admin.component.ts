import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DemandeCreditService } from '../../services/demande-credit.service';
import { ProfilCreditAdminService } from '../../services/profil-credit-admin.service';
import { EvaluationRisqueService } from '../../services/evaluation-risque.service';
import { DemandeCreditResponse } from '../../models/demande-credit.model';
import { ProfilCreditResponse } from '../../models/profil-credit.model';
import { EvaluationRisqueResponse } from '../../models/evaluation-risque.model';

@Component({
  selector: 'app-profil-credit-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profil-credit-admin.component.html',
  styleUrl: './profil-credit-admin.component.scss',
})
export class ProfilCreditAdminComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private demandeService = inject(DemandeCreditService);
  private profilService = inject(ProfilCreditAdminService);
  private evaluationService = inject(EvaluationRisqueService);

  demandeId = Number(this.route.snapshot.paramMap.get('demandeId'));

  demande = signal<DemandeCreditResponse | null>(null);
  profil = signal<ProfilCreditResponse | null>(null);
  evaluation = signal<EvaluationRisqueResponse | null>(null);

  loading = signal(false);
  error = signal('');
  profilMissing = signal(false);
  evaluationMissing = signal(false);

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
    this.profilMissing.set(false);
    this.evaluationMissing.set(false);

    this.demandeService.getById(this.demandeId).subscribe({
      next: (demande) => {
        this.demande.set(demande);
        this.loadProfilAndEvaluation(demande.clientId);
      },
      error: () => {
        this.error.set('Failed to load request dossier.');
        this.loading.set(false);
      },
    });
  }

  loadProfilAndEvaluation(clientId: number): void {
    this.profilService.getByClientId(clientId).subscribe({
      next: (profil) => {
        this.profil.set(profil);
        this.loadEvaluation();
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 404) {
          this.profilMissing.set(true);
        } else {
          this.error.set('Failed to load client credit profile.');
        }
        this.loadEvaluation();
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
          this.evaluationMissing.set(true);
        }
        this.loading.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/credit/demandes', this.demandeId]);
  }

  goToEvaluation(): void {
    this.router.navigate(['/admin/credit/demandes', this.demandeId, 'evaluation']);
  }

  startPrediction(): void {
    // Route backend de prédiction Flask à brancher plus tard.
    this.router.navigate(['/admin/credit/demandes', this.demandeId, 'evaluation']);
  }
}

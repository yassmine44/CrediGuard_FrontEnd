import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { PlanUtilisationCreditService } from '../../services/plan-utilisation-credit.service';
import { PlanUtilisationResponse } from '../../models/plan-utilisation-credit.model';

@Component({
  selector: 'app-plan-utilisation-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './plan-utilisation-list.component.html',
  styleUrl: './plan-utilisation-list.component.scss',
})
export class PlanUtilisationListComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private planService = inject(PlanUtilisationCreditService);

  demandeId = Number(this.route.snapshot.paramMap.get('demandeId'));

  plan = signal<PlanUtilisationResponse | null>(null);
  loading = signal(false);
  error = signal('');
  notFound = signal(false);

  ngOnInit(): void {
    if (!this.demandeId) {
      this.error.set('Demande invalide.');
      return;
    }

    this.loadPlan();
  }

  loadPlan(): void {
    this.loading.set(true);
    this.error.set('');
    this.notFound.set(false);

    this.planService.getByDemande(this.demandeId).subscribe({
      next: (data) => {
        this.plan.set(data);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 404) {
          this.notFound.set(true);
        } else {
          this.error.set('Erreur lors du chargement du plan.');
        }
        this.loading.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/credit/demandes', this.demandeId]);
  }
}
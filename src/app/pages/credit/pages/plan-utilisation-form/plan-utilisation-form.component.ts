import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { PlanUtilisationCreditService } from '../../services/plan-utilisation-credit.service';
import {
  NatureActivite,
  PlanUtilisationRequest,
} from '../../models/plan-utilisation-credit.model';

@Component({
  selector: 'app-plan-utilisation-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './plan-utilisation-form.component.html',
  styleUrl: './plan-utilisation-form.component.scss',
})
export class PlanUtilisationFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private planService = inject(PlanUtilisationCreditService);

  demandeId = Number(this.route.snapshot.paramMap.get('demandeId'));
  loading = signal(false);
  saving = signal(false);
  error = signal('');
  success = signal('');
  editMode = signal(false);

  natureActivites: NatureActivite[] = [
    'AGRICULTURE',
    'COMMERCE',
    'SERVICE',
    'ARTISANAT',
    'AUTRE',
  ];

  form = this.fb.group({
    descriptionProjet: ['', [Validators.required]],
    objectifCredit: ['', [Validators.required]],
    montantInvestissement: [null as number | null, [Validators.required, Validators.min(1)]],
    revenuMensuelPrevu: [0 as number | null, [Validators.min(0)]],
    profitMensuelPrevu: [0 as number | null, [Validators.min(0)]],
    delaiRentabiliteMois: [null as number | null, [Validators.required, Validators.min(1)]],
    natureActivite: ['COMMERCE' as NatureActivite, [Validators.required]],
  });

  ngOnInit(): void {
    if (!this.demandeId) {
      this.error.set('Invalid credit request.');
      return;
    }

    this.loadPlan();
  }

  loadPlan(): void {
    this.loading.set(true);
    this.error.set('');

    this.planService.getByDemande(this.demandeId).subscribe({
      next: (plan) => {
        this.editMode.set(true);
        this.form.patchValue({
          descriptionProjet: plan.descriptionProjet,
          objectifCredit: plan.objectifCredit,
          montantInvestissement: plan.montantInvestissement,
          revenuMensuelPrevu: plan.revenuMensuelPrevu,
          profitMensuelPrevu: plan.profitMensuelPrevu,
          delaiRentabiliteMois: plan.delaiRentabiliteMois,
          natureActivite: plan.natureActivite,
        });
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 404) {
          this.editMode.set(false);
        } else {
          this.error.set('Failed to load plan data.');
        }
        this.loading.set(false);
      },
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set('');
    this.success.set('');

    const payload = this.form.getRawValue() as PlanUtilisationRequest;

    const request$ = this.editMode()
      ? this.planService.update(this.demandeId, payload)
      : this.planService.create(this.demandeId, payload);

    request$.subscribe({
      next: () => {
        this.success.set(
          this.editMode()
            ? 'Plan updated successfully.'
            : 'Plan created successfully.'
        );
        this.editMode.set(true);
        this.saving.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(
          err.error?.message ||
          err.error?.error ||
          err.message ||
          `HTTP error ${err.status}`
        );
        this.saving.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/front/credit/history']);
  }
}
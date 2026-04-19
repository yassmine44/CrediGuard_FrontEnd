import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DecisionCreditService } from '../../services/decision-credit.service';
import {
  DecisionCreditRequest,
  DecisionCreditResponse,
  DecisionFinale,
} from '../../models/decision-credit.model';

@Component({
  selector: 'app-decision-credit-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './decision-credit-form.component.html',
styleUrl: './decision-credit-form.component.scss',
})
export class DecisionCreditFormComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private decisionService = inject(DecisionCreditService);

  demandeId = Number(this.route.snapshot.paramMap.get('demandeId'));

  loading = signal(false);
  saving = signal(false);
  error = signal('');
  success = signal('');
  existingDecision = signal<DecisionCreditResponse | null>(null);

  decisions: DecisionFinale[] = ['ACCEPTE', 'REFUSE', 'CONDITIONNEL'];

  form = this.fb.group({
    decisionFinale: ['ACCEPTE' as DecisionFinale, [Validators.required]],
    justification: ['', [Validators.required, Validators.minLength(5)]],
    conditions: [''],
    prisePar: ['', [Validators.required]],
  });

  ngOnInit(): void {
    if (!this.demandeId) {
      this.error.set('Invalid credit request.');
      return;
    }

    this.loadDecision();
  }

  loadDecision(): void {
    this.loading.set(true);
    this.error.set('');

    this.decisionService.getByDemande(this.demandeId).subscribe({
      next: (decision) => {
        this.existingDecision.set(decision);
        this.form.patchValue({
          decisionFinale: decision.decisionFinale,
          justification: decision.justification,
          conditions: decision.conditions ?? '',
          prisePar: decision.prisePar,
        });
        this.form.disable();
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status !== 404) {
          this.error.set('Failed to load decision data.');
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

    const value = this.form.getRawValue();

    if (value.decisionFinale === 'CONDITIONNEL' && !value.conditions?.trim()) {
      this.error.set('Conditions are required for a conditional decision.');
      return;
    }

    this.saving.set(true);
    this.error.set('');
    this.success.set('');

    const payload: DecisionCreditRequest = {
      decisionFinale: value.decisionFinale as DecisionFinale,
      justification: value.justification ?? '',
      conditions: value.conditions?.trim() || null,
      prisePar: value.prisePar ?? '',
    };

    this.decisionService.create(this.demandeId, payload).subscribe({
      next: (decision) => {
        this.existingDecision.set(decision);
        this.success.set('Decision submitted successfully.');
        this.form.disable();
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
    this.router.navigate(['/admin/credit/demandes', this.demandeId]);
  }
}
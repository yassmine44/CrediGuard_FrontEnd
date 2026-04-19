import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfilCreditService } from '../../services/profil-credit.service';
import {
  ProfilCreditRequest,
  ProfilCreditResponse,
  ProfilDefaultFlag,
  ProfilHomeOwnership,
  ProfilLoanIntent,
} from '../../models/profil-credit.model';

@Component({
  selector: 'app-profil-credit-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profil-credit-form.component.html',
  styleUrl: './profil-credit-form.component.scss',
})
export class ProfilCreditFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private profilService = inject(ProfilCreditService);
  private router = inject(Router);

  loading = signal(true);
  saving = signal(false);
  error = signal('');
  success = signal('');
  profile = signal<ProfilCreditResponse | null>(null);

  readonly homeOwnershipOptions: ProfilHomeOwnership[] = [
    'RENT',
    'MORTGAGE',
    'OWN',
    'OTHER',
  ];

  readonly defaultOptions: ProfilDefaultFlag[] = ['N', 'Y'];

  readonly loanIntentOptions: ProfilLoanIntent[] = [
    'PERSONAL',
    'VENTURE',
    'EDUCATION',
    'MEDICAL',
    'DEBTCONSOLIDATION',
    'HOMEIMPROVEMENT',
  ];

  form = this.fb.group({
    personAge: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(18),
      Validators.max(100),
    ]),
    personIncomeAnnual: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(1000),
      Validators.max(1_000_000),
    ]),
    personHomeOwnership: this.fb.control<ProfilHomeOwnership | null>(null, Validators.required),
    personEmploymentLength: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(0),
      Validators.max(60),
    ]),
    previousDefaultOnFile: this.fb.control<ProfilDefaultFlag | null>(null, Validators.required),
    creditHistoryLength: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(1),
      Validators.max(50),
    ]),
    loanIntent: this.fb.control<ProfilLoanIntent | null>(null, Validators.required),
    monthlyFixedCharges: this.fb.control<number | null>(0, [
      Validators.required,
      Validators.min(0),
    ]),
    existingLoanMonthlyPayments: this.fb.control<number | null>(0, [
      Validators.required,
      Validators.min(0),
    ]),
    outstandingOldDebt: this.fb.control<number | null>(0, [
      Validators.required,
      Validators.min(0),
    ]),
    projectStartDelayMonths: this.fb.control<number | null>(0, [
      Validators.required,
      Validators.min(0),
      Validators.max(12),
    ]),
    expectedMonthlyRevenueAfterStart: this.fb.control<number | null>(0, [
      Validators.required,
      Validators.min(0),
    ]),
    hasExistingClients: this.fb.control(false, { nonNullable: true }),
    needsGracePeriod: this.fb.control(false, { nonNullable: true }),
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading.set(true);
    this.error.set('');

    this.profilService.getMyProfile().subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.form.patchValue({
          personAge: profile.personAge,
          personIncomeAnnual: profile.personIncomeAnnual,
          personHomeOwnership: profile.personHomeOwnership,
          personEmploymentLength: profile.personEmploymentLength,
          previousDefaultOnFile: profile.previousDefaultOnFile,
          creditHistoryLength: profile.creditHistoryLength,
          loanIntent: profile.loanIntent,
          monthlyFixedCharges: profile.monthlyFixedCharges,
          existingLoanMonthlyPayments: profile.existingLoanMonthlyPayments,
          outstandingOldDebt: profile.outstandingOldDebt,
          projectStartDelayMonths: profile.projectStartDelayMonths,
          expectedMonthlyRevenueAfterStart: profile.expectedMonthlyRevenueAfterStart,
          hasExistingClients: profile.hasExistingClients,
          needsGracePeriod: profile.needsGracePeriod,
        });
        this.loading.set(false);
      },
      error: (err) => {
        if (err.status === 404) {
          this.profile.set(null);
          this.loading.set(false);
          return;
        }

        if (err.status === 401) {
          this.router.navigate(['/auth/sign-in']);
          return;
        }

        console.error(err);
        this.error.set('Unable to load your credit profile.');
        this.loading.set(false);
      },
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    const payload: ProfilCreditRequest = {
      personAge: Number(raw.personAge),
      personIncomeAnnual: Number(raw.personIncomeAnnual),
      personHomeOwnership: raw.personHomeOwnership as ProfilHomeOwnership,
      personEmploymentLength: Number(raw.personEmploymentLength),
      previousDefaultOnFile: raw.previousDefaultOnFile as ProfilDefaultFlag,
      creditHistoryLength: Number(raw.creditHistoryLength),
      loanIntent: raw.loanIntent as ProfilLoanIntent,
      monthlyFixedCharges: Number(raw.monthlyFixedCharges),
      existingLoanMonthlyPayments: Number(raw.existingLoanMonthlyPayments),
      outstandingOldDebt: Number(raw.outstandingOldDebt),
      projectStartDelayMonths: Number(raw.projectStartDelayMonths),
      expectedMonthlyRevenueAfterStart: Number(raw.expectedMonthlyRevenueAfterStart),
      hasExistingClients: raw.hasExistingClients ?? false,
      needsGracePeriod: raw.needsGracePeriod ?? false,
    };

    this.saving.set(true);
    this.error.set('');
    this.success.set('');

    const request$ = this.profile()
      ? this.profilService.updateMyProfile(payload)
      : this.profilService.createMyProfile(payload);

    request$.subscribe({
      next: (profile) => {
        const wasExisting = this.profile() !== null;
        this.profile.set(profile);
        this.success.set(
          wasExisting
            ? 'Your credit profile has been updated successfully.'
            : 'Your credit profile has been created successfully.'
        );
        this.saving.set(false);
      },
      error: (err) => {
        if (err.status === 401) {
          this.router.navigate(['/auth/sign-in']);
          return;
        }

        console.error(err);
        this.error.set('Unable to save your credit profile.');
        this.saving.set(false);
      },
    });
  }

  goToCreditHome(): void {
    this.router.navigate(['/front/credit']);
  }

  goToRequest(): void {
    this.router.navigate(['/front/credit/request']);
  }

  goToHistory(): void {
    this.router.navigate(['/front/credit/history']);
  }
}

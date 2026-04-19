import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DemandeCreditService } from '../../services/demande-credit.service';
import { ProfilCreditService } from '../../services/profil-credit.service';
import {
  DemandeCreditRequest,
  TypeCredit,
} from '../../models/demande-credit.model';

@Component({
  selector: 'app-demande-credit-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './demande-credit-form.component.html',
  styleUrl: './demande-credit-form.component.scss',
})
export class DemandeCreditFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private demandeService = inject(DemandeCreditService);
  private profilService = inject(ProfilCreditService);
  private router = inject(Router);

  saving = signal(false);
  loadingProfile = signal(true);
  hasProfile = signal(false);
  error = signal('');
  success = signal('');

  readonly typeCredits: TypeCredit[] = ['NUMERAIRE', 'EN_NATURE', 'VOUCHER'];

  form = this.fb.group({
    typeCredit: this.fb.control<TypeCredit | null>(null, Validators.required),
    montantDemande: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(1),
    ]),
    dureeMois: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(1),
    ]),
    objetCredit: this.fb.control('', [
      Validators.required,
      Validators.minLength(3),
    ]),
  });

  ngOnInit(): void {
    this.checkProfile();
  }

  checkProfile(): void {
    this.loadingProfile.set(true);
    this.error.set('');

    this.profilService.getMyProfile().subscribe({
      next: () => {
        this.hasProfile.set(true);
        this.loadingProfile.set(false);
      },
      error: (err) => {
        if (err.status === 404) {
          this.hasProfile.set(false);
          this.loadingProfile.set(false);
          return;
        }

        console.error(err);
        this.error.set('Unable to verify your credit profile.');
        this.loadingProfile.set(false);
      },
    });
  }

  submit(): void {
    if (!this.hasProfile()) {
      this.error.set('You must complete your credit profile before sending a request.');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();

    const payload: DemandeCreditRequest = {
      typeCredit: formValue.typeCredit as TypeCredit,
      montantDemande: Number(formValue.montantDemande),
      dureeMois: Number(formValue.dureeMois),
      objetCredit: formValue.objetCredit ?? '',
    };

    this.saving.set(true);
    this.error.set('');
    this.success.set('');

    this.demandeService.create(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.success.set('Your credit request has been submitted successfully.');
        this.form.reset();
      },
      error: (err) => {
        console.error(err);
        this.error.set('Unable to submit your request.');
        this.saving.set(false);
      },
    });
  }

  goToHistory(): void {
    this.router.navigate(['/front/credit/history']);
  }

  goBackToCreditHome(): void {
    this.router.navigate(['/front/credit']);
  }

  goToProfile(): void {
    this.router.navigate(['/front/credit/profile']);
  }
}

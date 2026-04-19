import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CreditService } from '../../services/credit.service';
import { CreditRequest, CreditResponse, ModeRemboursement } from '../../models/credit.model';
import { DemandeCreditService } from '../../services/demande-credit.service';
import { DemandeCreditResponse } from '../../models/demande-credit.model';

@Component({
  selector: 'app-credit-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './credit-form.component.html',
  styleUrl: './credit-form.component.scss',
})
export class CreditFormComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private creditService = inject(CreditService);
  private demandeService = inject(DemandeCreditService);

  demandeId = Number(this.route.snapshot.paramMap.get('demandeId'));

  loading = signal(false);
  saving = signal(false);
  error = signal('');
  success = signal('');

  demande = signal<DemandeCreditResponse | null>(null);
  existingCredit = signal<CreditResponse | null>(null);

  modes: ModeRemboursement[] = ['MANUEL', 'LIE_AUX_VENTES', 'MIXTE'];

  form = this.fb.group({
    montantAccorde: [null as number | null, [Validators.required, Validators.min(1)]],
    tauxRemboursement: [null as number | null, [Validators.required, Validators.min(0)]],
    modeRemboursement: ['MANUEL' as ModeRemboursement, [Validators.required]],
    dateFin: ['', [Validators.required]],
  });

  ngOnInit(): void {
    if (!this.demandeId) {
      this.error.set('Invalid credit request.');
      return;
    }

    this.loadDemande();
    this.loadCredit();
  }

  loadDemande(): void {
    this.demandeService.getById(this.demandeId).subscribe({
      next: (data) => {
        this.demande.set(data);
      },
      error: () => {
        this.error.set('Failed to load request data.');
      },
    });
  }

  loadCredit(): void {
  this.loading.set(true);
  this.error.set('');

  this.creditService.getByDemande(this.demandeId).subscribe({
    next: (credit) => {
      this.existingCredit.set(credit);
      this.form.patchValue({
        montantAccorde: credit.montantAccorde,
        tauxRemboursement: credit.tauxRemboursement,
        modeRemboursement: credit.modeRemboursement,
        dateFin: credit.dateFin?.slice(0, 16),
      });
      this.form.disable();
      this.loading.set(false);
    },
   error: (err: HttpErrorResponse) => {
  const backendMessage =
    err?.error?.message ||
    err?.error?.error ||
    '';

  if (err.status === 404 || backendMessage.includes('Credit not found')) {
    this.existingCredit.set(null);
    this.error.set('');
  } else {
    this.error.set('Failed to load credit data.');
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

    const demande = this.demande();
    if (!demande || demande.statut !== 'APPROUVEE') {
      this.error.set('Credit can only be created after the request has been approved.');
      return;
    }

    this.saving.set(true);
    this.error.set('');
    this.success.set('');

    const raw = this.form.getRawValue();

    const payload: CreditRequest = {
      montantAccorde: raw.montantAccorde as number,
      tauxRemboursement: raw.tauxRemboursement as number,
      modeRemboursement: raw.modeRemboursement as ModeRemboursement,
      dateFin: raw.dateFin as string,
    };

    this.creditService.create(this.demandeId, payload).subscribe({
      next: (credit) => {
        this.existingCredit.set(credit);
        this.success.set('Credit created successfully.');
        this.form.disable();
        this.saving.set(false);
      },
      error: (err: HttpErrorResponse) => {
  if (err.status !== 404) {
    this.error.set('Failed to load credit data.');
  } else {
    this.existingCredit.set(null);
  }
  this.loading.set(false);
},
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/credit/demandes', this.demandeId]);
  }
 
}
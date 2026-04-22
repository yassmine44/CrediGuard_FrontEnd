import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DemandeCreditService } from '../../services/demande-credit.service';
import { UserClientService } from '../../services/user-client.service';
import { ClientOption } from '../../models/client-option.model';
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
  private userClientService = inject(UserClientService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  loading = signal(false);
  saving = signal(false);
  error = signal('');
  isEditMode = signal(false);

  clients = signal<ClientOption[]>([]);
  readonly typeCredits: TypeCredit[] = ['NUMERAIRE', 'EN_NATURE', 'VOUCHER'];

  demandeId: number | null = null;

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
    clientId: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(1),
    ]),
  });

  ngOnInit(): void {
    this.loadClients();

    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.isEditMode.set(true);
      this.demandeId = Number(idParam);
      this.loadDemande(this.demandeId);
    }
  }

  loadClients(): void {
    this.userClientService.getClients().subscribe({
      next: (data) => {
        this.clients.set(data);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Failed to load clients.');
      },
    });
  }

  loadDemande(id: number): void {
    this.loading.set(true);
    this.error.set('');

    this.demandeService.getById(id).subscribe({
      next: (demande) => {
        this.form.patchValue({
          typeCredit: demande.typeCredit,
          montantDemande: demande.montantDemande,
          dureeMois: demande.dureeMois,
          objetCredit: demande.objetCredit,
          clientId: demande.clientId,
        });
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Failed to load credit request.');
        this.loading.set(false);
      },
    });
  }

  submit(): void {
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

    const clientId = Number(formValue.clientId);

    this.saving.set(true);
    this.error.set('');

    if (this.isEditMode() && this.demandeId) {
      this.demandeService.update(this.demandeId, payload).subscribe({
        next: () => {
          this.saving.set(false);
          this.router.navigate(['/admin/credit/demandes']);
        },
        error: (err) => {
          console.error(err);
          this.error.set('Update failed.');
          this.saving.set(false);
        },
      });
    } else {
      this.demandeService.create(clientId, payload).subscribe({
        next: () => {
          this.saving.set(false);
          this.router.navigate(['/admin/credit/demandes']);
        },
        error: (err) => {
          console.error(err);
          this.error.set('Creation failed.');
          this.saving.set(false);
        },
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/admin/credit/demandes']);
  }
}
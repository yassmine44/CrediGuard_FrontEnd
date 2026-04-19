import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DemandeCreditService } from '../../services/demande-credit.service';
import {
  DemandeCreditResponse,
  StatutDemande,
} from '../../models/demande-credit.model';

@Component({
  selector: 'app-demande-credit-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './demande-credit-detail.component.html',
  styleUrl: './demande-credit-detail.component.scss',
})
export class DemandeCreditDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private demandeService = inject(DemandeCreditService);

  demande = signal<DemandeCreditResponse | null>(null);
  loading = signal(false);
  error = signal('');

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.loadDemande(Number(idParam));
    }
  }

  loadDemande(id: number): void {
    this.loading.set(true);
    this.error.set('');

    this.demandeService.getById(id).subscribe({
      next: (data) => {
        this.demande.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Failed to load request details.');
        this.loading.set(false);
      },
    });
  }

  updateStatus(statut: StatutDemande): void {
    const current = this.demande();
    if (!current) return;

    this.demandeService.setStatus(current.id, statut).subscribe({
      next: (updated) => {
        this.demande.set(updated);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Failed to update status.');
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/credit/demandes']);
  }

  goToEdit(): void {
    const current = this.demande();
    if (!current) return;
    this.router.navigate(['/admin/credit/demandes/edit', current.id]);
  }
}
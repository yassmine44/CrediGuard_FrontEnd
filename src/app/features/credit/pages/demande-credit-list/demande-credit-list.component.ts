import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DemandeCreditService } from '../../services/demande-credit.service';
import {
  DemandeCreditResponse,
  StatutDemande,
} from '../../models/demande-credit.model';

@Component({
  selector: 'app-demande-credit-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './demande-credit-list.component.html',
  styleUrl: './demande-credit-list.component.scss',
})
export class DemandeCreditListComponent implements OnInit {
  private demandeService = inject(DemandeCreditService);
  private router = inject(Router);

  demandes = signal<DemandeCreditResponse[]>([]);
  loading = signal(false);
  error = signal('');

  search = '';
  statusFilter = '';

  ngOnInit(): void {
    this.loadDemandes();
  }

  loadDemandes(): void {
    this.loading.set(true);
    this.error.set('');

    this.demandeService.getAll().subscribe({
      next: (data) => {
        this.demandes.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Failed to load credit requests.');
        this.loading.set(false);
      },
    });
  }

  goToCreate(): void {
    this.router.navigate(['/admin/credit/demandes/new']);
  }

  goToEdit(id: number): void {
    this.router.navigate(['/admin/credit/demandes/edit', id]);
  }

  goToDetail(id: number): void {
    this.router.navigate(['/admin/credit/demandes', id]);
  }

  deleteDemande(id: number): void {
    const confirmed = window.confirm('Are you sure you want to delete this request?');
    if (!confirmed) return;

    this.demandeService.delete(id).subscribe({
      next: () => this.loadDemandes(),
      error: (err) => {
        console.error(err);
        alert('Delete failed. Only SOUMISE requests can be deleted.');
      },
    });
  }

  changeStatus(id: number, statut: StatutDemande): void {
    this.demandeService.setStatus(id, statut).subscribe({
      next: () => this.loadDemandes(),
      error: (err) => {
        console.error(err);
        alert('Status change failed.');
      },
    });
  }

  filteredDemandes(): DemandeCreditResponse[] {
    return this.demandes().filter((d) => {
      const matchSearch =
        !this.search ||
        d.reference.toLowerCase().includes(this.search.toLowerCase()) ||
        d.objetCredit.toLowerCase().includes(this.search.toLowerCase()) ||
        (d.clientName ?? '').toLowerCase().includes(this.search.toLowerCase());

      const matchStatus =
        !this.statusFilter || d.statut === this.statusFilter;

      return matchSearch && matchStatus;
    });
  }

  countByStatus(status: StatutDemande): number {
    return this.demandes().filter((d) => d.statut === status).length;
  }

  trackById(index: number, item: DemandeCreditResponse): number {
    return item.id;
  }
}
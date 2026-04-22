import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DemandeCreditService } from './services/demande-credit.service';
import { DemandeCreditResponse } from './models/demande-credit.model';

@Component({
  selector: 'app-credit',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './credit.component.html',
  styleUrl: './credit.component.scss',
})
export class CreditComponent implements OnInit {
  private demandeService = inject(DemandeCreditService);

  loading = signal(false);
  error = signal('');
  demandes = signal<DemandeCreditResponse[]>([]);

  totalRequests = computed(() => this.demandes().length);
  submittedRequests = computed(() => this.demandes().filter(d => d.statut === 'SOUMISE').length);
  reviewRequests = computed(() => this.demandes().filter(d => d.statut === 'EN_COURS_D_ETUDE').length);
  approvedRequests = computed(() => this.demandes().filter(d => d.statut === 'APPROUVEE').length);
  rejectedRequests = computed(() => this.demandes().filter(d => d.statut === 'REJETEE').length);

  latestRequests = computed(() =>
    [...this.demandes()]
      .sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime())
      .slice(0, 5)
  );

  ngOnInit(): void {
    this.loadDemandes();
  }

  loadDemandes(): void {
    this.loading.set(true);
    this.error.set('');

    this.demandeService.getAll().subscribe({
      next: (data) => {
        this.demandes.set(data ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Unable to load credit dashboard data.');
        this.loading.set(false);
      }
    });
  }
}
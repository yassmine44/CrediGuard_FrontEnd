import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DemandeCreditService } from '../../services/demande-credit.service';
import { DemandeCreditResponse } from '../../models/demande-credit.model';

@Component({
  selector: 'app-demande-credit-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './demande-credit-history.component.html',
  styleUrl: './demande-credit-history.component.scss',
})
export class DemandeCreditHistoryComponent implements OnInit {
  private demandeService = inject(DemandeCreditService);
  private router = inject(Router);

  demandes = signal<DemandeCreditResponse[]>([]);
  loading = signal(false);
  error = signal('');

  ngOnInit(): void {
    this.loadDemandes();
  }

  goBackToCreditHome(): void {
    this.router.navigate(['/front/credit']);
  }

  goToProfile(): void {
    this.router.navigate(['/front/credit/profile']);
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
        this.error.set('Unable to load your requests.');
        this.loading.set(false);
      },
    });
  }

  trackById(index: number, item: DemandeCreditResponse): number {
    return item.id;
  }
}

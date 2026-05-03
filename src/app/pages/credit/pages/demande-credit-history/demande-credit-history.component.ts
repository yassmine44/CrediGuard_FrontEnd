import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DemandeCreditService } from '../../services/demande-credit.service';
import {
  DemandeCreditResponse,
  StatutDemande,
} from '../../models/demande-credit.model';

type StatusFilter = 'ALL' | StatutDemande;

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
  downloadingPdfId = signal<number | null>(null);
  searchTerm = signal('');
  statusFilter = signal<StatusFilter>('ALL');

  filteredDemandes = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();

    return this.demandes().filter((demande) => {
      const matchesStatus = status === 'ALL' || demande.statut === status;
      const matchesSearch =
        !search ||
        demande.reference.toLowerCase().includes(search) ||
        demande.objetCredit.toLowerCase().includes(search) ||
        demande.typeCredit.toLowerCase().includes(search);

      return matchesStatus && matchesSearch;
    });
  });

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

  canDownloadModalite(demande: DemandeCreditResponse): boolean {
    return demande.statut === 'APPROUVEE';
  }

  setSearchTerm(value: string): void {
    this.searchTerm.set(value);
  }

  setStatusFilter(value: StatusFilter): void {
    this.statusFilter.set(value);
  }

  statusLabel(status: StatutDemande): string {
    const labels: Record<StatutDemande, string> = {
      SOUMISE: 'Submitted',
      EN_COURS_D_ETUDE: 'Under review',
      APPROUVEE: 'Approved',
      REJETEE: 'Rejected',
    };

    return labels[status];
  }

  downloadModalitePdf(demande: DemandeCreditResponse): void {
    if (!this.canDownloadModalite(demande) || this.downloadingPdfId() === demande.id) {
      return;
    }

    this.downloadingPdfId.set(demande.id);
    this.error.set('');

    this.demandeService.downloadAmortissementPdf(demande.id).subscribe({
      next: (blob) => {
        const fileUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = `tableau-amortissement-demande-${demande.id}.pdf`;
        link.click();
        URL.revokeObjectURL(fileUrl);
        this.downloadingPdfId.set(null);
      },
      error: (err) => {
        console.error(err);
        this.error.set('The amortization document is not available yet for this request.');
        this.downloadingPdfId.set(null);
      },
    });
  }

  trackById(index: number, item: DemandeCreditResponse): number {
    return item.id;
  }
}

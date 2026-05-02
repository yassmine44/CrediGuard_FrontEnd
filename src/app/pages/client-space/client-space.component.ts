import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ContratService } from '../../core/services/insurance/contrat.service';
import { ClaimService } from '../../core/services/insurance/claim.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-client-space',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-space.component.html',
  styleUrls: ['./client-space.component.scss']
})
export class ClientSpaceComponent implements OnInit {

  private claimsService = inject(ClaimService);
  private contratService = inject(ContratService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private http = inject(HttpClient);

  activeTab: 'policies' | 'claims' | 'vouchers' | 'orders' = 'policies';
  userClaims: any[] = [];
  userPurchases: any[] = [];
  userPolicies: any[] = [];
  userVouchers: any[] = [];
  loading = false;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const user: any = this.authService.getUser();
    if (!user?.id) {
       this.router.navigate(['/login']);
       return;
    }

    this.loading = true;
    
    import('rxjs').then(({ forkJoin }) => {
      forkJoin({
        policies: this.contratService.getByClient(user.id),
        claims: this.claimsService.getByClient(user.id),
        vouchers: this.http.get<any[]>(`http://127.0.0.1:8089/api/vouchers/client/${user.id}`),
        purchases: this.http.get<any[]>(`http://127.0.0.1:8089/api/partnership/purchases/client/${user.id}`)
      }).subscribe({
        next: (res: any) => {
          this.userPolicies = res.policies;
          this.userClaims = res.claims;
          this.userVouchers = res.vouchers;
          this.userPurchases = res.purchases;
          this.loading = false;
        },
        error: (err: any) => {
          console.error('Error loading client data:', err);
          this.loading = false;
        }
      });
    });
  }


  switchTab(tab: 'policies' | 'claims' | 'vouchers' | 'orders') {
    this.activeTab = tab;
  }

  getStatusLabel(status: string): string {
    switch(status?.toUpperCase()) {
      case 'PENDING': return '⏳ EN ATTENTE';
      case 'APPROVED': 
      case 'ACTIVE':
      case 'VALIDATED': return '✅ VALIDÉE';
      case 'REJECTED': 
      case 'CANCELLED': return '❌ REFUSÉE';
      default: return status || 'INCONNU';
    }
  }

  getRejectionReason(claim: any): string {
    if (claim.rejectionReason && claim.rejectionReason !== 'Rejected') {
      return claim.rejectionReason;
    }
    return "Votre score de risque actuel ne permet pas la validation automatique de cet achat. Veuillez contacter votre conseiller.";
  }

  goBack() {
    this.router.navigate(['/front/partnership']);
  }

  downloadPdf(policyId: number) {
    this.contratService.downloadPdf(policyId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Contrat_Assurance_${policyId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error('Erreur téléchargement PDF:', err)
    });
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      // On pourrait utiliser un service de toast ici, mais une alerte simple confirme le fonctionnement
      alert('Code voucher copié dans le presse-papier !');
    });
  }
}

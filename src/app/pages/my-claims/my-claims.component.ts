import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ClaimsAdminService } from '../../features/claims-admin/claims-admin.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-my-claims',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-claims.component.html',
  styleUrls: ['./my-claims.component.scss']
})
export class MyClaimsComponent implements OnInit {

  private claimsService = inject(ClaimsAdminService);
  private authService = inject(AuthService);
  private router = inject(Router);

  userClaims: any[] = [];
  loading = false;

  ngOnInit() {
    this.loadClaims();
  }

  loadClaims() {
    const user: any = this.authService.getUser();
    if (!user?.id) {
       this.router.navigate(['/login']);
       return;
    }

    this.loading = true;
    this.claimsService.getByClient(user.id).then(claims => {
      this.userClaims = claims;
      this.loading = false;
    }).catch(() => this.loading = false);
  }

  getStatusLabel(status: string): string {
    switch(status) {
      case 'PENDING': return '⏳ EN ATTENTE';
      case 'APPROVED': return '✅ VALIDÉE';
      case 'REJECTED': return '❌ REFUSÉE';
      default: return status;
    }
  }

  getRejectionReason(claim: any): string {
    if (claim.rejectionReason && claim.rejectionReason !== 'Rejected') {
      return claim.rejectionReason;
    }
    
    // Génération automatique d'un motif si aucun n'est fourni
    const amount = claim.voucher?.amount || 0;
    if (amount > 1000) {
      return "Le montant demandé dépasse le plafond d'approbation automatique pour votre contrat actuel.";
    }
    
    if (claim.claimReference?.includes('SAFE')) {
      return "Analyse de risque défavorable : Fréquence de demandes inhabituelle sur ce type de voucher.";
    }

    return "Votre score de risque actuel ne permet pas la validation automatique de cet achat. Veuillez contacter votre conseiller.";
  }

  goBack() {
    this.router.navigate(['/front/partnership']);
  }
}

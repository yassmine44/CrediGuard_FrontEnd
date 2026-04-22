import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ClaimsAdminService } from '../../features/claims-admin/claims-admin.service';
import { PolicyService } from '../../services/policy.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-client-space',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-space.component.html',
  styleUrls: ['./client-space.component.scss']
})
export class ClientSpaceComponent implements OnInit {

  private claimsService = inject(ClaimsAdminService);
  private policyService = inject(PolicyService);
  private authService = inject(AuthService);
  private router = inject(Router);

  activeTab: 'policies' | 'claims' = 'policies';
  userClaims: any[] = [];
  userPolicies: any[] = [];
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
    
    // Load both policies and claims
    Promise.all([
      this.policyService.getByClient(user.id).toPromise(),
      this.claimsService.getByClient(user.id)
    ]).then(([policies, claims]) => {
      this.userPolicies = policies as any[];
      this.userClaims = claims as any[];
      this.loading = false;
    }).catch(err => {
      console.error('Error loading client data:', err);
      this.loading = false;
    });
  }

  switchTab(tab: 'policies' | 'claims') {
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
}

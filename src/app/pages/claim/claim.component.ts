import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ClaimService } from '../../core/services/insurance/claim.service';
import { ContratService } from '../../core/services/insurance/contrat.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-claim',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './claim.component.html'
})
export class ClaimComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private claimService = inject(ClaimService);
  private contratService = inject(ContratService);
  private http = inject(HttpClient);

  product: string | null = null;
  price: number | null = null;
  voucherCode: string | null = null;

  voucher: any = null;
  policy: any = null;

  message = '';
  loading = false;

  ngOnInit() {
    this.product = this.route.snapshot.queryParamMap.get('product');
    this.price = Number(this.route.snapshot.queryParamMap.get('price'));
    this.voucherCode = this.route.snapshot.queryParamMap.get('voucherCode');

    this.loadVoucher();
    this.loadPolicy();
  }

  loadVoucher() {
    if (!this.voucherCode) {
      this.message = "Voucher manquant ❌";
      return;
    }

    this.http.get(`http://localhost:8089/api/vouchers/code/${this.voucherCode}`).subscribe({
      next: (data: any) => this.voucher = data,
      error: (err: any) => this.message = "Voucher introuvable ❌"
    });
  }

  loadPolicy() {
    const user: any = this.authService.getUser();
    if (!user?.id) return;
    this.contratService.getByClient(user.id).subscribe({
      next: (policies: any[]) => {
        if (policies && policies.length > 0) {
          this.policy = policies[0];
        }
      },
      error: () => console.log("Policy non trouvée")
    });
  }

  submitClaim() {
    if (!this.voucher || !this.policy) {
      this.message = "Données manquantes ❌";
      return;
    }

    this.loading = true;
    const user: any = this.authService.getUser();
    
    this.claimService.submit(this.policy.id, user.id, `Réclamation pour ${this.product}`, this.price || 0).subscribe({
      next: (res: any) => {
        this.message = "Demande envoyée avec succès ✅";
        this.loading = false;
      },
      error: (err: any) => {
        this.message = "Erreur lors de l'envoi ❌";
        this.loading = false;
      }
    });
  }
}
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service'; // 🔥 IMPORT

@Component({
  selector: 'app-claim',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './claim.component.html'
})
export class ClaimComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  product: string | null = null;
  price: number | null = null;
  voucherCode: string | null = null;

  voucher: any = null;
  policy: any = null;

  message = '';
  loading = false;

  // =========================
  // INIT
  // =========================
  ngOnInit() {
    this.product = this.route.snapshot.queryParamMap.get('product');
    this.price = Number(this.route.snapshot.queryParamMap.get('price'));
    this.voucherCode = this.route.snapshot.queryParamMap.get('voucherCode');

    this.loadVoucher();
    this.loadPolicy(); // 🔥 direct (JWT gère user)
  }

  // =========================
  // LOAD VOUCHER
  // =========================
  loadVoucher() {

    if (!this.voucherCode) {
      this.message = "Voucher manquant ❌";
      return;
    }

    fetch(`http://localhost:8090/api/api/vouchers/code/${this.voucherCode}`, {
      headers: {
        Authorization: `Bearer ${this.authService.getToken()}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error("Voucher introuvable ❌");
        return res.json();
      })
      .then(data => {
        this.voucher = data;
      })
      .catch(err => {
        this.message = err.message;
      });
  }

  // =========================
  // LOAD POLICY (USER CONNECTÉ)
  // =========================
  loadPolicy() {
      console.log("TOKEN:", this.authService.getToken());
    fetch('http://localhost:8090/api/insurance/policies/my-policy', {
      headers: {
        
        Authorization: `Bearer ${this.authService.getToken()}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error("Aucune policy trouvée ❌");
        return res.json(); // 🔥 CORRECTION
      })
      .then(data => {
        this.policy = data;
        console.log("POLICY:", data);
      })
      .catch(() => {
        console.log("Policy non trouvée");
        this.policy = null; // pas de message ici (UX propre)
      });
  }

  // =========================
  // SUBMIT CLAIM
  // =========================
  submitClaim() {
    

    if (!this.voucher) {
      this.message = "Voucher non chargé ❌";
      return;
    }

    if (!this.policy) {
      this.message = "Aucune policy trouvée ❌";
      return;
    }

    this.loading = true;
    this.message = '';

    const body = {
      voucherId: this.voucher.id,
      policyId: this.policy.id,
      claimReference: `CLAIM-${this.voucher.id}-${Date.now()}`
    };
    console.log("BODY:", body);

    fetch('http://localhost:8090/api/insurance/claims/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.authService.getToken()}` // 🔥 JWT
      },
      body: JSON.stringify(body)
    })
   .then(async res => {
  if (!res.ok) {
    let errorMessage = "Erreur création claim ❌";

    try {
    const error = await res.json();
errorMessage = error.message || error.error || errorMessage;
    } catch {
      const text = await res.text();
      errorMessage = text || errorMessage;
    }

    throw new Error(errorMessage);
  }

  return res.json();
})
    .then(data => {
      this.message = "Demande envoyée avec succès ✅";
      console.log("CLAIM:", data);
    })
    .catch(err => {
  if (err.message.includes("Voucher already has a claim")) {
    this.message = "Ce voucher a déjà une demande d'assurance ❌";
  } else {
    this.message = err.message;
  }
})
    
    .finally(() => {
      this.loading = false;

    });
  }
}
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { UserService } from '../../services/user.service';
import { PartnerProductService, PartnerProduct } from '../../services/partner-product.service';
import { AuthService } from '../../core/services/auth.service';
import { ClaimsAdminService } from '../../features/claims-admin/claims-admin.service';
import { InsuranceService, InsuranceRecommendation } from '../../services/insurance.service';

@Component({
  selector: 'app-partnership',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './partnership.component.html',
  styleUrls: ['./partnership.component.scss']
})
export class PartnershipComponent implements OnInit {

  public router = inject(Router);
  private userService = inject(UserService);
  private productService = inject(PartnerProductService);
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private claimsService = inject(ClaimsAdminService);
  private insuranceService = inject(InsuranceService);

  private api = 'http://localhost:8082/api/api/vouchers';

  partnerTypes = ['Produits', 'Equipement', 'Services'];
  partners: any[] = [];
  products: PartnerProduct[] = [];
  userClaims: any[] = [];

  selectedType: string | null = null;
  selectedPartner: any = null;
  selectedProducts: PartnerProduct[] = [];
  showCheckout = false;

  voucherCode = '';
  message = '';
  success = false;
  isInsuranceMode = false;

  claimLoading = false;
  policy: any = null;
  policies: any[] = [];
  recommendation: InsuranceRecommendation | null = null;

  // =====================
  // INIT
  // =====================
  ngOnInit() {
    this.loadUserPolicy();
    this.loadUserClaims();
    this.loadRecommendations();
  }

  loadRecommendations() {
    const user: any = this.authService.getUser();
    if (!user?.id) return;

    this.insuranceService.getRecommendationForClient(user.id).subscribe({
      next: (recs: InsuranceRecommendation[]) => {
        if (recs && recs.length > 0) {
          this.recommendation = recs[0];
        }
      },
      error: (err: any) => console.error("Error loading recommendations", err)
    });
  }

  loadUserPolicy() {
    const user: any = this.authService.getUser();
    if (!user?.id) return;
    const token = this.authService.getToken();

    this.http.get(
      `http://localhost:8082/api/insurance/policies/by-client/${user.id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    ).subscribe({
      next: (res: any) => {
        this.policies = res;
        if (this.policies.length > 0) this.policy = this.policies[0];
      },
      error: (err: any) => console.error(err)
    });
  }

  loadUserClaims() {
    const user: any = this.authService.getUser();
    if (!user?.id) return;

    this.claimsService.getByClient(user.id).then(claims => {
      console.log("USER CLAIMS:", claims); // 🔥 DEBUG
      this.userClaims = claims;
    });
  }

  get totalAmount(): number {
    return this.selectedProducts.reduce((sum, p) => sum + p.price, 0);
  }

  // =====================
  // SELECTION
  // =====================
  selectType(type: string) {
    this.selectedType = type;
    this.loadPartners();
  }

  loadPartners() {
    const typeBackend = this.selectedType?.toUpperCase();

    this.userService.getPartnersByType(typeBackend!)
      .subscribe({
        next: (data: any[]) => {
          this.partners = data.map(p => ({ id: p.id, name: p.fullName }));
        },
        error: () => this.message = "Erreur chargement partenaires ❌"
      });

    this.selectedPartner = null;
    this.products = [];
    this.selectedProducts = [];
    this.showCheckout = false;
  }

  selectPartner(p: any) {
    this.selectedPartner = p;
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getByPartner(this.selectedPartner.id)
      .subscribe({
        next: (data) => this.products = data,
        error: () => this.message = "Erreur chargement produits ❌"
      });

    this.selectedProducts = [];
    this.showCheckout = false;
  }

  selectProduct(p: PartnerProduct) {
    if (this.isSelected(p)) {
      this.selectedProducts = this.selectedProducts.filter(item => item.id !== p.id);
    } else {
      this.selectedProducts = [...this.selectedProducts, p];
    }
  }

  isSelected(p: PartnerProduct): boolean {
    return this.selectedProducts.some(item => item.id === p.id);
  }

  finalizeSelection() {
    if (this.selectedProducts.length === 0) {
      this.message = "Veuillez choisir au moins un produit ❗";
      return;
    }
    this.showCheckout = true;
  }

  // =====================
  // CLAIM
  // =====================
  submitClaimInPartnership() {

    if (!this.voucherCode) {
      this.message = "Entrer un voucher ❗";
      return;
    }

    const token = this.authService.getToken();

    if (!token) {
      this.message = "Veuillez vous connecter ❗";
      return;
    }

    this.claimLoading = true;
    this.message = '⏳ Vérification du voucher...';

    fetch(`${this.api}/code/${this.voucherCode}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      if (!res.ok) throw new Error("Voucher introuvable ❌");
      return res.json();
    })
    .then(v => {

      if (v.status !== 'ACTIVE') {
        throw new Error("Voucher non valide ❌");
      }

    const user: any = this.authService.getUser();

if (!user?.id) {
  throw new Error("Utilisateur non connecté ❌");
}

const clientId = user.id;

      return fetch(`http://localhost:8090/api/insurance/policies/by-client/${clientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        if (!res.ok) throw new Error("Aucune police détectée ❌");
        return res.json();
      })
      .then(policies => {

        if (!policies || policies.length === 0) {
          throw new Error("Aucune police détectée ❌");
        }

        const selectedPolicy = policies[0];
        this.policy = selectedPolicy;

        const body = {
          voucherId: v.id,
          policyId: selectedPolicy.id,
          claimReference: `CLAIM-${v.id}-${Date.now()}`
        };

        return fetch('http://localhost:8090/api/insurance/claims/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(body)
        });

      });

    })
    .then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Erreur claim ❌" }));
        throw new Error(err.message);
      }
      return res.json();
    })
    .then(() => {
      this.message = "Demande d'assurance envoyée ✅";
      this.loadUserClaims(); 
      this.buy(true);
    })
    .catch((err: any) => {
      this.message = err?.message || "Erreur ❌";
    })
    .finally(() => this.claimLoading = false);
  }

  // =====================
  // BUY
  // =====================
  buy(isInsurance: boolean = false) {
    this.isInsuranceMode = isInsurance;

    if (!this.voucherCode) {
      this.message = "Entrer un voucher ❗";
      return;
    }

    fetch(`${this.api}/code/${this.voucherCode}`)
      .then(res => {
        if (!res.ok) throw new Error("Voucher introuvable ❌");
        return res.json();
      })
      .then(v => {

        if (v.amount < this.totalAmount) {
          throw new Error("Solde insuffisant ❌");
        }

        return fetch(`${this.api}/consume/${v.id}?amount=${this.totalAmount}`, {
          method: 'PUT'
        });

      })
      .then(() => {
        this.message = "Achat validé ✅";
        this.success = true;
        this.voucherCode = '';
      })
      .catch((err: any) => {
        this.message = err?.message || "Erreur ❌";
      });
  }

  // =====================
  // RESET + TRACK
  // =====================
  reset() {
    this.success = false;
    this.selectedType = null;
    this.selectedPartner = null;
    this.selectedProducts = [];
    this.showCheckout = false;
    this.products = [];
    this.message = '';
    this.voucherCode = '';
    this.isInsuranceMode = false;
  }

  trackById(index: number, item: any): number {
    return item.id;
  }
}
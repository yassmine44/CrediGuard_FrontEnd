import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { UserService } from '../../services/user.service';
import { PartnerProductService, PartnerProduct } from '../../services/partner-product.service';

@Component({
  selector: 'app-partnership',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './partnership.component.html',
  styleUrls: ['./partnership.component.scss']
})
export class PartnershipComponent {

  // =====================
  // INJECTION
  // =====================
  private router = inject(Router);
  private userService = inject(UserService);
  private productService = inject(PartnerProductService);

  private api = 'http://localhost:8090/api/api/vouchers';

  // =====================
  // TYPES (ALIGNÉS BACKEND)
  // =====================
  partnerTypes = ['Produits', 'Equipement', 'Services'];

  // =====================
  // DATA
  // =====================
  partners: any[] = [];
  products: PartnerProduct[] = [];

  selectedType: string | null = null;
  selectedPartner: any = null;
  selectedProduct: PartnerProduct | null = null;

  voucherCode = '';
  message = '';
  success = false;

  // =====================
  // TYPE
  // =====================
  selectType(type: string) {
    this.selectedType = type;
    this.loadPartners();
  }

loadPartners() {

  console.log("TYPE SELECTED =", this.selectedType);

  const typeBackend = this.selectedType?.toUpperCase();

  console.log("TYPE BACKEND =", typeBackend);

  this.userService.getPartnersByType(typeBackend!)
    .subscribe({
      next: (data: any[]) => {

        console.log("DATA BACK =", data);

        this.partners = data.map(p => ({
          id: p.id,
          name: p.fullName
        }));

        console.log("PARTNERS =", this.partners);
      },
      error: (err) => {
        console.error("ERREUR API =", err);
        this.message = "Erreur chargement partenaires ❌";
      }
    });

  this.selectedPartner = null;
  this.products = []; // ✅ IMPORTANT
  this.selectedProduct = null;
}

  // =====================
  // PRODUITS (100% DYNAMIQUE 🔥)
  // =====================
loadProducts() {

  console.log("PARTNER ID =", this.selectedPartner?.id);

  this.productService.getByPartner(this.selectedPartner.id)
    .subscribe({
      next: (data) => {
        console.log("PRODUCTS BACK =", data); // 🔥 IMPORTANT
        this.products = data;
      },
      error: (err) => {
        console.error("ERREUR PRODUITS =", err);
        this.message = "Erreur chargement produits ❌";
      }
    });

  this.selectedProduct = null;
}
// =====================
// SELECT PARTNER (MANQUANTE ❗)
// =====================
selectPartner(p: any) {
  this.selectedPartner = p;
  this.loadProducts();
}

// =====================
// TRACK BY (PERFORMANCE + FIX ERREUR ❗)
// =====================
trackById(index: number, item: PartnerProduct) {
  return item.id;
}

  // =====================
  // PRODUCT
  // =====================
  selectProduct(p: PartnerProduct) {
    this.selectedProduct = p;
    this.message = '';
  }

  // =====================
  // NAVIGATION CLAIM
  // =====================
goToInsurance() {

  if (!this.selectedProduct) {
    this.message = "Choisir un produit ❗";
    return;
  }

  this.router.navigate(['/claim'], {
    queryParams: {
      product: this.selectedProduct.name,
      price: this.selectedProduct.price,
      voucherCode: this.voucherCode
    }
  });
}

  // =====================
  // BUY (VOUCHER)
  // =====================
  buy() {

    if (!this.selectedProduct) {
      this.message = "Choisir un produit ❗";
      return;
    }

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

        if (v.status !== 'ACTIVE') {
          this.message = "Voucher non valide ❌";
          return;
        }

        if (v.amount < this.selectedProduct!.price) {
          this.message = "Montant insuffisant ❌";
          return;
        }

        return fetch(`${this.api}/${v.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...v, status: 'USED' })
        });

      })
      .then(() => {
        this.message = "Achat validé ✅";
        this.success = true;
        this.voucherCode = '';
      })
      .catch(err => this.message = err.message);
  }

  // =====================
  // RESET
  // =====================
  reset() {
    this.success = false;
    this.selectedType = null;
    this.selectedPartner = null;
    this.selectedProduct = null;
    this.products = [];
    this.message = '';
    this.voucherCode = '';
  }
}
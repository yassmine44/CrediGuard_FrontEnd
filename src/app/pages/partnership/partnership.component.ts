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

  private api = 'http://127.0.0.1:8089/api/vouchers';

  partnerTypes = ['Produits', 'Equipement', 'Services'];
  partners: any[] = [];
  products: PartnerProduct[] = [];
  userClaims: any[] = [];
  insuranceOffers: any[] = [];

  selectedType: string | null = null;
  selectedPartner: any = null;
  selectedProducts: PartnerProduct[] = [];
  showCheckout = false;

  voucherCode = '';
  purchaseAmount = 0; // Ajouté pour le nouveau HTML
  message = '';
  success = false;
  isInsuranceMode = false;

  claimLoading = false;
  policy: any = null;
  policies: any[] = [];
  recommendation: any = null;
  recommendationOffer: any = null;

  // SMS Verification Flow
  verificationStep: 1 | 2 | 3 = 1;
  phoneNumber = '+216';
  otpDigits = ['', '', '', '', '', ''];
  countdown = 300; // 5 minutes
  timerInterval: any;

  // =====================
  // INIT
  // =====================
  ngOnInit() {
    // alert('TEST DE MISE À JOUR - V4'); // Désactivé pour la prod
    this.loadUserPolicy();
    this.loadUserClaims();
    this.loadRecommendations();
  }

  loadRecommendations() {
    const user: any = this.authService.getUser();
    if (!user?.id) return;

    this.insuranceService.getRecommendationForClient(user.id).subscribe({
      next: (recs: any[]) => {
        if (recs && recs.length > 0) {
          this.recommendation = recs[0];
          if (this.recommendation.suggestedOffers && this.recommendation.suggestedOffers.length > 0) {
            this.recommendationOffer = this.recommendation.suggestedOffers[0];
          }
        }

        // SÉCURITÉ : Si aucune offre n'est trouvée, on en propose une par défaut pour le test
        if (!this.recommendationOffer) {
          this.recommendationOffer = {
            id: 1,
            name: '🛡️ Pack Protection Standard (Demo)',
            premiumAmount: 150,
            description: 'Couverture complète pour vos achats partenaires.'
          };
        }
      },
      error: (err: any) => {
        console.error("Error loading recommendations", err);
        // Fallback en cas d'erreur API
        this.recommendationOffer = {
          id: 1,
          name: '🛡️ Pack Protection Standard (Demo)',
          premiumAmount: 150,
          description: 'Couverture complète pour vos achats partenaires.'
        };
      }
    });
  }

  loadUserPolicy() {
    const user: any = this.authService.getUser();
    if (!user?.id) return;
    const token = this.authService.getToken();

    this.http.get(
      `http://127.0.0.1:8089/api/insurance/policies/by-client/${user.id}`,
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
    this.isInsuranceMode = false;
    this.loadPartners();
  }

  loadPartners() {
    const typeBackend = this.selectedType?.toUpperCase();
    this.userService.getPartnersByType(typeBackend!).subscribe({
      next: (data: any[]) => this.partners = data.map(p => ({ id: p.id, name: p.fullName })),
      error: () => this.message = "Erreur chargement partenaires ❌"
    });
    this.selectedPartner = null;
  }

  selectPartner(p: any) {
    this.selectedPartner = p;
    this.message = '';
    this.loadProducts();
  }

  get filteredPartners() {
    return this.partners;
  }

  getIcon(type: string): string {
    switch (type) {
      case 'Produits': return '🛍️';
      case 'Equipement': return '🛠️';
      case 'Services': return '⚙️';
      default: return '🤝';
    }
  }

  goBack() {
    if (this.showCheckout) {
      this.showCheckout = false;
    } else if (this.selectedPartner) {
      this.selectedPartner = null;
    } else if (this.selectedType) {
      this.selectedType = null;
    }
    this.message = '';
    this.success = false;
  }

  payWithVoucher() {
    // Initial verification step
    if (!this.voucherCode || !this.phoneNumber) {
      this.message = "Veuillez remplir tous les champs ❗";
      return;
    }
    this.sendVerificationSMS();
  }

  sendVerificationSMS() {
    this.claimLoading = true;
    this.message = '⏳ Envoi du code SMS via Trellio...';

    this.http.post('http://127.0.0.1:8089/api/sms/send', { phoneNumber: this.phoneNumber }).subscribe({
      next: () => {
        this.claimLoading = false;
        this.message = '';
        this.verificationStep = 2;
        this.startCountdown();
      },
      error: (err) => {
        this.claimLoading = false;
        this.message = '❌ Échec de l\'envoi du SMS. Réessayez.';
        console.error(err);
      }
    });
  }

  startCountdown() {
    this.countdown = 300;
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.countdown > 0) {
        this.countdown--;
      } else {
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  get formatTime(): string {
    const min = Math.floor(this.countdown / 60);
    const sec = this.countdown % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  }

  onOtpInput(event: any, index: number) {
    // This is now just a safety fallback, most logic is in keydown
    const val = event.target.value;
    if (val && val.length > 0) {
      this.otpDigits[index] = val.slice(-1);
    }
    this.checkOtpComplete();
  }

  onOtpKeyDown(event: any, index: number) {
    const key = event.key;

    if (key === 'Backspace') {
      event.preventDefault();
      if (this.otpDigits[index]) {
        this.otpDigits[index] = '';
      } else if (index > 0) {
        const prevInput = document.getElementById(`otp-${index - 1}`);
        prevInput?.focus();
        this.otpDigits[index - 1] = '';
      }
      this.checkOtpComplete();
      return;
    }

    if (key === 'ArrowLeft' && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
      return;
    }
    if (key === 'ArrowRight' && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
      return;
    }

    // Only allow digits
    if (/^\d$/.test(key)) {
      event.preventDefault(); // CRITICAL: Stop browser from inserting the char twice
      this.otpDigits[index] = key;

      if (index < 5) {
        setTimeout(() => {
          document.getElementById(`otp-${index + 1}`)?.focus();
        }, 10);
      }
      this.checkOtpComplete();
    } else if (key.length === 1 && !event.ctrlKey && !event.metaKey) {
      // Block non-digit characters
      event.preventDefault();
    }
  }

  onOtpPaste(event: ClipboardEvent) {
    event.preventDefault();
    const data = event.clipboardData?.getData('text');
    if (!data) return;

    const digits = data.replace(/\D/g, '').split('').slice(0, 6);
    digits.forEach((digit, i) => {
      if (i < 6) {
        this.otpDigits[i] = digit;
      }
    });

    // Focus last digit or next empty
    const nextIndex = Math.min(digits.length, 5);
    document.getElementById(`otp-${nextIndex}`)?.focus();

    this.checkOtpComplete();
  }

  checkOtpComplete() {
    const code = this.otpDigits.join('');
    console.log('Current OTP Length:', code.length, 'Code:', code);
    if (code.length === 6) {
      this.verifyOtp();
    }
  }

  verifyOtp() {
    this.claimLoading = true;
    this.message = '⏳ Vérification du code...';

    const code = this.otpDigits.join('');
    console.log('Verifying code:', code, 'for phone:', this.phoneNumber);

    this.http.post<boolean>('http://127.0.0.1:8089/api/sms/verify', {
      phoneNumber: this.phoneNumber,
      code: code
    }).subscribe({
      next: (isValid) => {
        console.log('Verification result:', isValid);
        this.claimLoading = false;
        if (isValid) {
          this.message = '';
          this.verificationStep = 3;
          clearInterval(this.timerInterval);
        } else {
          this.message = '❌ Code incorrect ou expiré. Réessayez.';
          this.otpDigits = ['', '', '', '', '', ''];
          document.getElementById('otp-0')?.focus();
        }
      },
      error: (err) => {
        this.claimLoading = false;
        this.message = '❌ Erreur lors de la vérification.';
        console.error(err);
      }
    });
  }

  confirmFinalPayment() {
    console.log('Confirming payment for voucher:', this.voucherCode);
    this.buy(false);
  }

  resendOtp() {
    this.otpDigits = ['', '', '', '', '', ''];
    this.sendVerificationSMS();
  }

  declareClaim() {
    this.submitClaimInPartnership();
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
    this.purchaseAmount = this.totalAmount; // Transfert automatique du montant
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

        return fetch(`http://127.0.0.1:8089/api/insurance/policies/by-client/${clientId}`, {
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

            return fetch('http://127.0.0.1:8089/api/insurance/claims/create', {
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
          const errData = await res.json().catch(() => ({}));
          // Spring Boot typically puts the message in 'message' or 'error' or 'detail'
          const backendMessage = errData.message || errData.error || errData.detail || "Erreur lors de la déclaration ❌";
          throw new Error(backendMessage);
        }
        return res.json();
      })
      .then(() => {
        this.message = "Demande de sinistre envoyée avec succès ✅ (Décision en attente par l'assurance)";
        this.loadUserClaims();
      })
      .catch((err: any) => {
        this.message = err?.message || "Erreur ❌";
      })
      .finally(() => this.claimLoading = false);
  }

  quickSubscribe() {
    const user: any = this.authService.getUser();
    if (!user?.id) {
      this.message = "Veuillez vous connecter ❗";
      return;
    }

    if (!this.recommendationOffer) {
      this.router.navigate(['/front/insurance']);
      return;
    }

    this.claimLoading = true;
    this.message = "⏳ Création de votre contrat d'assurance...";

    const token = this.authService.getToken();
    const params = {
      clientId: user.id.toString(),
      offerId: this.recommendationOffer.id.toString(),
      declaredValue: this.totalAmount.toString(),
      goodsNature: this.selectedProducts.map(p => p.name).join(', ')
    };

    this.http.post('http://127.0.0.1:8089/api/contrats', null, {
      params,
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (res: any) => {
        this.policy = res;
        this.message = "✅ Contrat créé avec succès ! Vous êtes maintenant couvert.";
        this.loadUserPolicy();
        this.claimLoading = false;
      },
      error: (err: any) => {
        console.error("Subscription failed", err);
        this.message = "❌ Échec de la souscription. Vérifiez votre solde voucher.";
        this.claimLoading = false;
      }
    });
  }

  // =====================
  // BUY
  // =====================
  buy(isInsurance: boolean = false) {
    this.isInsuranceMode = isInsurance;

    if (!this.voucherCode) {
      this.message = "❌ Code voucher manquant. Veuillez revenir à l'étape 1.";
      console.warn("Attempted buy without voucherCode");
      return;
    }

    this.claimLoading = true;
    this.message = "⏳ Traitement de la transaction en cours...";
    const token = this.authService.getToken();

    // 1. Vérifier le voucher
    this.http.get(`${this.api}/code/${this.voucherCode}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (v: any) => {
        if (v.amount < this.totalAmount) {
          this.message = "❌ Solde insuffisant sur ce voucher (" + v.amount + " TND disponibles).";
          this.claimLoading = false;
          return;
        }

        // 2. Consommer le voucher
        this.http.put(`${this.api}/consume/${v.id}?amount=${this.totalAmount}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        }).subscribe({
          next: () => {
            const user: any = this.authService.getUser();

            // 3. Créer l'achat partenaire (si pas mode assurance)
            if (!isInsurance && user) {
              const body = {
                clientId: user.id,
                partnerId: this.selectedPartner.id,
                voucherId: v.id,
                totalAmount: this.totalAmount,
                productNames: this.selectedProducts.map(p => p.name).join(', ')
              };

              this.http.post('http://127.0.0.1:8089/api/partnership/purchases/create', body, {
                headers: { Authorization: `Bearer ${token}` }
              }).subscribe({
                next: () => this.completePurchase(),
                error: (err) => this.handleBuyError(err)
              });
            } else {
              this.completePurchase();
            }
          },
          error: (err) => this.handleBuyError(err)
        });
      },
      error: (err) => this.handleBuyError(err)
    });
  }

  private completePurchase() {
    this.message = "✅ Transaction réussie ! Votre achat a été validé.";
    this.success = true;
    this.claimLoading = false;
    // On garde le code affiché pour le récap final, on ne le vide qu'au reset()
  }

  private handleBuyError(err: any) {
    console.error("Purchase failed", err);
    this.claimLoading = false;
    this.message = "❌ Erreur technique lors du paiement. Veuillez réessayer.";
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
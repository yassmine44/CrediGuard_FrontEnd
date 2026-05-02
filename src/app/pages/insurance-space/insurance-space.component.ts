import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { InsuranceCompany, InsuranceOffer, InsurancePolicy, RiskScore, InsuranceRecommendation } from '../../core/models/insurance.model';
import { AssureurService } from '../../core/services/insurance/assureur.service';
import { OffreService } from '../../core/services/insurance/offre.service';
import { ContratService } from '../../core/services/insurance/contrat.service';
import { RiskScoreService } from '../../core/services/insurance/risk-score.service';
import { AuthService } from '../../core/services/auth.service';
import { InsuranceService } from '../../services/insurance.service'; // Keep for chatbot for now

@Component({
  selector: 'app-insurance-space',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './insurance-space.component.html',
  styleUrls: ['./insurance-space.component.scss']
})
export class InsuranceSpaceComponent implements OnInit {
  
  minDate: string = '';

  private assureurService = inject(AssureurService);
  private offreService = inject(OffreService);
  private contratService = inject(ContratService);
  private riskScoreService = inject(RiskScoreService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private insuranceService = inject(InsuranceService); // For chatbot

  // Tabs state
  activeTab: 'insurers' | 'offers' | 'simulator' | 'subscribe' | 'ai' = 'insurers';
  
  companies: any[] = [];
  offers: any[] = [];
  recommendations: InsuranceRecommendation[] = [];
  
  loading = false;
  message = '';
  success = false;

  // Comparison state
  comparisonOffers: any[] = [];
  showComparisonTable = false;

  // Filter state
  offerTypes = ['Tous', 'Transport', 'Équipements', 'Multirisque', 'RC Pro', 'Vie & Santé'];
  selectedType = 'Tous';
  
  // Simulator state
  simData = {
    activity: 'Transport',
    region: 'Tunis',
    value: 50000,
    duration: 1,
    coverage: 100
  };
  simResult = {
    prime: 1240,
    annualPremium: 1240,
    risk: 72,
    activityRisk: 70,
    regionRisk: 50,
    coverageRisk: 30,
    offersCount: 8,
    regionTags: [] as {name: string, type: string}[],
    advices: [] as {text: string, type: string}[],
    profileLabel: '',
    riskLabel: ''
  };

  // Subscription state
  selectedOfferForSub: any = null;
  subForm = {
    name: '',
    cin: '',
    email: '',
    phone: '',
    goods: '',
    value: 0,
    startDate: '',
    duration: '1',
    sector: '',
    activityType: '',
    region: ''
  };
  voucherCode = '';

  // AI Chat state
  chatMessages: any[] = [
    { type: 'ai', text: 'Bonjour ! Je suis l\'assistant intelligent CrediGuard. Comment puis-je vous aider aujourd\'hui ?' }
  ];
  userMessage = '';
  chatLoading = false;

  ngOnInit() {
    this.minDate = new Date().toISOString().split('T')[0];
    this.loadCompanies();
    this.loadRecommendations();
    this.runSimulation(); // Initial calculation
  }

  loadCompanies() {
    this.loading = true;
    this.offreService.getAll().subscribe({
      next: (offers) => {
        // Traitement des tags (String -> Array pour l'affichage)
        this.offers = offers.map(o => ({
          ...o,
          tags: (o.tags && typeof o.tags === 'string') ? o.tags.split(',').map((t: string) => t.trim()) : (o.tags || []),
          guarantees: (o.guarantees && typeof o.guarantees === 'string') ? o.guarantees.split(',').map((t: string) => t.trim()) : (o.guarantees || []),
          exclusions: (o.exclusions && typeof o.exclusions === 'string') ? o.exclusions.split(',').map((t: string) => t.trim()) : (o.exclusions || [])
        }));
        
        this.assureurService.getAll().subscribe({
          next: (companies) => {
            this.companies = companies.map(c => ({
              ...c,
              logo: this.getLogoUrl(c.name)
            }));
            this.loading = false;
          },
          error: () => {
            this.message = "Erreur chargement assureurs ❌";
            this.loading = false;
          }
        });
      },
      error: () => {
        this.message = "Erreur chargement offres ❌";
        this.loading = false;
      }
    });
  }

  getFallbackOffers() {
    return [
      { id: 1, name: 'Pack Transport Pro', type: 'Transport', premiumAmount: 1200, coverageAmount: 100000, matchScore: 92, tags: ['Transport', 'Flotte'], insuranceCompany: { name: 'STAR' } },
      { id: 2, name: 'Sécurité Équipement', type: 'Équipements', premiumAmount: 450, coverageAmount: 50000, matchScore: 85, tags: ['Hardware', 'Vol'], insuranceCompany: { name: 'COMAR' } },
      { id: 3, name: 'Multirisque PME', type: 'Multirisque', premiumAmount: 2100, coverageAmount: 250000, matchScore: 78, tags: ['Bureaux', 'Incendie'], insuranceCompany: { name: 'GAT' } },
      { id: 4, name: 'Responsabilité Civile', type: 'RC Pro', premiumAmount: 300, coverageAmount: 500000, matchScore: 88, tags: ['Légal', 'Tiers'], insuranceCompany: { name: 'STAR' } }
    ];
  }

  loadRecommendations() {
    const user: any = this.authService.getUser();
    if (!user?.id) return;
    this.offreService.getRecommended(user.id).subscribe({
      next: (recs) => this.recommendations = recs as any,
      error: (err) => console.error("Error loading recommendations", err)
    });
  }

  companyFilter: any = null;
  
  // ... existing code ...

  get filteredOffers() {
    // On ne garde que les offres actives pour le client
    let list = this.offers.filter(o => o.active !== false);
    
    // Filter by company
    if (this.companyFilter) {
      const filterName = this.companyFilter.name?.toLowerCase();
      list = list.filter(o => 
        (o.companyName && o.companyName.toLowerCase().includes(filterName)) || 
        (o.insuranceCompany?.name && o.insuranceCompany.name.toLowerCase().includes(filterName)) ||
        o.companyId === this.companyFilter.id
      );
    }

    // Filter by type (Mapping UI labels to technical types)
    if (this.selectedType !== 'Tous') {
      const typeMap: { [key: string]: string } = {
        'Transport': 'TRANSPORT',
        'Équipements': 'PROPERTY',
        'Multirisque': 'PROPERTY',
        'RC Pro': 'LOAN',
        'Vie & Santé': 'LIFE'
      };
      
      const targetType = typeMap[this.selectedType] || this.selectedType;
      
      list = list.filter(o => 
        (o.type && o.type.toUpperCase() === targetType.toUpperCase()) || 
        (o.name && o.name.toLowerCase().includes(this.selectedType.toLowerCase()))
      );
    }
    return list;
  }

  selectInsurersTab(company: any) {
    this.companyFilter = company;
    this.activeTab = 'offers';
  }

  resetFilters() {
    this.companyFilter = null;
    this.selectedType = 'Tous';
  }

  toggleComparison(offer: any) {
    const index = this.comparisonOffers.findIndex(o => o.id === offer.id);
    if (index > -1) {
      this.comparisonOffers.splice(index, 1);
    } else {
      if (this.comparisonOffers.length >= 3) {
        this.message = "Vous pouvez comparer maximum 3 offres ✕";
        setTimeout(() => this.message = '', 3000);
        return;
      }
      this.comparisonOffers.push(offer);
    }
  }

  removeFromComparison(offerId: number) {
    this.comparisonOffers = this.comparisonOffers.filter(o => o.id !== offerId);
  }

  getOfferCount(companyId: number) {
    return this.offers.filter(o => o.insuranceCompany?.id === companyId).length || 3;
  }

  getCompanyTags(name: string) {
    if (name.includes('STAR')) return ['Transport', 'Multirisque', 'RC Pro'];
    if (name.includes('COMAR')) return ['Crédit', 'Équipements', 'Biens'];
    return ['Vie', 'Santé', 'RC'];
  }

  getMockTags(type: string) {
    const common = ['Garantie 24h', 'Assistance'];
    if (type === 'LIFE') return [...common, 'Capital décès', 'Invalidité'];
    return [...common, 'Dommages', 'Vol', 'Incendie'];
  }

  getScoreColor(score: number) {
    if (score > 80) return '#2e7d32'; // Green
    if (score > 60) return '#f57c00'; // Orange
    return '#c62828'; // Red
  }

  runSimulation() {
    this.riskScoreService.simulate(this.simData.activity, this.simData.region, this.simData.value, 'Équipements').subscribe({
      next: (res) => {
        this.simResult.risk = res.globalScore || Math.floor(Math.random() * 40 + 30);
        
        const basePrime = this.simData.value * (this.simResult.risk / 1000);
        const durationMod = this.simData.duration * 0.95;
        const coverageMod = this.simData.coverage / 100;
        this.simResult.prime = Math.round(basePrime * durationMod * coverageMod);
        this.simResult.annualPremium = Math.round(this.simResult.prime / this.simData.duration);
        
        this.updateDynamicInsights();
      },
      error: (err) => {
        console.error("Simulation error:", err);
        // On ne met pas de message bloquant ici car c'est une simulation auto-trigger
      }
    });
    this.simResult.offersCount = Math.floor(Math.random() * 5) + 3;
  }

  updateDynamicInsights() {
    // 1. Calculate Sub-scores based on inputs
    if (this.simData.activity === 'Transport') this.simResult.activityRisk = 80;
    else if (this.simData.activity === 'Industrie') this.simResult.activityRisk = 75;
    else if (this.simData.activity === 'Commerce') this.simResult.activityRisk = 45;
    else this.simResult.activityRisk = 25;

    if (this.simData.region === 'Gabès') this.simResult.regionRisk = 85;
    else if (this.simData.region === 'Sfax') this.simResult.regionRisk = 70;
    else if (this.simData.region === 'Tunis') this.simResult.regionRisk = 60;
    else if (this.simData.region === 'Sousse') this.simResult.regionRisk = 50;
    else this.simResult.regionRisk = 40;

    this.simResult.coverageRisk = Math.floor(this.simData.coverage * 0.8);

    // 2. Region tags
    const regions: Record<string, {name: string, type: string}[]> = {
      'Tunis': [{name: 'Trafic dense', type: 'orange'}, {name: 'Zone urbaine', type: 'orange'}],
      'Sousse': [{name: 'Inondation côtière', type: 'orange'}, {name: 'Zone touristique', type: 'orange'}],
      'Sfax': [{name: 'Zone industrielle', type: 'orange'}, {name: 'Risque pollution', type: 'red'}],
      'Bizerte': [{name: 'Zone portuaire', type: 'orange'}, {name: 'Humidité élevée', type: 'orange'}],
      'Gabès': [{name: 'Infrastructure limitée', type: 'orange'}, {name: 'Éloignement des secours', type: 'red'}, {name: 'Risque inondation flash', type: 'orange'}]
    };
    this.simResult.regionTags = regions[this.simData.region] || [{name: 'Risque standard', type: 'green'}];

    // 3. Advices
    const activities: Record<string, string> = {
      'Transport': 'Une couverture "Perte d\'exploitation" est recommandée pour les flottes.',
      'Commerce': 'Un audit de sécurité incendie annuel est valorisé par les assureurs.',
      'Industrie': 'Une assurance bris de machine est vitale pour éviter les arrêts prolongés.',
      'Services': 'La responsabilité civile professionnelle couvre la majorité de vos risques.'
    };
    
    this.simResult.advices = [
      { text: activities[this.simData.activity] || 'Vérifiez bien les garanties de base.', type: 'orange' },
      { text: 'La valeur des biens doit être mise à jour chaque année pour éviter la sous-assurance.', type: 'orange' },
      { text: 'Une franchise plus haute sur les petits sinistres réduit significativement la prime.', type: 'red' }
    ];

    if (this.simResult.risk > 75) {
      this.simResult.advices.unshift({ text: 'Votre score de risque est élevé. Nous recommandons une couverture maximale.', type: 'red' });
    } else if (this.simResult.risk < 40) {
      this.simResult.advices.unshift({ text: 'Votre profil présente un risque faible. Profitez de nos offres premium.', type: 'green' });
    }

    // 4. Profile and Risk Label
    if (this.simResult.risk > 75) {
      this.simResult.profileLabel = 'Profil risqué';
      this.simResult.riskLabel = 'Risque élevé';
    } else if (this.simResult.risk > 40) {
      this.simResult.profileLabel = 'Profil standard';
      this.simResult.riskLabel = 'Risque modéré';
    } else {
      this.simResult.profileLabel = 'Profil attractif';
      this.simResult.riskLabel = 'Risque faible';
    }
  }

  getSubScoreLabel(score: number): string {
    if (score >= 70) return 'élevé';
    if (score >= 40) return 'modéré';
    return 'faible';
  }

  getSubScoreColor(score: number): string {
    if (score >= 70) return '#e53935'; // Red
    if (score >= 40) return '#f57c00'; // Orange
    return '#2e7d32'; // Green
  }
  
  getSubScoreBg(score: number): string {
    if (score >= 70) return '#ffebee';
    if (score >= 40) return '#fff3e0';
    return '#e8f5e9';
  }
  
  getTagStyle(type: string) {
    if (type === 'red') return { color: '#d32f2f', border: '1px solid #ffcdd2', background: '#fff' };
    if (type === 'orange') return { color: '#f57c00', border: '1px solid #ffe0b2', background: '#fff' };
    return { color: '#388e3c', border: '1px solid #c8e6c9', background: '#fff' };
  }

  startSubscription(offer: any) {
    this.selectedOfferForSub = offer;
    this.activeTab = 'subscribe';
    const user: any = this.authService.getUser();
    if (user) {
      this.subForm.name = user.fullName || '';
      this.subForm.email = user.email || '';
      this.subForm.phone = (user.phone && !user.phone.includes('X')) ? user.phone : '';
      this.subForm.sector = user.sector || '';
      this.subForm.activityType = user.activityType || '';
      this.subForm.region = user.region || '';
    }
    this.subForm.value = offer.coverageAmount || 50000;
  }

  validateVoucher() {
    if (!this.voucherCode) {
       this.message = "Veuillez entrer un code voucher.";
       return;
    }
    this.message = "Voucher validé ! Le montant sera déduit à la confirmation.";
    setTimeout(() => this.message = '', 3000);
  }

  confirmSubscription() {
    const user: any = this.authService.getUser();
    if (!user?.id || !this.selectedOfferForSub) return;

    // Validation du plafond
    if (this.subForm.value > this.selectedOfferForSub.coverageAmount) {
      this.message = `❌ Erreur : Le montant déclaré (${this.subForm.value} TND) dépasse le plafond autorisé par cette offre (${this.selectedOfferForSub.coverageAmount} TND).`;
      alert(this.message);
      return;
    }

    // Validation des champs obligatoires
    if (!this.subForm.name || !this.subForm.email) {
      this.message = "❌ Erreur : Le nom et l'email sont obligatoires pour la gestion de votre contrat.";
      alert(this.message);
      return;
    }

    // Nettoyage du téléphone : enlever les espaces et vérifier les placeholders
    let cleanPhone = this.subForm.phone || '';
    cleanPhone = cleanPhone.replace(/\s/g, ''); // Enlever tous les espaces
    if (cleanPhone.includes('X')) cleanPhone = '';

    const payload = {
      fullName: this.subForm.name,
      email: this.subForm.email,
      phone: cleanPhone,
      sector: this.subForm.sector || 'SERVICES',
      activityType: this.subForm.activityType || 'Non spécifié',
      region: this.subForm.region || 'Tunis'
    };

    console.log("ACTUAL API PAYLOAD:", payload);
    this.loading = true;

    // 1. Validation de la date de début (ne peut pas être dans le passé)
    if (this.subForm.startDate) {
      const selectedDate = new Date(this.subForm.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Comparer uniquement les dates
      
      if (selectedDate < today) {
        this.message = "❌ Erreur : La date de début ne peut pas être dans le passé.";
        alert(this.message);
        return;
      }
    }

    // 2. D'abord mettre à jour le profil pour l'adéquation futur
    this.authService.updateProfile(payload).subscribe({
      next: () => {
        // 3. Ensuite créer le contrat
        this.contratService.create(user.id, this.selectedOfferForSub.id, this.subForm.value, this.subForm.goods, this.voucherCode, this.subForm.startDate).subscribe({
          next: (res) => {
            this.success = true;
            this.message = "Souscription réussie ! Votre profil a été mis à jour et le numéro de police est : " + res.policyNumber;
            this.loading = false;
            
            // Émettre un événement pour rafraîchir les notifications dans le header
            window.dispatchEvent(new CustomEvent('refreshNotifications'));
            
            alert("✅ Félicitations ! Votre profil est à jour et votre contrat d'assurance a été créé.");
          },
          error: (err) => {
            this.message = err.error?.message || err.message || "Erreur lors de la souscription ❌";
            this.loading = false;
            alert("❌ Échec de la souscription : " + this.message);
          }
        });
      },
      error: () => {
        this.message = "Erreur lors de la mise à jour du profil ❌";
        this.loading = false;
      }
    });
  }

  sendMessage() {
    if (!this.userMessage.trim()) return;
    
    const text = this.userMessage;
    const user: any = this.authService.getUser();
    this.chatMessages.push({ type: 'user', text });
    this.userMessage = '';
    this.chatLoading = true;

    this.insuranceService.askChatbot(text, user?.id).subscribe({
      next: (res) => {
        this.chatMessages.push({ type: 'ai', text: res.response });
        this.chatLoading = false;
      },
      error: () => {
        this.chatMessages.push({ type: 'ai', text: "Désolé, je rencontre une difficulté technique. Réessayez bientôt." });
        this.chatLoading = false;
      }
    });
  }

  getLogoUrl(name: string): string {
    const n = name.toLowerCase();
    if (n.includes('star')) return 'https://mystar.star.com.tn/assets/img/logo-color.svg';
    if (n.includes('gat')) return 'https://www.gat.com.tn/themes/custom/gat/logo.png';
    if (n.includes('comar')) return 'https://www.comar.tn/sites/default/files/2018-02/logo_3.jpg';
    return 'assets/img/default-insurance.png';
  }

  reset() {
    this.success = false;
    this.message = '';
    this.activeTab = 'insurers';
    this.loadCompanies();
  }

  goBack() {
    this.router.navigate(['/front/client-space']);
  }
}

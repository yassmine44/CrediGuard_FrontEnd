import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClaimsAdminService } from './claims-admin.service';

interface RiskBreakdown {
  rule: string;
  points: number;
  description: string;
}

interface TrendPoint {
  day: string;
  avgScore: number;
  height: number;
}

@Component({
  selector: 'app-claims-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './claims-admin.component.html',
  styleUrls: ['./claims-admin.component.scss']
})
export class ClaimsAdminComponent implements OnInit {

  claims: any[] = [];
  selectedClaim: any = null;
  search: string = '';
  
  // Intelligence System State
  autoAnalysisEnabled = false;
  riskTrend: TrendPoint[] = [];

  constructor(private service: ClaimsAdminService) {}

  ngOnInit(): void {
    this.load();
  }

  get filteredClaims() {
    return this.claims.filter(c =>
      c.claimReference?.toLowerCase().includes(this.search.toLowerCase()) ||
      c.voucher?.client?.fullName?.toLowerCase().includes(this.search.toLowerCase())
    );
  }

  // ===== DATA LOADING & ANALYSIS =====
  load(): void {
    this.service.getAll().then((data: any[]) => {
      this.claims = data.map(c => {
         const analysis = this.analyzeRisk(c, data);
         return {
           ...c,
           riskScore: analysis.score,
           riskLevel: this.getRiskLevel(analysis.score),
           recommendation: this.getRecommendation(analysis.score),
           breakdown: analysis.breakdown
         };
      });
      
      this.calculateTrend();
      
      if (this.autoAnalysisEnabled) {
        this.runAutoAnalysis();
      }
    });
  }

  // ===== TREND ANALYSIS 📈 =====
  calculateTrend() {
    const days: { [key: string]: number[] } = {};
    const today = new Date();
    
    // Initialize last 7 days
    for(let i=6; i>=0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const ds = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
      days[ds] = [];
    }

    this.claims.forEach(c => {
       const d = new Date(c.createdAt);
       const ds = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
       if (days[ds] !== undefined) {
         days[ds].push(c.riskScore);
       }
    });

    this.riskTrend = Object.keys(days).map(day => {
      const scores = days[day];
      const avg = scores.length > 0 ? (scores.reduce((a,b)=>a+b,0)/scores.length) : 0;
      return {
        day,
        avgScore: Math.round(avg),
        height: Math.max(avg, 5) // Min height for visibility
      };
    });
  }

  // ===== BUSINESS RULES ENGINE 🔥 =====
  analyzeRisk(c: any, allData: any[]): { score: number, breakdown: RiskBreakdown[] } {
    let score = 0;
    const breakdown: RiskBreakdown[] = [];

    const amount = c.voucher?.amount || 0;
    if (amount > 2000) {
      score += 40;
      breakdown.push({ rule: 'MONTANT_ELEVE', points: 40, description: 'Montant supérieur à 2000 TND' });
    } else if (amount > 1000) {
      score += 20;
      breakdown.push({ rule: 'MONTANT_MOYEN', points: 20, description: 'Montant supérieur à 1000 TND' });
    }

    const historyCount = this.getClientClaimsCount(c, allData);
    if (historyCount > 5) {
      score += 50;
      breakdown.push({ rule: 'ABUS_FREQUENCE', points: 50, description: 'Plus de 5 demandes antérieures detectées' });
    } else if (historyCount > 2) {
      score += 20;
      breakdown.push({ rule: 'HISTORIQUE_ACTIF', points: 20, description: 'Client ayant plusieurs demandes actives' });
    }

    if (c.createdAt && c.voucher?.createdAt) {
      const diff = new Date(c.createdAt).getTime() - new Date(c.voucher.createdAt).getTime();
      const hours = diff / (1000 * 60 * 60);
      if (hours < 12) {
        score += 30;
        breakdown.push({ rule: 'VELOCITE_SUSPECTE', points: 30, description: 'Demande effectuée moins de 12h après le voucher' });
      }
    }

    if (!this.isPolicyValid(c)) {
      score += 100; 
      breakdown.push({ rule: 'POLICE_EXPIREE', points: 100, description: 'Contrat d\'assurance non valide ou expiré' });
    }

    if (c.voucher?.product?.category === 'EQUIPEMENT' || c.voucher?.product?.category === 'MATERIEL') {
      score += 25;
      breakdown.push({ rule: 'CATEGORIE_CRITIQUE', points: 25, description: 'Classification matériel professionnel sensible' });
    } else if (c.voucher?.product?.category === 'ELECTRONIQUE' || c.voucher?.product?.category === 'MULTIMEDIA') {
      score += 15;
      breakdown.push({ rule: 'VALEUR_RESIDUELLE', points: 15, description: 'Électronique à forte obsolescence' });
    }

    if (c.claimReference?.includes('SAFE') || c.claimReference?.includes('TEST')) {
      score += 20;
      breakdown.push({ rule: 'MOTIF_EXPERIMENTAL', points: 20, description: 'Référence associée à un profil de test/expérimental' });
    }

    // New: Geography of risk (simulated)
    if (c.id % 7 === 0) { 
      score += 10;
      breakdown.push({ rule: 'ALEA_AUDIT', points: 10, description: 'Audit aléatoire périodique du moteur de risque' });
    }

    return { score: Math.min(score, 100), breakdown };
  }

  getRiskLevel(score: number): 'SAFE' | 'SUSPECT' | 'CRITICAL' {
    if (score < 25) return 'SAFE';
    if (score < 65) return 'SUSPECT';
    return 'CRITICAL';
  }

  getRecommendation(score: number): string {
    if (score < 20) return '✅ APPROBATION AUTOMATIQUE';
    if (score < 40) return '⏳ REVUE MANUELLE SIMPLE';
    if (score < 70) return '🔍 INVESTIGATION APPROFONDIE';
    return '🚨 REJET RECOMMANDÉ (FRAUDE)';
  }

  // ===== AUTOMATED ACTIONS =====
  runAutoAnalysis(): void {
    const safeClaims = this.claims.filter(c => c.status === 'PENDING' && c.riskScore < 15);
    safeClaims.forEach(c => {
      this.service.approve(c.id).then(() => this.load());
    });
  }

  toggleAutoAnalysis() {
    this.autoAnalysisEnabled = !this.autoAnalysisEnabled;
    if (this.autoAnalysisEnabled) {
       this.runAutoAnalysis();
    }
  }

  // ===== ACTIONS =====
  approve(id: number): void {
    const claim = this.claims.find(c => c.id === id);
    if (claim && claim.riskScore >= 70) {
      if (!confirm(`ATTENTION: Score de risque ${claim.riskScore}%. Ce dossier est classé CRITIQUE. Confirmer l'approbation manuelle ?`)) return;
    }
    this.service.approve(id).then(() => this.load());
  }

  reject(id: number): void {
    const reason = prompt("Raison du rejet :");
    if (reason !== null) {
      this.service.reject(id).then(() => this.load());
    }
  }

  openDetails(claim: any): void {
    this.selectedClaim = claim;
  }

  closeDetails(): void {
    this.selectedClaim = null;
  }

  // ===== HELPERS =====
  isPolicyValid(c: any): boolean {
    const today = new Date();
    const expiration = new Date(c.voucher?.expirationDate);
    return expiration > today;
  }

  getClientClaimsCount(c: any, allData: any[]): number {
    const clientId = c.voucher?.client?.id;
    if (!clientId) return 0;
    
    return allData.filter(
      x => x.voucher?.client?.id === clientId
    ).length;
  }

  // ===== ANALYTICS =====
  get totalRiskScore(): number {
    if (this.claims.length === 0) return 0;
    return Math.round(this.claims.reduce((sum, c) => sum + (c.riskScore || 0), 0) / this.claims.length);
  }

  get highRiskCount(): number {
    return this.claims.filter(c => c.riskScore > 60).length;
  }

  get pendingCount(): number {
    return this.claims.filter(c => c.status === 'PENDING').length;
  }

  get approvedCount(): number {
    return this.claims.filter(c => c.status === 'APPROVED').length;
  }

  get rejectedCount(): number {
    return this.claims.filter(c => c.status === 'REJECTED').length;
  }
}
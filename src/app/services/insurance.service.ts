import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface InsuranceOffer {
  id?: number;
  name: string;
  description: string;
  type: 'LIFE' | 'HEALTH' | 'PROPERTY' | 'LOAN';
  premiumAmount: number;
  coverageAmount: number;
  guaranteedAmount?: number;
  rate?: number;
  active: boolean;
  insuranceCompany?: any;
}

export interface InsuranceRecommendation {
  id: number;
  clientId: number;
  creditRequestId: number;
  suggestedOffers: InsuranceOffer[];
  riskScore: number;
  recommendationDate: string;
  reasons: string[];
}

export interface ChatResponse {
  response: string;
  intent?: string;
  confidence?: number;
  suggestedAction?: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class InsuranceService {

  private api = 'http://localhost:8089/api/insurance';

  constructor(private http: HttpClient) {}

  // Subscription
  subscribe(clientId: number, offerId: number, demandeId: number): Observable<any> {
    return this.http.post(`${this.api}/subscribe`, null, {
      params: { clientId, offerId, demandeId }
    });
  }

  // Recommendations
  getRecommendationForClient(clientId: number): Observable<InsuranceRecommendation[]> {
    return this.http.get<InsuranceRecommendation[]>(`${this.api}/recommendations/client/${clientId}`);
  }

  getRecommendationForDemande(demandeId: number): Observable<InsuranceRecommendation> {
    return this.http.post<InsuranceRecommendation>(`${this.api}/recommendation/${demandeId}`, {});
  }

  // Offers
  getOffers(): Observable<InsuranceOffer[]> {
    return this.http.get<InsuranceOffer[]>(`${this.api}/offers`);
  }

  getInsurances(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/companies`);
  }

  // Claims
  createClaim(policyId: number, reason: string): Observable<any> {
    return this.http.post(`${this.api}/claims`, null, {
      params: { policyId, reason }
    });
  }

  getUserClaims(clientId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/claims/client/${clientId}`);
  }

  // AI Chatbot
  askChatbot(question: string, clientId?: number): Observable<ChatResponse> {
    const payload = { question, clientId };
    return this.http.post<ChatResponse>(`${this.api}/chatbot/ask`, payload);
  }

  // New Profile & Adequacy methods
  getRiskScore(clientId: number): Observable<number> {
    return this.http.get<number>(`${this.api}/client/${clientId}/risk-score`);
  }

  getAdequacyScore(offerId: number, clientId: number): Observable<number> {
    return this.http.get<number>(`${this.api}/offers/${offerId}/adequacy/${clientId}`);
  }

  downloadPolicyPDF(policyId: number): Observable<Blob> {
    return this.http.get(`${this.api}/policies/${policyId}/pdf`, { responseType: 'blob' });
  }
}

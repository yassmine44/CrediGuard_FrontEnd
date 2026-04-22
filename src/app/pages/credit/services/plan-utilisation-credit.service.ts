import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  PlanUtilisationRequest,
  PlanUtilisationResponse,
} from '../models/plan-utilisation-credit.model';

@Injectable({
  providedIn: 'root',
})
export class PlanUtilisationCreditService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8089/api/plans';

  create(demandeId: number, payload: PlanUtilisationRequest): Observable<PlanUtilisationResponse> {
    return this.http.post<PlanUtilisationResponse>(
      `${this.apiUrl}?demandeId=${demandeId}`,
      payload
    );
  }

  getByDemande(demandeId: number): Observable<PlanUtilisationResponse> {
    return this.http.get<PlanUtilisationResponse>(
      `${this.apiUrl}?demandeId=${demandeId}`
    );
  }

  update(demandeId: number, payload: PlanUtilisationRequest): Observable<PlanUtilisationResponse> {
    return this.http.put<PlanUtilisationResponse>(
      `${this.apiUrl}?demandeId=${demandeId}`,
      payload
    );
  }
}
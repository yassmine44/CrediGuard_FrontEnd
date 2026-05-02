import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  DecisionCreditRequest,
  DecisionCreditResponse,
} from '../models/decision-credit.model';

@Injectable({
  providedIn: 'root',
})
export class DecisionCreditService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8089/api/decisions';

  create(demandeId: number, payload: DecisionCreditRequest): Observable<DecisionCreditResponse> {
    return this.http.post<DecisionCreditResponse>(
      `${this.apiUrl}?demandeId=${demandeId}`,
      payload
    );
  }

  getByDemande(demandeId: number): Observable<DecisionCreditResponse> {
    return this.http.get<DecisionCreditResponse>(
      `${this.apiUrl}?demandeId=${demandeId}`
    );
  }
}
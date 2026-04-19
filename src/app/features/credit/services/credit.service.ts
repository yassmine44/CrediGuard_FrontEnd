import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreditRequest, CreditResponse, StatutCredit } from '../models/credit.model';

@Injectable({
  providedIn: 'root',
})
export class CreditService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8089/api/credits';

  create(demandeId: number, payload: CreditRequest): Observable<CreditResponse> {
    return this.http.post<CreditResponse>(
      `${this.apiUrl}?demandeId=${demandeId}`,
      payload
    );
  }

  getById(id: number): Observable<CreditResponse> {
    return this.http.get<CreditResponse>(`${this.apiUrl}/${id}`);
  }

  getAll(clientId?: number, statut?: StatutCredit): Observable<CreditResponse[]> {
    const params: string[] = [];

    if (clientId !== undefined) params.push(`clientId=${clientId}`);
    if (statut) params.push(`statut=${statut}`);

    const query = params.length ? `?${params.join('&')}` : '';
    return this.http.get<CreditResponse[]>(`${this.apiUrl}${query}`);
  }

  update(id: number, payload: CreditRequest): Observable<CreditResponse> {
    return this.http.put<CreditResponse>(`${this.apiUrl}/${id}`, payload);
  }

  getByDemande(demandeId: number): Observable<CreditResponse> {
    return this.http.get<CreditResponse>(
      `${this.apiUrl}/by-demande?demandeId=${demandeId}`
    );
  }
}
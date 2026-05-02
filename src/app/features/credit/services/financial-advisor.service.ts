import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FinancialAdvisorResponse } from '../models/financial-advisor.model';

@Injectable({
  providedIn: 'root',
})
export class FinancialAdvisorService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8089/api/financial-advisor';

  getByDemande(demandeId: number): Observable<FinancialAdvisorResponse> {
    const params = new HttpParams().set('demandeId', demandeId);
    return this.http.get<FinancialAdvisorResponse>(this.apiUrl, { params });
  }
}

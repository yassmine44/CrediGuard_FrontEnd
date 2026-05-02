import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FinancialAdvisorClientResponse } from '../models/financial-advisor-client.model';

@Injectable({
  providedIn: 'root',
})
export class FinancialAdvisorClientService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8089/api/financial-advisor';

  getAdvisor(demandeId: number): Observable<FinancialAdvisorClientResponse> {
    const params = new HttpParams().set('demandeId', demandeId);
    return this.http.get<FinancialAdvisorClientResponse>(this.apiUrl, { params });
  }
}

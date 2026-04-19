import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreditResponse, StatutCredit } from '../models/credit.model';

@Injectable({
  providedIn: 'root',
})
export class CreditService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8089/api/credits';

  getAll(clientId?: number, statut?: StatutCredit): Observable<CreditResponse[]> {
    const params: string[] = [];

    if (clientId !== undefined) params.push(`clientId=${clientId}`);
    if (statut) params.push(`statut=${statut}`);

    const query = params.length ? `?${params.join('&')}` : '';
    return this.http.get<CreditResponse[]>(`${this.apiUrl}${query}`);
  }
}
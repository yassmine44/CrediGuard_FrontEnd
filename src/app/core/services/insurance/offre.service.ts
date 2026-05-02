import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InsuranceOffer } from '../../models/insurance.model';

@Injectable({
  providedIn: 'root'
})
export class OffreService {
  private apiUrl = 'http://localhost:8089/api/offres';

  constructor(private http: HttpClient) {}

  getAll(): Observable<InsuranceOffer[]> {
    return this.http.get<InsuranceOffer[]>(this.apiUrl);
  }

  getRecommended(clientId: number): Observable<InsuranceOffer[]> {
    return this.http.get<InsuranceOffer[]>(`${this.apiUrl}/recommandees`, {
      params: { clientId: clientId.toString() }
    });
  }

  create(offer: InsuranceOffer): Observable<InsuranceOffer> {
    return this.http.post<InsuranceOffer>(this.apiUrl, offer);
  }

  update(id: number, offer: InsuranceOffer): Observable<InsuranceOffer> {
    return this.http.put<InsuranceOffer>(`${this.apiUrl}/${id}`, offer);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

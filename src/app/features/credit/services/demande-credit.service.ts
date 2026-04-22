import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  DemandeCreditRequest,
  DemandeCreditResponse,
  StatutDemande,
} from '../models/demande-credit.model';

@Injectable({
  providedIn: 'root',
})
export class DemandeCreditService {
  private http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:8089/api/demandes';

  create(
    clientId: number,
    payload: DemandeCreditRequest
  ): Observable<DemandeCreditResponse> {
    const params = new HttpParams().set('clientId', clientId);
    return this.http.post<DemandeCreditResponse>(this.apiUrl, payload, { params });
  }

  getAll(
    clientId?: number,
    statut?: StatutDemande
  ): Observable<DemandeCreditResponse[]> {
    let params = new HttpParams();

    if (clientId !== undefined && clientId !== null) {
      params = params.set('clientId', clientId);
    }

    if (statut) {
      params = params.set('statut', statut);
    }

    return this.http.get<DemandeCreditResponse[]>(this.apiUrl, { params });
  }

  getById(id: number): Observable<DemandeCreditResponse> {
    return this.http.get<DemandeCreditResponse>(`${this.apiUrl}/${id}`);
  }

  update(
  id: number,
  payload: DemandeCreditRequest
): Observable<DemandeCreditResponse> {
  return this.http.put<DemandeCreditResponse>(`${this.apiUrl}/${id}`, payload);
}

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  setStatus(
    id: number,
    statut: StatutDemande
  ): Observable<DemandeCreditResponse> {
    const params = new HttpParams().set('statut', statut);
    return this.http.patch<DemandeCreditResponse>(
      `${this.apiUrl}/${id}/status`,
      null,
      { params }
    );
  }
  
}
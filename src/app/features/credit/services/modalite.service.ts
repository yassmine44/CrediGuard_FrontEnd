import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  LigneAmortissement,
  ModaliteRequest,
  ModaliteResponse,
} from '../models/modalite.model';

@Injectable({
  providedIn: 'root',
})
export class ModaliteService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8089/api/modalites';

  generate(demandeId: number): Observable<ModaliteResponse> {
    const params = new HttpParams().set('demandeId', demandeId);

    return this.http.post<ModaliteResponse>(
      `${this.apiUrl}/generate`,
      null,
      { params }
    );
  }

  getByDemande(demandeId: number): Observable<ModaliteResponse> {
    const params = new HttpParams().set('demandeId', demandeId);

    return this.http.get<ModaliteResponse>(this.apiUrl, { params });
  }

  choose(
    demandeId: number,
    payload: ModaliteRequest
  ): Observable<ModaliteResponse> {
    const params = new HttpParams().set('demandeId', demandeId);

    return this.http.put<ModaliteResponse>(
      `${this.apiUrl}/choose`,
      payload,
      { params }
    );
  }

  getAmortissement(demandeId: number): Observable<LigneAmortissement[]> {
    const params = new HttpParams().set('demandeId', demandeId);

    return this.http.get<LigneAmortissement[]>(
      `${this.apiUrl}/amortissement`,
      { params }
    );
  }

  downloadAmortissementPdf(demandeId: number): Observable<Blob> {
    const params = new HttpParams().set('demandeId', demandeId);

    return this.http.get(`${this.apiUrl}/amortissement/pdf`, {
      params,
      responseType: 'blob',
    });
  }
}

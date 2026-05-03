import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  DemandeCreditRequest,
  DemandeCreditResponse,
} from '../models/demande-credit.model';
import { AuthService } from '../../../core/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class DemandeCreditService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private readonly apiUrl = 'http://localhost:8089/api/demandes';
  private readonly modaliteApiUrl = 'http://localhost:8089/api/modalites';

  create(payload: DemandeCreditRequest): Observable<DemandeCreditResponse> {
    return this.http.post<DemandeCreditResponse>(this.apiUrl, payload);
  }

  getAll(): Observable<DemandeCreditResponse[]> {
    const userId = this.authService.getUser()?.id;

    if (!userId) {
      throw new Error('Utilisateur non connecté ou ID introuvable.');
    }

    const params = new HttpParams().set('clientId', userId);

    return this.http.get<DemandeCreditResponse[]>(this.apiUrl, { params });
  }

  getById(id: number): Observable<DemandeCreditResponse> {
    return this.http.get<DemandeCreditResponse>(`${this.apiUrl}/${id}`);
  }

  downloadAmortissementPdf(demandeId: number): Observable<Blob> {
    const params = new HttpParams().set('demandeId', demandeId);

    return this.http.get(`${this.modaliteApiUrl}/amortissement/pdf`, {
      params,
      responseType: 'blob',
    });
  }
}

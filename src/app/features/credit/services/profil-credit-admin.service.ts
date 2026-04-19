import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProfilCreditResponse } from '../models/profil-credit.model';

@Injectable({
  providedIn: 'root',
})
export class ProfilCreditAdminService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8089/api/profils-credit';

  getByClientId(clientId: number): Observable<ProfilCreditResponse> {
    const params = new HttpParams().set('clientId', clientId);
    return this.http.get<ProfilCreditResponse>(`${this.apiUrl}/by-client`, { params });
  }
}

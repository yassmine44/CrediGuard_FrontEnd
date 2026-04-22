import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ProfilCreditRequest,
  ProfilCreditResponse,
} from '../models/profil-credit.model';

@Injectable({
  providedIn: 'root',
})
export class ProfilCreditService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8089/api/profils-credit';

  getMyProfile(): Observable<ProfilCreditResponse> {
    return this.http.get<ProfilCreditResponse>(`${this.apiUrl}/me`);
  }

  createMyProfile(payload: ProfilCreditRequest): Observable<ProfilCreditResponse> {
    return this.http.post<ProfilCreditResponse>(`${this.apiUrl}/me`, payload);
  }

  updateMyProfile(payload: ProfilCreditRequest): Observable<ProfilCreditResponse> {
    return this.http.put<ProfilCreditResponse>(`${this.apiUrl}/me`, payload);
  }
}

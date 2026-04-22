import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  PromoCodeCreateRequest,
  PromoCodeResponse,
  PromoCodeUpdateRequest,
  PromoCodeValidateRequest,
  PromoCodeValidateResponse
} from '../models/promo-code.model';

@Injectable({
  providedIn: 'root'
})
export class PromoCodeService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8089/api/promo-codes';

  getAll(): Observable<PromoCodeResponse[]> {
    return this.http.get<PromoCodeResponse[]>(this.apiUrl);
  }

  getById(id: number): Observable<PromoCodeResponse> {
    return this.http.get<PromoCodeResponse>(`${this.apiUrl}/${id}`);
  }

  create(payload: PromoCodeCreateRequest): Observable<PromoCodeResponse> {
    return this.http.post<PromoCodeResponse>(this.apiUrl, payload);
  }

  update(id: number, payload: PromoCodeUpdateRequest): Observable<PromoCodeResponse> {
    return this.http.put<PromoCodeResponse>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  validate(payload: PromoCodeValidateRequest): Observable<PromoCodeValidateResponse> {
    return this.http.post<PromoCodeValidateResponse>(`${this.apiUrl}/validate`, payload);
  }
}
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Promotion,
  PromotionCreateRequest
} from '../models/promotion.model';

@Injectable({
  providedIn: 'root'
})
export class PromotionService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8089/api/promotions';

  getAll(): Observable<Promotion[]> {
    return this.http.get<Promotion[]>(this.apiUrl);
  }

  getActive(): Observable<Promotion[]> {
    return this.http.get<Promotion[]>(`${this.apiUrl}/active`);
  }

  getById(id: number): Observable<Promotion> {
    return this.http.get<Promotion>(`${this.apiUrl}/${id}`);
  }

  create(payload: PromotionCreateRequest): Observable<Promotion> {
    return this.http.post<Promotion>(this.apiUrl, payload);
  }
}
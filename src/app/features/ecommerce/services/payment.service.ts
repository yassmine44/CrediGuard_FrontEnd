import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  PaymentCreateRequest,
  PaymentResponse,
  PaymentUpdateRequest
} from '../models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8089/api/payments';

  getAll(): Observable<PaymentResponse[]> {
    return this.http.get<PaymentResponse[]>(this.apiUrl);
  }

  getById(id: number): Observable<PaymentResponse> {
    return this.http.get<PaymentResponse>(`${this.apiUrl}/${id}`);
  }

  getByOrder(orderId: number): Observable<PaymentResponse> {
    return this.http.get<PaymentResponse>(`${this.apiUrl}/order/${orderId}`);
  }

  create(payload: PaymentCreateRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(this.apiUrl, payload);
  }

  update(id: number, payload: PaymentUpdateRequest): Observable<PaymentResponse> {
    return this.http.put<PaymentResponse>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
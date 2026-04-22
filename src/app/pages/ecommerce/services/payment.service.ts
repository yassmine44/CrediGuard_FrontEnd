import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PaymentCreateRequest, PaymentResponse } from '../models/payment.model';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8089/api/payments';

  create(payload: PaymentCreateRequest) {
    return this.http.post<PaymentResponse>(this.apiUrl, payload);
  }

  getByOrder(orderId: number) {
    return this.http.get<PaymentResponse>(`${this.apiUrl}/order/${orderId}`);
  }
}
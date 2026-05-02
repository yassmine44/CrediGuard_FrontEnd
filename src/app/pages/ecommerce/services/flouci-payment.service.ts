import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  FlouciPaymentConfirmation,
  FlouciPaymentRequest,
  FlouciPaymentResponse
} from '../models/flouci-payment.model';

@Injectable({
  providedIn: 'root'
})
export class FlouciPaymentService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8089/api/flouci';

  generatePayment(payload: FlouciPaymentRequest): Observable<FlouciPaymentResponse> {
    return this.http.post<FlouciPaymentResponse>(`${this.baseUrl}/payment`, payload);
  }

  verifyPayment(paymentId: number): Observable<FlouciPaymentConfirmation> {
    const params = new HttpParams().set('paymentId', paymentId);
    return this.http.post<FlouciPaymentConfirmation>(`${this.baseUrl}/payment/verify`, null, { params });
  }
}

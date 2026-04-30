import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  StripeCheckoutRequest,
  StripeCheckoutResponse,
  StripePaymentConfirmation
} from '../models/stripe-checkout.model';

@Injectable({
  providedIn: 'root'
})
export class StripeCheckoutService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8089/api/stripe';

  createCheckoutSession(payload: StripeCheckoutRequest): Observable<StripeCheckoutResponse> {
    return this.http.post<StripeCheckoutResponse>(`${this.baseUrl}/checkout-session`, payload);
  }

  confirmCheckoutSession(sessionId: string): Observable<StripePaymentConfirmation> {
    const params = new HttpParams().set('sessionId', sessionId);
    return this.http.post<StripePaymentConfirmation>(`${this.baseUrl}/checkout-session/confirm`, null, { params });
  }
}

import { PaymentResponse } from './payment.model';

export interface StripeCheckoutRequest {
  paymentId: number;
}

export interface StripeCheckoutResponse {
  sessionId: string;
  url: string;
}

export type StripePaymentConfirmation = PaymentResponse;

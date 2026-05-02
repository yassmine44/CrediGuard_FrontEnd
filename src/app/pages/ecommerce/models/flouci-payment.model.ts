import { PaymentResponse } from './payment.model';

export interface FlouciPaymentRequest {
  paymentId: number;
}

export interface FlouciPaymentResponse {
  paymentId: number;
  flouciPaymentId: string;
  paymentLink: string;
}

export type FlouciPaymentConfirmation = PaymentResponse;

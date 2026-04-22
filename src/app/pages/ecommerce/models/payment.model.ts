export type PaymentType =
  | 'CARD'
  | 'CASH_ON_DELIVERY'
  | 'BANK_TRANSFER'
  | 'WALLET';

export type PaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED';

export interface PaymentCreateRequest {
  orderId: number;
  paymentType: PaymentType;
}

export interface PaymentResponse {
  id: number;
  orderId: number;
  amount: number;
  paymentType: PaymentType;
  paymentStatus: PaymentStatus;
  transactionRef?: string | null;
}
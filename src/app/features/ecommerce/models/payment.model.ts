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

export interface PaymentResponse {
  id: number;
  orderId: number;
  amount: number;
  paymentType: PaymentType;
  paymentStatus: PaymentStatus;
  transactionRef?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface PaymentCreateRequest {
  orderId: number;
  paymentType: PaymentType;
}

export interface PaymentUpdateRequest {
  paymentStatus?: PaymentStatus | null;
  transactionRef?: string | null;
}
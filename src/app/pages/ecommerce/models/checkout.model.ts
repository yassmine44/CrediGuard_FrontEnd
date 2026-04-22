import { OrderResponse } from './order.model';
import { DeliveryResponse, DeliverySlot, DeliveryType } from './delivery.model';
import { PaymentResponse, PaymentType } from './payment.model';

export interface CheckoutRequest {
  addressId: number;
  paymentType: PaymentType;
  deliveryType: DeliveryType;
  deliverySlot?: DeliverySlot | null;
  scheduledAt?: string | null;
  promoCode?: string | null;
}

export interface CheckoutResponse {
  order: OrderResponse;
  delivery: DeliveryResponse;
  payment: PaymentResponse;
}
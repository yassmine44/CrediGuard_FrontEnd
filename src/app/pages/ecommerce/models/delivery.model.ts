import { DeliveryAddressResponse } from './delivery-address.model';

export type DeliveryType = 'STANDARD' | 'EXPRESS';
export type DeliveryStatus = 'WAITING_STOCK' | 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
export type DeliverySlot = 'MORNING' | 'AFTERNOON' | 'EVENING';

export interface DeliveryCreateRequest {
  orderId: number;
  addressId: number;
  deliveryType: DeliveryType;
  deliverySlot: DeliverySlot;
  deliveryFee: number;
  scheduledAt?: string | null;
  trackingNumber?: string | null;
  carrier?: string | null;
}

export interface DeliveryResponse {
  id: number;
  orderId: number;
  deliveryType: DeliveryType;
  deliveryStatus: DeliveryStatus;
  deliverySlot: DeliverySlot;
  deliveryFee: number;
  scheduledAt?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  trackingNumber?: string | null;
  carrier?: string | null;
  address?: DeliveryAddressResponse | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}
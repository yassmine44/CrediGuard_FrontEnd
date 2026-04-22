export type DeliveryType = 'STANDARD' | 'EXPRESS';
export type DeliveryStatus =
  | 'WAITING_STOCK'
  | 'PENDING'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED';
export type DeliverySlot = 'MORNING' | 'AFTERNOON' | 'EVENING';

export interface DeliveryAddressResponse {
  id: number;
  fullName: string;
  phone: string;
  city: string;
  addressLine: string;
  additionalInfo?: string | null;
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

export interface DeliveryUpdateRequest {
  deliveryType?: DeliveryType | null;
  deliveryStatus?: DeliveryStatus | null;
  deliverySlot?: DeliverySlot | null;
  deliveryFee?: number | null;
  scheduledAt?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  trackingNumber?: string | null;
  carrier?: string | null;
  addressId?: number | null;
}
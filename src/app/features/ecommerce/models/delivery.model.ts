export type DeliveryType = 'STANDARD' | 'EXPRESS';
export type DeliveryStatus =
  | 'WAITING_STOCK'
  | 'PENDING'
  | 'PENDING_REVIEW'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED';
export type DeliverySlot = 'MORNING' | 'AFTERNOON' | 'EVENING';

export interface DeliveryAddressResponse {
  id: number;
  fullName: string;
  phone: string;
  city: string;
  governorate?: string | null;
  delegation?: string | null;
  locality?: string | null;
  addressLine: string;
  additionalInfo?: string | null;
  latitude?: number | null;
  longitude?: number | null;
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
  deliveryZoneId?: number | null;
  deliveryZoneName?: string | null;
  zoneRiskLevel?: string | null;
  extraDelayDays?: number | null;
  requiresAdminApproval?: boolean | null;
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

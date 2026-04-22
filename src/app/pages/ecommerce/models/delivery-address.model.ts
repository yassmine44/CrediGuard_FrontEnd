export interface DeliveryAddressCreateRequest {
  fullName: string;
  phone: string;
  city: string;
  addressLine: string;
  additionalInfo?: string | null;
}

export interface DeliveryAddressUpdateRequest {
  fullName?: string | null;
  phone?: string | null;
  city?: string | null;
  addressLine?: string | null;
  additionalInfo?: string | null;
}

export interface DeliveryAddressResponse {
  id: number;
  fullName: string;
  phone: string;
  city: string;
  addressLine: string;
  additionalInfo?: string | null;
}
export interface DeliveryAddressCreateRequest {
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

export interface DeliveryAddressUpdateRequest {
  fullName?: string | null;
  phone?: string | null;
  city?: string | null;
  governorate?: string | null;
  delegation?: string | null;
  locality?: string | null;
  addressLine?: string | null;
  additionalInfo?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

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

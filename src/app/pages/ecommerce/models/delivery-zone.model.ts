export type DeliveryZoneRisk = 'NORMAL' | 'REMOTE' | 'SENSITIVE' | 'DANGEROUS';

export interface DeliveryZoneResponse {
  id: number;
  name: string;
  governorate?: string | null;
  delegation?: string | null;
  locality?: string | null;
  riskLevel: DeliveryZoneRisk;
  riskLabel: string;
  riskColor: string;
  feeAdjustment: number;
  extraDelayDays: number;
  requiresAdminApproval: boolean;
  active: boolean;
  reason?: string | null;
  geoJsonPolygon: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface DeliveryZoneCheckRequest {
  latitude: number;
  longitude: number;
}

export interface DeliveryZoneCheckResponse {
  matched: boolean;
  zoneId?: number | null;
  zoneName?: string | null;
  riskLevel: DeliveryZoneRisk;
  riskLabel: string;
  riskColor: string;
  feeAdjustment: number;
  extraDelayDays: number;
  requiresAdminApproval: boolean;
  message: string;
}

export interface DeliveryFeeCheckRequest {
  governorate?: string | null;
  city?: string | null;
  delegation?: string | null;
  locality?: string | null;
  addressLine?: string | null;
}

export interface DeliveryFeeCheckResponse {
  areaLabel: string;
  areaColor: string;
  deliveryFee: number;
  estimatedDelayDays: number;
  message: string;
}

export type DiscountType = 'PERCENTAGE' | 'FIXED';

export interface PromoCodeResponse {
  id: number;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  active: boolean;
  maxUses: number;
  usedCount: number;
  minOrderAmount?: number | null;
  maxDiscountAmount?: number | null;
  startAt?: string | null;
  endAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface PromoCodeCreateRequest {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  active?: boolean | null;
  maxUses: number;
  minOrderAmount?: number | null;
  maxDiscountAmount?: number | null;
  startAt?: string | null;
  endAt?: string | null;
}

export interface PromoCodeUpdateRequest {
  code?: string | null;
  discountType?: DiscountType | null;
  discountValue?: number | null;
  active?: boolean | null;
  maxUses?: number | null;
  minOrderAmount?: number | null;
  maxDiscountAmount?: number | null;
  startAt?: string | null;
  endAt?: string | null;
}

export interface PromoCodeValidateRequest {
  code: string;
  orderAmount: number;
}

export interface PromoCodeValidateResponse {
  valid: boolean;
  message: string;
  discountAmount: number;
  finalAmount: number;
  promoCodeId?: number | null;
}
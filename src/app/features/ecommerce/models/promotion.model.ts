export type PromotionType = 'SEASONAL' | 'HOLIDAY' | 'FLASH' | 'CLEARANCE';
export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';
export type PromotionTargetType = 'ALL_PRODUCTS' | 'CATEGORY' | 'PRODUCT';
export type PromotionStatus = 'SCHEDULED' | 'LIVE' | 'EXPIRED' | 'DISABLED';

export interface Promotion {
  id: number;
  name: string;
  description: string | null;
  promotionType: PromotionType;
  discountType: DiscountType;
  targetType: PromotionTargetType;
  discountValue: number;
  minOrderAmount: number | null;
  maxDiscountAmount: number | null;
  status?: PromotionStatus | null;
  active: boolean;
  priority: number;
  autoApply: boolean;
  stackable: boolean;
  startDate: string | null;
  endDate: string | null;
  categoryId: number | null;
  categoryName: string | null;
  productId: number | null;
  productName: string | null;
  calendarEventId: number | null;
  calendarEventName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PromotionCreateRequest {
  name: string;
  description?: string | null;
  promotionType: PromotionType | null;
  discountType: DiscountType | null;
  targetType: PromotionTargetType | null;
  discountValue: number | null;
  minOrderAmount?: number | null;
  maxDiscountAmount?: number | null;
  active?: boolean | null;
  priority?: number | null;
  autoApply?: boolean | null;
  stackable?: boolean | null;
  startDate?: string | null;
  endDate?: string | null;
  categoryId?: number | null;
  productId?: number | null;
  calendarEventId?: number | null;
}

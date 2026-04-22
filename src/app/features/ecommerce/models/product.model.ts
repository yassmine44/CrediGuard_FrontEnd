export type SaleMode = 'STANDARD' | 'PREORDER';

export interface Product {
  id: number;
  sellerId?: number | null;
  sellerName?: string | null;
  categoryId?: number | null;
  categoryName?: string | null;

  name: string;
  description?: string | null;

  basePrice: number;
  currentPrice?: number | null;

  dynamicPricingEnabled?: boolean | null;
  pricingStrategy?: string | null;

  saleType?: SaleMode | null;
  stockQuantity?: number | null;
  preorderQuota?: number | null;
  preorderCount?: number | null;

  paymentMode?: string | null;
  depositPercentage?: number | null;

  expressDeliveryAvailable?: boolean | null;
  expressDeliveryFee?: number | null;

  preorderStartDate?: string | null;
  preorderEndDate?: string | null;
  expectedReleaseDate?: string | null;

  active?: boolean;
  createdAt?: string;
  updatedAt?: string;

  imageUrl?: string | null;

  originalPrice?: number | null;
  finalPrice?: number | null;
  discountAmount?: number | null;
  promotionApplied?: boolean;
  promotionName?: string | null;
}

export interface ProductCreateRequest {
  categoryId: number | null;
  name: string;
  description?: string | null;
  basePrice: number | null;
  imageUrl?: string | null;
  dynamicPricingEnabled?: boolean | null;
  pricingStrategy?: string | null;
  saleType: SaleMode | null;
  stockQuantity?: number | null;
  preorderQuota?: number | null;
  paymentMode?: string | null;
  depositPercentage?: number | null;
  expressDeliveryAvailable?: boolean | null;
  expressDeliveryFee?: number | null;
  preorderStartDate?: string | null;
  preorderEndDate?: string | null;
  expectedReleaseDate?: string | null;
}

export interface ProductUpdateRequest {
  categoryId?: number | null;
  name?: string;
  description?: string | null;
  basePrice?: number | null;
  imageUrl?: string | null;
  currentPrice?: number | null;
  dynamicPricingEnabled?: boolean | null;
  pricingStrategy?: string | null;
  saleType?: SaleMode | null;
  stockQuantity?: number | null;
  preorderQuota?: number | null;
  paymentMode?: string | null;
  depositPercentage?: number | null;
  expressDeliveryAvailable?: boolean | null;
  expressDeliveryFee?: number | null;
  preorderStartDate?: string | null;
  preorderEndDate?: string | null;
  expectedReleaseDate?: string | null;
  active?: boolean | null;
}
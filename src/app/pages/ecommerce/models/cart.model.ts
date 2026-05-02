export interface AddItemRequest {
  productId: number;
  quantity: number;
}

export interface UpdateItemRequest {
  quantity: number;
}

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productImageUrl?: string | null;
  imageUrl?: string | null;

  unitPrice: number;

  // 🔥 IMPORTANT (manquaient chez toi)
  originalUnitPrice: number;
  finalUnitPrice: number;
  discountAmount: number;
  promotionApplied: boolean;
  promotionName?: string | null;

  quantity: number;
  lineTotal: number;

source?: 'STANDARD' | 'PRODUCT_REQUEST_OFFER';
sourceOfferId?: number | null;
negotiatedUnitPrice?: number | null;
expressDeliveryAvailable?: boolean | null;
expressDeliveryFee?: number | null;

}

export interface Cart {
  id: number;
  userId: number;
  status: string;
  items: CartItem[];

  // 🔥 IMPORTANT (manquaient chez toi)
  subtotal: number;
  totalDiscount: number;
  total: number;
}

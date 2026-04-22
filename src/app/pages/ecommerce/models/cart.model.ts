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
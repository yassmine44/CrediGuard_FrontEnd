export interface OrderItemCreateRequest {
  productId: number;
  quantity: number;
}

export interface OrderCreateRequest {
  promoCode?: string | null;
  items: {
    productId: number;
    quantity: number;
  }[];
}

export interface OrderItemResponse {
  id: number;
  productId: number;
  productName: string;
  productImageUrl?: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderResponse {
  id: number;
  userId: number;
  status: string;
  totalAmount: number;
  promoCodeId?: number | null;
  promoCode?: string | null;
  financeReference?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItemResponse[];
}
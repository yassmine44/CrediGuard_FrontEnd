export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELED';

export interface OrderAdmin {
  id: number;
  userId: number;
  clientName: string;
  clientEmail: string;
  status: OrderStatus;
  totalAmount: number;
  promoCodeId?: number | null;
  financeReference?: string | null;
  createdAt: string;
  updatedAt: string;
  itemCount: number;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderDetail {
  id: number;
  userId: number;
  clientName?: string;      // ← Ajoute ceci
  clientEmail?: string;     // ← Ajoute ceci
  status: OrderStatus;
  totalAmount: number;
  promoCodeId?: number | null;
  financeReference?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
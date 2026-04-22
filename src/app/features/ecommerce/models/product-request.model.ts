export type ProductRequestStatus =
  | 'OPEN'
  | 'OFFERED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'CLOSED';

export interface ProductRequestResponse {
  id: number;
  title: string;
  description?: string | null;
  requestedQuantity?: number | null;
  maxBudget?: number | null;
  desiredDate?: string | null;
  imageUrl?: string | null;
  status: ProductRequestStatus;

  clientId?: number | null;
  clientName?: string | null;

  categoryId?: number | null;
  categoryName?: string | null;

  targetSellerId?: number | null;
  targetSellerName?: string | null;

  offersCount: number;

  createdAt?: string | null;
  updatedAt?: string | null;
}

export type ProductRequestOfferStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED';

export interface ProductRequestOfferResponse {
  id: number;
  productRequestId: number;
  sellerId?: number | null;
  sellerName?: string | null;
  productId?: number | null;
  productName?: string | null;
  proposedPrice?: number | null;
  proposedQuantity?: number | null;
  estimatedDeliveryDays?: number | null;
  message?: string | null;
  status: ProductRequestOfferStatus;
  createdAt?: string | null;
  updatedAt?: string | null;
}
export type ProductRequestStatus =
  | 'OPEN'
  | 'OFFERED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'CLOSED';

export type ProductRequestOfferStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED';

export interface ProductRequest {
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

  offersCount?: number | null;

  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface ProductRequestCreateRequest {
  title: string;
  description?: string | null;
  categoryId?: number | null;
  requestedQuantity?: number | null;
  maxBudget?: number | null;
  desiredDate?: string | null;
  targetSellerId?: number | null;
  imageUrl?: string | null;
}

export interface ProductRequestOffer {
  id: number;

  productRequestId?: number | null;

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

export interface ProductRequestOfferCreateRequest {
  proposedPrice?: number | null;
  proposedQuantity?: number | null;
  estimatedDeliveryDays?: number | null;
  message?: string | null;
  productId?: number | null;
}
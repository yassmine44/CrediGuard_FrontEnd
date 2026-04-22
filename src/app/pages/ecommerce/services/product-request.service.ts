import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  ProductRequest,
  ProductRequestCreateRequest,
  ProductRequestOffer,
  ProductRequestOfferCreateRequest
} from '../models/product-request.model';

@Injectable({
  providedIn: 'root'
})
export class ProductRequestService {
  private http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:8089/api/product-requests';

  createRequest(clientId: number, body: ProductRequestCreateRequest): Observable<ProductRequest> {
    const params = new HttpParams().set('clientId', clientId);
    return this.http.post<ProductRequest>(this.apiUrl, body, { params });
  }

  getMyRequests(clientId: number): Observable<ProductRequest[]> {
    const params = new HttpParams().set('clientId', clientId);
    return this.http.get<ProductRequest[]>(`${this.apiUrl}/my`, { params });
  }

  getOpenRequests(): Observable<ProductRequest[]> {
    return this.http.get<ProductRequest[]>(`${this.apiUrl}/open`);
  }

  getRequestsForTargetSeller(sellerId: number): Observable<ProductRequest[]> {
    const params = new HttpParams().set('sellerId', sellerId);
    return this.http.get<ProductRequest[]>(`${this.apiUrl}/target-seller`, { params });
  }

  getRequestById(requestId: number): Observable<ProductRequest> {
    return this.http.get<ProductRequest>(`${this.apiUrl}/${requestId}`);
  }

 createOffer(requestId: number, sellerId: number, payload: any) {
  return this.http.post(
    `${this.apiUrl}/${requestId}/offers?sellerId=${sellerId}`,
    payload
  );
}

  getOffersForRequest(requestId: number): Observable<ProductRequestOffer[]> {
    return this.http.get<ProductRequestOffer[]>(`${this.apiUrl}/${requestId}/offers`);
  }

  getMyOffers(sellerId: number): Observable<ProductRequestOffer[]> {
    const params = new HttpParams().set('sellerId', sellerId);
    return this.http.get<ProductRequestOffer[]>(`${this.apiUrl}/offers/my`, { params });
  }

  acceptOffer(offerId: number, clientId: number): Observable<ProductRequestOffer> {
    const params = new HttpParams().set('clientId', clientId);
    return this.http.post<ProductRequestOffer>(
      `${this.apiUrl}/offers/${offerId}/accept`,
      {},
      { params }
    );
  }

  rejectOffer(offerId: number, clientId: number): Observable<ProductRequestOffer> {
    const params = new HttpParams().set('clientId', clientId);
    return this.http.post<ProductRequestOffer>(
      `${this.apiUrl}/offers/${offerId}/reject`,
      {},
      { params }
    );
  }

  cancelRequest(requestId: number, clientId: number): Observable<ProductRequest> {
    const params = new HttpParams().set('clientId', clientId);
    return this.http.post<ProductRequest>(
      `${this.apiUrl}/${requestId}/cancel`,
      {},
      { params }
    );
  }
 
getMyProducts() {
  return this.http.get<any[]>(`http://localhost:8089/api/products/mine`);
}
}
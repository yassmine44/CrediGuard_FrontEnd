import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  ProductRequestResponse,
  ProductRequestOfferResponse,
  ProductRequestStatus
} from '../models/product-request.model';

@Injectable({
  providedIn: 'root'
})
export class ProductRequestAdminService {
  private http = inject(HttpClient);

 private readonly baseUrl = 'http://localhost:8089/api/product-requests';
  getAll(status?: ProductRequestStatus): Observable<ProductRequestResponse[]> {
    let params = new HttpParams();

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<ProductRequestResponse[]>(`${this.baseUrl}/admin`, { params });
  }

  getById(id: number): Observable<ProductRequestResponse> {
    return this.http.get<ProductRequestResponse>(`${this.baseUrl}/admin/${id}`);
  }

  getOffersByRequestId(id: number): Observable<ProductRequestOfferResponse[]> {
    return this.http.get<ProductRequestOfferResponse[]>(`${this.baseUrl}/admin/${id}/offers`);
  }

  updateStatus(id: number, status: ProductRequestStatus): Observable<ProductRequestResponse> {
    const params = new HttpParams().set('status', status);

    return this.http.patch<ProductRequestResponse>(
      `${this.baseUrl}/admin/${id}/status`,
      {},
      { params }
    );
  }
}
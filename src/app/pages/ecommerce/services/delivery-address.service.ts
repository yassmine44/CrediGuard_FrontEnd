import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  DeliveryAddressCreateRequest,
  DeliveryAddressResponse,
  DeliveryAddressUpdateRequest
} from '../models/delivery-address.model';

@Injectable({
  providedIn: 'root'
})
export class DeliveryAddressService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8089/api/delivery-addresses';

  create(payload: DeliveryAddressCreateRequest): Observable<DeliveryAddressResponse> {
    return this.http.post<DeliveryAddressResponse>(this.apiUrl, payload);
  }

  update(id: number, payload: DeliveryAddressUpdateRequest): Observable<DeliveryAddressResponse> {
    return this.http.put<DeliveryAddressResponse>(`${this.apiUrl}/${id}`, payload);
  }

  getById(id: number): Observable<DeliveryAddressResponse> {
    return this.http.get<DeliveryAddressResponse>(`${this.apiUrl}/${id}`);
  }

  getAll(): Observable<DeliveryAddressResponse[]> {
    return this.http.get<DeliveryAddressResponse[]>(this.apiUrl);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
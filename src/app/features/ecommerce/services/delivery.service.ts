import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DeliveryResponse, DeliveryUpdateRequest } from '../models/delivery.model';

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8089/api/deliveries';

  getMine(): Observable<DeliveryResponse[]> {
    return this.http.get<DeliveryResponse[]>(`${this.apiUrl}/mine`);
  }

  getById(id: number): Observable<DeliveryResponse> {
    return this.http.get<DeliveryResponse>(`${this.apiUrl}/${id}`);
  }

  getByOrderId(orderId: number): Observable<DeliveryResponse> {
    return this.http.get<DeliveryResponse>(`${this.apiUrl}/order/${orderId}`);
  }

  update(id: number, payload: DeliveryUpdateRequest): Observable<DeliveryResponse> {
    return this.http.put<DeliveryResponse>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  getAll() {
  return this.http.get<DeliveryResponse[]>(`${this.apiUrl}/admin`);
}
}
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DeliveryCreateRequest, DeliveryResponse } from '../models/delivery.model';

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8089/api/deliveries';

  create(payload: DeliveryCreateRequest): Observable<DeliveryResponse> {
    return this.http.post<DeliveryResponse>(this.apiUrl, payload);
  }

  getByOrderId(orderId: number): Observable<DeliveryResponse> {
    return this.http.get<DeliveryResponse>(`${this.apiUrl}/order/${orderId}`);
  }

  getMine(): Observable<DeliveryResponse[]> {
    return this.http.get<DeliveryResponse[]>(`${this.apiUrl}/mine`);
  }
}
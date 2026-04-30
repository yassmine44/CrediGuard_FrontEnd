import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  DeliveryFeeCheckRequest,
  DeliveryFeeCheckResponse,
  DeliveryZoneCheckRequest,
  DeliveryZoneCheckResponse,
  DeliveryZoneResponse
} from '../models/delivery-zone.model';

@Injectable({
  providedIn: 'root'
})
export class DeliveryZoneService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8089/api/delivery-zones';

  getActiveZones(): Observable<DeliveryZoneResponse[]> {
    return this.http.get<DeliveryZoneResponse[]>(`${this.apiUrl}/active`);
  }

  checkLocation(payload: DeliveryZoneCheckRequest): Observable<DeliveryZoneCheckResponse> {
    return this.http.post<DeliveryZoneCheckResponse>(`${this.apiUrl}/check`, payload);
  }

  checkAddress(payload: DeliveryFeeCheckRequest): Observable<DeliveryFeeCheckResponse> {
    return this.http.post<DeliveryFeeCheckResponse>(`${this.apiUrl}/check-address`, payload);
  }
}

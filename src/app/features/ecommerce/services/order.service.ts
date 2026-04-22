import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  OrderAdmin,
  OrderDetail,
  OrderStatus,
  PageResponse,
  UpdateOrderStatusRequest
} from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8089/api/orders';

  getAdminOrders(
    page: number,
    size: number,
    status?: OrderStatus | '',
    dateFrom?: string,
    dateTo?: string,
    sortBy: string = 'createdAt',
    direction: string = 'desc'
  ): Observable<PageResponse<OrderAdmin>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sortBy', sortBy)
      .set('direction', direction);

    if (status) {
      params = params.set('status', status);
    }

    if (dateFrom) {
      params = params.set('dateFrom', dateFrom);
    }

    if (dateTo) {
      params = params.set('dateTo', dateTo);
    }

    return this.http.get<PageResponse<OrderAdmin>>(`${this.apiUrl}/admin`, { params });
  }

  getAdminOrderById(id: number): Observable<OrderDetail> {
    return this.http.get<OrderDetail>(`${this.apiUrl}/admin/${id}`);
  }

  updateAdminOrderStatus(id: number, body: UpdateOrderStatusRequest): Observable<OrderDetail> {
    return this.http.patch<OrderDetail>(`${this.apiUrl}/admin/${id}/status`, body);
  }
}
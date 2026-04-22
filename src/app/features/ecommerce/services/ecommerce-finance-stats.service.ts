import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EcommerceFinanceOverview } from '../models/ecommerce-finance-overview.model';
import { RevenueByMonth } from '../models/revenue-by-month.model';
import { PaymentMethodStats } from '../models/payment-method-stats.model';
import { TopProductStats } from '../models/top-product-stats.model';
import { LowStockProduct } from '../models/low-stock-product.model';
import { RevenueByCategory } from '../models/revenue-by-category.model';
@Injectable({
  providedIn: 'root'
})
export class EcommerceFinanceStatsService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8089/api/finance/stats';

  getOverview(): Observable<EcommerceFinanceOverview> {
    return this.http.get<EcommerceFinanceOverview>(`${this.apiUrl}/overview`);
  }
  getRevenueByMonth() {
  return this.http.get<RevenueByMonth[]>(`${this.apiUrl}/revenue-by-month`);
}
getPaymentMethodDistribution() {
  return this.http.get<PaymentMethodStats[]>(
    `${this.apiUrl}/payment-method-distribution`
  );
}
getTopProducts() {
  return this.http.get<TopProductStats[]>(`${this.apiUrl}/top-products`);
}
getLowStockProducts() {
  return this.http.get<LowStockProduct[]>(`${this.apiUrl}/low-stock`);
}
getRevenueByCategory() {
  return this.http.get<RevenueByCategory[]>(`${this.apiUrl}/revenue-by-category`);
}
}
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ProductIntelligence,
  ProductIntelligenceHistory,
  ProductIntelligenceModelInfo
} from '../models/product-intelligence.model';

@Injectable({
  providedIn: 'root'
})
export class ProductIntelligenceService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8089/api/product-intelligence/admin';

  getAll(): Observable<ProductIntelligence[]> {
    return this.http.get<ProductIntelligence[]>(this.apiUrl);
  }

  getModelInfo(): Observable<ProductIntelligenceModelInfo> {
    return this.http.get<ProductIntelligenceModelInfo>(`${this.apiUrl}/model-info`);
  }

  getHistory(productId: number): Observable<ProductIntelligenceHistory[]> {
    return this.http.get<ProductIntelligenceHistory[]>(`${this.apiUrl}/product/${productId}/history`);
  }

  analyzeAll(): Observable<ProductIntelligence[]> {
    return this.http.post<ProductIntelligence[]>(`${this.apiUrl}/analyze`, {});
  }

  analyzeProduct(productId: number): Observable<ProductIntelligence> {
    return this.http.post<ProductIntelligence>(`${this.apiUrl}/products/${productId}/analyze`, {});
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  Product,
  ProductCreateRequest,
  ProductUpdateRequest
} from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private readonly apiBaseUrl = 'http://localhost:8089';
  private readonly defaultImageUrl = 'assets/default-product.png';

  private apiUrl = `${this.apiBaseUrl}/api/products`;

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  getMine(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/mine`);
  }

  create(payload: ProductCreateRequest): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, payload);
  }

  update(id: number, payload: ProductUpdateRequest): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  uploadImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http
      .post(`${this.apiBaseUrl}/api/products/upload-image`, formData, {
        responseType: 'text'
      })
      .pipe(map((imageUrl) => this.normalizeImageValue(imageUrl) ?? ''));
  }

  getBySellerId(sellerId: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/seller/${sellerId}`);
  }

  getBySeller(sellerId: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/seller/${sellerId}`);
  }

  normalizeImageValue(imageUrl?: string | null): string | null {
    const trimmedImageUrl = imageUrl?.trim();

    if (!trimmedImageUrl) {
      return null;
    }

    const unquotedImageUrl = trimmedImageUrl
      .replace(/^['"]+/, '')
      .replace(/['"]+$/, '');

    return unquotedImageUrl.replace(/\\/g, '/');
  }

  getImageUrl(imageUrl?: string | null): string {
    const sanitizedImageUrl = this.normalizeImageValue(imageUrl);

    if (!sanitizedImageUrl) {
      return this.defaultImageUrl;
    }

    if (
      sanitizedImageUrl.startsWith('http://') ||
      sanitizedImageUrl.startsWith('https://') ||
      sanitizedImageUrl.startsWith('data:') ||
      sanitizedImageUrl.startsWith('blob:')
    ) {
      return sanitizedImageUrl;
    }

    if (sanitizedImageUrl.startsWith('/uploads/')) {
      return `${this.apiBaseUrl}/api${sanitizedImageUrl}`;
    }

    if (sanitizedImageUrl.startsWith('uploads/')) {
      return `${this.apiBaseUrl}/api/${sanitizedImageUrl}`;
    }

    return `${this.apiBaseUrl}/${sanitizedImageUrl.replace(/^\/+/, '')}`;
  }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PartnerProduct {
  id?: number;
  name: string;
  description?: string;
  price: number;
  category?: string;
  partnerId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PartnerProductService {

  private api = 'http://localhost:8090/api/partner-products';

  constructor(private http: HttpClient) {}

 getAll(): Observable<PartnerProduct[]> {
  return this.http.get<PartnerProduct[]>(`${this.api}/all`);
}

  getById(id: number): Observable<PartnerProduct> {
    return this.http.get<PartnerProduct>(`${this.api}/${id}`);
  }

  getByPartner(partnerId: number): Observable<PartnerProduct[]> {
    return this.http.get<PartnerProduct[]>(`${this.api}/partner/${partnerId}`);
  }

  create(product: PartnerProduct): Observable<PartnerProduct> {
    return this.http.post<PartnerProduct>(this.api, product);
  }

  update(id: number, product: PartnerProduct): Observable<PartnerProduct> {
    return this.http.put<PartnerProduct>(`${this.api}/${id}`, product);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.api}/${id}`);
  }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InsurancePolicy } from '../../models/insurance.model';

@Injectable({
  providedIn: 'root'
})
export class ContratService {
  private apiUrl = 'http://127.0.0.1:8089/api/contrats';

  constructor(private http: HttpClient) {}

  create(clientId: number, offerId: number, declaredValue: number, goodsNature: string, voucherCode?: string, startDate?: string): Observable<InsurancePolicy> {
    const params: any = { 
      clientId: clientId.toString(),
      offerId: offerId.toString(),
      declaredValue: declaredValue.toString(),
      goodsNature
    };
    if (voucherCode) params.voucherCode = voucherCode;
    if (startDate) params.startDate = startDate;

    return this.http.post<InsurancePolicy>(this.apiUrl, null, { params });
  }

  renew(id: number): Observable<InsurancePolicy> {
    return this.http.patch<InsurancePolicy>(`${this.apiUrl}/${id}/renouveler`, {});
  }

  getByClient(clientId: number): Observable<InsurancePolicy[]> {
    return this.http.get<InsurancePolicy[]>(`${this.apiUrl}/client/${clientId}`);
  }

  getAll(): Observable<InsurancePolicy[]> {
    return this.http.get<InsurancePolicy[]>(this.apiUrl);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  downloadPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/pdf`, { responseType: 'blob' });
  }
}

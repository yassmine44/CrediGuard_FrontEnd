import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  EcheancePaymentRequest,
  EcheanceResponse,
} from '../models/echeance.model';

@Injectable({
  providedIn: 'root',
})
export class EcheanceService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8089/api/echeances';

  getByCredit(creditId: number): Observable<EcheanceResponse[]> {
    return this.http.get<EcheanceResponse[]>(
      `${this.apiUrl}?creditId=${creditId}`
    );
  }

  pay(
    echeanceId: number,
    payload: EcheancePaymentRequest
  ): Observable<EcheanceResponse> {
    return this.http.patch<EcheanceResponse>(
      `${this.apiUrl}/${echeanceId}/pay`,
      payload
    );
  }
}
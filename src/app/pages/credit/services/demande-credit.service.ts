import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  DemandeCreditRequest,
  DemandeCreditResponse,
} from '../models/demande-credit.model';

@Injectable({
  providedIn: 'root',
})
export class DemandeCreditService {
  private http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:8089/api/demandes';

  create(payload: DemandeCreditRequest): Observable<DemandeCreditResponse> {
    return this.http.post<DemandeCreditResponse>(this.apiUrl, payload);
  }

  getAll(): Observable<DemandeCreditResponse[]> {
    return this.http.get<DemandeCreditResponse[]>(this.apiUrl);
  }

  getById(id: number): Observable<DemandeCreditResponse> {
    return this.http.get<DemandeCreditResponse>(`${this.apiUrl}/${id}`);
  }
}
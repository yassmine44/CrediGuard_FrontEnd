import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Policy {
  id?: number;
  policyNumber: string;
  description?: string;
  premium: number;
  startDate: string;
  endDate: string;
  status: string;
  company?: {
    id: number;
    name: string;
  };
  client?: {
    id: number;
    fullName: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PolicyService {

  private api = 'http://localhost:8090/api/insurance/policies';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Policy[]> {
    return this.http.get<Policy[]>(`${this.api}/all`);
  }

  getById(id: number): Observable<Policy> {
    return this.http.get<Policy>(`${this.api}/${id}`);
  }

  create(policy: Policy): Observable<Policy> {
    return this.http.post<Policy>(this.api, policy);
  }

  update(id: number, policy: Policy): Observable<Policy> {
    return this.http.put<Policy>(`${this.api}/${id}`, policy);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.api}/${id}`);
  }
  getByClient(clientId: number) {
  return this.http.get(`http://localhost:8090/insurance/policies/by-client/${clientId}`);
}
}

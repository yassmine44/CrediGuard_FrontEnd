import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InsuranceCompany } from '../../models/insurance.model';

@Injectable({
  providedIn: 'root'
})
export class AssureurService {
  private apiUrl = 'http://localhost:8089/api/assureurs';

  constructor(private http: HttpClient) {}

  getAll(): Observable<InsuranceCompany[]> {
    return this.http.get<InsuranceCompany[]>(this.apiUrl);
  }

  getById(id: number): Observable<InsuranceCompany> {
    return this.http.get<InsuranceCompany>(`${this.apiUrl}/${id}`);
  }

  create(company: InsuranceCompany): Observable<InsuranceCompany> {
    return this.http.post<InsuranceCompany>(this.apiUrl, company);
  }

  update(id: number, company: InsuranceCompany): Observable<InsuranceCompany> {
    return this.http.put<InsuranceCompany>(`${this.apiUrl}/${id}`, company);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface User {
  id: number;
  fullName: string;
  partnerType: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private api = 'http://localhost:8082/api/users';

  constructor(private http: HttpClient) {}

  getPartnersByType(type: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.api}/partners/type/${type}`);
  }
}
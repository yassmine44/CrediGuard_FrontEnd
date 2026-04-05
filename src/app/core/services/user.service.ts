import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface User {
  id?: number;
  fullName: string;
  email: string;
  password?: string;
  phone?: string;
  userType?: string;
  enabled?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8090/api/users';

  constructor(private http: HttpClient) {}

  getUsers() {
    return this.http.get<User[]>(this.apiUrl);
  }

  deleteUser(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  createUser(user: any) {
    return this.http.post<User>(this.apiUrl, user);
  }

  updateUser(id: number, user: any) {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }
}
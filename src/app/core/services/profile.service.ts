import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Profile {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  userType: string;
  enabled: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = 'http://localhost:8082/api/users/me';

  constructor(private http: HttpClient) {}

  getMyProfile() {
    return this.http.get<Profile>(this.apiUrl);
  }

  updateMyProfile(data: { fullName: string; email: string; phone?: string }) {
    return this.http.put<Profile>(this.apiUrl, data);
  }
}
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClientOption } from '../models/client-option.model';

@Injectable({
  providedIn: 'root',
})
export class UserClientService {
  private http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:8089/api/users/clients';

  getClients(): Observable<ClientOption[]> {
    return this.http.get<ClientOption[]>(this.apiUrl);
  }
}
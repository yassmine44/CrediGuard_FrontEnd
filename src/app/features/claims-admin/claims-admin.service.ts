import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ClaimsAdminService {

<<<<<<< HEAD
  private api = 'http://localhost:8089/api/insurance/claims';
=======
  private api = 'http://localhost:8082/api/insurance/claims';
>>>>>>> eya

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  private getToken(): string | null {
    return this.isBrowser()
      ? localStorage.getItem('token')
      : null;
  }

  // ===== CLAIMS =====
  getAll() {
    if (!this.isBrowser()) return Promise.resolve([]);

    return fetch(`${this.api}/all`, {
      headers: {
        Authorization: `Bearer ${this.getToken()}`
      }
    }).then(res => res.json());
  }

  getByClient(clientId: number) {
    if (!this.isBrowser()) return Promise.resolve([]);

    return this.getAll().then((claims: any[]) => {
      // Filtrage local car le endpoint by-client pour les claims peut ne pas exister
      return claims.filter(c => c.voucher?.client?.id === clientId);
    });
  }

  approve(id: number) {
    return fetch(`${this.api}/approve/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${this.getToken()}`
      }
    });
  }

  reject(id: number) {
    return fetch(`${this.api}/reject/${id}?reason=Rejected`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${this.getToken()}`
      }
    });
  }

  // ===== PARTNERS (COUNT OK) =====
  getPartnersCount(): Promise<number> {
    return fetch(`http://localhost:8089/api/partners/count`, {
      headers: {
        Authorization: `Bearer ${this.getToken()}`
      }
    }).then(res => res.json());
  }

  // ===== PRODUCTS (LISTE → length) =====
  getProducts(): Promise<any[]> {
<<<<<<< HEAD
    return fetch(`http://localhost:8089/api/partner-products/all`, {
=======
    return fetch(`http://localhost:8082/api/partner-products/all`, {
>>>>>>> eya
      headers: {
        Authorization: `Bearer ${this.getToken()}`
      }
    }).then(res => res.json());
  }

  // ===== INSURANCES (LISTE → length) =====
  getInsurances(): Promise<any[]> {
<<<<<<< HEAD
    return fetch(`http://localhost:8089/api/insurance/companies/all`, {
=======
    return fetch(`http://localhost:8082/api/insurance/companies/all`, {
>>>>>>> eya
      headers: {
        Authorization: `Bearer ${this.getToken()}`
      }
    }).then(res => res.json());
  }
}
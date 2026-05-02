import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ClaimsAdminService {

  private api = 'http://localhost:8089/api/insurance/claims';

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

  getByClient(clientId: number): Promise<any[]> {
    if (!this.isBrowser()) return Promise.resolve([]);

    return fetch(`${this.api}/by-client/${clientId}`, {
      headers: {
        Authorization: `Bearer ${this.getToken()}`
      }
    }).then(res => {
      if (!res.ok) return [];
      return res.json();
    }).catch(err => {
      console.error('Error fetching claims for client:', err);
      return [];
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
    return fetch(`http://localhost:8089/api/partner-products/all`, {
      headers: {
        Authorization: `Bearer ${this.getToken()}`
      }
    }).then(res => res.json());
  }

  // ===== INSURANCES (LISTE → length) =====
  getInsurances(): Promise<any[]> {
    return fetch(`http://localhost:8089/api/insurance/companies/all`, {
      headers: {
        Authorization: `Bearer ${this.getToken()}`
      }
    }).then(res => res.json());
  }

  getVouchersByClient(clientId: number): Promise<any[]> {
    return fetch(`http://localhost:8089/api/vouchers/client/${clientId}`, {
      headers: {
        Authorization: `Bearer ${this.getToken()}`
      }
    }).then(res => res.json());
  }

  getPurchasesByClient(clientId: number): Promise<any[]> {
    return fetch(`http://localhost:8089/api/partnership/purchases/client/${clientId}`, {
      headers: {
        Authorization: `Bearer ${this.getToken()}`
      }
    }).then(res => res.json());
  }
}
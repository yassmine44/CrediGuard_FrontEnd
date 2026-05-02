import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';

interface AuthUser {
  id?: number;
  email?: string;
  userType?: string | null;
  role?: string | null;
  [key: string]: unknown;
}

interface PendingOtpAuth {
  email: string;
  user: AuthUser | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://127.0.0.1:8089/api/auth';
  private userUrl = 'http://127.0.0.1:8089/api/users';

  private readonly tokenKey = 'accessToken';
  private readonly userKey = 'currentUser';
  private readonly emailKey = 'userEmail';
  private readonly pendingOtpKey = 'pendingOtpAuth';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  private get storage(): Storage | null {
    return isPlatformBrowser(this.platformId) ? localStorage : null;
  }

  // ================= AUTH API =================

  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data);
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  forgotPassword(data: { email: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, data);
  }

  resetPassword(data: { token: string; newPassword: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, data);
  }

  verifyOtp(data: { email: string; otp: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-otp`, data);
  }

  enable2fa(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/enable-2fa?email=${email}`, {});
  }

  disable2fa(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/disable-2fa?email=${email}`, {});
  }

  get2faStatus(email: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/2fa-status?email=${email}`);
  }

  // ================= TOKEN =================

  saveToken(token: string): void {
    this.storage?.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return this.storage?.getItem(this.tokenKey) ?? null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // ================= USER NORMALIZATION =================

  private normalizeUserType(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    return value.trim().toUpperCase();
  }

  private buildStoredUser(user: unknown, fallback: Partial<AuthUser> = {}): AuthUser | null {
    const source = typeof user === 'object' && user !== null
      ? { ...(user as AuthUser) }
      : {};

    const id =
      typeof source.id === 'number'
        ? source.id
        : typeof fallback.id === 'number'
          ? fallback.id
          : undefined;

    const email =
      typeof source.email === 'string'
        ? source.email
        : typeof fallback.email === 'string'
          ? fallback.email
          : undefined;

    const userType = this.normalizeUserType(
      source.userType ?? source.role ?? fallback.userType ?? fallback.role
    );

    if (!id && !email && !userType && Object.keys(source).length === 0) {
      return null;
    }

    return {
      ...source,
      ...(id !== undefined ? { id } : {}),
      ...(email ? { email } : {}),
      ...(userType ? { userType, role: userType } : {})
    };
  }

  getUser(): AuthUser | null {
    const raw = this.storage?.getItem(this.userKey);
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch {
      this.storage?.removeItem(this.userKey);
      return null;
    }
  }

  saveUser(user: unknown, fallback: Partial<AuthUser> = {}): AuthUser | null {
    const normalized = this.buildStoredUser(user, fallback);

    if (!normalized) {
      this.storage?.removeItem(this.userKey);
      return null;
    }

    this.storage?.setItem(this.userKey, JSON.stringify(normalized));
    return normalized;
  }

  saveUserFromAuthResponse(response: any, fallbackEmail?: string): AuthUser | null {
    return this.saveUser(
      response?.user ?? response?.currentUser ?? response,
      {
        id: response?.id ?? response?.user?.id,
        email: response?.email ?? fallbackEmail,
        userType: this.getUserTypeFromAuthResponse(response)
      }
    );
  }

  getUserTypeFromAuthResponse(response: any): string | null {
    return this.normalizeUserType(
      response?.user?.userType ??
      response?.user?.role ??
      response?.currentUser?.userType ??
      response?.currentUser?.role ??
      response?.userType ??
      response?.role
    );
  }

  getUserType(): string | null {
    const user = this.getUser();
    return this.normalizeUserType(user?.userType ?? user?.role);
  }

  isAdmin(): boolean {
    return this.getUserType() === 'ADMIN';
  }

  // ================= EMAIL =================

  saveUserEmail(email: string): void {
    this.storage?.setItem(this.emailKey, email);
  }

  getUserEmail(): string | null {
    const email = this.storage?.getItem(this.emailKey);
    return email ?? null;
  }

  // ================= OTP =================

  savePendingOtpAuth(response: any, fallbackEmail: string): void {
    const email = response?.email || fallbackEmail;

    const user = this.buildStoredUser(response?.user ?? response?.currentUser, {
      id: response?.user?.id ?? response?.currentUser?.id,
      email,
      userType: this.getUserTypeFromAuthResponse(response)
    });

    this.storage?.setItem(
      this.pendingOtpKey,
      JSON.stringify({ email, user })
    );
  }

  getPendingOtpAuth(): PendingOtpAuth | null {
    const raw = this.storage?.getItem(this.pendingOtpKey);
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch {
      this.storage?.removeItem(this.pendingOtpKey);
      return null;
    }
  }

  clearPendingOtpAuth(): void {
    this.storage?.removeItem(this.pendingOtpKey);
  }

  // ================= SESSION =================

  clearSession(): void {
    this.storage?.removeItem(this.tokenKey);
    this.storage?.removeItem(this.userKey);
    this.storage?.removeItem(this.emailKey);
    this.storage?.removeItem(this.pendingOtpKey);
  }

  logout(): void {
    this.clearSession();
  }

  // ================= PROFILE =================

  updateProfile(data: any): Observable<any> {
    return new Observable(observer => {
      this.http.put(`${this.userUrl}/me`, data).subscribe({
        next: (response: any) => {
          // Mettre à jour l'utilisateur stocké localement
          const currentUser = this.getUser();
          if (currentUser) {
            this.saveUser({ ...currentUser, ...response });
          }
          observer.next(response);
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }
}
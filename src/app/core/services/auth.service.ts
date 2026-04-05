import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';

interface AuthUser {
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

  private apiUrl = 'http://localhost:8090/api/auth';
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

  private normalizeUserType(value: unknown): string | null {
    if (typeof value !== 'string') {
      return null;
    }

    const normalized = value.trim().toUpperCase();
    return normalized || null;
  }

  private buildStoredUser(
    user: unknown,
    fallback: Partial<AuthUser> = {}
  ): AuthUser | null {
    const source = typeof user === 'object' && user !== null
      ? { ...(user as AuthUser) }
      : {};

    const email = typeof source.email === 'string'
      ? source.email
      : typeof fallback.email === 'string'
        ? fallback.email
        : undefined;

    const userType = this.normalizeUserType(
      source.userType ?? source.role ?? fallback.userType ?? fallback.role
    );

    if (Object.keys(source).length === 0 && !email && !userType) {
      return null;
    }

    return {
      ...source,
      ...(email ? { email } : {}),
      ...(userType ? { userType, role: userType } : {})
    };
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

  login(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, data);
  }

  register(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, data);
  }

  forgotPassword(data: { email: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/forgot-password`, data);
  }

  resetPassword(data: { token: string; newPassword: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reset-password`, data);
  }

  verifyOtp(data: { email: string; otp: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/verify-otp`, data);
  }

  enable2fa(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/enable-2fa?email=${email}`, {});
  }

  disable2fa(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/disable-2fa?email=${email}`, {});
  }

  get2faStatus(email: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/2fa-status?email=${email}`);
  }

  saveToken(token: string): void {
    this.storage?.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return this.storage?.getItem(this.tokenKey) ?? null;
  }

  saveUser(user: unknown, fallback: Partial<AuthUser> = {}): AuthUser | null {
    const normalizedUser = this.buildStoredUser(user, fallback);

    if (!normalizedUser) {
      this.storage?.removeItem(this.userKey);
      return null;
    }

    this.storage?.setItem(this.userKey, JSON.stringify(normalizedUser));
    return normalizedUser;
  }

  saveUserFromAuthResponse(response: any, fallbackEmail?: string): AuthUser | null {
    return this.saveUser(
      response?.user ?? response?.currentUser ?? null,
      {
        email: response?.email ?? fallbackEmail,
        userType: this.getUserTypeFromAuthResponse(response)
      }
    );
  }

  getUser(): AuthUser | null {
    const rawUser = this.storage?.getItem(this.userKey);

    if (!rawUser) {
      return null;
    }

    try {
      return JSON.parse(rawUser) as AuthUser;
    } catch {
      this.storage?.removeItem(this.userKey);
      return null;
    }
  }

  getUserType(): string | null {
    const user = this.getUser();
    return this.normalizeUserType(user?.userType ?? user?.role);
  }

  isAdmin(): boolean {
    return this.getUserType() === 'ADMIN';
  }

  saveUserEmail(email: string): void {
    this.storage?.setItem(this.emailKey, email);
  }

  getUserEmail(): string | null {
    return this.storage?.getItem(this.emailKey) ?? null;
  }

  savePendingOtpAuth(response: any, fallbackEmail: string): void {
    const email = response?.email || fallbackEmail;
    const user = this.buildStoredUser(
      response?.user ?? response?.currentUser ?? null,
      {
        email,
        userType: this.getUserTypeFromAuthResponse(response)
      }
    );

    this.storage?.setItem(
      this.pendingOtpKey,
      JSON.stringify({ email, user } satisfies PendingOtpAuth)
    );
  }

  getPendingOtpAuth(): PendingOtpAuth | null {
    const rawPendingAuth = this.storage?.getItem(this.pendingOtpKey);

    if (!rawPendingAuth) {
      return null;
    }

    try {
      return JSON.parse(rawPendingAuth) as PendingOtpAuth;
    } catch {
      this.storage?.removeItem(this.pendingOtpKey);
      return null;
    }
  }

  clearPendingOtpAuth(): void {
    this.storage?.removeItem(this.pendingOtpKey);
  }

  clearSession(): void {
    this.storage?.removeItem(this.tokenKey);
    this.storage?.removeItem(this.userKey);
    this.storage?.removeItem(this.emailKey);
    this.storage?.removeItem(this.pendingOtpKey);
  }

  logout(): void {
    this.clearSession();
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}

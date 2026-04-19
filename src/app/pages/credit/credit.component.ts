import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ProfilCreditService } from './services/profil-credit.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-credit',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './credit.component.html',
  styleUrl: './credit.component.scss',
})
export class CreditComponent implements OnInit {
  private profilService = inject(ProfilCreditService);
  private authService = inject(AuthService);
  private router = inject(Router);

  profileLoading = signal(true);
  profileReady = signal(false);
  profileError = signal('');
  isLoggedIn = signal(false);

  ngOnInit(): void {
    this.isLoggedIn.set(this.authService.isLoggedIn());

    if (!this.isLoggedIn()) {
      this.profileLoading.set(false);
      this.profileReady.set(false);
      this.profileError.set('You need to sign in before accessing credit services.');
      return;
    }

    this.loadProfileStatus();
  }

  loadProfileStatus(): void {
    this.profileLoading.set(true);
    this.profileError.set('');

    this.profilService.getMyProfile().subscribe({
      next: () => {
        this.profileReady.set(true);
        this.profileLoading.set(false);
      },
      error: (err) => {
        if (err.status === 404) {
          this.profileReady.set(false);
          this.profileLoading.set(false);
          return;
        }

        if (err.status === 401) {
          this.authService.clearSession();
          this.router.navigate(['/auth/sign-in']);
          return;
        }

        console.error(err);
        this.profileError.set('Unable to verify your credit profile right now.');
        this.profileLoading.set(false);
      },
    });
  }

  goToProfile(): void {
    if (!this.isLoggedIn()) {
      this.router.navigate(['/auth/sign-in']);
      return;
    }

    this.router.navigate(['/front/credit/profile']);
  }

  goToRequest(): void {
    if (!this.isLoggedIn()) {
      this.router.navigate(['/auth/sign-in']);
      return;
    }

    this.router.navigate([
      this.profileReady() ? '/front/credit/request' : '/front/credit/profile',
    ]);
  }

  goToHistory(): void {
    if (!this.isLoggedIn()) {
      this.router.navigate(['/auth/sign-in']);
      return;
    }

    this.router.navigate(['/front/credit/history']);
  }

  goToWallet(): void {
    if (!this.isLoggedIn()) {
      this.router.navigate(['/auth/sign-in']);
      return;
    }

    this.router.navigate(['/front/credit/wallet']);
  }

  goToLogin(): void {
    this.router.navigate(['/auth/sign-in']);
  }
}

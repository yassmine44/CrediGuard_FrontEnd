import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CreditService } from '../../services/credit.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-credit-wallet',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './credit-wallet.component.html',
  styleUrl: './credit-wallet.component.scss'
})
export class CreditWalletComponent implements OnInit {
  private creditService = inject(CreditService);
  private authService = inject(AuthService);
  private router = inject(Router);

  credits = signal<any[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadCredits();
  }

  goBackToCreditHome(): void {
    this.router.navigate(['/front/credit']);
  }

  viewSchedule(creditId: number): void {
    this.router.navigate(['/front/credit/wallet', creditId, 'echeances']);
  }

  loadCredits(): void {
    this.loading.set(true);
    this.error.set(null);

    const user = this.authService.getUser();
    const clientId = user?.id;

    if (!clientId) {
      this.loading.set(false);
      this.error.set('User not connected.');
      return;
    }

    this.creditService.getAll(clientId).subscribe({
      next: (data) => {
        this.credits.set(data ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Wallet load error =', err);
        this.error.set('Unable to load credits.');
        this.loading.set(false);
      }
    });
  }
}
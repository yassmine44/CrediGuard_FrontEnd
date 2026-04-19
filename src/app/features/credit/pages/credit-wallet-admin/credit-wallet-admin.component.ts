import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CreditService } from '../../services/credit.service';
import { CreditResponse } from '../../models/credit.model';

@Component({
  selector: 'app-credit-wallet-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './credit-wallet-admin.component.html',
  styleUrl: './credit-wallet-admin.component.scss',
})
export class CreditWalletAdminComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private creditService = inject(CreditService);

  clientId = Number(this.route.snapshot.paramMap.get('clientId'));

  credits = signal<CreditResponse[]>([]);
  loading = signal(false);
  error = signal('');

  ngOnInit(): void {
    if (!this.clientId) {
      this.error.set('Invalid client.');
      return;
    }

    this.loadCredits();
  }

  loadCredits(): void {
    this.loading.set(true);
    this.error.set('');

    this.creditService.getAll(this.clientId).subscribe({
      next: (data) => {
        this.credits.set(data);
        this.loading.set(false);
      },
      error: (_err: HttpErrorResponse) => {
        this.error.set('Failed to load client credits.');
        this.loading.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/credit/demandes']);
  }
}
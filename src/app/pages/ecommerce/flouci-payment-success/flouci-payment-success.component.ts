import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { FlouciPaymentService } from '../services/flouci-payment.service';
import { PaymentResponse } from '../models/payment.model';

@Component({
  selector: 'app-flouci-payment-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './flouci-payment-success.component.html',
  styleUrl: './flouci-payment-success.component.scss'
})
export class FlouciPaymentSuccessComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private flouciPaymentService = inject(FlouciPaymentService);

  loading = signal(true);
  error = signal<string | null>(null);
  payment = signal<PaymentResponse | null>(null);

  ngOnInit(): void {
    const paymentId = Number(this.route.snapshot.queryParamMap.get('paymentId'));

    if (!Number.isFinite(paymentId) || paymentId <= 0) {
      this.error.set('Missing payment id.');
      this.loading.set(false);
      return;
    }

    this.flouciPaymentService.verifyPayment(paymentId).subscribe({
      next: (payment) => {
        this.payment.set(payment);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Flouci payment verification failed:', err);
        this.error.set(err?.error?.message || err?.error?.error || 'Failed to verify Flouci payment.');
        this.loading.set(false);
      }
    });
  }
}

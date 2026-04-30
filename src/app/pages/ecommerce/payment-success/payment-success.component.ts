import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { StripeCheckoutService } from '../services/stripe-checkout.service';
import { PaymentResponse } from '../models/payment.model';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './payment-success.component.html',
  styleUrl: './payment-success.component.scss'
})
export class PaymentSuccessComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private stripeCheckoutService = inject(StripeCheckoutService);

  loading = signal(true);
  error = signal<string | null>(null);
  payment = signal<PaymentResponse | null>(null);

  ngOnInit(): void {
    const sessionId = this.route.snapshot.queryParamMap.get('session_id');

    if (!sessionId) {
      this.error.set('Missing Stripe session id.');
      this.loading.set(false);
      return;
    }

    this.stripeCheckoutService.confirmCheckoutSession(sessionId).subscribe({
      next: (payment) => {
        this.payment.set(payment);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Stripe payment confirmation failed:', err);
        this.error.set(err?.error?.message || err?.error?.error || 'Failed to confirm payment.');
        this.loading.set(false);
      }
    });
  }
}

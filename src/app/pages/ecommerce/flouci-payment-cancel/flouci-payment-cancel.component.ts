import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-flouci-payment-cancel',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './flouci-payment-cancel.component.html',
  styleUrl: './flouci-payment-cancel.component.scss'
})
export class FlouciPaymentCancelComponent {}

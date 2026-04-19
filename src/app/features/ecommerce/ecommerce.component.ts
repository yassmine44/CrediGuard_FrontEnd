import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ecommerce',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ecommerce.component.html',
  styleUrl: './ecommerce.component.scss'
})
export class EcommerceComponent {
  cards = [
    {
      title: 'Products',
      description: 'Manage the product catalog, stock, and availability.',
      value: 0,
      action: 'Open Products'
    },
    {
      title: 'Categories',
      description: 'Organize products into categories and collections.',
      value: 0,
      action: 'Open Categories'
    },
    {
      title: 'Orders',
      description: 'Track customer orders and order status.',
      value: 0,
      action: 'Open Orders'
    },
    {
      title: 'Payments',
      description: 'Monitor payments and transaction states.',
      value: 0,
      action: 'Open Payments'
    },
    {
      title: 'Deliveries',
      description: 'Follow shipment and delivery management.',
      value: 0,
      action: 'Open Deliveries'
    },
    {
      title: 'Promo Codes',
      description: 'Create and track discounts and promotions.',
      value: 0,
      action: 'Open Promo Codes'
    }
  ];
}
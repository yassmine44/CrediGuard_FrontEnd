import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClaimsAdminService } from '../claims-admin/claims-admin.service';
import { PolicyService } from '../../services/policy.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-partners-insurance',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './partners-insurance.component.html',
  styleUrls: ['./partners-insurance.component.scss']
})
export class PartnersInsuranceComponent implements OnInit {

  constructor(
    private claimsService: ClaimsAdminService,
    private policyService: PolicyService
  ) {}
  topStats = [
    { title: 'Total Partners', value: 0, icon: '🏪' },
    { title: 'Products', value: 0, icon: '🛍️' },
    { title: 'Active Policies', value: 0, icon: '📜' },
    { title: 'Risk Alerts', value: 0, icon: '🚨', alert: true },
    { title: 'Claims', value: 0, icon: '📋' }
  ];
  partners: any[] = [];


  cards = [
    // {
    //   title: 'Partners',
    //   description: 'Manage partner companies...',
    //   value: 0,
    //   action: 'Open Partners',
    //   route: '/admin/partners'
    // },
    {
      title: 'Products',
      description: 'Manage partner products...',
      value: 0,
      action: 'Open Products',
      route: '/admin/partners-insurance/products'
    },
   
    {
      title: 'Claims',
      description: 'Manage insurance claims...',
      value: 0,
      action: 'Open Claims',
      route: '/admin/partners-insurance/claims'
    },
    {
      title: 'Policies',
      description: 'Manage insurance policies...',
      value: 0,
      action: 'Open Policies',
      route: '/admin/partners-insurance/policies'
    }
  ];

  ngOnInit(): void {
    this.loadStats();
    this.load();
    
  }
  load() {
  fetch('http://localhost:8082/api/partners/all')
    .then(res => {
      console.log("STATUS:", res.status);
      return res.json();
    })
    .then(data => {
      console.log("DATA:", data);
      this.partners = data;
    })
    .catch(err => console.error("ERROR:", err));
}

  async loadStats() {
    try {
      const claims = await this.claimsService.getAll();
      const partnersCount = await this.claimsService.getPartnersCount();
      const products = await this.claimsService.getProducts();
      const policies = await firstValueFrom(this.policyService.getAll()).catch(() => []);

      // Calculate risk scores locally to show alerts on dashboard
      const alertsCount = claims.filter((c: any) => {
        let score = 0;
        if ((c.voucher?.amount || 0) > 1000) score += 30;
        const historyCount = claims.filter((x: any) => x.voucher?.client?.id === c.voucher?.client?.id).length;
        if (historyCount > 5) score += 40;
        return score > 60;
      }).length;

      // Update Top Stats
      this.topStats = [
        { title: 'Total Partners', value: partnersCount, icon: '🏪' },
        { title: 'Products', value: products.length, icon: '🛍️' },
        { title: 'Active Policies', value: policies.length, icon: '📜' },
        { title: 'Risk Alerts', value: alertsCount, icon: '🚨', alert: true },
        { title: 'Claims', value: claims.length, icon: '📋' }
      ];

      // Update Bottom Cards
      this.updateCard('Claims', claims.length);
      this.updateCard('Products', products.length);
      this.updateCard('Policies', policies.length);
      this.updateCard('Risk Alerts', alertsCount);

    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  }

  updateCard(title: string, value: number) {
    this.cards = this.cards.map(card =>
      card.title === title ? { ...card, value } : card
    );
  }
}
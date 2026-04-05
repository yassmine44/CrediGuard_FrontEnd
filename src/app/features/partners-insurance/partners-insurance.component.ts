import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClaimsAdminService } from '../claims-admin/claims-admin.service';

@Component({
  selector: 'app-partners-insurance',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './partners-insurance.component.html',
  styleUrls: ['./partners-insurance.component.scss']
})
export class PartnersInsuranceComponent implements OnInit {

  constructor(private claimsService: ClaimsAdminService) {}
  topStats = [
  { title: 'Total Partners', value: 0 },
  { title: 'Products', value: 0 },
  { title: 'Claims', value: 0 },
  { title: 'Insurances', value: 0 }
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
      title: 'Insurances',
      description: 'Manage insurance offers...',
      value: 0,
      action: 'Open Insurances',
      route: '/admin/insurances'
    },
    {
      title: 'Claims',
      description: 'Manage insurance claims...',
      value: 0,
      action: 'Open Claims',
      route: '/admin/partners-insurance/claims'
    }
  ];

  ngOnInit(): void {
    this.loadStats();
    this.load();
    
  }
  load() {
  fetch('http://localhost:8090/api/partners/all')
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
    const insurances = await this.claimsService.getInsurances();

    // ===== CARDS BAS =====
    this.updateCard('Claims', claims.length);
    this.updateCard('Partners', partnersCount);
    this.updateCard('Products', products.length);
    this.updateCard('Insurances', insurances.length);

    // ===== CARDS HAUT (🔥 AJOUT) =====
    this.topStats = [
      { title: 'Total Partners', value: partnersCount },
      { title: 'Products', value: products.length },
      { title: 'Claims', value: claims.length },
      { title: 'Insurances', value: insurances.length }
    ];

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
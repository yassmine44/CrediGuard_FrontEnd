import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClaimService } from '../../core/services/insurance/claim.service';
import { ContratService } from '../../core/services/insurance/contrat.service';
import { AssureurService } from '../../core/services/insurance/assureur.service';
import { PartnerProductService } from '../../services/partner-product.service';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-partners-insurance',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './partners-insurance.component.html',
  styleUrls: ['./partners-insurance.component.scss']
})
export class PartnersInsuranceComponent implements OnInit {

  constructor(
    private claimService: ClaimService,
    private contratService: ContratService,
    private assureurService: AssureurService,
    private partnerProductService: PartnerProductService,
    private http: HttpClient
  ) {}

  topStats = [
    { title: 'Total Partners',  value: 0, icon: '🏪' },
    { title: 'Products',        value: 0, icon: '🛍️' },
    { title: 'Active Policies', value: 0, icon: '📜' },
    { title: 'Risk Alerts',     value: 0, icon: '🚨', alert: true },
    { title: 'Claims',          value: 0, icon: '📋' }
  ];

  partners: any[] = [];

  cards = [
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
    },
    {
      title: 'Offers',
      description: 'Manage insurance offers & companies...',
      value: 0,
      action: 'Open Offers',
      route: '/admin/partners-insurance/offers'
    }
  ];

  ngOnInit(): void {
    this.loadStats();
    this.load();
  }

  load() {
    this.assureurService.getAll().subscribe({
      next: (data) => this.partners = data,
      error: (err) => console.error('ERROR loading assureurs:', err)
    });
  }

  loadStats() {
    forkJoin({
      claims:   this.claimService.getAll().pipe(catchError(() => of([]))),
      partners: this.assureurService.getAll().pipe(catchError(() => of([]))),
      products: this.partnerProductService.getAll().pipe(catchError(() => of([]))),
      policies: this.contratService.getAll().pipe(catchError(() => of([])))
    }).subscribe({
      next: (res) => {
        const claims        = res.claims;
        const partnersCount = res.partners.length;
        const productsCount = res.products.length;
        const policiesCount = res.policies.length;

        this.topStats = [
          { title: 'Total Partners',  value: partnersCount, icon: '🏪' },
          { title: 'Products',        value: productsCount, icon: '🛍️' },
          { title: 'Active Policies', value: policiesCount, icon: '📜' },
          { title: 'Risk Alerts',     value: 0,             icon: '🚨', alert: true },
          { title: 'Claims',          value: claims.length, icon: '📋' }
        ];

        this.updateCard('Claims',   claims.length);
        this.updateCard('Products', productsCount);
        this.updateCard('Policies', policiesCount);
      },
      error: (error) => {
        console.error('Erreur chargement stats:', error);
      }
    });
  }

  updateCard(title: string, value: number) {
    this.cards = this.cards.map(card =>
      card.title === title ? { ...card, value } : card
    );
  }
}
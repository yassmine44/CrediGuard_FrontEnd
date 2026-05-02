import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AssureurService } from '../../core/services/insurance/assureur.service';
import { OffreService } from '../../core/services/insurance/offre.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-offers-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './offers-admin.component.html',
  styleUrls: ['./offers-admin.component.scss']
})
export class OffersAdminComponent implements OnInit {
  private http = inject(HttpClient);
  private assureurService = inject(AssureurService);
  private offreService = inject(OffreService);
  private authService = inject(AuthService);

  offers: any[] = [];
  companies: any[] = [];
  
  loading = false;
  message = '';

  // Form states
  showOfferForm = false;
  showCompanyForm = false;

  newCompany = {
    name: '',
    registrationNumber: '',
    address: '',
    phoneNumber: '',
    email: '',
    active: true
  };

  newOffer = {
    name: '',
    annualPremium: 0,
    coverageDetails: '',
    type: 'PROPERTY',
    coverageAmount: 0,
    franchise: 0,
    coverageRate: 100,
    active: true,
    companyId: null as number | null
  };

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.offreService.getAll().subscribe({
      next: (data) => {
        this.offers = data;
        this.loadCompanies();
      },
      error: () => {
        this.message = "Erreur lors du chargement des offres ❌";
        this.loading = false;
      }
    });
  }

  loadCompanies() {
    this.assureurService.getAll().subscribe({
      next: (data) => {
        this.companies = data;
        this.loading = false;
      },
      error: () => {
        this.message = "Erreur lors du chargement des compagnies ❌";
        this.loading = false;
      }
    });
  }

  createCompany() {
    this.loading = true;
    const headers = { Authorization: `Bearer ${this.authService.getToken()}` };
    this.http.post('http://localhost:8089/api/assureurs', this.newCompany, { headers }).subscribe({
      next: () => {
        this.message = "Compagnie créée avec succès ✅";
        this.showCompanyForm = false;
        this.loadCompanies();
      },
      error: (err) => {
        this.message = "Erreur lors de la création ❌";
        this.loading = false;
        console.error(err);
      }
    });
  }

  createOffer() {
    if (!this.newOffer.companyId) {
      this.message = "Veuillez sélectionner une compagnie ❗";
      return;
    }

    this.loading = true;
    
    // On récupère l'objet compagnie complet
    const selectedCompany = this.companies.find(c => c.id == this.newOffer.companyId);

    const payload = {
      name: this.newOffer.name,
      annualPremium: Number(this.newOffer.annualPremium),
      coverageDetails: this.newOffer.coverageDetails,
      type: this.newOffer.type,
      coverageAmount: Number(this.newOffer.coverageAmount || 0),
      franchise: Number(this.newOffer.franchise || 0),
      coverageRate: Number(this.newOffer.coverageRate || 100),
      active: true,
      guarantees: "",
      exclusions: "",
      tags: "",
      insuranceCompany: selectedCompany
    };

    console.log("Envoi du payload:", payload);

    const headers = { Authorization: `Bearer ${this.authService.getToken()}` };
    this.http.post('http://localhost:8089/api/offres', payload, { headers }).subscribe({
      next: () => {
        this.message = "Offre créée avec succès ✅";
        this.showOfferForm = false;
        this.loadData();
      },
      error: (err) => {
        console.error("Erreur détaillée:", err);
        const serverError = err.error?.message || err.error?.error || "Erreur inconnue";
        this.message = `❌ Erreur : ${serverError}`;
        this.loading = false;
      }
    });
  }

  deleteOffer(id: number) {
    if (!confirm('Voulez-vous vraiment supprimer cette offre ?')) return;
    this.offreService.delete(id).subscribe({
      next: () => {
        this.message = "Offre supprimée ✅";
        this.loadData();
      }
    });
  }
}

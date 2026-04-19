import { Routes } from '@angular/router';
import { CreditComponent } from './credit.component';
import { DemandeCreditListComponent } from './pages/demande-credit-list/demande-credit-list.component';
import { DemandeCreditFormComponent } from './pages/demande-credit-form/demande-credit-form.component';
import { DemandeCreditDetailComponent } from './pages/demande-credit-detail/demande-credit-detail.component';

export const CREDIT_ROUTES: Routes = [
  {
    path: '',
    component: CreditComponent,
  },
  {
    path: 'demandes',
    component: DemandeCreditListComponent,
  },
  {
    path: 'demandes/new',
    component: DemandeCreditFormComponent,
  },
  {
    path: 'demandes/edit/:id',
    component: DemandeCreditFormComponent,
  },
  {
    path: 'demandes/:demandeId/profil',
    loadComponent: () =>
      import('./pages/profil-credit-admin/profil-credit-admin.component')
        .then(m => m.ProfilCreditAdminComponent),
  },
  {
    path: 'demandes/:demandeId/evaluation',
    loadComponent: () =>
      import('./pages/evaluation-risque-detail/evaluation-risque-detail.component')
        .then(m => m.EvaluationRisqueDetailComponent),
  },
  {
    path: 'demandes/:demandeId/credit',
    loadComponent: () =>
      import('./pages/credit-form/credit-form.component')
        .then(m => m.CreditFormComponent),
  },
  {
    path: 'wallet/:clientId',
    loadComponent: () =>
      import('./pages/credit-wallet-admin/credit-wallet-admin.component')
        .then(m => m.CreditWalletAdminComponent),
  },
  {
    path: 'demandes/:id',
    component: DemandeCreditDetailComponent,
  },
  {
    path: 'demandes/:demandeId/plan',
    loadComponent: () =>
      import('./pages/plan-utilisation-list/plan-utilisation-list.component')
        .then(m => m.PlanUtilisationListComponent),
  },
  {
    path: 'demandes/:demandeId/decision',
    loadComponent: () =>
      import('./pages/decision-credit-form/decision-credit-form.component')
        .then(m => m.DecisionCreditFormComponent),
  },
];

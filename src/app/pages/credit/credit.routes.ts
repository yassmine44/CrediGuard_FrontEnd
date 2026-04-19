import { Routes } from '@angular/router';
import { CreditComponent } from './credit.component';
import { DemandeCreditFormComponent } from './pages/demande-credit-form/demande-credit-form.component';
import { DemandeCreditHistoryComponent } from './pages/demande-credit-history/demande-credit-history.component';
import { ProfilCreditFormComponent } from './pages/profil-credit-form/profil-credit-form.component';
import { FrontAuthGuard } from '../../core/guards/front-auth.guard';

export const FRONT_CREDIT_ROUTES: Routes = [
  {
    path: '',
    component: CreditComponent,
    canActivate: [FrontAuthGuard],
  },
  {
    path: 'profile',
    component: ProfilCreditFormComponent,
    canActivate: [FrontAuthGuard],
  },
  {
    path: 'request',
    component: DemandeCreditFormComponent,
    canActivate: [FrontAuthGuard],
  },
  {
    path: 'history',
    component: DemandeCreditHistoryComponent,
    canActivate: [FrontAuthGuard],
  },
  {
    path: 'history/:demandeId/plan',
    canActivate: [FrontAuthGuard],
    loadComponent: () =>
      import('./pages/plan-utilisation-form/plan-utilisation-form.component')
        .then(m => m.PlanUtilisationFormComponent),
  },
  {
    path: 'wallet',
    canActivate: [FrontAuthGuard],
    loadComponent: () =>
      import('./pages/credit-wallet/credit-wallet.component')
        .then(m => m.CreditWalletComponent),
  },
  {
    path: 'wallet/:creditId/echeances',
    canActivate: [FrontAuthGuard],
    loadComponent: () =>
      import('./pages/echeance-list/echeance-list.component')
        .then(m => m.EcheanceListComponent),
  },
];

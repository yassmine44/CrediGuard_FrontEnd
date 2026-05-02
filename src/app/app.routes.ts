import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

import { ECOMMERCE_FRONT_ROUTES } from './pages/ecommerce/ecommerce-front.routes';
import { ECOMMERCE_ADMIN_ROUTES } from './features/ecommerce/ecommerce-admin.routes';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/sign-in',
    pathMatch: 'full'
  },

  // FRONT
  {
    path: 'front',
    loadComponent: () =>
      import('./layout/all-template-front/all-template-front.component')
        .then(m => m.AllTemplateFrontComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'about',
        loadComponent: () =>
          import('./pages/about/about.component').then(m => m.AboutComponent)
      },
      {
        path: 'contact',
        loadComponent: () =>
          import('./pages/contact/contact.component').then(m => m.ContactComponent)
      },

      // ✅ VERSION YASSMINE (plus scalable)
      {
        path: 'credit',
        loadChildren: () =>
          import('./pages/credit/credit.routes').then(m => m.FRONT_CREDIT_ROUTES)
      },

      {
        path: 'crowdfunding',
        loadComponent: () =>
          import('./pages/crowdfunding/crowdfunding.component').then(m => m.CrowdfundingComponent)
      },
      {
        path: 'finance',
        loadComponent: () =>
          import('./pages/finance-front/finance-front.component').then(m => m.FinanceFrontComponent)
      },
      {
        path: 'partnership',
        loadComponent: () =>
          import('./pages/partnership/partnership.component').then(m => m.PartnershipComponent)
      },

      // ✅ VERSION MAIN (important)
      {
        path: 'claim',
        loadComponent: () =>
          import('./pages/claim/claim.component').then(m => m.ClaimComponent)
      },

      {
        path: 'events',
        loadComponent: () =>
          import('./pages/events-front/events-front.component').then(m => m.EventsFrontComponent)
      },

      // ✅ ECOMMERCE (yassmine)
      ...ECOMMERCE_FRONT_ROUTES,

      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/profile-front/profile-front.component').then(m => m.ProfileFrontComponent)
      },

      // ✅ VERSION MAIN (important)
      {
        path: 'my-claims',
        loadComponent: () =>
          import('./pages/my-claims/my-claims.component').then(m => m.MyClaimsComponent)
      },
      {
        path: 'client-space',
        loadComponent: () =>
          import('./pages/client-space/client-space.component').then(m => m.ClientSpaceComponent)
      },
      {
        path: 'insurance',
        loadComponent: () =>
          import('./pages/insurance-space/insurance-space.component').then(m => m.InsuranceSpaceComponent)
      }
    ]
  },

  // AUTH
  {
    path: 'auth',
    children: [
      {
        path: 'sign-in',
        loadComponent: () =>
          import('./features/auth/sign-in/sign-in.component')
            .then(m => m.SignInComponent)
      },
      {
        path: 'sign-up',
        loadComponent: () =>
          import('./features/auth/sign-up/sign-up.component')
            .then(m => m.SignUpComponent)
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./features/auth/forgot-password/forgot-password.component')
            .then(m => m.ForgotPasswordComponent)
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./features/auth/reset-password/reset-password.component')
            .then(m => m.ResetPasswordComponent)
      },
      {
        path: 'verify-otp',
        loadComponent: () =>
          import('./features/auth/verify-otp/verify-otp.component')
            .then(m => m.VerifyOtpComponent)
      },
      {
        path: '',
        redirectTo: 'sign-in',
        pathMatch: 'full'
      }
    ]
  },

  // ADMIN
  {
    path: 'admin',
    loadComponent: () =>
      import('./layout/admin-layout/admin-layout.component')
        .then(m => m.AdminLayoutComponent),
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component')
            .then(m => m.DashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/users/users.component')
            .then(m => m.UsersComponent)
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.component')
            .then(m => m.ProfileComponent)
      },
      {
        path: 'security',
        loadComponent: () =>
          import('./features/security/security.component')
            .then(m => m.SecurityComponent)
      },

      // ✅ ECOMMERCE ADMIN
      ...ECOMMERCE_ADMIN_ROUTES,

      {
        path: 'finance',
        loadComponent: () =>
          import('./features/finance/finance.component')
        .then(m => m.FinanceAdminComponent)
      },

      // ✅ VERSION YASSMINE (plus modulaire)
      {
        path: 'credit',
        loadChildren: () =>
          import('./features/credit/credit.routes').then(m => m.CREDIT_ROUTES)
      },

      // ✅ VERSION MAIN (plus complète)
      {
        path: 'partners-insurance',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/partners-insurance/partners-insurance.component')
                .then(m => m.PartnersInsuranceComponent)
          },
          {
            path: 'claims',
            loadComponent: () =>
              import('./features/claims-admin/claims-admin.component')
                .then(m => m.ClaimsAdminComponent)
          },
          {
            path: 'products',
            loadComponent: () =>
              import('./features/products-admin/products-admin.component')
                .then(m => m.ProductsComponent)
          },
          {
            path: 'offers',
            loadComponent: () =>
              import('./features/offers-admin/offers-admin.component')
                .then(m => m.OffersAdminComponent)
          },
          {
            path: 'policies',
            loadComponent: () =>
              import('./features/policies-admin/policies-admin.component')
                .then(m => m.PoliciesAdminComponent)
          }
        ]
      },

      {
        path: 'crowdfunding',
        loadComponent: () =>
          import('./features/crowdfunding/crowdfunding.component')
            .then(m => m.CrowdfundingComponent)
      },
      {
        path: 'events',
        loadComponent: () =>
          import('./features/events/events.component')
            .then(m => m.EventsComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },

  {
    path: '**',
    redirectTo: 'auth/sign-in'
  }
];
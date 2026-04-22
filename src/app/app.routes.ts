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
      ...ECOMMERCE_FRONT_ROUTES,
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/profile-front/profile-front.component').then(m => m.ProfileFrontComponent)
      },
      {
        path: 'my-claims',
        loadComponent: () =>
          import('./pages/my-claims/my-claims.component').then(m => m.MyClaimsComponent)
      }
    ]
  },

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
cat > src/app/app.routes.ts << 'EOF'
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
      ...ECOMMERCE_FRONT_ROUTES,
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/profile-front/profile-front.component').then(m => m.ProfileFrontComponent)
      },
      {
        path: 'my-claims',
        loadComponent: () =>
          import('./pages/my-claims/my-claims.component').then(m => m.MyClaimsComponent)
      }
    ]
  },

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

  {
    path: 'admin',
    loadComponent: () =>
      import('./layout/admin-layout/admin-layout.component')
        .then(m => m.AdminLayoutComponent),
    canActivate: [AuthGuard],

cat > src/app/components/header-front/header-front.component.html << 'EOF'
<nav class="navbar">
  <div class="auth-actions">
    <ng-container *ngIf="authService.isLoggedIn()">
      <button type="button" class="btn-auth outline" (click)="logout()">Logout</button>
    </ng-container>
  </div>

  <a routerLink="/" class="brand">
    <div class="logo-icon">/</div>
    CREDIGUARD
  </a>

  <ul class="nav-links">
    <li><a routerLink="/front" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Home</a></li>
    <li><a routerLink="/front/about" routerLinkActive="active">About</a></li>
    <li><a routerLink="/front/contact" routerLinkActive="active">Contact</a></li>
    <li><a routerLink="/front/credit" routerLinkActive="active">Credit</a></li>
    <li><a routerLink="/front/crowdfunding" routerLinkActive="active">Crowdfunding</a></li>
    <li><a routerLink="/front/finance" routerLinkActive="active">Finance</a></li>
    <li><a routerLink="/front/partnership" routerLinkActive="active">Partnership</a></li>
    <li><a routerLink="/front/events" routerLinkActive="active">Events</a></li>
    <li><a routerLink="/front/ecommerce" routerLinkActive="active">E-Commerce</a></li>
    <li>
      <a routerLink="/front/orders" routerLinkActive="active">My Orders</a>
    </li>
    <li *ngIf="canSell()">
      <a routerLink="/front/seller/products" routerLinkActive="active">My Products</a>
    </li>
    <li *ngIf="canSell()">
      <a routerLink="/front/seller/products/new" routerLinkActive="active">Sell Product</a>
    </li>
  </ul>

  <div class="nav-actions">
    <a routerLink="/front/cart" routerLinkActive="active" class="cart-link" aria-label="Cart">
      <mat-icon>shopping_cart</mat-icon>
      <span *ngIf="cartCount() > 0" class="cart-badge">
        {{ cartCount() }}
      </span>
    </a>

    <button
      *ngIf="authService.isLoggedIn()"
      type="button"
      class="icon-btn"
      (click)="goProfile()"
      aria-label="Profile">
      <mat-icon>account_circle</mat-icon>
    </button>

    <button type="button" class="icon-btn btn-notify" aria-label="Notifications">
      <mat-icon>notifications</mat-icon>
    </button>
  </div>
</nav>

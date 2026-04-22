import {
  Component,
  OnInit,
  inject,
  signal,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { CartService } from '../../pages/ecommerce/services/cart.service';


@Component({
  selector: 'app-header-front',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './header-front.component.html',
  styleUrls: ['./header-front.component.scss']
})
export class HeaderFrontComponent implements OnInit {
  private cartService = inject(CartService);


  cartCount = signal(0);


  constructor(
    public authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}


  ngOnInit(): void {
    this.cartService.itemsCount$.subscribe(count => {
      this.cartCount.set(count);
    });


    if (isPlatformBrowser(this.platformId)) {
      this.cartService.getMyCart().subscribe({
        error: () => {
          this.cartCount.set(0);
        }
      });
    }
  }


  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/auth/sign-in');
  }


  goProfile(): void {
    if (this.authService.isAdmin()) {
      this.router.navigate(['/admin/profile']);
    } else {
      this.router.navigate(['/front/profile']);
    }
  }


  canSell(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }


    const rawUser =
      localStorage.getItem('currentUser') ||
      localStorage.getItem('user');


    if (!rawUser) {
      return false;
    }


    try {
      const user = JSON.parse(rawUser);
      const role = String(user?.userType ?? user?.role ?? '').toUpperCase();


      return (
        role === 'ADMIN' ||
        role === 'BENEFICIARY' ||
        role === 'PARTNER'
      );
    } catch {
      return false;
    }
  }
}


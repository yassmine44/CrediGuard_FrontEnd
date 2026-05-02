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
import { NotificationService } from '../../core/services/notification.service';
import { Notification } from '../../core/models/notification.model';
import { NotificationPanelComponent } from '../../shared/components/notification-panel/notification-panel.component';


@Component({
  selector: 'app-header-front',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule, NotificationPanelComponent],
  templateUrl: './header-front.component.html',
  styleUrls: ['./header-front.component.scss']
})
export class HeaderFrontComponent implements OnInit {
  private cartService = inject(CartService);
  private notificationService = inject(NotificationService);

  notifications: Notification[] = [];
  unreadCount = 0;
  showNotifications = false;


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
      this.loadNotifications();

      // Écouter l'événement de rafraîchissement des notifications
      window.addEventListener('refreshNotifications', () => {
        this.loadNotifications();
      });
    }
  }

  loadNotifications() {
    const user: any = this.authService.getUser();
    if (!user?.id) return;

    this.notificationService.getUserNotifications(user.id).subscribe(res => {
      this.notifications = res;
    });

    this.notificationService.getUnreadCount(user.id).subscribe(count => {
      this.unreadCount = count;
    });
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  markNotificationAsRead(id: number) {
    this.notificationService.markAsRead(id).subscribe(() => {
      const n = this.notifications.find(notif => notif.id === id);
      if (n && !n.isRead) {
        n.isRead = true;
        this.unreadCount--;
      }
    });
  }

  markAllNotificationsAsRead() {
    const user: any = this.authService.getUser();
    if (!user?.id) return;
    this.notificationService.markAllAsRead(user.id).subscribe(() => {
      this.notifications.forEach(n => n.isRead = true);
      this.unreadCount = 0;
    });
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


import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Notification, NotificationCategory } from '../../../core/models/notification.model';

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-panel">
      <div class="panel-header">
        <h2>Notifications</h2>
        <button class="btn-link" (click)="onMarkAllAsRead()">Tout marquer comme lu</button>
      </div>

      <div class="panel-tabs">
        <button [class.active]="activeTab === 'all'" (click)="activeTab = 'all'">Toutes</button>
        <button [class.active]="activeTab === 'claims'" (click)="activeTab = 'claims'">Claims</button>
        <button [class.active]="activeTab === 'contracts'" (click)="activeTab = 'contracts'">Contrats</button>
      </div>

      <div class="notification-list">
        <div *ngIf="filteredNotifications.length === 0" class="empty-notifications">
          Aucune notification à afficher.
        </div>
        
        <div *ngFor="let n of filteredNotifications" 
             class="notification-item" 
             [class.unread]="!n.isRead"
             (click)="onNotificationClick(n)">
          <div class="notification-icon" [ngClass]="n.category.toLowerCase()">
            <span *ngIf="n.statusTag === 'Validée' || n.statusTag === 'Actif'">✅</span>
            <span *ngIf="n.statusTag === 'Refusée'">❌</span>
            <span *ngIf="n.statusTag === 'Renouvellement'">⚠️</span>
            <span *ngIf="n.statusTag === 'Soumis' || n.statusTag === 'En cours'">📩</span>
          </div>
          <div class="notification-content">
            <div class="notification-top">
              <span class="ref">{{ n.reference }}</span>
              <span class="time">{{ formatTime(n.createdAt) }}</span>
              <div *ngIf="!n.isRead" class="unread-dot"></div>
            </div>
            <p class="message">{{ n.message }}</p>
            <div class="notification-bottom">
              <span class="status-pill" [ngClass]="n.statusTag?.toLowerCase()">{{ n.statusTag }}</span>
              <span class="details">{{ n.details }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notification-panel {
      position: absolute;
      top: 60px;
      right: 20px;
      width: 400px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.15);
      border: 1px solid #eee;
      z-index: 1000;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      max-height: 500px;
    }
    .panel-header {
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #eee;
    }
    .panel-header h2 { margin: 0; font-size: 1.1rem; color: #333; }
    .btn-link { 
      background: none; border: none; color: #1976d2; cursor: pointer; font-size: 0.85rem; 
    }
    .panel-tabs {
      display: flex;
      padding: 0 16px;
      border-bottom: 1px solid #eee;
      background: #f9f9f9;
    }
    .panel-tabs button {
      padding: 12px 16px;
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      cursor: pointer;
      font-size: 0.9rem;
      color: #666;
    }
    .panel-tabs button.active {
      color: #1976d2;
      border-bottom-color: #1976d2;
      font-weight: 600;
    }
    .notification-list {
      overflow-y: auto;
      flex: 1;
    }
    .notification-item {
      padding: 16px;
      display: flex;
      gap: 12px;
      cursor: pointer;
      border-bottom: 1px solid #f5f5f5;
      transition: background 0.2s;
    }
    .notification-item:hover { background: #f0f7ff; }
    .notification-item.unread { background: #f8fbff; }
    .notification-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      flex-shrink: 0;
    }
    .notification-content { flex: 1; }
    .notification-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }
    .ref { font-weight: 700; color: #1976d2; font-size: 0.85rem; }
    .time { font-size: 0.75rem; color: #999; }
    .unread-dot {
      width: 8px;
      height: 8px;
      background: #1976d2;
      border-radius: 50%;
    }
    .message { margin: 0 0 8px 0; font-size: 0.95rem; color: #333; line-height: 1.4; }
    .notification-bottom {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .status-pill {
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    .status-pill.validée, .status-pill.actif { background: #e8f5e9; color: #2e7d32; }
    .status-pill.refusée { background: #ffebee; color: #c62828; }
    .status-pill.renouvellement { background: #fff3e0; color: #f57c00; }
    .status-pill.soumis { background: #e3f2fd; color: #1976d2; }
    .details { font-size: 0.8rem; color: #666; }
    .empty-notifications { padding: 40px; text-align: center; color: #999; }
  `]
})
export class NotificationPanelComponent {
  @Input() notifications: Notification[] = [];
  @Output() markAllRead = new EventEmitter<void>();
  @Output() markAsRead = new EventEmitter<number>();

  activeTab: 'all' | 'claims' | 'contracts' = 'all';

  get filteredNotifications() {
    if (this.activeTab === 'all') return this.notifications;
    if (this.activeTab === 'claims') return this.notifications.filter(n => n.category === NotificationCategory.CLAIM);
    if (this.activeTab === 'contracts') return this.notifications.filter(n => n.category === NotificationCategory.CONTRAT);
    return this.notifications;
  }

  formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Il y a quelques instants";
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    if (diffInHours < 48) return "Hier";
    return date.toLocaleDateString();
  }

  onNotificationClick(n: Notification) {
    if (!n.isRead) {
      this.markAsRead.emit(n.id);
    }
  }

  onMarkAllAsRead() {
    this.markAllRead.emit();
  }
}

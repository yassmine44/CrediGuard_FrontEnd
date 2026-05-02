export enum NotificationCategory {
    CLAIM = 'CLAIM',
    CONTRAT = 'CONTRAT',
    GENERAL = 'GENERAL'
}

export interface Notification {
    id: number;
    title: string;
    message: string;
    reference: string;
    category: NotificationCategory;
    statusTag: string;
    details: string;
    isRead: boolean;
    createdAt: string;
}

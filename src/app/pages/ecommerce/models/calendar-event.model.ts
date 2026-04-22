export interface CalendarEvent {
  id: number;
  name: string;
  code: string;
  description: string | null;
  eventType: 'SEASONAL' | 'HOLIDAY' | 'RELIGIOUS' | 'COMMERCIAL' | 'CUSTOM';
  startDate: string;
  endDate: string;
  recurringAnnually: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
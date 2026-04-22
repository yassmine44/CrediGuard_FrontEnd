export type CalendarEventType =
  | 'SEASONAL'
  | 'HOLIDAY'
  | 'RELIGIOUS'
  | 'COMMERCIAL'
  | 'CUSTOM';

export interface CalendarEvent {
  id: number;
  name: string;
  code: string;
  description: string | null;
  eventType: CalendarEventType;
  startDate: string;
  endDate: string;
  recurringAnnually: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEventCreateRequest {
  name: string;
  code: string;
  description?: string | null;
  eventType: CalendarEventType | null;
  startDate: string | null;
  endDate: string | null;
  recurringAnnually?: boolean | null;
  active?: boolean | null;
}
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CalendarEvent } from '../models/calendar-event.model';

@Injectable({
  providedIn: 'root'
})
export class CalendarEventService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8089/api/calendar-events';

  getAll(): Observable<CalendarEvent[]> {
    return this.http.get<CalendarEvent[]>(this.apiUrl);
  }

  getActive(): Observable<CalendarEvent[]> {
    return this.http.get<CalendarEvent[]>(`${this.apiUrl}/active`);
  }

  getById(id: number): Observable<CalendarEvent> {
    return this.http.get<CalendarEvent>(`${this.apiUrl}/${id}`);
  }
}
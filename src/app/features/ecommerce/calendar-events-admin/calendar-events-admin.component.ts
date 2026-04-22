import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, NgClass } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import {
  CalendarEvent,
  CalendarEventType
} from '../../../features/ecommerce/models/calendar-event.model';
import { CalendarEventService } from '../../../features/ecommerce/services/calendar-event.service';

@Component({
  selector: 'app-calendar-events-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe, NgClass, MatIconModule],
  templateUrl: './calendar-events-admin.component.html',
  styleUrl: './calendar-events-admin.component.scss'
})
export class CalendarEventsAdminComponent implements OnInit {
  private fb = inject(FormBuilder);
  private calendarEventService = inject(CalendarEventService);

  events = signal<CalendarEvent[]>([]);
  loading = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  showCreateForm = signal(false);

eventTypes: CalendarEventType[] = [
  'SEASONAL',
  'HOLIDAY',
  'RELIGIOUS',
  'COMMERCIAL',
  'CUSTOM'
];

activeEvents = computed(() =>
  this.events().filter(e => e.active)
);

activeEventsCount = computed(() =>
  this.events().filter(e => this.isCurrentlyActive(e)).length
);
  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    code: ['', [Validators.required, Validators.maxLength(80)]],
    description: ['', [Validators.maxLength(500)]],
    eventType: [null as CalendarEventType | null, Validators.required],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    recurringAnnually: [false],
    active: [true]
  });

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading.set(true);
    this.error.set(null);

    this.calendarEventService.getAll().subscribe({
      next: (data) => {
        const sorted = [...(data ?? [])].sort((a, b) =>
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        );
        this.events.set(sorted);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load calendar events', err);
        this.error.set('Failed to load calendar events.');
        this.loading.set(false);
      }
    });
  }

  toggleCreateForm(): void {
    this.showCreateForm.set(!this.showCreateForm());
    this.error.set(null);
    this.success.set(null);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    const payload = {
      name: raw.name!.trim(),
      code: raw.code!.trim().toUpperCase(),
      description: raw.description?.trim() || null,
      eventType: raw.eventType!,
      startDate: this.toLocalDateTime(raw.startDate!),
      endDate: this.toLocalDateTime(raw.endDate!),
      recurringAnnually: !!raw.recurringAnnually,
      active: !!raw.active
    };

    if (new Date(payload.endDate).getTime() < new Date(payload.startDate).getTime()) {
      this.error.set('End date must be after start date.');
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    this.success.set(null);

    this.calendarEventService.create(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.success.set('Calendar event created successfully.');
        this.form.reset({
          name: '',
          code: '',
          description: '',
          eventType: null,
          startDate: '',
          endDate: '',
          recurringAnnually: false,
          active: true
        });
        this.showCreateForm.set(false);
        this.loadEvents();
      },
      error: (err) => {
        console.error('Failed to create calendar event', err);
        this.error.set('Failed to create calendar event.');
        this.saving.set(false);
      }
    });
  }

  formatEventType(type: CalendarEventType): string {
    return type
      .toLowerCase()
      .split('_')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  isCurrentlyActive(event: CalendarEvent): boolean {
    const now = Date.now();
    const start = new Date(event.startDate).getTime();
    const end = new Date(event.endDate).getTime();
    return event.active && start <= now && end >= now;
  }

  private toLocalDateTime(value: string): string {
    return value.length === 16 ? `${value}:00` : value;
  }
}
'use client';

import { useState } from 'react';
import { EVENTS_2026 } from '@/lib/events-2026';

interface EventsCalendarProps {
  onEventSelect: (eventTitle: string | null) => void;
  selectedEvent: string | null;
}

export default function EventsCalendar({ onEventSelect, selectedEvent }: EventsCalendarProps) {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentMonth, setCurrentMonth] = useState(() => {
    const firstEventDate = new Date(EVENTS_2026[0].date);
    return new Date(firstEventDate.getFullYear(), firstEventDate.getMonth(), 1);
  });

  // Group events by month for calendar view
  const getEventsForMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    return EVENTS_2026.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    });
  };

  // Get all months that have events
  const getMonthsWithEvents = () => {
    const months = new Set<string>();
    EVENTS_2026.forEach(event => {
      const date = new Date(event.date);
      months.add(`${date.getFullYear()}-${date.getMonth()}`);
    });
    return Array.from(months).sort();
  };

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Calendar generation
  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];

    // Add empty cells for days before the first of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const getEventForDay = (day: number) => {
    const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      .toISOString()
      .split('T')[0];

    return EVENTS_2026.find(event => event.date.split('T')[0] === dateStr);
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const eventsThisMonth = getEventsForMonth(currentMonth);
  const calendarDays = generateCalendar();

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card-subtle">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">2026 Concert Schedule</h2>

        {/* View Mode Toggle */}
        <div className="flex gap-2 rounded-lg border border-border bg-background p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-primary text-foreground'
                : 'text-foreground/70 hover:text-foreground'
            }`}
          >
            List
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
              viewMode === 'calendar'
                ? 'bg-primary text-foreground'
                : 'text-foreground/70 hover:text-foreground'
            }`}
          >
            Calendar
          </button>
        </div>
      </div>

      {/* Clear Filter Button */}
      {selectedEvent && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-primary/30 bg-primary/10 px-4 py-2">
          <span className="text-sm font-medium text-foreground">
            Filtered by: <span className="font-bold">{selectedEvent}</span>
          </span>
          <button
            onClick={() => onEventSelect(null)}
            className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
          >
            Clear filter
          </button>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {EVENTS_2026.map((event, index) => {
            const eventDate = new Date(event.date);
            const isSelected = selectedEvent === event.artist;

            return (
              <button
                key={index}
                onClick={() => onEventSelect(isSelected ? null : event.artist)}
                className={`w-full text-left rounded-lg border p-4 transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-md'
                    : 'border-border hover:border-primary/50 hover:bg-secondary'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{event.artist}</h3>
                    <p className="text-sm text-foreground/70">
                      {eventDate.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                      {' • '}
                      {eventDate.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div>
          {/* Month Navigation */}
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={goToPreviousMonth}
              className="rounded-lg p-2 hover:bg-secondary transition-colors"
              aria-label="Previous month"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h3 className="text-lg font-semibold text-foreground">{formatMonthYear(currentMonth)}</h3>
            <button
              onClick={goToNextMonth}
              className="rounded-lg p-2 hover:bg-secondary transition-colors"
              aria-label="Next month"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="mb-4">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-semibold text-foreground/60 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} className="min-h-[80px]" />;
                }

                const event = getEventForDay(day);
                const isSelected = event && selectedEvent === event.artist;

                return (
                  <button
                    key={day}
                    onClick={() => event && onEventSelect(isSelected ? null : event.artist)}
                    disabled={!event}
                    className={`min-h-[80px] rounded-lg border p-2 text-sm transition-all ${
                      event
                        ? isSelected
                          ? 'border-primary bg-primary text-foreground font-bold shadow-md'
                          : 'border-primary/30 bg-primary/5 hover:bg-primary/20 hover:border-primary/50 cursor-pointer'
                        : 'border-border text-foreground/40 cursor-default'
                    }`}
                  >
                    <div className="flex flex-col items-start h-full">
                      <span className="font-semibold mb-1">{day}</span>
                      {event && (
                        <span className={`text-xs leading-tight line-clamp-3 text-left ${isSelected ? 'font-bold' : 'font-medium'}`}>
                          {event.artist}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Events This Month */}
          {eventsThisMonth.length > 0 && (
            <div className="border-t border-border pt-4">
              <h4 className="text-sm font-semibold text-foreground/70 mb-3">
                Events in {formatMonthYear(currentMonth)} ({eventsThisMonth.length})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {eventsThisMonth.map((event, index) => {
                  const eventDate = new Date(event.date);
                  const isSelected = selectedEvent === event.artist;

                  return (
                    <button
                      key={index}
                      onClick={() => onEventSelect(isSelected ? null : event.artist)}
                      className={`w-full text-left rounded px-3 py-2 text-sm transition-colors ${
                        isSelected
                          ? 'bg-primary/10 font-semibold'
                          : 'hover:bg-secondary'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-foreground">{event.artist}</span>
                        <span className="text-foreground/60">
                          {eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {eventsThisMonth.length === 0 && (
            <div className="border-t border-border pt-4 text-center text-sm text-foreground/60">
              No events scheduled for this month
            </div>
          )}
        </div>
      )}
    </div>
  );
}

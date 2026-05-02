import { useState, useEffect, useCallback } from 'react';
import ICAL from 'ical.js';
import { CalendarEvent, AppSettings } from '../types';

function normalizeUrl(url: string): string {
  return url.replace(/^webcal:\/\//i, 'https://');
}

function parseICS(text: string, calendarIndex: number): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const now = new Date();
  const rangeStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const rangeEnd = new Date(now.getFullYear(), now.getMonth() + 3, 0);

  let jcal: ReturnType<typeof ICAL.parse>;
  try {
    jcal = ICAL.parse(text);
  } catch {
    return events;
  }

  const comp = new ICAL.Component(jcal);
  const vevents = comp.getAllSubcomponents('vevent');

  for (const vevent of vevents) {
    const event = new ICAL.Event(vevent);

    if (event.isRecurring()) {
      const iter = event.iterator();
      let occ = iter.next();
      let count = 0;

      while (occ && count < 200) {
        const startJs = occ.toJSDate();
        if (startJs > rangeEnd) break;

        const details = event.getOccurrenceDetails(occ);
        const endJs = details.endDate.toJSDate();

        if (endJs >= rangeStart) {
          events.push({
            id: `${event.uid}-${startJs.getTime()}`,
            title: event.summary || 'Untitled',
            start: startJs,
            end: endJs,
            description: event.description || undefined,
            location: event.location || undefined,
            isAllDay: occ.isDate,
            calendarIndex,
          });
        }

        occ = iter.next();
        count++;
      }
    } else {
      const startJs = event.startDate.toJSDate();
      const endJs = event.endDate ? event.endDate.toJSDate() : startJs;

      if (startJs <= rangeEnd && endJs >= rangeStart) {
        events.push({
          id: event.uid || `ev-${startJs.getTime()}`,
          title: event.summary || 'Untitled',
          start: startJs,
          end: endJs,
          description: event.description || undefined,
          location: event.location || undefined,
          isAllDay: event.startDate.isDate,
          calendarIndex,
        });
      }
    }
  }

  return events;
}

export function useCalendar(settings: AppSettings) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const refresh = useCallback(async () => {
    if (settings.calendars.length === 0) return;
    setLoading(true);
    const errs: string[] = [];
    const all: CalendarEvent[] = [];

    await Promise.all(
      settings.calendars.map(async (feed, index) => {
        try {
          const raw = normalizeUrl(feed.url);
          const url = settings.corsProxy
            ? `${settings.corsProxy}${encodeURIComponent(raw)}`
            : raw;

          const res = await fetch(url, { cache: 'no-store' });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const text = await res.text();
          all.push(...parseICS(text, index));
        } catch (e) {
          errs.push(`${feed.name}: ${e instanceof Error ? e.message : 'Failed'}`);
        }
      }),
    );

    all.sort((a, b) => a.start.getTime() - b.start.getTime());
    setEvents(all);
    setErrors(errs);
    setLoading(false);
  }, [settings.calendars, settings.corsProxy]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, settings.refreshIntervalMinutes * 60_000);
    return () => clearInterval(id);
  }, [refresh, settings.refreshIntervalMinutes]);

  return { events, loading, errors, refresh };
}

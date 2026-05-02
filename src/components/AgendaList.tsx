import { CalendarEvent, AppSettings } from '../types';

const CAL_COLORS = ['#4f9eff', '#57ab5a', '#c69026', '#e5534b', '#9f7efe', '#f76e8e', '#43c4b0'];

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function overlapsDay(ev: CalendarEvent, day: Date) {
  const s = new Date(day); s.setHours(0, 0, 0, 0);
  const e = new Date(day); e.setHours(23, 59, 59, 999);
  return ev.start <= e && ev.end >= s;
}

function dayLabel(d: Date): string {
  const t = new Date();
  if (sameDay(d, t)) return 'Today';
  const tom = new Date(t); tom.setDate(t.getDate() + 1);
  if (sameDay(d, tom)) return 'Tomorrow';
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
}

function fmtTime(d: Date, use24: boolean): string {
  return d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: !use24,
  });
}

interface Props {
  events: CalendarEvent[];
  settings: AppSettings;
  selectedDate: Date;
  loading: boolean;
  errors: string[];
  onRefresh: () => void;
}

export default function AgendaList({ events, settings, selectedDate, loading, errors, onRefresh }: Props) {
  const today = new Date();
  const dayEvents = events
    .filter(e => overlapsDay(e, selectedDate))
    .sort((a, b) => {
      if (a.isAllDay !== b.isAllDay) return a.isAllDay ? -1 : 1;
      return a.start.getTime() - b.start.getTime();
    });

  const upcoming: { date: Date; evs: CalendarEvent[] }[] = [];
  for (let i = 1; i <= 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    if (sameDay(d, selectedDate)) continue;
    const evs = events.filter(e => overlapsDay(e, d));
    if (evs.length) upcoming.push({ date: d, evs });
  }

  return (
    <div className="agenda">
      <div className="agenda-header">
        <h2 className="agenda-title">{dayLabel(selectedDate)}</h2>
        <button className="refresh-btn" onClick={onRefresh} title="Refresh">
          {loading ? '⏳' : '↺'}
        </button>
      </div>

      {errors.length > 0 && (
        <div className="error-list">
          {errors.map((e, i) => <div key={i} className="error-msg">⚠ {e}</div>)}
        </div>
      )}

      {settings.calendars.length === 0 && (
        <div className="empty-state">
          <p>No calendars configured.</p>
          <p>Tap ⚙ to add an iCal feed.</p>
        </div>
      )}

      {dayEvents.length === 0 && settings.calendars.length > 0 && (
        <div className="empty-state">No events</div>
      )}

      <div className="event-list">
        {dayEvents.map(ev => (
          <EventCard key={ev.id} ev={ev} settings={settings} />
        ))}
      </div>

      {upcoming.length > 0 && (
        <div className="upcoming">
          <h3 className="upcoming-heading">Upcoming</h3>
          {upcoming.slice(0, 5).map(({ date, evs }) => (
            <div key={date.toISOString()} className="upcoming-day">
              <div className="upcoming-day-label">
                {date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
              </div>
              {evs.slice(0, 3).map(e => (
                <div key={e.id} className="upcoming-ev">
                  <span className="upcoming-dot" style={{ background: CAL_COLORS[e.calendarIndex % CAL_COLORS.length] }} />
                  <span className="upcoming-ev-title">{e.title}</span>
                  {!e.isAllDay && (
                    <span className="upcoming-ev-time">{fmtTime(e.start, settings.use24Hour)}</span>
                  )}
                </div>
              ))}
              {evs.length > 3 && <div className="upcoming-more">+{evs.length - 3} more</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EventCard({ ev, settings }: { ev: CalendarEvent; settings: AppSettings }) {
  const color = CAL_COLORS[ev.calendarIndex % CAL_COLORS.length];
  const calName = settings.calendars[ev.calendarIndex]?.name;
  const timeStr = ev.isAllDay
    ? 'All day'
    : `${fmtTime(ev.start, settings.use24Hour)} – ${fmtTime(ev.end, settings.use24Hour)}`;

  return (
    <div className="ev-card" style={{ borderLeftColor: color }}>
      <div className="ev-time">{timeStr}</div>
      <div className="ev-title">{ev.title}</div>
      {ev.location && <div className="ev-loc">📍 {ev.location}</div>}
      {calName && <div className="ev-cal" style={{ color }}>{calName}</div>}
    </div>
  );
}

import { useState } from 'react';
import { CalendarEvent } from '../types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
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

function buildGrid(year: number, month: number): Date[] {
  const days: Date[] = [];
  const first = new Date(year, month, 1);
  for (let i = first.getDay(); i > 0; i--)
    days.push(new Date(year, month, 1 - i));
  const last = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= last; d++)
    days.push(new Date(year, month, d));
  let n = 1;
  while (days.length < 42)
    days.push(new Date(year, month + 1, n++));
  return days;
}

interface Props {
  events: CalendarEvent[];
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
}

export default function CalendarGrid({ events, selectedDate, onSelectDate }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const prev = () => month === 0 ? (setMonth(11), setYear(y => y - 1)) : setMonth(m => m - 1);
  const next = () => month === 11 ? (setMonth(0), setYear(y => y + 1)) : setMonth(m => m + 1);
  const goToday = () => { setYear(today.getFullYear()); setMonth(today.getMonth()); onSelectDate(new Date(today)); };

  const grid = buildGrid(year, month);

  return (
    <div className="cal-grid">
      <div className="cal-nav">
        <button className="nav-btn" onClick={prev}>‹</button>
        <span className="cal-title">{MONTHS[month]} {year}</span>
        <button className="nav-btn" onClick={next}>›</button>
        <button className="today-btn" onClick={goToday}>Today</button>
      </div>

      <div className="day-names">
        {DAYS.map(d => <div key={d} className="day-name">{d}</div>)}
      </div>

      <div className="day-grid">
        {grid.map((day, i) => {
          const inMonth = day.getMonth() === month;
          const isToday = sameDay(day, today);
          const isSelected = sameDay(day, selectedDate);
          const dayEvs = events.filter(e => overlapsDay(e, day));

          return (
            <div
              key={i}
              className={[
                'day-cell',
                inMonth ? '' : 'dim',
                isToday ? 'today' : '',
                isSelected ? 'selected' : '',
              ].filter(Boolean).join(' ')}
              onClick={() => onSelectDate(new Date(day))}
            >
              <span className="day-num">{day.getDate()}</span>
              {dayEvs.length > 0 && (
                <div className="ev-dots">
                  {dayEvs.slice(0, 3).map((e, j) => (
                    <span
                      key={j}
                      className="ev-dot"
                      style={{ background: CAL_COLORS[e.calendarIndex % CAL_COLORS.length] }}
                    />
                  ))}
                  {dayEvs.length > 3 && <span className="ev-dot-more" />}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

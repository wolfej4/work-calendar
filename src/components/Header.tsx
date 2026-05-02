import { useState, useEffect } from 'react';
import { AppSettings, CalendarEvent, WeatherData } from '../types';
import { getWeatherInfo } from '../utils/weatherCodes';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function formatTime(d: Date, use24: boolean, secs: boolean): string {
  const h = d.getHours();
  const m = d.getMinutes();
  const s = d.getSeconds();
  const hours = use24 ? h : h % 12 || 12;
  const ampm = use24 ? '' : h < 12 ? ' AM' : ' PM';
  return `${pad(hours)}:${pad(m)}${secs ? ':' + pad(s) : ''}${ampm}`;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

interface HeaderProps {
  settings: AppSettings;
  weather: WeatherData | null;
  nextEvent: CalendarEvent | undefined;
  onOpenSettings: () => void;
}

export default function Header({ settings, weather, nextEvent, onOpenSettings }: HeaderProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const minsUntil = nextEvent
    ? Math.round((nextEvent.start.getTime() - now.getTime()) / 60_000)
    : null;

  const isImminent = minsUntil !== null && minsUntil <= 15 && minsUntil > 0;

  return (
    <header className="header">
      <button className="settings-btn" onClick={onOpenSettings} title="Settings">
        ⚙
      </button>

      <div className="header-center">
        <div className="clock">{formatTime(now, settings.use24Hour, settings.showSeconds)}</div>
        <div className="date">{formatDate(now)}</div>
      </div>

      <div className="header-right">
        {nextEvent && minsUntil !== null && minsUntil > 0 && (
          <div className={`next-event-badge${isImminent ? ' imminent' : ''}`}>
            <span>{isImminent ? '⏰' : '📅'}</span>
            <span className="next-event-title">{nextEvent.title}</span>
            <span>in {minsUntil}m</span>
          </div>
        )}
        {weather && (
          <div className="weather-badge">
            {getWeatherInfo(weather.current.weatherCode).emoji}{' '}
            {weather.current.temperature}°{settings.temperatureUnit === 'fahrenheit' ? 'F' : 'C'}
          </div>
        )}
      </div>
    </header>
  );
}

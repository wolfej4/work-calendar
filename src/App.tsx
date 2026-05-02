import { useState } from 'react';
import { AppSettings, DEFAULT_SETTINGS } from './types';
import { useWakeLock } from './hooks/useWakeLock';
import { useCalendar } from './hooks/useCalendar';
import { useWeather } from './hooks/useWeather';
import Header from './components/Header';
import CalendarGrid from './components/CalendarGrid';
import AgendaList from './components/AgendaList';
import WeatherWidget from './components/WeatherWidget';
import TrafficWidget from './components/TrafficWidget';
import SettingsPanel from './components/SettingsPanel';

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem('wc-settings');
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return DEFAULT_SETTINGS;
}

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [settingsOpen, setSettingsOpen] = useState(() => loadSettings().calendars.length === 0);

  useWakeLock();

  const { events, loading, errors, refresh } = useCalendar(settings);
  const { weather, error: weatherError } = useWeather(settings);

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem('wc-settings', JSON.stringify(next));
      return next;
    });
  };

  const nextEvent = events.find(e => !e.isAllDay && e.start > new Date());

  return (
    <div className="app">
      <Header
        settings={settings}
        weather={weather}
        nextEvent={nextEvent}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <div className="main-grid">
        <aside className="panel-left">
          <CalendarGrid
            events={events}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </aside>

        <main className="panel-center">
          <AgendaList
            events={events}
            settings={settings}
            selectedDate={selectedDate}
            loading={loading}
            errors={errors}
            onRefresh={refresh}
          />
        </main>

        <aside className="panel-right">
          <WeatherWidget weather={weather} settings={settings} error={weatherError} />
          <TrafficWidget settings={settings} />
        </aside>
      </div>

      {settingsOpen && (
        <SettingsPanel
          settings={settings}
          onChange={updateSettings}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}

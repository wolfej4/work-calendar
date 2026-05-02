import { useState } from 'react';
import { useWakeLock } from './hooks/useWakeLock';
import { useCalendar } from './hooks/useCalendar';
import { useWeather } from './hooks/useWeather';
import { useSettings } from './hooks/useSettings';
import Header from './components/Header';
import CalendarGrid from './components/CalendarGrid';
import AgendaList from './components/AgendaList';
import WeatherWidget from './components/WeatherWidget';
import TrafficWidget from './components/TrafficWidget';
import SettingsPanel from './components/SettingsPanel';

export default function App() {
  const { settings, updateSettings, serverLoaded } = useSettings();
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Open settings automatically once we know there are no calendars configured
  const [autoOpened, setAutoOpened] = useState(false);
  if (serverLoaded && !autoOpened) {
    setAutoOpened(true);
    if (settings.calendars.length === 0) setSettingsOpen(true);
  }

  useWakeLock();

  const { events, loading, errors, refresh } = useCalendar(settings);
  const { weather, error: weatherError } = useWeather(settings);

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

import { useState } from 'react';
import { AppSettings, CalendarFeed } from '../types';

const COLORS = ['#4f9eff', '#57ab5a', '#c69026', '#e5534b', '#9f7efe', '#f76e8e', '#43c4b0'];

interface Props {
  settings: AppSettings;
  onChange: (updates: Partial<AppSettings>) => void;
  onClose: () => void;
}

export default function SettingsPanel({ settings, onChange, onClose }: Props) {
  const [calName, setCalName] = useState('');
  const [calUrl, setCalUrl] = useState('');
  const [calColor, setCalColor] = useState(COLORS[0]);

  const addCalendar = () => {
    if (!calUrl.trim()) return;
    const feed: CalendarFeed = { name: calName || 'Calendar', url: calUrl.trim(), color: calColor };
    onChange({ calendars: [...settings.calendars, feed] });
    setCalName('');
    setCalUrl('');
    setCalColor(COLORS[settings.calendars.length % COLORS.length]);
  };

  const removeCalendar = (i: number) =>
    onChange({ calendars: settings.calendars.filter((_, idx) => idx !== i) });

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={e => e.stopPropagation()}>
        <div className="sp-header">
          <h2>Settings</h2>
          <button className="sp-close" onClick={onClose}>✕</button>
        </div>

        <div className="sp-body">
          {/* ── Calendars ── */}
          <section className="sp-section">
            <h3>Calendar Feeds</h3>

            {settings.calendars.map((cal, i) => (
              <div key={i} className="cal-item">
                <span className="cal-dot" style={{ background: cal.color }} />
                <div className="cal-meta">
                  <div className="cal-name">{cal.name}</div>
                  <div className="cal-url" title={cal.url}>{cal.url}</div>
                </div>
                <button className="rm-btn" onClick={() => removeCalendar(i)}>✕</button>
              </div>
            ))}

            <div className="add-cal">
              <input
                className="sp-input"
                placeholder="Calendar name"
                value={calName}
                onChange={e => setCalName(e.target.value)}
              />
              <input
                className="sp-input"
                placeholder="iCal URL (https:// or webcal://)"
                value={calUrl}
                onChange={e => setCalUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCalendar()}
              />
              <div className="color-row">
                {COLORS.map(c => (
                  <button
                    key={c}
                    className={`color-swatch${calColor === c ? ' active' : ''}`}
                    style={{ background: c }}
                    onClick={() => setCalColor(c)}
                  />
                ))}
              </div>
              <button className="add-btn" onClick={addCalendar}>+ Add Calendar</button>
            </div>

            <div className="sp-field">
              <label>CORS Proxy</label>
              <input
                className="sp-input"
                placeholder="e.g. https://corsproxy.io/?"
                value={settings.corsProxy}
                onChange={e => onChange({ corsProxy: e.target.value })}
              />
              <span className="sp-hint">
                Required for most iCal URLs. Default uses corsproxy.io — you can self-host a proxy for privacy.
              </span>
            </div>
          </section>

          {/* ── Location ── */}
          <section className="sp-section">
            <h3>Location</h3>
            <div className="sp-row">
              <div className="sp-field">
                <label>Latitude</label>
                <input
                  className="sp-input"
                  type="number"
                  step="0.0001"
                  placeholder="51.5074"
                  value={settings.latitude ?? ''}
                  onChange={e => onChange({ latitude: e.target.value ? parseFloat(e.target.value) : null })}
                />
              </div>
              <div className="sp-field">
                <label>Longitude</label>
                <input
                  className="sp-input"
                  type="number"
                  step="0.0001"
                  placeholder="-0.1278"
                  value={settings.longitude ?? ''}
                  onChange={e => onChange({ longitude: e.target.value ? parseFloat(e.target.value) : null })}
                />
              </div>
            </div>
            <div className="sp-field">
              <label>Display name (optional)</label>
              <input
                className="sp-input"
                placeholder="e.g. London, UK"
                value={settings.locationName}
                onChange={e => onChange({ locationName: e.target.value })}
              />
            </div>
            <span className="sp-hint">Find coordinates at latlong.net — used for weather and traffic.</span>

            <div className="sp-field" style={{ marginTop: '12px' }}>
              <label>Traffic map zoom (1–18)</label>
              <input
                className="sp-input"
                type="number"
                min={1}
                max={18}
                value={settings.trafficZoom}
                onChange={e => onChange({ trafficZoom: parseInt(e.target.value) || 14 })}
              />
            </div>
          </section>

          {/* ── Display ── */}
          <section className="sp-section">
            <h3>Display</h3>

            <div className="sp-toggle">
              <label>24-hour clock</label>
              <input
                type="checkbox"
                checked={settings.use24Hour}
                onChange={e => onChange({ use24Hour: e.target.checked })}
              />
            </div>
            <div className="sp-toggle">
              <label>Show seconds</label>
              <input
                type="checkbox"
                checked={settings.showSeconds}
                onChange={e => onChange({ showSeconds: e.target.checked })}
              />
            </div>
            <div className="sp-field">
              <label>Temperature unit</label>
              <select
                className="sp-input"
                value={settings.temperatureUnit}
                onChange={e => onChange({ temperatureUnit: e.target.value as 'celsius' | 'fahrenheit' })}
              >
                <option value="celsius">Celsius (°C)</option>
                <option value="fahrenheit">Fahrenheit (°F)</option>
              </select>
            </div>
            <div className="sp-field">
              <label>Data refresh (minutes)</label>
              <input
                className="sp-input"
                type="number"
                min={1}
                max={60}
                value={settings.refreshIntervalMinutes}
                onChange={e => onChange({ refreshIntervalMinutes: parseInt(e.target.value) || 15 })}
              />
            </div>
          </section>
        </div>

        <div className="sp-footer">
          <button className="done-btn" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { AppSettings, CalendarFeed } from '../types';

const COLORS = ['#4f9eff', '#57ab5a', '#c69026', '#e5534b', '#9f7efe', '#f76e8e', '#43c4b0'];

interface Props {
  settings: AppSettings;
  onChange: (updates: Partial<AppSettings>) => void;
  onClose: () => void;
}

const BLANK_FEED = { name: '', url: '', color: COLORS[0], username: '', password: '' };

export default function SettingsPanel({ settings, onChange, onClose }: Props) {
  const [draft, setDraft] = useState({ ...BLANK_FEED });
  const [showAuth, setShowAuth] = useState(false);
  const [showICloudGuide, setShowICloudGuide] = useState(false);

  const updateDraft = (patch: Partial<typeof draft>) =>
    setDraft(prev => ({ ...prev, ...patch }));

  const addCalendar = () => {
    if (!draft.url.trim()) return;
    const feed: CalendarFeed = {
      name: draft.name || 'Calendar',
      url: draft.url.trim(),
      color: draft.color,
      ...(draft.username ? { username: draft.username.trim() } : {}),
      ...(draft.password ? { password: draft.password.trim() } : {}),
    };
    onChange({ calendars: [...settings.calendars, feed] });
    setDraft({ ...BLANK_FEED, color: COLORS[settings.calendars.length % COLORS.length] });
    setShowAuth(false);
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
            <div className="sp-section-title-row">
              <h3>Calendar Feeds</h3>
              <button
                className="icloud-guide-btn"
                onClick={() => setShowICloudGuide(v => !v)}
              >
                🍎 iCloud help
              </button>
            </div>

            {showICloudGuide && (
              <div className="icloud-guide">
                <p className="icloud-guide-heading">Option A — share link (recommended)</p>
                <p className="icloud-guide-hint">Your calendar stays private; the link contains a secret token.</p>
                <ol className="icloud-steps">
                  <li>Open <strong>Calendar</strong> on iPhone / iPad</li>
                  <li>Tap <strong>Calendars</strong> at the bottom</li>
                  <li>Tap <strong>ⓘ</strong> next to your calendar</li>
                  <li>Enable <strong>Public Calendar</strong></li>
                  <li>Tap <strong>Share Link</strong> → Copy</li>
                  <li>Paste the <code>webcal://</code> URL into the field below</li>
                </ol>
                <p className="icloud-guide-heading" style={{ marginTop: 10 }}>Option B — app-specific password</p>
                <p className="icloud-guide-hint">Keeps the calendar fully private; no sharing required.</p>
                <ol className="icloud-steps">
                  <li>Go to <strong>appleid.apple.com</strong> → Sign-In &amp; Security → App-Specific Passwords</li>
                  <li>Generate a password for "Work Calendar"</li>
                  <li>In Calendar on Mac, right-click your calendar → <strong>Get Info</strong> — copy the CalDAV URL shown</li>
                  <li>Enter that URL below, then expand <strong>Login details</strong> and enter your Apple ID email + the app-specific password</li>
                </ol>
              </div>
            )}

            {settings.calendars.map((cal, i) => (
              <div key={i} className="cal-item">
                <span className="cal-dot" style={{ background: cal.color }} />
                <div className="cal-meta">
                  <div className="cal-name">
                    {cal.name}
                    {cal.username && <span className="cal-auth-badge">🔒</span>}
                  </div>
                  <div className="cal-url" title={cal.url}>{cal.url}</div>
                </div>
                <button className="rm-btn" onClick={() => removeCalendar(i)}>✕</button>
              </div>
            ))}

            <div className="add-cal">
              <input
                className="sp-input"
                placeholder="Calendar name"
                value={draft.name}
                onChange={e => updateDraft({ name: e.target.value })}
              />
              <input
                className="sp-input"
                placeholder="iCal / webcal URL"
                value={draft.url}
                onChange={e => updateDraft({ url: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && addCalendar()}
              />

              <button
                className="auth-toggle"
                onClick={() => setShowAuth(v => !v)}
              >
                {showAuth ? '▾' : '▸'} Login details (iCloud Option B / private feeds)
              </button>

              {showAuth && (
                <div className="auth-fields">
                  <input
                    className="sp-input"
                    placeholder="Apple ID / username"
                    value={draft.username}
                    onChange={e => updateDraft({ username: e.target.value })}
                  />
                  <input
                    className="sp-input"
                    type="password"
                    placeholder="App-specific password"
                    value={draft.password}
                    onChange={e => updateDraft({ password: e.target.value })}
                  />
                </div>
              )}

              <div className="color-row">
                {COLORS.map(c => (
                  <button
                    key={c}
                    className={`color-swatch${draft.color === c ? ' active' : ''}`}
                    style={{ background: c }}
                    onClick={() => updateDraft({ color: c })}
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
                The default <code>/proxy/</code> uses the bundled proxy service — it runs on your
                own network so Apple and other providers won't block it. Only change this if you
                know what you're doing.
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

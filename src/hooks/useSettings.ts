import { useState, useEffect, useCallback } from 'react';
import { AppSettings, DEFAULT_SETTINGS } from '../types';

function fromStorage(): AppSettings {
  try {
    const raw = localStorage.getItem('wc-settings');
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return DEFAULT_SETTINGS;
}

function toStorage(s: AppSettings) {
  try { localStorage.setItem('wc-settings', JSON.stringify(s)); } catch { /* ignore */ }
}

async function loadFromServer(): Promise<AppSettings | null> {
  try {
    const res = await fetch('/api/settings');
    if (!res.ok) return null;
    const data = await res.json();
    return Object.keys(data).length ? { ...DEFAULT_SETTINGS, ...data } : null;
  } catch {
    return null;
  }
}

async function saveToServer(s: AppSettings): Promise<void> {
  try {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(s),
    });
  } catch { /* offline — localStorage is the fallback */ }
}

export function useSettings() {
  // Initialise instantly from localStorage so there's no blank flash
  const [settings, setSettings] = useState<AppSettings>(fromStorage);
  const [serverLoaded, setServerLoaded] = useState(false);

  // On first mount, pull the authoritative copy from the server
  useEffect(() => {
    loadFromServer().then(serverSettings => {
      if (serverSettings) {
        setSettings(serverSettings);
        toStorage(serverSettings);
      }
      setServerLoaded(true);
    });
  }, []);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...updates };
      toStorage(next);
      saveToServer(next);
      return next;
    });
  }, []);

  return { settings, updateSettings, serverLoaded };
}

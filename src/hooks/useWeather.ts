import { useState, useEffect, useCallback } from 'react';
import { WeatherData, AppSettings } from '../types';

export function useWeather(settings: AppSettings) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    const { latitude: lat, longitude: lon, temperatureUnit } = settings;
    if (!lat || !lon) return;

    const tempParam = temperatureUnit === 'fahrenheit' ? '&temperature_unit=fahrenheit' : '';
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,uv_index` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code` +
      `${tempParam}&timezone=auto&forecast_days=3`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const d = await res.json();

      setWeather({
        current: {
          temperature: Math.round(d.current.temperature_2m),
          humidity: d.current.relative_humidity_2m,
          windSpeed: Math.round(d.current.wind_speed_10m),
          uvIndex: Math.round(d.current.uv_index ?? 0),
          weatherCode: d.current.weather_code,
        },
        forecast: (d.daily.time as string[]).slice(0, 3).map((dateStr, i) => ({
          date: new Date(dateStr),
          maxTemp: Math.round(d.daily.temperature_2m_max[i]),
          minTemp: Math.round(d.daily.temperature_2m_min[i]),
          weatherCode: d.daily.weather_code[i],
          precipProbability: d.daily.precipitation_probability_max[i] ?? 0,
        })),
      });
      setError(null);
    } catch {
      setError('Unable to fetch weather');
    }
  }, [settings.latitude, settings.longitude, settings.temperatureUnit]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetch_();
    const id = setInterval(fetch_, settings.refreshIntervalMinutes * 60_000);
    return () => clearInterval(id);
  }, [fetch_, settings.refreshIntervalMinutes]);

  return { weather, error, refresh: fetch_ };
}

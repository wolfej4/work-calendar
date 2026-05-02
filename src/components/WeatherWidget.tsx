import { WeatherData, AppSettings } from '../types';
import { getWeatherInfo } from '../utils/weatherCodes';

const WEEKDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function uvLabel(uv: number): string {
  if (uv <= 2) return 'Low';
  if (uv <= 5) return 'Moderate';
  if (uv <= 7) return 'High';
  if (uv <= 10) return 'Very High';
  return 'Extreme';
}

interface Props {
  weather: WeatherData | null;
  settings: AppSettings;
  error: string | null;
}

export default function WeatherWidget({ weather, settings, error }: Props) {
  const unit = settings.temperatureUnit === 'fahrenheit' ? 'F' : 'C';

  if (!settings.latitude || !settings.longitude) {
    return (
      <div className="weather-widget placeholder">
        <span>🌤️</span>
        <p>Add location in settings to see weather</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weather-widget placeholder">
        <span>⚠️</span>
        <p>{error}</p>
      </div>
    );
  }

  if (!weather) {
    return <div className="weather-widget placeholder">Loading weather…</div>;
  }

  const { current, forecast } = weather;
  const info = getWeatherInfo(current.weatherCode);

  return (
    <div className="weather-widget">
      {settings.locationName && (
        <div className="w-location">📍 {settings.locationName}</div>
      )}

      <div className="w-current">
        <span className="w-emoji">{info.emoji}</span>
        <div>
          <div className="w-temp">{current.temperature}°{unit}</div>
          <div className="w-desc">{info.description}</div>
        </div>
      </div>

      <div className="w-details">
        <div className="w-detail"><span>Humidity</span><strong>{current.humidity}%</strong></div>
        <div className="w-detail"><span>Wind</span><strong>{current.windSpeed} km/h</strong></div>
        <div className="w-detail"><span>UV</span><strong>{uvLabel(current.uvIndex)}</strong></div>
      </div>

      <div className="w-forecast">
        {forecast.map((day, i) => (
          <div key={i} className="fc-day">
            <div className="fc-name">{i === 0 ? 'Today' : WEEKDAY[day.date.getDay()]}</div>
            <div className="fc-emoji">{getWeatherInfo(day.weatherCode).emoji}</div>
            <div className="fc-temps">
              <span className="fc-hi">{day.maxTemp}°</span>
              <span className="fc-lo">{day.minTemp}°</span>
            </div>
            {day.precipProbability > 0 && (
              <div className="fc-precip">💧{day.precipProbability}%</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

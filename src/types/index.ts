export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
  isAllDay: boolean;
  calendarIndex: number;
}

export interface CalendarFeed {
  url: string;
  name: string;
  color: string;
  username?: string;
  password?: string;
}

export interface AppSettings {
  calendars: CalendarFeed[];
  corsProxy: string;
  latitude: number | null;
  longitude: number | null;
  locationName: string;
  trafficLat: number | null;
  trafficLon: number | null;
  trafficZoom: number;
  refreshIntervalMinutes: number;
  use24Hour: boolean;
  showSeconds: boolean;
  temperatureUnit: 'celsius' | 'fahrenheit';
}

export const DEFAULT_SETTINGS: AppSettings = {
  calendars: [],
  corsProxy: '/proxy/',
  latitude: null,
  longitude: null,
  locationName: '',
  trafficLat: null,
  trafficLon: null,
  trafficZoom: 14,
  refreshIntervalMinutes: 15,
  use24Hour: true,
  showSeconds: true,
  temperatureUnit: 'celsius',
};

export interface WeatherCurrent {
  temperature: number;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  weatherCode: number;
}

export interface ForecastDay {
  date: Date;
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
  precipProbability: number;
}

export interface WeatherData {
  current: WeatherCurrent;
  forecast: ForecastDay[];
}

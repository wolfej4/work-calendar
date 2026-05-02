import { AppSettings } from '../types';

interface Props {
  settings: AppSettings;
}

export default function TrafficWidget({ settings }: Props) {
  const lat = settings.trafficLat ?? settings.latitude;
  const lon = settings.trafficLon ?? settings.longitude;

  if (!lat || !lon) {
    return (
      <div className="traffic-widget placeholder">
        <span>🗺️</span>
        <p>Add location in settings to see traffic</p>
      </div>
    );
  }

  const src = `https://embed.waze.com/iframe?zoom=${settings.trafficZoom}&lat=${lat}&lon=${lon}&ct=livemap`;

  return (
    <div className="traffic-widget">
      <iframe
        src={src}
        title="Live traffic"
        className="traffic-iframe"
        allowFullScreen
      />
    </div>
  );
}

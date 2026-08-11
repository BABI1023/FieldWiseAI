/** Displays localized meteorological data and safe operating windows */
'use client';

import { CloudRain, Wind, Droplets, Thermometer, MapPin, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { weatherCodeLabel, formatTime } from '@/lib/weather';
import type { WeatherForecast, SafeWindow } from '@/lib/types';

interface WeatherCardProps {
  forecast: WeatherForecast;
  safeWindow: SafeWindow;
  locationLabel: string;
}

export function WeatherCard({ forecast, safeWindow, locationLabel }: WeatherCardProps) {
  const { current } = forecast;

  const stats = [
    {
      icon: Thermometer,
      label: 'Temperature',
      value: `${Math.round(current.temperature)}°C`,
    },
    {
      icon: Wind,
      label: 'Wind',
      value: `${Math.round(current.windspeed)} km/h`,
    },
    {
      icon: Droplets,
      label: 'Humidity',
      value: `${current.humidity}%`,
    },
    {
      icon: CloudRain,
      label: 'Rain now',
      value: `${current.precipitation} mm`,
    },
  ];

  return (
    <section
      aria-labelledby="weather-heading"
      className="rounded-xl border border-field-weather/30 bg-card/60 p-5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-field-weather" aria-hidden="true" />
          <h2 id="weather-heading" className="text-sm font-semibold text-foreground">
            {locationLabel}
          </h2>
        </div>
        <Badge
          variant="outline"
          className="border-field-weather/40 text-field-weather"
        >
          {weatherCodeLabel(current.weathercode)}
        </Badge>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-lg bg-background/40 px-3 py-2.5"
          >
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <s.icon className="h-3.5 w-3.5 text-field-weather" aria-hidden="true" />
              {s.label}
            </div>
            <dd className="mt-1 text-base font-semibold text-foreground">
              {s.value}
            </dd>
          </div>
        ))}
      </dl>

      <div
        className={`mt-4 rounded-lg border p-3 ${
          safeWindow.recommended
            ? 'border-field-healthy/30 bg-field-healthy/10'
            : 'border-field-issue/30 bg-field-issue/10'
        }`}
      >
        <div className="flex items-start gap-2">
          <Clock
            className={`mt-0.5 h-4 w-4 shrink-0 ${
              safeWindow.recommended ? 'text-field-healthy' : 'text-field-issue'
            }`}
            aria-hidden="true"
          />
          <div>
            <p className="text-sm font-medium text-foreground">
              {safeWindow.recommended ? 'Safe to treat now' : 'Wait before treating'}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {safeWindow.reason}
            </p>
            {safeWindow.windowStart && safeWindow.windowEnd && (
              <p className="mt-1 text-xs text-muted-foreground">
                Dry window: {formatTime(safeWindow.windowStart)} —{' '}
                {formatTime(safeWindow.windowEnd)}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

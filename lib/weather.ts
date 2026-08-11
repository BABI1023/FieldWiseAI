import type { SafeWindow, WeatherForecast, WeatherHour } from './types';

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';

export async function fetchWeather(lat: number, lon: number): Promise<WeatherForecast> {
  const params = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lon.toFixed(4),
    current: 'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,is_day',
    hourly: 'precipitation_probability,precipitation,wind_speed_10m,temperature_2m',
    forecast_days: '3',
    timezone: 'auto',
  });

  const res = await fetch(`${OPEN_METEO_URL}?${params.toString()}`);
  if (!res.ok) throw new Error(`Weather request failed (${res.status})`);
  const data = await res.json();

  const current = data.current;
  const hourlyTimes: string[] = data.hourly.time;
  const hourly: WeatherHour[] = hourlyTimes.map((time, i) => ({
    time,
    precipitationProbability: data.hourly.precipitation_probability[i] ?? 0,
    precipitation: data.hourly.precipitation[i] ?? 0,
    windspeed: data.hourly.wind_speed_10m[i] ?? 0,
    temperature: data.hourly.temperature_2m[i] ?? 0,
  }));

  return {
    current: {
      temperature: current.temperature_2m,
      windspeed: current.wind_speed_10m,
      humidity: current.relative_humidity_2m,
      precipitation: current.precipitation,
      weathercode: current.weather_code,
      isDay: current.is_day === 1,
      time: current.time,
    },
    hourly,
    timezone: data.timezone,
  };
}

function isRainHour(h: WeatherHour): boolean {
  return h.precipitation > 0.5 || h.precipitationProbability > 50;
}

export function computeSafeWindow(forecast: WeatherForecast, now: Date = new Date()): SafeWindow {
  const nowMs = now.getTime();
  const upcoming = forecast.hourly.filter((h) => new Date(h.time).getTime() >= nowMs - 3600000);

  if (upcoming.length === 0) {
    return {
      recommended: false,
      windowStart: null,
      windowEnd: null,
      reason: 'No forecast data available for the coming hours.',
      dryHours: 0,
      nextRainHour: null,
    };
  }

  const firstRainIdx = upcoming.findIndex(isRainHour);
  const currentlyRaining = firstRainIdx === 0;

  if (currentlyRaining) {
    const nextRain = upcoming[0];
    let dryStartIdx = -1;
    for (let i = 1; i < upcoming.length; i++) {
      if (!isRainHour(upcoming[i])) {
        dryStartIdx = i;
        break;
      }
    }
    if (dryStartIdx === -1) {
      return {
        recommended: false,
        windowStart: null,
        windowEnd: null,
        reason: 'Rain is expected for the next 48 hours. Wait for a dry window before treating.',
        dryHours: 0,
        nextRainHour: nextRain.time,
      };
    }
    let dryEnd = dryStartIdx;
    for (let i = dryStartIdx; i < upcoming.length; i++) {
      if (isRainHour(upcoming[i])) break;
      dryEnd = i;
    }
    const dryHours = dryEnd - dryStartIdx + 1;
    return {
      recommended: dryHours >= 6,
      windowStart: upcoming[dryStartIdx].time,
      windowEnd: upcoming[dryEnd].time,
      reason:
        dryHours >= 6
          ? `Rain now, but a dry window of ${dryHours} hours opens at ${formatTime(upcoming[dryStartIdx].time)}. Treat then.`
          : `Rain now, and only ${dryHours} dry hour(s) follow. Too short to treat safely.`,
      dryHours,
      nextRainHour: nextRain.time,
    };
  }

  if (firstRainIdx === -1) {
    return {
      recommended: true,
      windowStart: upcoming[0].time,
      windowEnd: upcoming[upcoming.length - 1].time,
      reason: 'No rain expected in the next 48 hours. Conditions are safe to treat now.',
      dryHours: upcoming.length,
      nextRainHour: null,
    };
  }

  const dryHours = firstRainIdx;
  const nextRain = upcoming[firstRainIdx];
  return {
    recommended: dryHours >= 6,
    windowStart: upcoming[0].time,
    windowEnd: nextRain.time,
    reason:
      dryHours >= 6
        ? `${dryHours} dry hours ahead before rain at ${formatTime(nextRain.time)}. Safe to treat now.`
        : `Only ${dryHours} dry hour(s) before rain at ${formatTime(nextRain.time)}. Wait for a longer window.`,
    dryHours,
    nextRainHour: nextRain.time,
  };
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function weatherCodeLabel(code: number): string {
  const map: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Severe thunderstorm with hail',
  };
  return map[code] ?? 'Unknown';
}

export type IssueCategory = 'healthy' | 'fungal' | 'bacterial' | 'nutrient';

export interface PixelRatios {
  green: number;
  brown: number;
  yellow: number;
  dark: number;
  sampledPixels: number;
}

export interface SeverityResult {
  severityScore: number;
  category: IssueCategory;
  confidence: number;
  ratios: PixelRatios;
  label: string;
}

export interface WeatherCurrent {
  temperature: number;
  windspeed: number;
  humidity: number;
  precipitation: number;
  weathercode: number;
  isDay: boolean;
  time: string;
}

export interface WeatherHour {
  time: string;
  precipitationProbability: number;
  precipitation: number;
  windspeed: number;
  temperature: number;
}

export interface WeatherForecast {
  current: WeatherCurrent;
  hourly: WeatherHour[];
  timezone: string;
}

export interface SafeWindow {
  recommended: boolean;
  windowStart: string | null;
  windowEnd: string | null;
  reason: string;
  dryHours: number;
  nextRainHour: string | null;
}

export interface Advisory {
  severity: SeverityResult;
  weather: WeatherForecast | null;
  safeWindow: SafeWindow | null;
  locationLabel: string;
}

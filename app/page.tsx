'use client';

import { useCallback, useState } from 'react';
import { Header } from '@/components/fieldwise/header';
import { UploadPanel } from '@/components/fieldwise/upload-panel';
import { AdvisoryCard } from '@/components/fieldwise/advisory-card';
import { WeatherCard } from '@/components/fieldwise/weather-card';
import { computeRatios, scoreSeverity } from '@/lib/leaf-analysis';
import { fetchWeather, computeSafeWindow } from '@/lib/weather';
import type { Advisory, SeverityResult, WeatherForecast, SafeWindow } from '@/lib/types';
import { Leaf, MapPinOff, AlertCircle } from 'lucide-react';

type Phase = 'idle' | 'analyzing' | 'done' | 'error';

export default function Home() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [advisory, setAdvisory] = useState<Advisory | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const analyzeImage = (file: File): Promise<SeverityResult> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const maxDim = 240;
          const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas not supported in this browser.'));
            return;
          }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const ratios = computeRatios(imageData.data);
          const severity = scoreSeverity(ratios);
          resolve(severity);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('Could not load the image.'));
      img.src = URL.createObjectURL(file);
    });
  };

  const getLocationAndWeather = async (): Promise<{
    weather: WeatherForecast | null;
    safeWindow: SafeWindow | null;
    locationLabel: string;
  }> => {
    if (!('geolocation' in navigator)) {
      return {
        weather: null,
        safeWindow: null,
        locationLabel: 'Location unavailable',
      };
    }

    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 10000,
        enableHighAccuracy: false,
      });
    }).catch(() => null);

    if (!position) {
      return {
        weather: null,
        safeWindow: null,
        locationLabel: 'Location permission denied',
      };
    }

    const { latitude, longitude } = position.coords;
    let locationLabel = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;

    try {
      const weather = await fetchWeather(latitude, longitude);
      const safeWindow = computeSafeWindow(weather);
      if (weather.timezone) {
        locationLabel = `${latitude.toFixed(2)}, ${longitude.toFixed(2)} — ${weather.timezone}`;
      }
      return { weather, safeWindow, locationLabel };
    } catch {
      return { weather: null, safeWindow: null, locationLabel };
    }
  };

  const handleFile = useCallback(async (file: File, preview: string) => {
    setPhase('analyzing');
    setErrorMsg(null);
    setPreviewUrl(preview);
    setAdvisory(null);

    try {
      const severity = await analyzeImage(file);
      const { weather, safeWindow, locationLabel } = await getLocationAndWeather();
      setAdvisory({ severity, weather, safeWindow, locationLabel });
      setPhase('done');
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Something went wrong during analysis.'
      );
      setPhase('error');
    }
  }, []);

  const handleReset = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPhase('idle');
    setPreviewUrl(null);
    setAdvisory(null);
    setErrorMsg(null);
  }, [previewUrl]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8 sm:mb-10">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Turn a leaf photo into a clear advisory
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Upload a photo of your crop&apos;s leaf. Fieldwise analyzes it
            client-side, checks live weather for your location, and tells you
            what may be wrong, how to treat it, and the safest time to act.
          </p>
        </div>

        {phase === 'idle' && (
          <div className="mx-auto max-w-xl">
            <UploadPanel onFileSelected={handleFile} loading={false} />
            <div className="mt-6 rounded-lg border border-border bg-card/30 p-4">
              <h3 className="text-sm font-medium text-foreground">How it works</h3>
              <ol className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                <li>1. Upload a clear photo of an affected leaf.</li>
                <li>2. Allow location access for live weather and forecast.</li>
                <li>3. Get a severity score, likely issue, and safe weather window.</li>
              </ol>
              <p className="mt-3 text-xs text-muted-foreground">
                Fieldwise runs entirely in your browser. No account, no API
                keys, no data stored.
              </p>
            </div>
          </div>
        )}

        {phase === 'analyzing' && (
          <div className="mx-auto max-w-xl">
            <UploadPanel onFileSelected={handleFile} loading={true} />
            {previewUrl && (
              <div className="mt-4 overflow-hidden rounded-lg border border-border">
                <img
                  src={previewUrl}
                  alt="Your uploaded leaf photo"
                  className="h-48 w-full object-cover"
                />
              </div>
            )}
          </div>
        )}

        {phase === 'error' && (
          <div className="mx-auto max-w-xl">
            <div
              role="alert"
              className="flex items-start gap-3 rounded-lg border border-field-issue/30 bg-field-issue/10 p-4"
            >
              <AlertCircle
                className="mt-0.5 h-5 w-5 shrink-0 text-field-issue"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Analysis failed
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {errorMsg}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="mt-4 text-sm font-medium text-field-weather underline-offset-4 hover:underline focus-ring rounded"
            >
              Try again
            </button>
          </div>
        )}

        {phase === 'done' && advisory && (
          <div className="space-y-5">
            <AdvisoryCard
              severity={advisory.severity}
              safeWindow={advisory.safeWindow}
              weather={advisory.weather}
              previewUrl={previewUrl || ''}
              onReset={handleReset}
            />

            {advisory.weather && advisory.safeWindow ? (
              <WeatherCard
                forecast={advisory.weather}
                safeWindow={advisory.safeWindow}
                locationLabel={advisory.locationLabel}
              />
            ) : (
              <div className="flex items-start gap-3 rounded-lg border border-border bg-card/30 p-4">
                <MapPinOff
                  className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Weather unavailable
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Location access was denied or the weather service could not
                    be reached. You still have your leaf analysis above.
                  </p>
                </div>
              </div>
            )}

            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Leaf className="h-3.5 w-3.5 text-field-healthy" aria-hidden="true" />
              Fieldwise provides an estimate, not a confirmed diagnosis. For
              commercial decisions, consult a local agronomist.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

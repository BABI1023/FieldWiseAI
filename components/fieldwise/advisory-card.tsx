/** Renders actionable agricultural advice based on multimodal analysis */
'use client';

import { AlertTriangle, CheckCircle2, Leaf, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CATEGORY_ADVICE } from '@/lib/leaf-analysis';
import type { SeverityResult, SafeWindow, WeatherForecast } from '@/lib/types';
import { formatTime } from '@/lib/weather';

interface AdvisoryCardProps {
  severity: SeverityResult;
  safeWindow: SafeWindow | null;
  weather: WeatherForecast | null;
  previewUrl: string;
  onReset: () => void;
}

function severityLabel(score: number): { label: string; tone: 'healthy' | 'issue' } {
  if (score < 40) return { label: 'Mild', tone: 'healthy' };
  if (score < 70) return { label: 'Moderate', tone: 'issue' };
  return { label: 'Severe', tone: 'issue' };
}

export function AdvisoryCard({
  severity,
  safeWindow,
  weather,
  previewUrl,
  onReset,
}: AdvisoryCardProps) {
  const isHealthy = severity.category === 'healthy';
  const sev = severityLabel(severity.severityScore);

  const containerClass = isHealthy
    ? 'rounded-xl border bg-card/60 p-5 sm:p-6 border-field-healthy/30'
    : 'rounded-xl border bg-card/60 p-5 sm:p-6 border-field-issue/30';

  const badgeClass = isHealthy
    ? 'border-field-healthy/40 text-field-healthy'
    : 'border-field-issue/40 text-field-issue';

  const barClass = isHealthy ? 'bg-field-healthy' : 'bg-field-issue';

  return (
    <article aria-labelledby="advisory-heading" className={containerClass}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="sm:w-40 sm:shrink-0">
          <div className="overflow-hidden rounded-lg border border-border">
            <img
              src={previewUrl}
              alt="Your uploaded leaf photo"
              className="h-40 w-full object-cover sm:h-32"
            />
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              {isHealthy ? (
                <CheckCircle2 className="h-5 w-5 text-field-healthy" aria-hidden="true" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-field-issue" aria-hidden="true" />
              )}
              <h2 id="advisory-heading" className="text-base font-semibold text-foreground">
                {isHealthy ? 'Crop looks healthy' : 'Likely issue detected'}
              </h2>
            </div>
            <Badge variant="outline" className={badgeClass}>
              {sev.label}
            </Badge>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Likely issue
            </p>
            <p className="mt-0.5 text-sm font-medium text-foreground">
              {severity.label}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Confidence: {severity.confidence}% — this is an estimate, not a
              confirmed diagnosis.
            </p>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Severity score
            </p>
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-background/60"
              role="progressbar"
              aria-valuenow={severity.severityScore}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Severity score"
            >
              <div
                className={`h-full rounded-full transition-all duration-500 ${barClass}`}
                style={{ width: `${severity.severityScore}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {severity.severityScore} / 100
            </p>
          </div>

          <div className="rounded-lg bg-background/40 p-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
              <Leaf className="h-3.5 w-3.5 text-field-healthy" aria-hidden="true" />
              Treatment advice
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {CATEGORY_ADVICE[severity.category]}
            </p>
          </div>

          {safeWindow && weather && (
            <div className="rounded-lg bg-background/40 p-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                <Sparkles className="h-3.5 w-3.5 text-field-weather" aria-hidden="true" />
                When to act
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {safeWindow.reason}
              </p>
              {safeWindow.windowStart && safeWindow.windowEnd && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Dry window: {formatTime(safeWindow.windowStart)} —{' '}
                  {formatTime(safeWindow.windowEnd)}
                </p>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={onReset}
            className="text-xs font-medium text-field-weather underline-offset-4 hover:underline focus-ring rounded"
          >
            Analyze another photo
          </button>
        </div>
      </div>
    </article>
  );
}

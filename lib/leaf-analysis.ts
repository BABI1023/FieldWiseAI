/** Core leaf pathology analyzer for precision agriculture */
import type { IssueCategory, PixelRatios, SeverityResult } from './types';

export const CATEGORY_LABELS: Record<IssueCategory, string> = {
  healthy: 'Healthy foliage',
  fungal: 'Fungal infection (leaf spot / rust)',
  bacterial: 'Bacterial infection (bacterial spot)',
  nutrient: 'Nutrient deficiency (chlorosis)',
};

export const CATEGORY_ADVICE: Record<IssueCategory, string> = {
  healthy:
    'No significant damage detected. Keep up regular watering and monitor for changes over the coming days.',
  fungal:
    'Remove and destroy affected leaves to stop spores spreading. Apply a copper-based or sulphur fungicide, and avoid wetting the foliage when watering.',
  bacterial:
    'Prune out affected areas with sterilised tools. Apply a copper bactericide and rotate crops next season to break the disease cycle.',
  nutrient:
    'Apply a balanced fertiliser or the specific nutrient the deficiency suggests (commonly nitrogen or iron). Test your soil to confirm before treating.',
};

function classifyPixel(r: number, g: number, b: number): 'green' | 'brown' | 'yellow' | 'dark' | 'other' {
  const brightness = (r + g + b) / 3;
  if (brightness < 45) return 'dark';
  if (g > r && g > b && g - Math.max(r, b) > 18) return 'green';
  if (r > 140 && g > 140 && b < 125 && r >= g - 5) return 'yellow';
  if (r > 110 && g > 55 && g < r && b < g && r - b > 28) return 'brown';
  return 'other';
}

export function computeRatios(pixels: Uint8ClampedArray | number[]): PixelRatios {
  let green = 0;
  let brown = 0;
  let yellow = 0;
  let dark = 0;
  let other = 0;
  const total = pixels.length;

  for (let i = 0; i < total; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    if (r === undefined || g === undefined || b === undefined) continue;
    const cls = classifyPixel(r, g, b);
    if (cls === 'green') green++;
    else if (cls === 'brown') brown++;
    else if (cls === 'yellow') yellow++;
    else if (cls === 'dark') dark++;
    else other++;
  }

  const sampled = green + brown + yellow + dark + other;
  const denom = sampled || 1;
  return {
    green: green / denom,
    brown: brown / denom,
    yellow: yellow / denom,
    dark: dark / denom,
    sampledPixels: sampled,
  };
}

function pickCategory(ratios: PixelRatios): IssueCategory {
  const issueRatio = ratios.brown + ratios.yellow + ratios.dark;
  if (issueRatio < 0.12 && ratios.green > 0.7) return 'healthy';
  if (ratios.dark >= ratios.brown && ratios.dark >= ratios.yellow) return 'bacterial';
  if (ratios.brown >= ratios.yellow) return 'fungal';
  return 'nutrient';
}

export function scoreSeverity(ratios: PixelRatios): SeverityResult {
  const issueRatio = ratios.brown + ratios.yellow + ratios.dark;
  const severityScore = Math.min(
    100,
    Math.round(ratios.brown * 100 + ratios.yellow * 70 + ratios.dark * 90)
  );

  const category = pickCategory(ratios);

  let confidence: number;
  if (category === 'healthy') {
    confidence = Math.min(95, Math.round(ratios.green * 100));
  } else {
    const dominantIssue = Math.max(ratios.brown, ratios.yellow, ratios.dark);
    const dominantShare = issueRatio > 0 ? dominantIssue / issueRatio : 0;
    confidence = Math.min(95, Math.round(issueRatio * 100 + dominantShare * 30));
  }

  const label = `${CATEGORY_LABELS[category]}`;

  return {
    severityScore,
    category,
    confidence,
    ratios,
    label,
  };
}

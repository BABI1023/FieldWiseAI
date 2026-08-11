import { describe, it, expect } from 'vitest';
import { computeRatios, scoreSeverity } from './leaf-analysis';
import type { PixelRatios } from './types';

function makePixels(r: number, g: number, b: number, count: number): number[] {
  const arr: number[] = [];
  for (let i = 0; i < count; i++) arr.push(r, g, b, 255);
  return arr;
}

function ratio(green: number, brown: number, yellow: number, dark: number): PixelRatios {
  const total = green + brown + yellow + dark || 1;
  return {
    green: green / total,
    brown: brown / total,
    yellow: yellow / total,
    dark: dark / total,
    sampledPixels: total,
  };
}

describe('computeRatios', () => {
  it('classifies a fully green image as 100% green', () => {
    const pixels = makePixels(40, 140, 50, 100);
    const r = computeRatios(pixels);
    expect(r.green).toBeCloseTo(1, 1);
    expect(r.brown).toBeCloseTo(0, 1);
    expect(r.yellow).toBeCloseTo(0, 1);
    expect(r.dark).toBeCloseTo(0, 1);
  });

  it('classifies brown pixels correctly', () => {
    const pixels = makePixels(160, 90, 40, 100);
    const r = computeRatios(pixels);
    expect(r.brown).toBeCloseTo(1, 1);
  });

  it('classifies yellow pixels correctly', () => {
    const pixels = makePixels(220, 200, 60, 100);
    const r = computeRatios(pixels);
    expect(r.yellow).toBeCloseTo(1, 1);
  });

  it('classifies dark pixels correctly', () => {
    const pixels = makePixels(20, 20, 20, 100);
    const r = computeRatios(pixels);
    expect(r.dark).toBeCloseTo(1, 1);
  });

  it('handles mixed pixels', () => {
    const green = makePixels(40, 140, 50, 60);
    const brown = makePixels(160, 90, 40, 40);
    const r = computeRatios([...green, ...brown]);
    expect(r.green).toBeCloseTo(0.6, 1);
    expect(r.brown).toBeCloseTo(0.4, 1);
  });
});

describe('scoreSeverity', () => {
  it('returns healthy category and low score for mostly green', () => {
    const r = scoreSeverity(ratio(90, 5, 3, 2));
    expect(r.category).toBe('healthy');
    expect(r.severityScore).toBeLessThan(15);
    expect(r.confidence).toBeGreaterThan(70);
  });

  it('returns fungal category when brown dominates', () => {
    const r = scoreSeverity(ratio(30, 50, 15, 5));
    expect(r.category).toBe('fungal');
    expect(r.severityScore).toBeGreaterThan(40);
    expect(r.confidence).toBeGreaterThan(0);
    expect(r.confidence).toBeLessThanOrEqual(95);
  });

  it('returns nutrient category when yellow dominates', () => {
    const r = scoreSeverity(ratio(30, 10, 55, 5));
    expect(r.category).toBe('nutrient');
    expect(r.severityScore).toBeGreaterThan(30);
  });

  it('returns bacterial category when dark dominates', () => {
    const r = scoreSeverity(ratio(20, 10, 10, 60));
    expect(r.category).toBe('bacterial');
    expect(r.severityScore).toBeGreaterThan(40);
  });

  it('caps severity score at 100', () => {
    const r = scoreSeverity(ratio(0, 100, 0, 0));
    expect(r.severityScore).toBeLessThanOrEqual(100);
  });

  it('caps confidence at 95', () => {
    const r = scoreSeverity(ratio(0, 100, 0, 0));
    expect(r.confidence).toBeLessThanOrEqual(95);
  });

  it('produces a human-readable label', () => {
    const r = scoreSeverity(ratio(90, 5, 3, 2));
    expect(r.label).toBe('Healthy foliage');
  });
});
it('rejects oversized files above maximum limit', () => {
  const hugeFile = makeFile('image/jpeg', 15 * 1024 * 1024);
  const result = validateImageFile(hugeFile);
  expect(result.valid).toBe(false);
});

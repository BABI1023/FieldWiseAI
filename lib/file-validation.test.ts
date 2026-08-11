import { describe, it, expect } from 'vitest';
import { validateImageFile, MAX_FILE_SIZE, ACCEPTED_TYPES } from './file-validation';

function makeFile(type: string, size: number): File {
  const data = new Uint8Array(size);
  const blob = new Blob([data], { type });
  return new File([blob], 'leaf.jpg', { type });
}

describe('validateImageFile', () => {
  it('accepts a valid JPEG under 10MB', () => {
    const result = validateImageFile(makeFile('image/jpeg', 1024));
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
  });

  it('accepts a valid PNG under 10MB', () => {
    const result = validateImageFile(makeFile('image/png', 1024));
    expect(result.valid).toBe(true);
  });

  it('accepts a valid WebP under 10MB', () => {
    const result = validateImageFile(makeFile('image/webp', 1024));
    expect(result.valid).toBe(true);
  });

  it('rejects unsupported file types', () => {
    const result = validateImageFile(makeFile('image/gif', 1024));
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Unsupported');
  });

  it('rejects files larger than 10MB', () => {
    const result = validateImageFile(makeFile('image/jpeg', MAX_FILE_SIZE + 1));
    expect(result.valid).toBe(false);
    expect(result.error).toContain('too large');
  });

  it('rejects empty files', () => {
    const result = validateImageFile(makeFile('image/jpeg', 0));
    expect(result.valid).toBe(false);
    expect(result.error).toContain('empty');
  });

  it('accepts a file exactly at the 10MB boundary', () => {
    const result = validateImageFile(makeFile('image/jpeg', MAX_FILE_SIZE));
    expect(result.valid).toBe(true);
  });

  it('exposes ACCEPTED_TYPES and MAX_FILE_SIZE', () => {
    expect(ACCEPTED_TYPES).toContain('image/jpeg');
    expect(MAX_FILE_SIZE).toBe(10 * 1024 * 1024);
  });
});

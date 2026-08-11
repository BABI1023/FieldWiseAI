export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export interface ValidationResult {
  valid: boolean;
  error: string | null;
}

export function validateImageFile(file: File): ValidationResult {
  if (!file) return { valid: false, error: 'No file selected.' };
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Unsupported file type. Please upload a JPG, PNG, or WebP image.',
    };
  }
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'File is too large. Maximum size is 10 MB.',
    };
  }
  if (file.size === 0) {
    return { valid: false, error: 'The selected file is empty.' };
  }
  return { valid: true, error: null };
}

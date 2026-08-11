'use client';

import { useRef, useState } from 'react';
import { Upload, ImagePlus, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { validateImageFile, ACCEPTED_TYPES, MAX_FILE_SIZE } from '@/lib/file-validation';

interface UploadPanelProps {
  onFileSelected: (file: File, previewUrl: string) => void;
  loading: boolean;
}

export function UploadPanel({ onFileSelected, loading }: UploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  function handleFiles(files: FileList | null) {
    setError(null);
    if (!files || files.length === 0) return;
    const file = files[0];
    const result = validateImageFile(file);
    if (!result.valid) {
      setError(result.error);
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    onFileSelected(file, previewUrl);
  }

  return (
    <div className="space-y-3">
      <div
        role="region"
        aria-label="Leaf photo upload"
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
          dragging
            ? 'border-field-healthy bg-field-healthy/5'
            : 'border-border bg-card/30 hover:border-field-healthy/50'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
          aria-label="Upload a leaf photo"
          aria-invalid={!!error}
        />
        <div
          className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-field-healthy/10"
          aria-hidden="true"
        >
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin text-field-healthy" />
          ) : (
            <ImagePlus className="h-6 w-6 text-field-healthy" />
          )}
        </div>
        <p className="text-sm font-medium text-foreground">
          {loading ? 'Analyzing photo…' : 'Upload a leaf photo'}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Drag & drop or browse. JPG, PNG, or WebP up to 10&nbsp;MB.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
        >
          <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
          Choose photo
        </Button>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-field-issue/30 bg-field-issue/10 px-3 py-2 text-sm text-foreground"
        >
          <AlertCircle
            className="mt-0.5 h-4 w-4 shrink-0 text-field-issue"
            aria-hidden="true"
          />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

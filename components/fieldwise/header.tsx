import { Leaf } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4 sm:px-6">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-field-healthy/15 ring-1 ring-field-healthy/30"
          aria-hidden="true"
        >
          <Leaf className="h-5 w-5 text-field-healthy" />
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            Fieldwise
          </h1>
          <p className="text-xs text-muted-foreground">
            Photo-driven crop advisory
          </p>
        </div>
      </div>
    </header>
  );
}

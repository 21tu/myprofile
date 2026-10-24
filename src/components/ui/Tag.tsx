import type { ReactNode } from 'react';
export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded-full border border-accent/15 bg-navy-950 px-3 py-1 text-ink-muted">
      {children}
    </span>
  );
}

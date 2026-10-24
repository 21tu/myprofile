import type { ReactNode } from 'react';
export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded-full border border-line bg-bg px-3 py-1 text-ink-muted">
      {children}
    </span>
  );
}

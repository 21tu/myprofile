import type { ReactNode } from 'react';
export function Card({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`card rounded-2xl border border-accent/15 bg-navy-800 p-6 ${className}`}
    >
      {children}
    </div>
  );
}

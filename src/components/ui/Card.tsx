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
      className={`card rounded-2xl border border-line bg-card p-6 ${className}`}
    >
      {children}
    </div>
  );
}

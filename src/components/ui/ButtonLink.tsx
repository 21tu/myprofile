import type { ReactNode } from 'react';
import { ExternalLink } from 'lucide-react';
export function ButtonLink({
  href,
  children,
  variant = 'primary',
  download,
}: {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  download?: string;
}) {
  const external = /^https?:/.test(href);
  return (
    <a
      href={href}
      download={download}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={`interactive inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full border px-5 py-2 text-center font-semibold ${variant === 'primary' ? 'border-accent bg-accent text-navy-950' : 'border-accent/40 text-accent'}`}
    >
      {children}
      {external && (
        <>
          <ExternalLink size={16} aria-hidden="true" />
          <span className="sr-only">（新しいタブで開く）</span>
        </>
      )}
    </a>
  );
}

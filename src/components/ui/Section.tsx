import { KineticHeading } from '../motion/KineticHeading';
import type { ReactNode } from 'react';
import { Container } from './Container';
export function Section({
  id,
  title,
  lead,
  index,
  wide = false,
  children,
}: {
  id: string;
  title: string;
  lead?: string;
  index?: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={id + '-heading'}
      className="scroll-mt-24 border-t border-line py-24 md:py-36"
    >
      <Container className="grid gap-8 md:grid-cols-12 md:gap-x-10">
        <div className="min-w-0 md:col-span-4">
          {index && (
            <div
              aria-hidden="true"
              className="mb-6 flex items-center gap-4 text-sm text-ink-muted"
            >
              <span>{index}</span>
              <span className="h-px w-12 bg-line" />
            </div>
          )}
          <KineticHeading id={id + '-heading'}>{title}</KineticHeading>
        </div>
        <div className={`min-w-0 ${wide ? 'md:col-span-12' : 'md:col-span-8'}`}>
          {lead && <p className="mb-8 text-ink-muted">{lead}</p>}
          {children}
        </div>
      </Container>
    </section>
  );
}

import { KineticHeading } from '../motion/KineticHeading';
import type { ReactNode } from 'react';
import { Container } from './Container';
export function Section({
  id,
  title,
  lead,
  children,
}: {
  id: string;
  title: string;
  lead?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={id + '-heading'}
      className="scroll-mt-28 py-14 even:bg-navy-900 sm:py-20"
    >
      <Container>
        <KineticHeading id={id + '-heading'}>{title}</KineticHeading>
        {lead && <p className="mb-8 max-w-2xl text-ink-muted">{lead}</p>}
        {children}
      </Container>
    </section>
  );
}

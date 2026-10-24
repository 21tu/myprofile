import { Reveal } from '../motion/Reveal';
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
        <Reveal>
          <h2 id={id + '-heading'} className="mb-4 font-bold">
            {title}
          </h2>
        </Reveal>
        {lead && <p className="mb-8 max-w-2xl text-ink-muted">{lead}</p>}
        {children}
      </Container>
    </section>
  );
}

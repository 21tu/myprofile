import { stagger } from '@/lib/motion';
import { Reveal } from '../motion/Reveal';
import { BrainCircuit, Cloud, CodeXml, Workflow } from 'lucide-react';
import { content } from '@/config/content';
import { Section } from '../ui/Section';
import { SampleBadge } from '../ui/SampleBadge';
const icons = { BrainCircuit, Cloud, CodeXml, Workflow };
export function Services() {
  return (
    <Section
      index="01"
      id="services"
      title="Services"
      lead="対応業務の紹介（準備中）"
    >
      <ol>
        {content.services.map((s, i) => {
          const Icon = icons[s.icon];
          return (
            <Reveal
              as="li"
              key={s.id}
              delay={i * stagger}
              className="group border-t border-line py-8"
            >
              <div className="flex items-start gap-4">
                <span aria-hidden="true" className="text-sm text-ink-muted">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0 flex-1">
                  <Icon
                    aria-hidden="true"
                    size={20}
                    className="card-icon mb-4 text-accent"
                  />
                  <h3 className="text-2xl font-bold md:text-3xl">{s.name}</h3>
                  <p className="my-3 text-ink-muted">{s.description}</p>
                  {s.status === 'placeholder' && <SampleBadge />}
                </div>
              </div>
            </Reveal>
          );
        })}
      </ol>
    </Section>
  );
}

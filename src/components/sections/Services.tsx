import { BrainCircuit, Cloud, CodeXml, Workflow } from 'lucide-react';
import { content } from '@/config/content';
import { Section } from '../ui/Section';
import { Card } from '../ui/Card';
import { SampleBadge } from '../ui/SampleBadge';
const icons = { BrainCircuit, Cloud, CodeXml, Workflow };
export function Services() {
  return (
    <Section id="services" title="Services" lead="対応業務の紹介（準備中）">
      <div className="grid gap-4 md:grid-cols-3">
        {content.services.map((s, i) => {
          const Icon = icons[s.icon];
          return (
            <Card key={s.id} className={i === 0 ? 'md:col-span-2' : ''}>
              <Icon aria-hidden="true" className="mb-4 text-accent" />
              <h3 className="text-xl font-bold">{s.name}</h3>
              <p className="my-3 text-ink-muted">{s.description}</p>
              {s.status === 'placeholder' && <SampleBadge />}
            </Card>
          );
        })}
      </div>
    </Section>
  );
}

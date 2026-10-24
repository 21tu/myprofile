import { stagger } from '@/lib/motion';
import { Reveal } from '../motion/Reveal';
import { content } from '@/config/content';
import type { SkillCategory } from '@/config/types';
import { Section } from '../ui/Section';
import { SampleBadge } from '../ui/SampleBadge';
const categories: SkillCategory[] = [
  'Language',
  'Frontend',
  'Cloud・Infra',
  'AI',
];
export function Skills() {
  return (
    <Section index="03" id="skills" title="Skills">
      <div className="grid gap-8">
        {categories.map((category, i) => (
          <Reveal key={category} delay={i * stagger} className="h-full">
            <div className="border-t border-line pt-6">
              <h3 className="mb-4 text-xs font-bold uppercase tracking-widest">
                {category}
              </h3>
              <ul className="flex flex-wrap items-baseline gap-x-3 gap-y-2 text-2xl md:text-3xl">
                {content.skills
                  .filter((s) => s.category === category)
                  .map((s, index) => (
                    <li key={s.name}>
                      {index > 0 && (
                        <span
                          aria-hidden="true"
                          className="mr-3 text-ink-muted"
                        >
                          /
                        </span>
                      )}
                      <span>{s.name}</span>
                      {s.status === 'placeholder' && <SampleBadge />}
                    </li>
                  ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

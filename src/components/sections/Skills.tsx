import { content } from '@/config/content';
import type { SkillCategory } from '@/config/types';
import { Section } from '../ui/Section';
import { Card } from '../ui/Card';
import { Tag } from '../ui/Tag';
import { SampleBadge } from '../ui/SampleBadge';
const categories: SkillCategory[] = [
  'Language',
  'Frontend',
  'Cloud・Infra',
  'AI',
];
export function Skills() {
  return (
    <Section id="skills" title="Skills">
      <div className="grid gap-4 sm:grid-cols-2">
        {categories.map((category) => (
          <Card key={category}>
            <h3 className="mb-4 text-xl font-bold">{category}</h3>
            <ul className="flex flex-wrap gap-2">
              {content.skills
                .filter((s) => s.category === category)
                .map((s) => (
                  <li key={s.name}>
                    <Tag>{s.name}</Tag>
                    {s.status === 'placeholder' && <SampleBadge />}
                  </li>
                ))}
            </ul>
          </Card>
        ))}
      </div>
    </Section>
  );
}

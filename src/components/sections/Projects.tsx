import { Reveal } from '../motion/Reveal';
import { content } from '@/config/content';
import type { Project } from '@/config/types';
import { Section } from '../ui/Section';
import { Card } from '../ui/Card';
import { Tag } from '../ui/Tag';
import { SampleBadge } from '../ui/SampleBadge';
import { ButtonLink } from '../ui/ButtonLink';
export function Projects({
  projects = content.projects,
}: {
  projects?: Project[];
}) {
  return (
    <Section
      id="projects"
      title="Projects"
      lead="制作実績のサンプルです。公開内容は準備中です。"
    >
      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((p) => (
          <Reveal key={p.name}>
            <Card className="card-reveal h-full">
              <h3 className="mb-3 text-xl font-bold">{p.name}</h3>
              {p.status === 'placeholder' && <SampleBadge />}
              <p className="my-4 text-ink-muted">{p.summary}</p>
              <ul className="mb-5 flex flex-wrap gap-2">
                {p.technologies.map((t) => (
                  <li key={t}>
                    <Tag>{t}</Tag>
                  </li>
                ))}
              </ul>
              {p.href && (
                <ButtonLink href={p.href} variant="secondary">
                  詳細を見る<span className="sr-only">：{p.name}</span>
                </ButtonLink>
              )}
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

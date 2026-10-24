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
      wide
      index="04"
      id="projects"
      title="Projects"
      lead="制作実績のサンプルです。公開内容は準備中です。"
    >
      <div className="grid gap-4 md:grid-cols-12">
        {projects.map((p, index) => (
          <Reveal
            key={p.name}
            className={index === 0 ? 'md:col-span-12' : 'md:col-span-6'}
          >
            <Card
              className={`card-reveal h-full ${index === 0 ? 'md:p-12' : ''}`}
            >
              <h3 className="mb-3 text-2xl font-bold">{p.name}</h3>
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

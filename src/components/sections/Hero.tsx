import type { CSSProperties } from 'react';
import { Parallax } from '../motion/Parallax';
import { content } from '@/config/content';
import { Container } from '../ui/Container';
import { ButtonLink } from '../ui/ButtonLink';
import { Tag } from '../ui/Tag';
import { SampleBadge } from '../ui/SampleBadge';
import { MascotSlot } from '../ui/MascotSlot';
export function Hero() {
  const p = content.profile;
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="relative isolate scroll-mt-28 overflow-hidden py-6 sm:py-16"
    >
      <Parallax decorative className="hero-glow absolute -inset-8 -z-10" />
      <Container className="grid items-center gap-8 lg:grid-cols-2">
        <div>
          <h1 className="font-bold">{p.name}</h1>
          <p className="mt-2 text-ink-muted">{p.title}</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {p.focusAreas.map((area) => (
              <li key={area}>
                <Tag>{area}</Tag>
              </li>
            ))}
          </ul>
          <h2
            id="hero-heading"
            aria-label={p.catchphrase}
            className="mt-4 text-[clamp(1.25rem,3vw,2rem)] font-bold"
          >
            {Array.from(
              new Intl.Segmenter('ja', { granularity: 'word' }).segment(
                p.catchphrase,
              ),
              ({ segment }, i) => (
                <span
                  key={i}
                  className="kinetic-word"
                  style={{ '--i': i } as CSSProperties}
                >
                  {segment}
                </span>
              ),
            )}
          </h2>
          <div className="mt-5 flex flex-wrap gap-3">
            <ButtonLink href="#projects">制作実績を見る</ButtonLink>
            <ButtonLink href="#contact" variant="secondary">
              問い合わせ
            </ButtonLink>
          </div>
          <p className="mt-5 text-ink-muted">{p.intro}</p>
          {p.status === 'placeholder' && (
            <div className="mt-3">
              <SampleBadge />
            </div>
          )}
        </div>
        <Parallax>
          <MascotSlot />
        </Parallax>
      </Container>
    </section>
  );
}

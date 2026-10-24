import { Reveal } from '../motion/Reveal';
import { content } from '@/config/content';
import { Section } from '../ui/Section';
import { SampleBadge } from '../ui/SampleBadge';
export function About() {
  const a = content.about;
  return (
    <Section index="02" id="about" title="About">
      <Reveal>
        <div>
          {a.status === 'placeholder' && <SampleBadge />}
          <dl className="mt-4">
            {[
              { title: '経歴', value: a.career },
              { title: '人物紹介', value: a.personality },
              { title: '趣味', value: a.hobbies },
            ].map((item) => (
              <div key={item.title} className="border-t border-line py-6">
                <dt className="mb-3 text-sm font-bold">{item.title}</dt>
                <dd className="text-ink-muted">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Reveal>
    </Section>
  );
}

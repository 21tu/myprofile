import { content } from '@/config/content';
import { Section } from '../ui/Section';
import { Card } from '../ui/Card';
import { SampleBadge } from '../ui/SampleBadge';
export function About() {
  const a = content.about;
  return (
    <Section id="about" title="About">
      <Card>
        {a.status === 'placeholder' && <SampleBadge />}
        <dl className="mt-4 grid gap-5">
          {[
            { title: '経歴', value: a.career },
            { title: '人物紹介', value: a.personality },
            { title: '趣味', value: a.hobbies },
          ].map((item) => (
            <div key={item.title}>
              <dt className="font-bold">{item.title}</dt>
              <dd className="text-ink-muted">{item.value}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </Section>
  );
}

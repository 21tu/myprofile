import { ProcessProgress } from '../motion/ProcessProgress';
import { content } from '@/config/content';
import { Section } from '../ui/Section';
export function WorkProcess() {
  return (
    <Section id="process" title="Work Process">
      <div className="relative ml-5">
        <ol className="grid auto-rows-fr border-l border-accent/40">
          {content.process.map((s, i) => (
            <li key={s.title} className="relative pb-8 pl-10 last:pb-0">
              <span
                aria-hidden="true"
                className="absolute -left-5 flex size-10 items-center justify-center rounded-full border border-accent/40 bg-navy-800 text-ink-muted"
              >
                {i + 1}
              </span>
              <h3 className="text-xl font-bold">{s.title}</h3>
              <p className="mt-2 text-ink-muted">{s.description}</p>
            </li>
          ))}
        </ol>
        <ProcessProgress count={content.process.length} />
      </div>
    </Section>
  );
}

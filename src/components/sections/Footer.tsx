import { ArrowUp } from 'lucide-react';
import { content } from '@/config/content';
import { navigation } from '@/config/navigation';
import { Container } from '../ui/Container';
import { ButtonLink } from '../ui/ButtonLink';
export function Footer() {
  return (
    <footer className="border-t border-line bg-surface py-10">
      <Container>
        <h2 className="sr-only">フッター</h2>
        <nav
          aria-label="フッターナビゲーション"
          className="mb-5 flex flex-wrap gap-2"
        >
          {navigation.map((item) => (
            <a
              key={item.id}
              href={'#' + item.id}
              className="interactive inline-flex min-h-11 min-w-11 items-center px-3 text-ink-muted hover:text-accent"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex flex-wrap items-center gap-4">
          {content.contact.github.status === 'confirmed' &&
            content.contact.github.value.trim() && (
              <ButtonLink
                href={content.contact.github.value}
                variant="secondary"
              >
                GitHub
              </ButtonLink>
            )}
          <ButtonLink href="#hero" variant="secondary">
            <ArrowUp aria-hidden="true" size={20} />
            トップへ戻る
          </ButtonLink>
        </div>
        <p className="mt-6 text-ink-muted">
          © {new Date().getFullYear()} {content.profile.name}
        </p>
      </Container>
    </footer>
  );
}

import { Menu } from 'lucide-react';
import { content } from '@/config/content';
import { navigation } from '@/config/navigation';
import { Container } from '../ui/Container';
import { ButtonLink } from '../ui/ButtonLink';
export function Header() {
  const links = navigation.map((item) => (
    <a
      key={item.id}
      href={'#' + item.id}
      className="interactive flex min-h-11 min-w-11 items-center px-2 text-ink-muted hover:text-accent"
    >
      {item.label}
    </a>
  ));
  return (
    <header className="sticky top-0 z-40 border-b border-accent/15 bg-navy-950/80 backdrop-blur">
      <Container className="flex min-h-20 items-center justify-between gap-2">
        <a
          href="#hero"
          className="interactive flex min-h-11 min-w-0 items-center text-sm font-bold md:max-w-40"
        >
          {content.site.name}
        </a>
        <nav aria-label="メインナビゲーション" className="hidden md:flex">
          {links}
        </nav>
        <ButtonLink href="#contact">問い合わせ</ButtonLink>
        <details className="relative md:hidden">
          <summary
            aria-label="ナビゲーションメニュー"
            className="mobile-menu-summary cursor-pointer text-accent"
          >
            <span className="flex min-h-11 min-w-11 items-center justify-center">
              <Menu aria-hidden="true" />
            </span>
          </summary>
          <nav
            aria-label="モバイルナビゲーション"
            className="absolute right-0 top-full mt-3 w-48 rounded-2xl border border-accent/15 bg-navy-900 p-3"
          >
            {links}
          </nav>
        </details>
      </Container>
    </header>
  );
}

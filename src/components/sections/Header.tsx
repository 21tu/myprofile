import { MobileMenu } from './MobileMenu';
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
    <header className="glass-header glass sticky top-0 z-40 bg-bg/70 backdrop-blur-md backdrop-saturate-150">
      <Container className="flex min-h-16 items-center justify-between gap-2">
        <a
          href="#hero"
          className="interactive flex min-h-11 min-w-0 items-center text-sm font-bold md:max-w-40"
        >
          {content.site.name}
        </a>
        <nav aria-label="メインナビゲーション" className="hidden md:flex">
          {links}
        </nav>
        <ButtonLink magnetic href="#contact">
          問い合わせ
        </ButtonLink>
        <MobileMenu />
      </Container>
    </header>
  );
}

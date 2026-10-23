import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Home from '@/app/page';
import { content } from '@/config/content';
import { Contact } from '@/components/sections/Contact';
import { Projects } from '@/components/sections/Projects';
import { confirmedContact, confirmedProfile } from './fixtures';

describe('UI-DESIGN-001 / FR-002–006, FR-011', () => {
  it('has one h1 and labelled sections with h2 headings', () => {
    const { container } = render(<Home />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      content.profile.name,
    );
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main');
    expect(screen.getByRole('main')).toHaveAttribute('tabindex', '-1');
    for (const section of container.querySelectorAll('section')) {
      expect(
        within(section).getByRole('heading', { level: 2 }),
      ).toHaveAttribute('id', section.getAttribute('aria-labelledby'));
    }
    expect(container.querySelectorAll('section')).toHaveLength(7);
  });
  it('links Hero CTAs to projects and contact', () => {
    render(<Home />);
    const hero = document.getElementById('hero')!;
    expect(
      within(hero).getByRole('link', { name: '制作実績を見る' }),
    ).toHaveAttribute('href', '#projects');
    expect(
      within(hero).getByRole('link', { name: '問い合わせ' }),
    ).toHaveAttribute('href', '#contact');
  });
  it('shows exactly the eight confirmed skills without ratings', () => {
    render(<Home />);
    const skills = document.getElementById('skills')!;
    expect(within(skills).getAllByRole('listitem')).toHaveLength(8);
    for (const name of [
      'Python',
      'React',
      'Next.js',
      'TypeScript',
      'C++',
      'AWS',
      'Docker',
      'AI',
    ])
      expect(
        within(skills).getByText(name, { selector: 'span' }),
      ).toBeVisible();
    expect(content.skills.every((skill) => skill.status === 'confirmed')).toBe(
      true,
    );
    expect(within(skills).queryByRole('progressbar')).not.toBeInTheDocument();
  });
  it('marks sample data and only shows the mascot placeholder', () => {
    const { container } = render(<Home />);
    expect(screen.getAllByLabelText('サンプルデータ').length).toBeGreaterThan(
      0,
    );
    expect(
      screen.getByText('マスコット画像（正式画像の提供待ち）'),
    ).toBeVisible();
    expect(container.querySelector('img')).toBeNull();
  });
  it('omits project links when href is null', () => {
    render(<Projects />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
  it('renders external project links safely when present', () => {
    render(
      <Projects
        projects={[
          {
            ...content.projects[0]!,
            href: 'https://example.invalid/project-test',
          },
        ]}
      />,
    );
    expect(screen.getByRole('link')).toHaveAttribute('target', '_blank');
    expect(screen.getByRole('link')).toHaveAttribute(
      'rel',
      'noopener noreferrer',
    );
    expect(screen.getByRole('link')).toHaveAccessibleName(/新しいタブで開く/);
  });
  it('does not expose placeholder contact links or vCard', () => {
    const { container } = render(<Home />);
    expect(screen.getByText('連絡先は準備中です')).toBeVisible();
    expect(container.querySelector('a[href^="mailto:"]')).toBeNull();
    expect(container.querySelector('a[href="/contact.vcf"]')).toBeNull();
  });
  it('renders confirmed email, external contact and downloadable vCard from a fixture', () => {
    render(<Contact contact={confirmedContact} profile={confirmedProfile} />);
    expect(screen.getByRole('link', { name: 'メール' })).toHaveAttribute(
      'href',
      'mailto:test@example.invalid',
    );
    expect(screen.getByRole('link', { name: /GitHub/ })).toHaveAttribute(
      'href',
      'https://example.invalid/github-test',
    );
    expect(screen.getByRole('link', { name: /GitHub/ })).toHaveAttribute(
      'rel',
      'noopener noreferrer',
    );
    expect(screen.getByRole('link', { name: 'vCardを保存' })).toHaveAttribute(
      'download',
      'contact.vcf',
    );
  });
  it('uses a native labelled mobile menu and valid navigation anchors', () => {
    const { container } = render(<Home />);
    expect(container.querySelector('details > summary')).toHaveAttribute(
      'aria-label',
      'ナビゲーションメニュー',
    );
    for (const link of container.querySelectorAll('a[href^="#"]'))
      expect(
        document.getElementById(link.getAttribute('href')!.slice(1)),
      ).not.toBeNull();
  });
});

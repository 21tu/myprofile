import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Section } from '@/components/ui/Section';
import { Skills } from '@/components/sections/Skills';
import { content } from '@/config/content';
describe('ADR-008 editorial layout', () => {
  it('keeps the h2 id and section label while hiding the decorative index', () => {
    render(
      <Section id="example" title="Example" index="03">
        <p>Body</p>
      </Section>,
    );
    const region = screen.getByRole('region', { name: 'Example' });
    expect(region).toHaveAttribute('aria-labelledby', 'example-heading');
    expect(
      within(region).getByRole('heading', { level: 2, name: 'Example' }),
    ).toHaveAttribute('id', 'example-heading');
    expect(screen.getByText('03').closest('[aria-hidden]')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    expect(within(region).getByText('Body')).toBeVisible();
  });
  it('renders all eight skill names in their categories', () => {
    render(<Skills />);
    const region = screen.getByRole('region', { name: 'Skills' });
    expect(within(region).getAllByRole('listitem')).toHaveLength(8);
    for (const skill of content.skills) {
      const name = within(region).getByText(skill.name, { selector: 'span' });
      expect(name).toBeVisible();
      expect(name.closest('ul')?.previousElementSibling).toHaveTextContent(
        skill.category,
      );
    }
  });
});

import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MobileMenu } from '@/components/sections/MobileMenu';
import { navigation } from '@/config/navigation';

describe('REV-20261024-006 F-001 / NFR-001, NFR-002: MobileMenu', () => {
  function renderMenu() {
    render(<MobileMenu />);
    return screen.getByRole('button', { name: 'ナビゲーションメニュー' });
  }

  it('starts with a named collapsed button and no navigation in the DOM', () => {
    const button = renderMenu();
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveAttribute('aria-controls', 'mobile-nav');
    expect(document.getElementById('mobile-nav')).toBeNull();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('opens the named navigation with all six configured links', () => {
    const button = renderMenu();
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    const nav = screen.getByRole('navigation', {
      name: 'モバイルナビゲーション',
    });
    expect(nav).toBeVisible();
    expect(nav).toHaveAttribute('id', button.getAttribute('aria-controls'));
    expect(within(nav).getAllByRole('link')).toHaveLength(6);
    for (const item of navigation) {
      expect(
        within(nav).getByRole('link', { name: item.label }),
      ).toHaveAttribute('href', '#' + item.id);
    }
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(document.getElementById('mobile-nav')).toBeNull();
  });

  it('closes on Escape from a link and returns focus to the button', () => {
    const button = renderMenu();
    fireEvent.click(button);
    const link = screen.getByRole('link', { name: 'Services' });
    link.focus();
    fireEvent.keyDown(link, { key: 'Escape' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(document.getElementById('mobile-nav')).toBeNull();
    expect(button).toHaveFocus();
  });

  it('F-004 / NFR-002: closes on link click without forcing focus to the button', () => {
    const button = renderMenu();
    fireEvent.click(button);
    const link = screen.getByRole('link', { name: 'Contact' });
    link.focus();
    fireEvent.click(link);
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(document.getElementById('mobile-nav')).toBeNull();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(button).not.toHaveFocus();
  });
});

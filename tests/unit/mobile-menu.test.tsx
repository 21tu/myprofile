import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
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

  it('F-004 / NFR-002: closes on link click without forcing focus to the button', async () => {
    const { unmount } = render(
      <h2 id="contact-heading" tabIndex={-1}>
        Contact heading
      </h2>,
    );
    const heading = screen.getByRole('heading');
    const focus = vi.spyOn(heading, 'focus');
    const button = renderMenu();
    fireEvent.click(button);
    const link = screen.getByRole('link', { name: 'Contact' });
    link.focus();
    fireEvent.click(link);
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(document.getElementById('mobile-nav')).toBeNull();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    await waitFor(() => expect(heading).toHaveFocus());
    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
    unmount();
  });
});

describe('Issue #40 NFR-002 dismissal lifecycle', () => {
  it('ignores inside pointerdown, closes outside and removes open listeners', () => {
    const remove = vi.spyOn(document, 'removeEventListener');
    render(<MobileMenu />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    fireEvent.pointerDown(screen.getByRole('link', { name: 'Services' }));
    expect(button).toHaveAttribute('aria-expanded', 'true');
    fireEvent.pointerDown(document.body);
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(remove).toHaveBeenCalledWith('pointerdown', expect.any(Function));
    expect(remove).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
  it('FR-011: stays open during scroll events regardless of distance', () => {
    render(<MobileMenu />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    for (const scrollY of [47, 48, 800, 0]) {
      vi.spyOn(window, 'scrollY', 'get').mockReturnValue(scrollY);
      fireEvent.scroll(window);
      expect(button).toHaveAttribute('aria-expanded', 'true');
    }
  });

  it('closes on wheel and removes the listener after closing and unmounting', () => {
    const add = vi.spyOn(window, 'addEventListener');
    const remove = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(<MobileMenu />);
    const button = screen.getByRole('button');
    const wheelListeners = () =>
      add.mock.calls.filter(([type]) => type === 'wheel');
    expect(wheelListeners()).toHaveLength(0);

    fireEvent.click(button);
    expect(wheelListeners()).toHaveLength(1);
    const firstListener = wheelListeners()[0]?.[1];
    expect(add).toHaveBeenCalledWith('wheel', firstListener, { passive: true });
    fireEvent.wheel(window, { deltaY: 1 });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(remove).toHaveBeenCalledWith('wheel', firstListener);

    fireEvent.wheel(window, { deltaY: 100 });
    expect(wheelListeners()).toHaveLength(1);
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(wheelListeners()).toHaveLength(2);
    const secondListener = wheelListeners()[1]?.[1];
    remove.mockClear();
    unmount();
    expect(remove).toHaveBeenCalledWith('wheel', secondListener);
  });
});

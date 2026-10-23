import { act, render, screen, within, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Reveal } from '@/components/motion/Reveal';
import { Hero } from '@/components/sections/Hero';
import { Services } from '@/components/sections/Services';
import { content } from '@/config/content';

afterEach(() => vi.restoreAllMocks());

describe('FR-008 / FR-009 motion', () => {
  it('keeps server HTML visible before JavaScript runs', () => {
    expect(renderToString(<Reveal>Visible content</Reveal>)).not.toMatch(
      /opacity:\s*0/,
    );
  });

  it('never hides or animates content already in the viewport', () => {
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
      top: 10,
      bottom: 110,
      left: 10,
      right: 110,
      width: 100,
      height: 100,
      x: 10,
      y: 10,
      toJSON: () => ({}),
    });
    render(<Reveal>In view</Reveal>);
    expect(screen.getByText('In view')).not.toHaveAttribute('style');
  });

  it('reveals an offscreen element once when it enters the viewport', async () => {
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
      top: 2000,
      bottom: 2100,
      left: 10,
      right: 110,
      width: 100,
      height: 100,
      x: 10,
      y: 2000,
      toJSON: () => ({}),
    });
    let enter: () => void = () => {};
    const disconnect = vi.fn();
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(callback: IntersectionObserverCallback) {
          enter = () =>
            callback(
              [{ isIntersecting: true } as IntersectionObserverEntry],
              this as unknown as IntersectionObserver,
            );
        }
        observe() {}
        disconnect = disconnect;
      },
    );
    try {
      const { unmount } = render(<Reveal>Offscreen</Reveal>);
      await waitFor(() =>
        expect(screen.getByText('Offscreen')).toHaveStyle({ opacity: 0 }),
      );
      act(() => enter());
      await waitFor(
        () => expect(screen.getByText('Offscreen')).toHaveStyle({ opacity: 1 }),
        { timeout: 2000 },
      );
      expect(disconnect).toHaveBeenCalledTimes(1);
      unmount();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('preserves the exact accessible catchphrase name and text', () => {
    render(<Hero />);
    const heading = screen.getByRole('heading', {
      name: content.profile.catchphrase,
    });
    expect(heading.textContent).toBe(content.profile.catchphrase);
    expect(heading).toHaveAccessibleName(content.profile.catchphrase);
    expect(heading.querySelectorAll('.kinetic-word').length).toBeGreaterThan(1);
  });

  it('renders all four Services cards', () => {
    render(<Services />);
    expect(
      within(screen.getByRole('region', { name: 'Services' })).getAllByRole(
        'heading',
        { level: 3 },
      ),
    ).toHaveLength(4);
  });
});

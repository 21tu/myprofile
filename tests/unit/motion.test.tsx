import { act, render, screen, within, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { useLayoutEffect } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Reveal } from '@/components/motion/Reveal';
import { Hero } from '@/components/sections/Hero';
import { Services } from '@/components/sections/Services';
import { content } from '@/config/content';

const preference = vi.hoisted(() => ({ reduced: false }));
vi.mock('motion/react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('motion/react')>()),
  useReducedMotion: () => preference.reduced,
}));

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  preference.reduced = false;
});

describe('FR-008 / FR-009 motion', () => {
  it('keeps server HTML visible before JavaScript runs', () => {
    expect(renderToString(<Reveal>Visible content</Reveal>)).not.toMatch(
      /opacity:/,
    );
  });

  it('never hides or animates content already in the viewport', async () => {
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
    const mutations: (string | null)[] = [];
    const observer = new MutationObserver((records) => {
      for (const record of records) mutations.push(record.oldValue);
    });
    observer.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeOldValue: true,
      attributeFilter: ['style'],
    });
    render(<Reveal>In view</Reveal>);
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });
    expect(screen.getByText('In view')).not.toHaveAttribute('style');
    mutations.push(...observer.takeRecords().map((record) => record.oldValue));
    expect(mutations).toEqual([]);
    observer.disconnect();
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
    let enter: (intersecting?: boolean) => void = () => {};
    const observe = vi.fn();
    const disconnect = vi.fn();
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(callback: IntersectionObserverCallback) {
          enter = (intersecting = true) =>
            callback(
              [{ isIntersecting: intersecting } as IntersectionObserverEntry],
              this as unknown as IntersectionObserver,
            );
        }
        observe = observe;
        disconnect = disconnect;
      },
    );
    try {
      let initialStyle: string | null | undefined;
      function InitialMarkup() {
        useLayoutEffect(() => {
          initialStyle = screen
            .getByText('Offscreen')
            .parentElement?.getAttribute('style');
        }, []);
        return <span>Offscreen</span>;
      }
      const { container, unmount } = render(
        <Reveal>
          <InitialMarkup />
        </Reveal>,
      );
      const element = container.firstElementChild;
      expect(initialStyle).toBeNull();
      expect(observe).toHaveBeenCalledWith(element);
      await waitFor(() => expect(element).toHaveStyle({ opacity: 0 }));
      act(() => enter(false));
      expect(element).toHaveStyle({ opacity: 0 });
      act(() => enter());
      await waitFor(() => expect(element).toHaveStyle({ opacity: 1 }), {
        timeout: 2000,
      });
      expect(disconnect).toHaveBeenCalledTimes(1);
      unmount();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('never hides an offscreen element with reduced motion', async () => {
    preference.reduced = true;
    const measure = vi
      .spyOn(Element.prototype, 'getBoundingClientRect')
      .mockReturnValue({
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
    const observe = vi.fn();
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe = observe;
        disconnect() {}
      },
    );
    render(<Reveal>Reduced offscreen</Reveal>);
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    expect(screen.getByText('Reduced offscreen')).not.toHaveAttribute('style');
    expect(measure).not.toHaveBeenCalled();
    expect(observe).not.toHaveBeenCalled();
  });

  it('hides offscreen server HTML after hydration', async () => {
    const observe = vi.fn();
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe = observe;
        disconnect() {}
      },
    );
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
    const container = document.createElement('div');
    container.innerHTML = renderToString(<Reveal>Hydrated offscreen</Reveal>);
    document.body.append(container);
    expect(container.firstElementChild).not.toHaveAttribute('style');
    let root: ReturnType<typeof hydrateRoot>;
    await act(async () => {
      root = hydrateRoot(container, <Reveal>Hydrated offscreen</Reveal>);
    });
    try {
      expect(observe).toHaveBeenCalledWith(container.firstElementChild);
      await waitFor(() =>
        expect(container.firstElementChild).toHaveStyle({ opacity: 0 }),
      );
    } finally {
      act(() => root!.unmount());
      container.remove();
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

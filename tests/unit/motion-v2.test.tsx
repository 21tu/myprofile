import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { Magnetic } from '@/components/motion/Magnetic';
import { KineticHeading } from '@/components/motion/KineticHeading';
import { HeroGradient } from '@/components/motion/HeroGradient';
import { ButtonLink } from '@/components/ui/ButtonLink';
import {
  durations,
  easeOutExpo,
  magnetic,
  reveal,
  stagger,
} from '@/lib/motion';

const preference = vi.hoisted(() => ({ reduced: false }));
vi.mock('motion/react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('motion/react')>()),
  useReducedMotion: () => preference.reduced,
}));

function media(fine: boolean, reduced: boolean) {
  vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
    matches: query.includes('prefers-reduced-motion')
      ? reduced
      : query.includes('pointer: coarse')
        ? !fine
        : fine,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

afterEach(() => {
  preference.reduced = false;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('FR-008 / FR-009 / SEC-002 motion v2', () => {
  it('exports the design values and equivalent CSS tokens', () => {
    expect(easeOutExpo).toEqual([0.22, 1, 0.36, 1]);
    expect(durations).toEqual({
      button: 0.2,
      card: 0.3,
      reveal: 0.6,
      text: 0.7,
    });
    expect(reveal).toEqual({ distance: 24, duration: 0.6 });
    expect(stagger).toBe(0.06);
    expect(magnetic).toEqual({
      max: 14,
      spring: { stiffness: 260, damping: 18, mass: 0.6 },
    });
    const css = readFileSync('src/app/globals.css', 'utf8');
    for (const [name, value] of Object.entries(durations)) {
      expect(css).toContain(`--dur-${name}: ${value * 1000}ms`);
    }
    expect(css).toContain(
      `--ease-out-expo: cubic-bezier(${easeOutExpo.join(', ')})`,
    );
    expect(css).toContain(`--reveal-distance: ${reveal.distance}px`);
    expect(css).toContain(`--stagger: ${stagger * 1000}ms`);
    expect(css).toContain(`--magnetic-max: ${magnetic.max}px`);
    for (const [name, value] of Object.entries(magnetic.spring))
      expect(css).toContain(`--magnetic-${name}: ${value}`);
  });

  it.each([
    [false, false],
    [true, true],
    [false, true],
  ])(
    'leaves children unchanged with fine=%s and reduced=%s',
    (fine, reduced) => {
      media(fine, reduced);
      const child = <a href="#contact">問い合わせ</a>;
      const { container } = render(<Magnetic>{child}</Magnetic>);
      fireEvent.pointerMove(screen.getByRole('link'), {
        clientX: 100,
        clientY: 100,
      });
      expect(container.innerHTML).toBe(renderToString(child));
      expect(container.querySelector('[style]')).toBeNull();
    },
  );

  it('outputs plain SSR children even on a fine pointer', () => {
    media(true, false);
    const child = <a href="#contact">問い合わせ</a>;
    expect(renderToString(<Magnetic>{child}</Magnetic>)).toBe(
      renderToString(child),
    );
  });

  it('throttles pointer input and cancels pending work on leave and unmount', () => {
    media(true, false);
    const request = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockReturnValue(42);
    const cancel = vi.spyOn(window, 'cancelAnimationFrame');
    const { container, unmount } = render(
      <Magnetic>
        <a href="#contact">問い合わせ</a>
      </Magnetic>,
    );
    const element = container.firstElementChild!;
    const remove = vi.spyOn(element, 'removeEventListener');
    const baseline = request.mock.calls.length;
    fireEvent.pointerMove(element, { clientX: 80, clientY: 80 });
    fireEvent.pointerMove(element, { clientX: 90, clientY: 90 });
    expect(request.mock.calls.length).toBe(baseline + 1);
    fireEvent.pointerLeave(element);
    expect(cancel).toHaveBeenCalledWith(42);
    fireEvent.pointerMove(element, { clientX: 80, clientY: 80 });
    unmount();
    expect(cancel).toHaveBeenLastCalledWith(42);
    expect(remove).toHaveBeenCalledWith('pointermove', expect.any(Function));
    expect(remove).toHaveBeenCalledWith('pointerleave', expect.any(Function));
    expect(remove).toHaveBeenCalledWith('focusin', expect.any(Function));
  });

  it.each([false, true])(
    'keeps ButtonLink a single link with the same name/href (fine=%s)',
    (fine) => {
      media(fine, false);
      const { container } = render(
        <ButtonLink magnetic href="#contact">
          問い合わせ
        </ButtonLink>,
      );
      expect(screen.getAllByRole('link')).toHaveLength(1);
      expect(screen.getByRole('link', { name: '問い合わせ' })).toHaveAttribute(
        'href',
        '#contact',
      );
      if (fine) expect(container.firstElementChild).toHaveClass('magnetic');
    },
  );

  it.each([
    'Work Process',
    '日本語の見出しを表示する',
    '日本語と English の見出し',
  ])('preserves the original heading name, text and id: %s', (text) => {
    // jsdom does not load globals.css. Display affects accessible-name spacing.
    const stylesheet = document.createElement('style');
    const css = readFileSync('src/app/globals.css', 'utf8');
    stylesheet.textContent = ['heading-segment', 'heading-word']
      .map((name) => css.match(new RegExp(`\\.${name} \\{[^}]+\\}`))![0])
      .join('\n');
    document.head.append(stylesheet);
    const html = renderToString(
      <KineticHeading id="test-heading">{text}</KineticHeading>,
    );
    expect(html).not.toMatch(/style=|aria-label=/);
    render(<KineticHeading id="test-heading">{text}</KineticHeading>);
    const heading = screen.getByRole('heading', { level: 2, name: text });
    expect(heading).toHaveAttribute('id', 'test-heading');
    expect(heading.textContent).toBe(text);
    expect(heading).not.toHaveAttribute('aria-label');
    expect(heading.querySelectorAll('span').length).toBeGreaterThan(1);
    expect(heading.querySelector('[style]')).toBeNull();
    stylesheet.remove();
  });

  it('reveals offscreen heading words once', async () => {
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue(
      new DOMRect(0, 2000, 100, 100),
    );
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
    render(<KineticHeading id="offscreen">Work Process</KineticHeading>);
    const words = screen.getByRole('heading').querySelectorAll('.heading-word');
    await waitFor(() => expect(words[0]).toHaveStyle({ opacity: 0 }));
    act(() => enter());
    await waitFor(() => expect(words[0]).toHaveStyle({ opacity: 1 }), {
      timeout: 2000,
    });
    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  it('leaves an offscreen heading visible with reduced motion', () => {
    preference.reduced = true;
    const measure = vi.spyOn(Element.prototype, 'getBoundingClientRect');
    render(<KineticHeading id="reduced">Work Process</KineticHeading>);
    expect(screen.getByRole('heading', { name: 'Work Process' })).toBeVisible();
    expect(measure).not.toHaveBeenCalled();
    for (const word of document.querySelectorAll('.heading-word'))
      expect(word).not.toHaveStyle({ opacity: 0 });
  });

  it('keeps the gradient decorative and static for coarse pointers', () => {
    media(false, false);
    const { container } = render(
      <section>
        <HeroGradient />
      </section>,
    );
    const gradient = container.querySelector('.hero-gradient');
    fireEvent.pointerMove(container.firstElementChild!, {
      clientX: 100,
      clientY: 100,
    });
    expect(gradient).toHaveAttribute('aria-hidden', 'true');
    expect(gradient).toHaveClass('pointer-events-none');
    expect(gradient).not.toHaveAttribute('style');
  });
});

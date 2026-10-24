import {
  act,
  fireEvent,
  render,
  screen,
  cleanup,
} from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, expect, it, vi } from 'vitest';
import { InteractiveCharacter } from '@/components/character/InteractiveCharacter';

const name = 'きつねのマスコット。押すとリアクションします';
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});
function media(fine: boolean, reduced: boolean) {
  vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
    matches: query.includes('prefers-reduced-motion') ? reduced : fine,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}
it('UX-002 NFR-001: renders a named native button and decorative SVG, with static SSR', () => {
  expect(renderToString(<InteractiveCharacter />)).toContain(
    'data-ready="false"',
  );
  render(<InteractiveCharacter />);
  const button = screen.getByRole('button', { name });
  expect(button).toHaveAttribute('type', 'button');
  expect(button.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  expect(button.querySelector('svg')).toHaveAttribute('focusable', 'false');
});
it.each(['Enter', ' '])(
  'NFR-002: handles the native keyboard click for %s',
  (key) => {
    render(<InteractiveCharacter />);
    const button = screen.getByRole('button', { name });
    button.focus();
    fireEvent.keyDown(button, { key });
    fireEvent.keyUp(button, { key });
    // jsdom does not synthesize browser default keyboard activation. Supply its native click.
    fireEvent.click(button, { detail: 0 });
    expect(button).toHaveAttribute('data-reaction', 'jump');
  },
);
it('FR-008: rapid clicks queue at most one reaction and never overlap', () => {
  vi.useFakeTimers();
  render(<InteractiveCharacter />);
  const button = screen.getByRole('button', { name });
  for (let i = 0; i < 20; i++) fireEvent.click(button);
  expect(button).toHaveAttribute('data-reaction', 'jump');
  act(() => vi.advanceTimersByTime(599));
  expect(button).toHaveAttribute('data-reaction', 'jump');
  act(() => vi.advanceTimersByTime(1));
  expect(button).toHaveAttribute('data-reaction', 'spin');
  act(() => vi.advanceTimersByTime(700));
  expect(button).toHaveAttribute('data-reaction', 'idle');
  fireEvent.click(button);
  expect(button).toHaveAttribute('data-reaction', 'surprised');
  act(() => vi.advanceTimersByTime(500));
  fireEvent.click(button);
  expect(button).toHaveAttribute('data-reaction', 'wave');
});
it.each([
  [false, false],
  [true, true],
  [false, true],
])('FR-009: no tracking listeners for fine=%s reduced=%s', (fine, reduced) => {
  media(fine, reduced);
  const add = vi.spyOn(window, 'addEventListener');
  render(<InteractiveCharacter />);
  expect(
    add.mock.calls.filter(
      ([type]) => type === 'pointermove' || type === 'pointerleave',
    ),
  ).toEqual([]);
});
it('FR-008: unmount cancels reaction, blink and tracking work', () => {
  vi.useFakeTimers();
  media(true, false);
  const remove = vi.spyOn(window, 'removeEventListener');
  const { unmount } = render(<InteractiveCharacter />);
  fireEvent.click(screen.getByRole('button', { name }));
  fireEvent.pointerMove(window, { clientX: 100, clientY: 100 });
  unmount();
  expect(vi.getTimerCount()).toBe(0);
  expect(remove).toHaveBeenCalledWith('pointermove', expect.any(Function));
});
it('FR-008: pauses blink timers while the document is hidden', () => {
  vi.useFakeTimers();
  render(<InteractiveCharacter />);
  vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
  fireEvent(document, new Event('visibilitychange'));
  expect(vi.getTimerCount()).toBe(0);
});

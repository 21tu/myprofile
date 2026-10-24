import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

// Motion reads matchMedia when its first reduced-motion subscriber mounts.
vi.hoisted(() => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
    }),
  });
});

import { Reveal } from '@/components/motion/Reveal';

it('FR-009: renders plain visible children with reduced motion enabled', () => {
  expect(window.matchMedia('(prefers-reduced-motion: reduce)').matches).toBe(
    true,
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
  render(<Reveal>Reduced motion content</Reveal>);
  expect(screen.getByText('Reduced motion content')).not.toHaveAttribute(
    'style',
  );
  expect(screen.getByText('Reduced motion content')).toBeVisible();
});

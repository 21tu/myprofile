'use client';

import { useEffect, useRef } from 'react';

export function HeroGradient() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    const hero = element?.parentElement;
    if (!element || !hero) return;
    const coarse = window.matchMedia('(pointer: coarse)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let clientX = 0;
    let clientY = 0;
    const move = (event: PointerEvent) => {
      if (coarse.matches || reduced.matches || event.pointerType === 'touch')
        return;
      clientX = event.clientX;
      clientY = event.clientY;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const rect = hero.getBoundingClientRect();
        element.style.setProperty(
          '--gx',
          `${((clientX - rect.left) / rect.width) * 100}%`,
        );
        element.style.setProperty(
          '--gy',
          `${((clientY - rect.top) / rect.height) * 100}%`,
        );
      });
    };
    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      element.style.removeProperty('--gx');
      element.style.removeProperty('--gy');
    };
    hero.addEventListener('pointermove', move);
    hero.addEventListener('pointerleave', reset);
    coarse.addEventListener('change', reset);
    reduced.addEventListener('change', reset);
    return () => {
      reset();
      hero.removeEventListener('pointermove', move);
      hero.removeEventListener('pointerleave', reset);
      coarse.removeEventListener('change', reset);
      reduced.removeEventListener('change', reset);
    };
  }, []);
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="hero-gradient pointer-events-none absolute -inset-8 -z-10"
    />
  );
}

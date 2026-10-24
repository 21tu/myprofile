'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { magnetic } from '@/lib/motion';

export function Magnetic({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, magnetic.spring);
  const springY = useSpring(y, magnetic.spring);

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setEnabled(fine.matches && !reduced.matches);
    update();
    fine.addEventListener('change', update);
    reduced.addEventListener('change', update);
    return () => {
      fine.removeEventListener('change', update);
      reduced.removeEventListener('change', update);
    };
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!enabled || !element) return;
    let frame = 0;
    let clientX = 0;
    let clientY = 0;
    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      x.set(0);
      y.set(0);
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || element.matches(':focus-within'))
        return;
      clientX = event.clientX;
      clientY = event.clientY;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const rect = element.getBoundingClientRect();
        // Remove the current spring translation from the measured center.
        const dx =
          (clientX - (rect.left - springX.get() + rect.width / 2)) * 0.3;
        const dy =
          (clientY - (rect.top - springY.get() + rect.height / 2)) * 0.3;
        const scale = Math.min(1, magnetic.max / (Math.hypot(dx, dy) || 1));
        x.set(dx * scale);
        y.set(dy * scale);
      });
    };
    element.addEventListener('pointermove', move);
    element.addEventListener('pointerleave', reset);
    element.addEventListener('focusin', reset);
    return () => {
      reset();
      springX.jump(0);
      springY.jump(0);
      element.removeEventListener('pointermove', move);
      element.removeEventListener('pointerleave', reset);
      element.removeEventListener('focusin', reset);
    };
  }, [enabled, x, y, springX, springY]);

  if (!enabled) return children;
  return (
    <motion.span
      ref={ref}
      className="magnetic inline-flex"
      style={{ x: springX, y: springY }}
    >
      {children}
    </motion.span>
  );
}

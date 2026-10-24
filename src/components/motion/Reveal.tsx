'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { reveal, easeOutExpo } from '@/lib/motion';

export function Reveal({
  children,
  delay = 0,
  className,
  as = 'div',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'li';
}) {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<'idle' | 'hidden' | 'shown'>('idle');
  const reduced = useReducedMotion();

  useEffect(() => {
    const element = ref.current;
    if (reduced || !element || !window.IntersectionObserver) return;
    const rect = element.getBoundingClientRect();
    if (
      rect.top < window.innerHeight &&
      rect.bottom > 0 &&
      rect.left < window.innerWidth &&
      rect.right > 0
    )
      return;

    setState('hidden');
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      setState('shown');
      observer.disconnect();
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [reduced]);

  const Element = as === 'li' ? motion.li : motion.div;
  const StaticElement = as;
  if (reduced)
    return <StaticElement className={className}>{children}</StaticElement>;
  return (
    <Element
      ref={(element: HTMLDivElement | HTMLLIElement | null) => {
        ref.current = element;
      }}
      initial={false}
      style={
        state === 'hidden' ? { opacity: 0, y: reveal.distance } : undefined
      }
      animate={
        state === 'idle'
          ? undefined
          : state === 'hidden'
            ? { opacity: 0, y: reveal.distance }
            : { opacity: 1, y: 0 }
      }
      transition={
        state === 'hidden'
          ? { duration: 0 }
          : { duration: reveal.duration, ease: easeOutExpo, delay }
      }
      className={className}
    >
      {children}
    </Element>
  );
}

'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
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

  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      ref={ref}
      initial={false}
      style={state === 'hidden' ? { opacity: 0, y: 16 } : undefined}
      animate={
        state === 'idle'
          ? undefined
          : state === 'hidden'
            ? { opacity: 0, y: 16 }
            : { opacity: 1, y: 0 }
      }
      transition={
        state === 'hidden' ? { duration: 0 } : { duration: 0.5, delay }
      }
      className={className}
    >
      {children}
    </motion.div>
  );
}

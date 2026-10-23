'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { motion, useAnimationControls, useReducedMotion } from 'motion/react';

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
  const controls = useAnimationControls();
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

    controls.set({ opacity: 0, y: 16 });
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      void controls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, delay },
      });
      observer.disconnect();
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      controls.stop();
    };
  }, [controls, delay, reduced]);

  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      ref={ref}
      initial={false}
      animate={controls}
      className={className}
    >
      {children}
    </motion.div>
  );
}

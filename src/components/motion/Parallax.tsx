'use client';

import type { ReactNode } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react';

export function Parallax({
  children,
  className,
  decorative = false,
}: {
  children?: ReactNode;
  className?: string;
  decorative?: boolean;
}) {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1200], [0, 24]);
  return (
    <motion.div
      className={`parallax ${className ?? ''}`}
      aria-hidden={decorative || undefined}
      style={{ y: reduced ? 0 : y }}
    >
      {children}
    </motion.div>
  );
}

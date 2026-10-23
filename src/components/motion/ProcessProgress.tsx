'use client';

import { useRef } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'motion/react';

// CSS makes the line and numbers fully visible for reduced motion, including before hydration.
// This layer mirrors the server-rendered step grid; all readable content stays on the server.
export function ProcessProgress({ count }: { count: number }) {
  const target = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target,
    offset: ['start 80%', 'end 80%'],
  });
  return (
    <div
      ref={target}
      aria-hidden="true"
      className="process-progress pointer-events-none absolute inset-0 grid"
    >
      <motion.div
        className="process-line absolute inset-y-0 left-0 w-px origin-top bg-accent"
        style={{ scaleY: scrollYProgress }}
      />
      {Array.from({ length: count }, (_, index) => (
        <ProcessNumber
          key={index}
          index={index}
          count={count}
          progress={scrollYProgress}
        />
      ))}
    </div>
  );
}

function ProcessNumber({
  index,
  count,
  progress,
}: {
  index: number;
  count: number;
  progress: MotionValue<number>;
}) {
  const opacity = useTransform(progress, (value) =>
    value >= index / count ? 1 : 0,
  );
  return (
    <motion.span
      className="process-number relative -left-5 flex size-10 items-center justify-center rounded-full border border-accent bg-navy-800 text-accent"
      style={{ opacity }}
    >
      {index + 1}
    </motion.span>
  );
}

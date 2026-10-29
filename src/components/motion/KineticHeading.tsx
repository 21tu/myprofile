'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { durations, easeOutExpo, reveal, stagger } from '@/lib/motion';

export function KineticHeading({
  id,
  children,
}: {
  id: string;
  children: string;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
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
    return () => observer.disconnect();
  }, [reduced]);

  return (
    <h2
      ref={ref}
      id={id}
      tabIndex={-1}
      className="mb-4 scroll-mt-24 font-bold kinetic-heading"
    >
      {Array.from(
        new Intl.Segmenter('ja', { granularity: 'word' }).segment(children),
        ({ segment }, i) =>
          /\s/u.test(segment) ? (
            segment
          ) : (
            <span key={i} className="heading-segment">
              <motion.span
                className="heading-word"
                initial={false}
                style={
                  state === 'hidden' && !reduced
                    ? { opacity: 0, y: reveal.distance, filter: 'blur(6px)' }
                    : undefined
                }
                animate={
                  reduced
                    ? { opacity: 1, y: 0, filter: 'blur(0px)' }
                    : state === 'idle'
                      ? undefined
                      : state === 'hidden'
                        ? {
                            opacity: 0,
                            y: reveal.distance,
                            filter: 'blur(6px)',
                          }
                        : { opacity: 1, y: 0, filter: 'blur(0px)' }
                }
                transition={
                  state === 'hidden' || reduced
                    ? { duration: 0 }
                    : {
                        duration: durations.text,
                        ease: easeOutExpo,
                        delay: i * stagger,
                      }
                }
              >
                {segment}
              </motion.span>
            </span>
          ),
      )}
    </h2>
  );
}

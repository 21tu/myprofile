'use client';
import { useEffect, useRef, useState } from 'react';
import { useMotionValue, useSpring } from 'motion/react';
import { FoxSvg } from './FoxSvg';
import {
  characterAnimations as config,
  type Reaction,
} from './characterAnimations';

export function InteractiveCharacter() {
  const ref = useRef<HTMLButtonElement>(null);

  const [blinking, setBlinking] = useState(false);
  const [reaction, setReaction] = useState<Reaction | 'idle'>('idle');
  const [mood, setMood] = useState('neutral');
  const playing = useRef(false);
  const queued = useRef(false);
  const next = useRef(0);
  const reactionTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const x = useMotionValue(0),
    y = useMotionValue(0),
    tilt = useMotionValue(0);
  const sx = useSpring(x, config.spring),
    sy = useSpring(y, config.spring),
    st = useSpring(tilt, config.spring);

  const react = () => {
    if (playing.current) {
      queued.current = true;
      return;
    }
    const start = () => {
      playing.current = true;
      const name =
        config.reactions[next.current % config.reactions.length] ?? 'jump';
      next.current += 1;
      setReaction(name);
      reactionTimer.current = setTimeout(() => {
        if (queued.current) {
          queued.current = false;
          start();
        } else {
          playing.current = false;
          setReaction('idle');
        }
      }, config.durations[name]);
    };
    start();
  };

  useEffect(() => {
    ref.current?.setAttribute('data-ready', 'true');
    let blinkTimer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      if (document.hidden) return;
      blinkTimer = setTimeout(
        () => {
          setBlinking(true);
          blinkTimer = setTimeout(() => {
            setBlinking(false);
            schedule();
          }, config.blink.duration);
        },
        config.blink.min +
          Math.random() * (config.blink.max - config.blink.min),
      );
    };
    const visibility = () => {
      clearTimeout(blinkTimer);
      setBlinking(false);
      schedule();
    };
    schedule();
    document.addEventListener('visibilitychange', visibility);
    const visible = new Map<string, number>();
    const observer =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(
            (entries) => {
              for (const entry of entries) {
                if (entry.isIntersecting && entry.intersectionRatio >= 0.35)
                  visible.set(entry.target.id, entry.intersectionRatio);
                else visible.delete(entry.target.id);
              }
              setMood(
                [...visible].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'neutral',
              );
            },
            { threshold: 0.35 },
          );
    for (const id of ['about', 'projects', 'contact']) {
      const section = document.getElementById(id);
      if (section) observer?.observe(section);
    }
    return () => {
      clearTimeout(blinkTimer);
      clearTimeout(reactionTimer.current);
      document.removeEventListener('visibilitychange', visibility);
      observer?.disconnect();
    };
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let idle: ReturnType<typeof setTimeout>;
    let px = 0,
      py = 0;
    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      clearTimeout(idle);
      x.set(0);
      y.set(0);
      tilt.set(0);
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      px = event.clientX;
      py = event.clientY;
      clearTimeout(idle);
      idle = setTimeout(reset, config.track.idle);
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const rect = element.getBoundingClientRect();
        const dx = (px - rect.left - rect.width / 2) / Math.max(rect.width, 1);
        const dy = (py - rect.top - rect.height / 2) / Math.max(rect.height, 1);
        const length = Math.max(1, Math.hypot(dx, dy));
        x.set((dx / length) * config.track.eyes);
        y.set((dy / length) * config.track.eyes);
        tilt.set(Math.max(-1, Math.min(1, dx)) * config.track.head);
      });
    };
    const update = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerleave', reset);
      reset();
      sx.jump(0);
      sy.jump(0);
      st.jump(0);
      if (fine.matches && !reduced.matches) {
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerleave', reset);
      }
    };
    const subscriptions = [
      sx.on('change', (value) =>
        element.style.setProperty('--fox-eye-x', `${value}px`),
      ),
      sy.on('change', (value) =>
        element.style.setProperty('--fox-eye-y', `${value}px`),
      ),
      st.on('change', (value) =>
        element.style.setProperty('--fox-head-tilt', `${value}deg`),
      ),
    ];
    update();
    fine.addEventListener('change', update);
    reduced.addEventListener('change', update);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerleave', reset);
      fine.removeEventListener('change', update);
      reduced.removeEventListener('change', update);
      reset();
      sx.stop();
      sy.stop();
      st.stop();
      subscriptions.forEach((unsubscribe) => unsubscribe());
    };
  }, [x, y, tilt, sx, sy, st]);

  return (
    <button
      ref={ref}
      type="button"
      aria-label="きつねのマスコット。押すとリアクションします"
      className="fox-character mx-auto block aspect-square w-full max-w-[10rem] md:max-w-[22rem] cursor-pointer rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      data-ready="false"
      data-blinking={blinking}
      data-reaction={reaction}
      data-mood={mood}
      onClick={react}
    >
      <FoxSvg aria-hidden="true" focusable="false" className="h-full w-full" />
    </button>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { navigation } from '@/config/navigation';

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !menuRef.current?.contains(event.target)
      )
        setOpen(false);
    }
    function handleWheel() {
      setOpen(false);
    }
    document.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative shrink-0 md:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label="ナビゲーションメニュー"
        className="interactive flex min-h-11 min-w-11 cursor-pointer items-center justify-center text-accent"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </button>
      {open && (
        <nav
          id="mobile-nav"
          aria-label="モバイルナビゲーション"
          className="glass absolute right-0 top-full mt-3 w-48 rounded-2xl border border-line bg-bg/70 p-3 backdrop-blur-md backdrop-saturate-150"
        >
          {navigation.map((item) => (
            <a
              key={item.id}
              href={'#' + item.id}
              className="interactive flex min-h-11 min-w-11 items-center px-2 text-ink-muted hover:text-accent"
              onClick={() => {
                setOpen(false);
                requestAnimationFrame(() => {
                  document
                    .getElementById(item.id + '-heading')
                    ?.focus({ preventScroll: true });
                });
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </div>
  );
}

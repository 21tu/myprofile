import Image from 'next/image';
import { content } from '@/config/content';
import type { Content } from '@/config/types';
import { SampleBadge } from './SampleBadge';

export function MascotSlot({
  mascot = content.mascot,
}: {
  mascot?: Content['mascot'];
}) {
  if (mascot.src) {
    return (
      <figure className="overflow-hidden rounded-2xl border border-line bg-card">
        <Image
          unoptimized
          src={mascot.src}
          width={mascot.width}
          height={mascot.height}
          alt={mascot.alt}
          decoding="async"
          loading="eager"
          className="h-auto w-full"
        />
        {mascot.status === 'placeholder' && (
          <figcaption className="space-y-2 p-4 text-sm text-ink-muted">
            <p>仮画像（デザインコンセプトより。正式画像に差し替え予定）</p>
            <SampleBadge />
          </figcaption>
        )}
      </figure>
    );
  }
  return (
    <div className="flex min-h-48 items-center justify-center rounded-2xl border border-dashed border-accent/40 p-6 text-center text-ink-muted">
      マスコット画像（正式画像の提供待ち）
    </div>
  );
}

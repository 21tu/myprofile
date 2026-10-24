import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MascotSlot } from '@/components/ui/MascotSlot';
import { content } from '@/config/content';

describe('MascotSlot (ADR-006 / UX-002 / NFR-001 / NFR-004)', () => {
  it('renders the supplied image eagerly with alt and intrinsic dimensions', () => {
    render(<MascotSlot />);
    const image = screen.getByRole('img', { name: content.mascot.alt });
    expect(image).toHaveAttribute('src', '/mascot/fox-temp-concept.webp');
    expect(image).toHaveAttribute('width', '360');
    expect(image).toHaveAttribute('height', '212');
    expect(image).toHaveAttribute('decoding', 'async');
    expect(image).toHaveAttribute('loading', 'eager');
    const figure = screen.getByRole('figure');
    expect(figure.querySelector('figcaption')).toHaveTextContent('仮画像');
    expect(within(figure).getByText(/サンプル/)).toBeVisible();
  });

  it('keeps the dashed placeholder when src is null', () => {
    render(<MascotSlot mascot={{ ...content.mascot, src: null }} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(
      screen.getByText('マスコット画像（正式画像の提供待ち）'),
    ).toHaveClass('border-dashed');
  });

  it('omits the temporary caption and badge for confirmed images', () => {
    render(<MascotSlot mascot={{ ...content.mascot, status: 'confirmed' }} />);
    expect(screen.getByRole('img')).toBeVisible();
    expect(screen.getByRole('figure').querySelector('figcaption')).toBeNull();
    expect(screen.queryByText(/サンプル/)).not.toBeInTheDocument();
  });
});

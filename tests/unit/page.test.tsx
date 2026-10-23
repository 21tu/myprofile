import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import Home from '@/app/page';

it('renders the scaffold heading inside the skip-link target (FR-010)', () => {
  render(<Home />);
  expect(
    screen.getByRole('heading', {
      level: 1,
      name: 'Portfolio — under construction',
    }),
  ).toBeInTheDocument();
  expect(screen.getByRole('main')).toHaveAttribute('id', 'main');
});

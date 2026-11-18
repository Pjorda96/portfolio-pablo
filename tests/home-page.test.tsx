import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import HomePage from '@/app/page';

describe('HomePage', () => {
  it('renders the site name as the only level-one heading', () => {
    render(<HomePage />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('pablojorda.es');
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('wraps the content in a main landmark', () => {
    render(<HomePage />);

    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});

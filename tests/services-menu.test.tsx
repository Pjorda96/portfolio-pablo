import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { getSiteNav } from '@/components/layout/nav';
import { ServicesMenu } from '@/components/layout/ServicesMenu';

import { renderWithIntl } from './utils/intl';

vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  usePathname: () => '/servicios/soluciones-ia',
}));

const setup = () => {
  const { services } = getSiteNav('es');
  renderWithIntl(
    <>
      <ServicesMenu label={services.label} items={services.items} />
      <button type="button">Fuera</button>
    </>,
    'es',
  );
  return screen.getByRole('button', { name: 'Servicios' });
};

const list = (button: HTMLElement) =>
  document.getElementById(button.getAttribute('aria-controls') ?? '') as HTMLElement;

describe('ServicesMenu', () => {
  it('is a disclosure button controlling the list of services', () => {
    const button = setup();
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(list(button)).not.toBeVisible();

    fireEvent.click(button);

    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(list(button)).toBeVisible();
    for (const [name, href] of [
      ['Desarrollo web a medida', '/servicios/desarrollo-web-a-medida'],
      ['Soluciones con IA', '/servicios/soluciones-ia'],
      ['Apps, SaaS y MVPs', '/servicios/apps-saas-mvp'],
    ]) {
      expect(screen.getByRole('link', { name })).toHaveAttribute('href', href);
    }
    // The current page is marked.
    expect(screen.getByRole('link', { name: 'Soluciones con IA' })).toHaveAttribute(
      'aria-current',
      'page',
    );

    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes on Escape and returns focus to the button', () => {
    const button = setup();
    fireEvent.click(button);
    screen.getByRole('link', { name: 'Soluciones con IA' }).focus();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveFocus();
  });

  it('ignores other keys', () => {
    const button = setup();
    fireEvent.click(button);
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes on a pointer down outside, not inside', () => {
    const button = setup();
    fireEvent.click(button);

    fireEvent.pointerDown(screen.getByRole('link', { name: 'Apps, SaaS y MVPs' }));
    expect(button).toHaveAttribute('aria-expanded', 'true');

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Fuera' }));
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes when focus leaves it, not when it moves inside', () => {
    const button = setup();
    fireEvent.click(button);
    const link = screen.getByRole('link', { name: 'Apps, SaaS y MVPs' });

    fireEvent.blur(button, { relatedTarget: link });
    expect(button).toHaveAttribute('aria-expanded', 'true');

    fireEvent.blur(link, { relatedTarget: screen.getByRole('button', { name: 'Fuera' }) });
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes after following a link', () => {
    const button = setup();
    fireEvent.click(button);
    fireEvent.click(screen.getByRole('link', { name: 'Desarrollo web a medida' }));
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });
});

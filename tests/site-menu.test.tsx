import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { getSiteNav } from '@/components/layout/nav';
import { SiteMenu } from '@/components/layout/SiteMenu';

import { renderWithIntl } from './utils/intl';

vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  usePathname: () => '/sobre-mi',
}));

const setup = () => {
  renderWithIntl(<SiteMenu nav={getSiteNav('es')} />, 'es');
  return screen.getByRole('button', { name: 'Abrir menú' });
};

describe('SiteMenu', () => {
  it('opens a labelled modal dialog and reflects it in aria-expanded', () => {
    const toggle = setup();
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('dialog')).toBeNull();

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const dialog = screen.getByRole('dialog', { name: 'Menú' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(toggle).toHaveAttribute('aria-controls', dialog.id);
  });

  it('lists the navigation, the single CTA, theme and language', () => {
    fireEvent.click(setup());

    for (const name of [
      'Desarrollo web a medida',
      'Soluciones con IA',
      'Apps, SaaS y MVPs',
      'Proyectos',
      'Sobre mí',
      'Preguntas frecuentes',
      'Cuéntame tu proyecto',
    ]) {
      expect(screen.getByRole('link', { name })).toBeInTheDocument();
    }
    expect(screen.getByRole('link', { name: 'Cuéntame tu proyecto' })).toHaveAttribute(
      'href',
      '/contacto',
    );
    expect(screen.getByRole('link', { name: 'Sobre mí' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('group', { name: 'Tema' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /English/ })).toHaveAttribute('href', '/en/about');
  });

  it('moves focus inside, traps Tab and closes with Escape', () => {
    const toggle = setup();
    toggle.focus();
    fireEvent.click(toggle);

    const close = screen.getByRole('button', { name: 'Cerrar menú' });
    expect(close).toHaveFocus();

    // Shift+Tab on the first element wraps to the last one.
    fireEvent.keyDown(close, { key: 'Tab', shiftKey: true });
    const english = screen.getByRole('link', { name: /English/ });
    expect(english).toHaveFocus();

    // Tab on the last element wraps to the first one.
    fireEvent.keyDown(english, { key: 'Tab' });
    expect(close).toHaveFocus();

    fireEvent.keyDown(close, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveFocus();
  });

  it('closes when a link is followed', () => {
    fireEvent.click(setup());
    fireEvent.click(screen.getByRole('link', { name: 'Proyectos' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

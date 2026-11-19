import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ContactPage } from '@/components/pages/contact/ContactPage';
import { getContent } from '@/content';
import type { ContactFormState } from '@/lib/contact/state';
import { getContactFormUi } from '@/lib/contact/copy';

const action = vi.fn<(previous: ContactFormState, data: FormData) => Promise<ContactFormState>>();
vi.mock('@/app/[locale]/contacto/actions', () => ({
  sendContactMessage: (previous: ContactFormState, data: FormData) => action(previous, data),
}));

const renderPage = (locale: 'es' | 'en' = 'es') =>
  render(
    <ContactPage
      locale={locale}
      content={getContent(locale).contact}
      ui={getContactFormUi(locale)}
      formToken="123.signature"
    />,
  );

const fillValid = () => {
  fireEvent.change(screen.getByLabelText(/^Nombre/), { target: { value: 'Ada' } });
  fireEvent.change(screen.getByLabelText(/^Correo electrónico/), {
    target: { value: 'ada@example.com' },
  });
  fireEvent.change(screen.getByLabelText(/^¿Qué necesitas\?/), { target: { value: 'web' } });
  fireEvent.change(screen.getByLabelText(/^Tu proyecto/), {
    target: { value: 'Una web a medida para mi estudio, con blog y reservas.' },
  });
  fireEvent.click(screen.getByLabelText(/política de privacidad/));
};

const submit = async () => {
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }));
  });
};

beforeEach(() => {
  action.mockReset();
});

describe('ContactForm', () => {
  it('renders every field with its label, plus the hidden anti-spam fields', () => {
    const { container } = renderPage();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Cuéntame tu proyecto.');
    expect(screen.getByLabelText(/^Nombre/)).toBeRequired();
    expect(screen.getByLabelText(/^Empresa o proyecto/)).not.toBeRequired();
    expect(screen.getAllByRole('option')).toHaveLength(5);
    expect(screen.getByRole('link', { name: 'Leer la política de privacidad' })).toHaveAttribute(
      'href',
      '/legal/privacidad',
    );

    const token = container.querySelector('input[name="formToken"]');
    expect(token).toHaveValue('123.signature');
    const honeypot = container.querySelector('input[name="website"]');
    expect(honeypot).toHaveAttribute('tabindex', '-1');
    expect(honeypot).toHaveAttribute('autocomplete', 'off');
    expect(honeypot?.closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it('shows inline errors and a focused summary without calling the server', async () => {
    renderPage();
    await submit();

    expect(action).not.toHaveBeenCalled();
    const summary = screen.getByRole('group', { name: 'Revisa el formulario:' });
    expect(summary).toHaveFocus();
    expect(screen.getByRole('link', { name: 'Escribe tu nombre.' })).toHaveAttribute(
      'href',
      '#contact-name',
    );

    const name = screen.getByLabelText(/^Nombre/);
    expect(name).toHaveAttribute('aria-invalid', 'true');
    expect(name).toHaveAccessibleDescription('Escribe tu nombre.');
    expect(screen.getByLabelText(/^Correo electrónico/)).toHaveAccessibleDescription(
      'Solo lo uso para responderte. Escribe tu correo electrónico.',
    );
    expect(screen.getByLabelText(/^Empresa o proyecto/)).not.toHaveAttribute('aria-invalid');
  });

  it('sends a valid form and announces success', async () => {
    action.mockResolvedValue({ status: 'success', at: 1 });
    renderPage();
    fillValid();
    await submit();

    await waitFor(() => expect(action).toHaveBeenCalledOnce());
    const data = action.mock.calls[0]![1];
    expect(data.get('name')).toBe('Ada');
    expect(data.get('privacy')).toBe('on');
    expect(data.get('locale')).toBe('es');

    const status = await screen.findByRole('status');
    await waitFor(() => expect(status).toHaveTextContent('Mensaje enviado. ¡Gracias!'));
    expect(screen.queryByRole('button', { name: 'Enviar mensaje' })).not.toBeInTheDocument();
  });

  it('shows server-side errors, such as the rate limit', async () => {
    action.mockImplementation(async (_previous, data) => ({
      status: 'error',
      at: 2,
      formError: 'rateLimited',
      fieldErrors: {},
      values: {
        name: String(data.get('name')),
        email: String(data.get('email')),
        company: '',
        service: 'web',
        message: String(data.get('message')),
        privacy: true,
      },
    }));
    renderPage();
    fillValid();
    await submit();

    const summary = await screen.findByRole('group', { name: 'Revisa el formulario:' });
    expect(summary).toHaveTextContent(/Espera unos minutos/);
    await waitFor(() => expect(summary).toHaveFocus());
    expect(screen.getByLabelText(/^Nombre/)).toHaveValue('Ada');
  });

  it('uses the English copy on the English page', async () => {
    renderPage('en');
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
    });
    expect(screen.getByRole('group', { name: 'Please check the form:' })).toHaveFocus();
    expect(screen.getByRole('link', { name: 'Please enter your name.' })).toBeInTheDocument();
  });
});

import { describe, expect, it } from 'vitest';

import { getContent, LOCALES } from '@/content';
import { contactFormUi as enUi } from '@/content/en/contact';
import { contactFormUi as esUi } from '@/content/es/contact';
import {
  MESSAGE_MAX,
  readContactValues,
  validateContact,
  type ContactErrorKey,
  type ContactValues,
} from '@/lib/contact/schema';

const valid: ContactValues = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  company: '',
  service: 'web',
  message: 'Necesito una web a medida para mi estudio de arquitectura.',
  privacy: true,
};

const errorsOf = (values: Partial<ContactValues>) => {
  const result = validateContact({ ...valid, ...values });
  return result.success ? {} : result.errors;
};

const ERROR_KEYS: ContactErrorKey[] = [
  'nameRequired',
  'emailRequired',
  'emailInvalid',
  'serviceRequired',
  'messageTooShort',
  'messageTooLong',
  'privacyRequired',
  'rateLimited',
  'spam',
  'generic',
];

describe('contact schema', () => {
  it('accepts a complete message and trims it', () => {
    const result = validateContact({ ...valid, name: '  Ada  ', company: ' Acme ' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Ada');
      expect(result.data.company).toBe('Acme');
    }
  });

  it('accepts every project type and rejects anything else', () => {
    for (const service of ['web', 'ai', 'apps', 'other']) {
      expect(errorsOf({ service })).toEqual({});
    }
    expect(errorsOf({ service: '' })).toEqual({ service: 'serviceRequired' });
    expect(errorsOf({ service: 'hacking' })).toEqual({ service: 'serviceRequired' });
  });

  it.each<[Partial<ContactValues>, Record<string, ContactErrorKey>]>([
    [{ name: '   ' }, { name: 'nameRequired' }],
    [{ email: '' }, { email: 'emailRequired' }],
    [{ email: 'ada@' }, { email: 'emailInvalid' }],
    [{ email: 'ada.example.com' }, { email: 'emailInvalid' }],
    [{ message: 'Muy corto' }, { message: 'messageTooShort' }],
    [{ message: 'x'.repeat(MESSAGE_MAX + 1) }, { message: 'messageTooLong' }],
    [{ privacy: false }, { privacy: 'privacyRequired' }],
  ])('reports %o as %o', (values, expected) => {
    expect(errorsOf(values)).toEqual(expected);
  });

  it('reports one error per failing field', () => {
    const result = validateContact({
      name: '',
      email: '',
      company: '',
      service: '',
      message: '',
      privacy: false,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toEqual({
        name: 'nameRequired',
        email: 'emailRequired',
        service: 'serviceRequired',
        message: 'messageTooShort',
        privacy: 'privacyRequired',
      });
    }
  });

  it('reads FormData, treating an unchecked checkbox as false', () => {
    const data = new FormData();
    data.set('name', ' Ada ');
    data.set('email', 'ada@example.com');
    data.set('service', 'ai');
    data.set('message', 'hola');
    expect(readContactValues(data)).toEqual({
      name: 'Ada',
      email: 'ada@example.com',
      company: '',
      service: 'ai',
      message: 'hola',
      privacy: false,
    });
    data.set('privacy', 'on');
    expect(readContactValues(data).privacy).toBe(true);
  });

  it.each(LOCALES)('has a %s message for every error key', (locale) => {
    const { errors } = getContent(locale).contact.form;
    for (const key of ERROR_KEYS) expect(errors[key].length).toBeGreaterThan(5);
  });

  it('localizes the messages', () => {
    expect(getContent('es').contact.form.errors.nameRequired).toBe('Escribe tu nombre.');
    expect(getContent('en').contact.form.errors.nameRequired).toBe('Please enter your name.');
    expect(esUi.unavailable).toMatch(/no está disponible/);
    expect(enUi.unavailable).toMatch(/temporarily unavailable/);
    expect(Object.keys(enUi).sort()).toEqual(Object.keys(esUi).sort());
  });
});

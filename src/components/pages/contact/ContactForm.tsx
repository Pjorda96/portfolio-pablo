'use client';

import { useActionState, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { flushSync } from 'react-dom';

import { sendContactMessage } from '@/app/[locale]/contacto/actions';
import type { ContactContent, Locale } from '@/content';
import type { ContactFormUi } from '@/content/es/contact';
import { HONEYPOT_FIELD, TOKEN_FIELD } from '@/lib/contact/fields';
import {
  CONTACT_FIELDS,
  COMPANY_MAX,
  EMAIL_MAX,
  MESSAGE_MAX,
  NAME_MAX,
  PROJECT_TYPES,
  readContactValues,
  validateContact,
  type ContactField,
  type ContactFieldErrors,
} from '@/lib/contact/schema';
import { initialContactState } from '@/lib/contact/state';

interface ContactFormProps {
  locale: Locale;
  form: ContactContent['form'];
  ui: ContactFormUi;
  privacyHref: string;
  /** Signed render timestamp (anti-spam), issued by the server per request. */
  token: string;
}

const fieldId = (field: ContactField) => `contact-${field}`;
const errorId = (field: ContactField) => `contact-${field}-error`;
const helpId = (field: ContactField) => `contact-${field}-help`;

const inputClass =
  'w-full rounded-[10px] border border-line bg-surface px-3 py-2.5 text-base text-text placeholder:text-text-muted aria-invalid:border-accent-strong aria-invalid:ring-1 aria-invalid:ring-accent-strong';

/**
 * The contact form. Posts to a Server Action, so it works without JavaScript
 * (the server validates and renders the result); with JavaScript it validates
 * on submit with the same Zod schema, shows inline errors and an error summary
 * that takes focus, and announces success in a live region.
 */
export function ContactForm({ locale, form, ui, privacyHref, token }: ContactFormProps) {
  const [state, formAction, pending] = useActionState(sendContactMessage, initialContactState);
  const [clientErrors, setClientErrors] = useState<ContactFieldErrors | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);

  const serverError = state.status === 'error' ? state : null;
  const fieldErrors = clientErrors ?? serverError?.fieldErrors ?? {};
  const formError = clientErrors ? undefined : serverError?.formError;
  const values = serverError?.values;
  const failedFields = CONTACT_FIELDS.filter((field) => fieldErrors[field]);
  const hasErrors = failedFields.length > 0 || formError !== undefined;

  // After a round trip, focus goes to the error summary or the success heading.
  useEffect(() => {
    if (state.status === 'error') summaryRef.current?.focus();
    if (state.status === 'success') successRef.current?.focus();
  }, [state]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    const result = validateContact(readContactValues(new FormData(event.currentTarget)));
    if (result.success) {
      setClientErrors(null);
      return;
    }
    event.preventDefault();
    flushSync(() => setClientErrors(result.errors));
    summaryRef.current?.focus();
  };

  const errorText = (field: ContactField) => {
    const key = fieldErrors[field];
    return key ? form.errors[key] : undefined;
  };

  const formErrorText =
    formError === 'unavailable' ? ui.unavailable : formError ? form.errors[formError] : undefined;

  const describedBy = (field: ContactField, hasHelp: boolean) =>
    [hasHelp && helpId(field), fieldErrors[field] && errorId(field)].filter(Boolean).join(' ') ||
    undefined;

  const invalid = (field: ContactField) => (fieldErrors[field] ? true : undefined);

  const { fields } = form;

  return (
    <div className="grid gap-6">
      <div role="status" aria-live="polite" aria-atomic="true">
        {state.status === 'success' && (
          <div className="grid gap-2 rounded-[14px] border border-line bg-surface p-6">
            <h3
              ref={successRef}
              tabIndex={-1}
              className="font-display text-2xl font-extrabold tracking-[-0.02em] outline-none"
            >
              {form.success.title}
            </h3>
            <p className="text-text-muted">{form.success.text}</p>
          </div>
        )}
      </div>

      {state.status !== 'success' && (
        <form
          action={formAction}
          onSubmit={handleSubmit}
          noValidate
          aria-describedby="contact-required-hint"
          className="relative grid gap-5"
        >
          <p id="contact-required-hint" className="text-sm text-text-muted">
            {form.requiredHint}
          </p>

          {hasErrors && (
            <div
              ref={summaryRef}
              tabIndex={-1}
              role="group"
              aria-labelledby="contact-error-summary"
              className="grid gap-2 rounded-[10px] border-2 border-accent-strong bg-surface p-4"
            >
              <p id="contact-error-summary" className="font-semibold">
                {ui.errorSummary}
              </p>
              <ul className="grid list-disc gap-1 pl-5">
                {formErrorText && <li>{formErrorText}</li>}
                {failedFields.map((field) => (
                  <li key={field}>
                    <a
                      href={`#${fieldId(field)}`}
                      className="underline underline-offset-4 hover:text-accent-strong"
                    >
                      {errorText(field)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <input type="hidden" name={TOKEN_FIELD} value={token} />
          <input type="hidden" name="locale" value={locale} />

          {/* Honeypot: invisible to people and to assistive technology. */}
          <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
            <label htmlFor="contact-website">{ui.honeypot}</label>
            <input
              id="contact-website"
              type="text"
              name={HONEYPOT_FIELD}
              tabIndex={-1}
              autoComplete="off"
              defaultValue=""
            />
          </div>

          <Field
            field="name"
            label={fields.name.label}
            required
            help={fields.name.help}
            error={errorText('name')}
          >
            <input
              id={fieldId('name')}
              name="name"
              type="text"
              autoComplete="name"
              required
              maxLength={NAME_MAX}
              placeholder={fields.name.placeholder}
              defaultValue={values?.name}
              aria-invalid={invalid('name')}
              aria-describedby={describedBy('name', Boolean(fields.name.help))}
              className={inputClass}
            />
          </Field>

          <Field
            field="email"
            label={fields.email.label}
            required
            help={fields.email.help}
            error={errorText('email')}
          >
            <input
              id={fieldId('email')}
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              spellCheck={false}
              required
              maxLength={EMAIL_MAX}
              placeholder={fields.email.placeholder}
              defaultValue={values?.email}
              aria-invalid={invalid('email')}
              aria-describedby={describedBy('email', Boolean(fields.email.help))}
              className={inputClass}
            />
          </Field>

          <Field
            field="company"
            label={fields.company.label}
            optional={form.optional}
            help={fields.company.help}
            error={errorText('company')}
          >
            <input
              id={fieldId('company')}
              name="company"
              type="text"
              autoComplete="organization"
              maxLength={COMPANY_MAX}
              placeholder={fields.company.placeholder}
              defaultValue={values?.company}
              aria-invalid={invalid('company')}
              aria-describedby={describedBy('company', Boolean(fields.company.help))}
              className={inputClass}
            />
          </Field>

          <Field
            field="service"
            label={fields.service.label}
            required
            help={fields.service.help}
            error={errorText('service')}
          >
            <select
              id={fieldId('service')}
              name="service"
              required
              defaultValue={values?.service ?? ''}
              aria-invalid={invalid('service')}
              aria-describedby={describedBy('service', Boolean(fields.service.help))}
              className={inputClass}
            >
              <option value="" disabled>
                {fields.service.placeholder}
              </option>
              {PROJECT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {fields.service.options[type]}
                </option>
              ))}
            </select>
          </Field>

          <Field
            field="message"
            label={fields.message.label}
            required
            help={fields.message.help}
            error={errorText('message')}
          >
            <textarea
              id={fieldId('message')}
              name="message"
              required
              rows={7}
              maxLength={MESSAGE_MAX}
              placeholder={fields.message.placeholder}
              defaultValue={values?.message}
              aria-invalid={invalid('message')}
              aria-describedby={describedBy('message', Boolean(fields.message.help))}
              className={`${inputClass} min-h-40 resize-y`}
            />
          </Field>

          <div className="grid gap-1.5">
            <div className="flex items-start gap-3">
              <input
                id={fieldId('privacy')}
                name="privacy"
                type="checkbox"
                required
                defaultChecked={values?.privacy}
                aria-invalid={invalid('privacy')}
                aria-describedby={describedBy('privacy', false)}
                className="mt-1 size-4 shrink-0 accent-accent-strong"
              />
              <label htmlFor={fieldId('privacy')}>
                {fields.privacy.label} <RequiredMark />
              </label>
            </div>
            <p className="pl-7 text-sm">
              <a
                href={privacyHref}
                className="underline underline-offset-4 hover:text-accent-strong"
              >
                {fields.privacy.linkLabel}
              </a>
            </p>
            <FieldError field="privacy" error={errorText('privacy')} />
          </div>

          <p>
            <button type="submit" className="btn-primary disabled:opacity-70" disabled={pending}>
              {pending ? form.sending : form.submit}
            </button>
          </p>
        </form>
      )}
    </div>
  );
}

function RequiredMark() {
  return (
    <span aria-hidden="true" className="text-accent-strong">
      *
    </span>
  );
}

function FieldError({ field, error }: { field: ContactField; error?: string }) {
  if (!error) return null;
  return (
    <p id={errorId(field)} className="text-sm font-medium text-accent-strong">
      {error}
    </p>
  );
}

interface FieldProps {
  field: ContactField;
  label: string;
  required?: boolean;
  optional?: string;
  help: string;
  error?: string;
  children: ReactNode;
}

function Field({ field, label, required, optional, help, error, children }: FieldProps) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={fieldId(field)} className="font-medium">
        {label}{' '}
        {required ? (
          <RequiredMark />
        ) : (
          optional && <span className="font-normal text-text-muted">{optional}</span>
        )}
      </label>
      {children}
      {help && (
        <p id={helpId(field)} className="text-sm text-text-muted">
          {help}
        </p>
      )}
      <FieldError field={field} error={error} />
    </div>
  );
}

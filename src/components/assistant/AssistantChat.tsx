'use client';

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';

import type { AssistantContent, Locale } from '@/content';
import { ASSISTANT_ENDPOINT, MAX_QUESTIONS, QUESTION_MAX } from '@/lib/assistant/config';
import {
  errorCodeForStatus,
  readEvents,
  type AssistantDoneReason,
  type AssistantErrorCode,
} from '@/lib/assistant/protocol';
import type { AssistantMessage } from '@/lib/assistant/schema';

type TurnStatus = 'streaming' | 'done' | 'truncated' | 'stopped' | 'refusal' | 'error';

interface Turn {
  id: number;
  question: string;
  answer: string;
  status: TurnStatus;
  error?: AssistantErrorCode;
}

interface AssistantChatProps {
  locale: Locale;
  copy: AssistantContent;
  /** False when the server has no API key: shows the unavailable notice. */
  available: boolean;
  /** Link to the contact page, rendered by the server. */
  contactLink: ReactNode;
}

/** Turns whose answer the model can build on: sent back as history. */
const inHistory = (t: Turn) =>
  t.answer.trim() !== '' &&
  (t.status === 'done' || t.status === 'truncated' || t.status === 'stopped');

const toHistory = (turns: readonly Turn[]): AssistantMessage[] =>
  turns.filter(inHistory).flatMap((t) => [
    { role: 'user' as const, content: t.question },
    { role: 'assistant' as const, content: t.answer.trim() },
  ]);

const statusFor = (reason: AssistantDoneReason): TurnStatus =>
  reason === 'refusal' ? 'refusal' : reason === 'max_tokens' ? 'truncated' : 'done';

const INPUT_ID = 'assistant-question';
const HELP_ID = 'assistant-question-help';
const ERROR_ID = 'assistant-question-error';

/**
 * "Ask me about my services": a short conversation with the assistant over
 * the site's content. The answer streams into the page; a polite live region
 * announces "typing…" and then the complete answer (not every token), so
 * screen readers get it once. Nothing is stored: the history lives in this
 * component and is sent with each question.
 */
export function AssistantChat({ locale, copy, available, contactLink }: AssistantChatProps) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [question, setQuestion] = useState('');
  const [invalid, setInvalid] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const limitRef = useRef<HTMLParagraphElement>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const nextId = useRef(0);

  const streaming = turns.some((t) => t.status === 'streaming');
  const limitReached = turns.filter(inHistory).length >= MAX_QUESTIONS;

  // The form goes away at the limit: move focus to the notice that replaces it.
  useEffect(() => {
    if (limitReached) limitRef.current?.focus();
  }, [limitReached]);

  // Stop any answer in flight when the section unmounts.
  useEffect(() => () => controllerRef.current?.abort(), []);

  const update = (id: number, patch: Partial<Turn>) =>
    setTurns((all) => all.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const errorText = (code: AssistantErrorCode) => copy.errors[code];

  async function ask(text: string) {
    const q = text.trim();
    if (streaming || limitReached) return;
    if (!q || q.length > QUESTION_MAX) {
      setInvalid(true);
      inputRef.current?.focus();
      return;
    }

    const id = nextId.current++;
    const messages = [...toHistory(turns), { role: 'user' as const, content: q }];
    setTurns((all) => [...all, { id, question: q, answer: '', status: 'streaming' }]);
    setQuestion('');
    setInvalid(false);
    setAnnouncement(copy.conversation.thinking);

    const controller = new AbortController();
    controllerRef.current = controller;
    let answer = '';
    let result: Pick<Turn, 'status' | 'error'> = { status: 'error', error: 'generic' };

    try {
      const response = await fetch(ASSISTANT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale, messages }),
        signal: controller.signal,
      });
      let received = false;
      if (response.body) {
        for await (const event of readEvents(response.body)) {
          if (event.type === 'text') {
            answer += event.text;
            update(id, { answer });
          } else if (event.type === 'done') {
            result = { status: statusFor(event.reason) };
            received = true;
          } else {
            result = { status: 'error', error: event.code };
            received = true;
          }
        }
      }
      if (!received && !response.ok) {
        result = { status: 'error', error: errorCodeForStatus(response.status) };
      }
    } catch {
      result = controller.signal.aborted
        ? { status: 'stopped' }
        : { status: 'error', error: 'generic' };
    } finally {
      controllerRef.current = null;
    }

    // A declined or failed answer is replaced by its message, never half shown.
    const failed = result.status === 'refusal' || result.status === 'error';
    update(id, { ...result, answer: failed ? '' : answer });
    setAnnouncement(
      result.status === 'refusal'
        ? copy.errors.refusal
        : result.status === 'error'
          ? errorText(result.error ?? 'generic')
          : `${copy.conversation.assistant}: ${answer}`,
    );
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (streaming) return;
    void ask(question);
  };

  const askSuggestion = (text: string) => {
    // The suggestions go away once asked: keep focus in the form.
    inputRef.current?.focus();
    void ask(text);
  };

  const stop = () => controllerRef.current?.abort();

  const reset = () => {
    controllerRef.current?.abort();
    setTurns([]);
    setQuestion('');
    setInvalid(false);
    setAnnouncement('');
    // The input is rendered again on the next commit.
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const note = (t: Turn) =>
    t.status === 'truncated'
      ? copy.conversation.truncated
      : t.status === 'stopped'
        ? copy.conversation.stopped
        : null;

  if (!available) {
    return (
      <div className="grid content-start gap-4 rounded-[14px] border border-line bg-surface p-6">
        <p>{copy.errors.unavailable}</p>
        <p>{contactLink}</p>
      </div>
    );
  }

  return (
    <div className="grid content-start gap-5 rounded-[14px] border border-line bg-surface p-5 sm:p-6">
      <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </p>

      {turns.length === 0 && (
        <div className="grid gap-3">
          <p id="assistant-suggestions" className="kicker">
            {copy.suggestions.label}
          </p>
          <ul aria-labelledby="assistant-suggestions" className="grid gap-2">
            {copy.suggestions.items.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => askSuggestion(s)}
                  className="w-full rounded-[10px] border border-line bg-ground px-3 py-2.5 text-left text-[15px] hover:border-accent-strong"
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {turns.length > 0 && (
        <ol aria-label={copy.conversation.label} className="grid gap-5">
          {turns.map((t) => (
            <li key={t.id} className="grid gap-3">
              <div className="grid gap-1 justify-self-end rounded-[10px] bg-ground px-3 py-2 sm:max-w-[85%]">
                <p className="kicker">{copy.conversation.you}</p>
                <p className="break-words whitespace-pre-wrap">{t.question}</p>
              </div>
              <div
                aria-busy={t.status === 'streaming'}
                className="grid gap-1 border-l-2 border-accent pl-3"
              >
                <p className="kicker">{copy.conversation.assistant}</p>
                {t.status === 'streaming' && t.answer === '' && (
                  <p className="text-text-muted">
                    <span aria-hidden="true" className="motion-safe:animate-pulse">
                      •••
                    </span>
                    <span className="sr-only">{copy.conversation.thinking}</span>
                  </p>
                )}
                {t.answer !== '' && <p className="break-words whitespace-pre-wrap">{t.answer}</p>}
                {note(t) && <p className="text-sm text-text-muted">{note(t)}</p>}
                {t.status === 'refusal' && <p>{copy.errors.refusal}</p>}
                {t.status === 'error' && (
                  <p className="font-medium text-accent-strong">
                    {errorText(t.error ?? 'generic')}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}

      {limitReached ? (
        <p ref={limitRef} tabIndex={-1} className="font-medium outline-none">
          {copy.limitReached}
        </p>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="grid gap-2">
          <label htmlFor={INPUT_ID} className="font-medium">
            {copy.form.label}
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              ref={inputRef}
              id={INPUT_ID}
              type="text"
              value={question}
              onChange={(e) => {
                setQuestion(e.target.value);
                if (invalid) setInvalid(false);
              }}
              maxLength={QUESTION_MAX}
              autoComplete="off"
              enterKeyHint="send"
              placeholder={copy.form.placeholder}
              aria-invalid={invalid || undefined}
              aria-describedby={invalid ? `${ERROR_ID} ${HELP_ID}` : HELP_ID}
              className="min-w-0 flex-1 rounded-[10px] border border-line bg-ground px-3 py-2.5 text-base text-text placeholder:text-text-muted aria-invalid:border-accent-strong aria-invalid:ring-1 aria-invalid:ring-accent-strong"
            />
            {/* One button that turns into "stop" while answering, so focus stays put. */}
            <button
              type={streaming ? 'button' : 'submit'}
              onClick={streaming ? stop : undefined}
              className={streaming ? 'btn-secondary' : 'btn-primary'}
            >
              {streaming ? copy.form.stop : copy.form.submit}
            </button>
          </div>
          {invalid && (
            <p id={ERROR_ID} className="text-sm font-medium text-accent-strong">
              {copy.errors.invalid}
            </p>
          )}
          <p id={HELP_ID} className="text-sm text-text-muted">
            {copy.form.help}
          </p>
        </form>
      )}

      {turns.length > 0 && !streaming && (
        <p>
          <button type="button" onClick={reset} className="btn-secondary">
            {copy.form.reset}
          </button>
        </p>
      )}

      <div className="grid gap-2 border-t border-line pt-4 text-sm">
        <p className="text-text-muted">{copy.disclaimer}</p>
        <p>{contactLink}</p>
      </div>
    </div>
  );
}

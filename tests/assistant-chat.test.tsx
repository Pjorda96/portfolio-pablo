import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import NextLink from 'next/link';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AssistantChat } from '@/components/assistant/AssistantChat';
import { AssistantSection } from '@/components/assistant/AssistantSection';
import { getContent, LOCALES, type Locale } from '@/content';
import { isAssistantConfigured } from '@/lib/assistant/availability';
import { ASSISTANT_ENDPOINT, MAX_QUESTIONS } from '@/lib/assistant/config';
import { encodeEvent, type AssistantEvent } from '@/lib/assistant/protocol';

import { renderWithIntl } from './utils/intl';

vi.mock('@/lib/assistant/availability', () => ({ isAssistantConfigured: vi.fn(() => false) }));

const ndjson = (...events: AssistantEvent[]) => events.map(encodeEvent).join('');

/** A fetch response whose body the test writes to, chunk by chunk. */
function controlledResponse(status = 200) {
  let controller!: ReadableStreamDefaultController<Uint8Array>;
  const body = new ReadableStream<Uint8Array>({
    start(c) {
      controller = c;
    },
  });
  const encoder = new TextEncoder();
  return {
    response: new Response(body, { status }),
    push: (...events: AssistantEvent[]) => controller.enqueue(encoder.encode(ndjson(...events))),
    close: () => controller.close(),
    fail: (error: unknown) => controller.error(error),
  };
}

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

const answerWith = (status: number, ...events: AssistantEvent[]) =>
  fetchMock.mockImplementationOnce(async () => new Response(ndjson(...events), { status }));

const renderChat = (locale: Locale, available = true) => {
  const copy = getContent(locale).assistant;
  render(
    <AssistantChat
      locale={locale}
      copy={copy}
      available={available}
      contactLink={<NextLink href={copy.contact.href}>{copy.contact.label}</NextLink>}
    />,
  );
  return copy;
};

const sentBody = (call = 0) =>
  JSON.parse(String(fetchMock.mock.calls[call]?.[1]?.body)) as {
    locale: string;
    messages: { role: string; content: string }[];
  };

const ask = (copy: ReturnType<typeof renderChat>, text: string) => {
  fireEvent.change(screen.getByRole('textbox', { name: copy.form.label }), {
    target: { value: text },
  });
  fireEvent.submit(screen.getByRole('textbox', { name: copy.form.label }).closest('form')!);
};

describe.each(LOCALES)('AssistantChat (%s)', (locale) => {
  it('renders an accessible form, the suggestions, the disclaimer and the contact link', () => {
    const copy = renderChat(locale);
    const input = screen.getByRole('textbox', { name: copy.form.label });
    expect(input).toHaveAccessibleDescription(copy.form.help);
    expect(input).toHaveAttribute('maxLength', '500');
    expect(screen.getByRole('button', { name: copy.form.submit })).toHaveAttribute(
      'type',
      'submit',
    );
    const suggestions = screen.getByRole('list', { name: copy.suggestions.label });
    expect(within(suggestions).getAllByRole('button')).toHaveLength(3);
    expect(screen.getByText(copy.disclaimer)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: copy.contact.label })).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('streams the answer into the page and announces it once complete', async () => {
    const copy = renderChat(locale);
    const stream = controlledResponse();
    fetchMock.mockResolvedValueOnce(stream.response);

    ask(copy, 'Remote?');
    expect(fetchMock).toHaveBeenCalledWith(
      ASSISTANT_ENDPOINT,
      expect.objectContaining({ method: 'POST' }),
    );
    expect(sentBody()).toEqual({ locale, messages: [{ role: 'user', content: 'Remote?' }] });
    expect(screen.getByRole('status')).toHaveTextContent(copy.conversation.thinking);
    expect(screen.getByRole('button', { name: copy.form.stop })).toBeInTheDocument();

    await act(async () => stream.push({ type: 'text', text: 'Yes, ' }));
    expect(await screen.findByText('Yes,')).toBeInTheDocument();

    await act(async () => {
      stream.push({ type: 'text', text: 'remotely.' }, { type: 'done', reason: 'end' });
      stream.close();
    });
    const log = screen.getByRole('list', { name: copy.conversation.label });
    expect(await within(log).findByText('Yes, remotely.')).toBeInTheDocument();
    expect(within(log).getByText('Remote?')).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(
        `${copy.conversation.assistant}: Yes, remotely.`,
      ),
    );
    expect(screen.getByRole('textbox', { name: copy.form.label })).toHaveValue('');
    expect(screen.getByRole('button', { name: copy.form.submit })).toBeInTheDocument();
  });

  it('asks a suggested question and sends the history with the next one', async () => {
    const copy = renderChat(locale);
    answerWith(200, { type: 'text', text: 'First answer' }, { type: 'done', reason: 'end' });
    fireEvent.click(screen.getByRole('button', { name: copy.suggestions.items[0] }));
    expect(await screen.findByText('First answer')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: copy.form.label })).toHaveFocus();
    expect(screen.queryByRole('list', { name: copy.suggestions.label })).not.toBeInTheDocument();

    answerWith(200, { type: 'text', text: 'Second' }, { type: 'done', reason: 'end' });
    ask(copy, 'And then?');
    expect(await screen.findByText('Second')).toBeInTheDocument();
    expect(sentBody(1).messages).toEqual([
      { role: 'user', content: copy.suggestions.items[0] },
      { role: 'assistant', content: 'First answer' },
      { role: 'user', content: 'And then?' },
    ]);
  });

  it('shows a polite message instead of a refused answer, and keeps it out of the history', async () => {
    const copy = renderChat(locale);
    answerWith(200, { type: 'text', text: 'Partial' }, { type: 'done', reason: 'refusal' });
    ask(copy, 'Something odd');
    expect(await screen.findByText(copy.errors.refusal, { selector: 'li p' })).toBeInTheDocument();
    expect(screen.queryByText('Partial')).not.toBeInTheDocument();

    answerWith(200, { type: 'done', reason: 'end' });
    ask(copy, 'Next');
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(sentBody(1).messages).toEqual([{ role: 'user', content: 'Next' }]);
  });

  it.each([
    [503, 'unavailable'],
    [429, 'rateLimited'],
  ] as const)('shows the %s error state', async (status, code) => {
    const copy = renderChat(locale);
    answerWith(status, { type: 'error', code });
    ask(copy, 'Hello');
    expect(await screen.findByText(copy.errors[code], { selector: 'li p' })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(copy.errors[code]));
  });

  it('shows a generic error when the network fails', async () => {
    const copy = renderChat(locale);
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    ask(copy, 'Hello');
    expect(await screen.findByText(copy.errors.generic, { selector: 'li p' })).toBeInTheDocument();
  });

  it('flags an empty question without calling the API', () => {
    const copy = renderChat(locale);
    ask(copy, '   ');
    const input = screen.getByRole('textbox', { name: copy.form.label });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(`${copy.errors.invalid} ${copy.form.help}`);
    expect(input).toHaveFocus();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('stops an answer in flight', async () => {
    const copy = renderChat(locale);
    const stream = controlledResponse();
    fetchMock.mockImplementationOnce(async (_url, init) => {
      init?.signal?.addEventListener('abort', () =>
        stream.fail(new DOMException('Aborted', 'AbortError')),
      );
      return stream.response;
    });
    ask(copy, 'Long one');
    await act(async () => stream.push({ type: 'text', text: 'Some text' }));
    fireEvent.click(await screen.findByRole('button', { name: copy.form.stop }));
    expect(await screen.findByText(copy.conversation.stopped)).toBeInTheDocument();
    expect(screen.getByText('Some text')).toBeInTheDocument();
  });

  it('ends the conversation after the maximum number of questions', async () => {
    const copy = renderChat(locale);
    for (let i = 0; i < MAX_QUESTIONS; i++) {
      answerWith(200, { type: 'text', text: `Answer ${i}` }, { type: 'done', reason: 'end' });
      ask(copy, `Question ${i}`);
      expect(await screen.findByText(`Answer ${i}`)).toBeInTheDocument();
    }
    const notice = screen.getByText(copy.limitReached);
    await waitFor(() => expect(notice).toHaveFocus());
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: copy.form.reset }));
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: copy.form.label })).toHaveFocus(),
    );
    expect(screen.queryByText('Answer 0')).not.toBeInTheDocument();
  });

  it('shows only the unavailable notice when the server has no API key', () => {
    const copy = renderChat(locale, false);
    expect(screen.getByText(copy.errors.unavailable)).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: copy.contact.label })).toBeInTheDocument();
  });
});

describe.each(LOCALES)('AssistantSection (%s)', (locale) => {
  afterEach(() => vi.mocked(isAssistantConfigured).mockReturnValue(false));

  it('is left out entirely without an API key', () => {
    const { container } = renderWithIntl(<AssistantSection locale={locale} />, locale);
    expect(container).toBeEmptyDOMElement();
  });

  it('is a labelled region with the form and the contact link when configured', () => {
    vi.mocked(isAssistantConfigured).mockReturnValue(true);
    const { assistant, meta } = getContent(locale);
    renderWithIntl(<AssistantSection locale={locale} />, locale);
    const region = screen.getByRole('region', { name: assistant.title });
    expect(within(region).getByRole('heading', { level: 2 })).toHaveTextContent(assistant.title);
    expect(within(region).getByRole('textbox', { name: assistant.form.label })).toBeInTheDocument();
    expect(within(region).getByRole('link', { name: assistant.contact.label })).toHaveAttribute(
      'href',
      meta.routes.contact,
    );
  });
});

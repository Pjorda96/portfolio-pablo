import { z } from 'zod';

import { LOCALES } from '@/content/types';

import { ANSWER_MAX, MAX_MESSAGES, QUESTION_MAX } from './config';

const message = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().trim().min(1),
});

/**
 * Body of `POST /api/assistant`: the locale and the conversation so far,
 * ending with the new question. The server keeps nothing between requests,
 * so the client sends the short history every time; its size is bounded here.
 */
export const assistantRequestSchema = z
  .object({
    locale: z.enum(LOCALES),
    messages: z.array(message).min(1).max(MAX_MESSAGES),
  })
  .superRefine(({ messages }, ctx) => {
    messages.forEach((m, i) => {
      const expected = i % 2 === 0 ? 'user' : 'assistant';
      if (m.role !== expected) {
        ctx.addIssue({ code: 'custom', path: ['messages', i, 'role'], message: 'turn order' });
      }
      const max = m.role === 'user' ? QUESTION_MAX : ANSWER_MAX;
      if (m.content.length > max) {
        ctx.addIssue({ code: 'custom', path: ['messages', i, 'content'], message: 'too long' });
      }
    });
    if (messages.at(-1)?.role !== 'user') {
      ctx.addIssue({ code: 'custom', path: ['messages'], message: 'must end with a question' });
    }
  });

export type AssistantRequest = z.infer<typeof assistantRequestSchema>;
export type AssistantMessage = AssistantRequest['messages'][number];

import { buildLlmsTxt } from './llms';

/** Generated at build time from the content tree. */
export const dynamic = 'force-static';

export function GET() {
  return new Response(buildLlmsTxt(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

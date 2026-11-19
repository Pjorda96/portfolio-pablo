import { handleAssistantRequest } from '@/lib/assistant/handler';
import { assistantDeps } from '@/lib/assistant/server';
import { clientIp } from '@/lib/contact/rate-limit';

/**
 * AI assistant over the site's content: streams the answer as NDJSON (see
 * src/lib/assistant/protocol.ts). POST only, so it is never prerendered.
 */
export const runtime = 'nodejs';
/** Seconds: one short answer, plus one SDK retry. */
export const maxDuration = 60;

export async function POST(request: Request): Promise<Response> {
  return handleAssistantRequest(request, assistantDeps(clientIp(request.headers)));
}

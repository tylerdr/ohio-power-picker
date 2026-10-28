import { z } from 'zod';
import { AssessmentCustody, AssessmentError, type Actor } from './custody';
const editSchema = z.object({ expectedVersion: z.number().int().nonnegative(), input: z.object({ caseLabel: z.string().trim().min(1).max(80), territory: z.literal('ohio-edison'), monthlyKwh: z.number().finite().min(1).max(100000), baselineAvailable: z.literal(false), measurementGapScopeAccepted: z.literal(true) }) });
export type AssessmentRuntime = { authenticate(request: Request): Promise<Actor | null>; custody: AssessmentCustody };
// No env-selected shared resource, global service override, or caller-provided owner header.
// The deployment composition must supply existing server-verified identity and isolated custody.
export function assessmentHandlers(runtime: AssessmentRuntime | null) {
  async function handle(request: Request, id: string, edit: boolean) {
    const headers = { 'Cache-Control': 'private, no-store', 'Content-Type': 'application/json', 'Vary': 'Cookie, Authorization' };
    const reply = (value: unknown, status: number) => new Response(JSON.stringify(value), { status, headers });
    if (!runtime) return reply({ error: 'Private assessment runtime is not configured.' }, 503);
    try {
      const actor = await runtime.authenticate(request);
      if (!actor) return reply({ error: 'Authentication required.' }, 401);
      let change;
      if (edit) {
        // No cross-origin cookie-auth writes. Runtime also enforces its session/CSRF policy.
        if (request.headers.get('origin') !== new URL(request.url).origin) return reply({ error: 'Same-origin request required.' }, 403);
        const reader = request.body?.getReader();
        let size = 0; const chunks: Uint8Array[] = [];
        if (reader) while (true) {
          const part = await reader.read(); if (part.done) break;
          size += part.value.byteLength;
          if (size > 4096) { await reader.cancel(); return reply({ error: 'Intake too large.' }, 413); }
          chunks.push(part.value);
        }
        const bytes = new Uint8Array(size); let offset = 0;
        for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
        let body;
        try { body = JSON.parse(new TextDecoder().decode(bytes)); } catch { return reply({ error: 'Invalid JSON intake.' }, 400); }
        if (!body || typeof body !== 'object') return reply({ error: 'Invalid intake.' }, 400);
        const parsed = editSchema.safeParse(body);
        if (!parsed.success) return reply({ error: 'Invalid measurement-gap intake.' }, 400);
        change = parsed.data;
      }
      return reply(await runtime.custody.access(actor, id, change), 200);
    } catch (e) { return reply({ error: e instanceof AssessmentError ? e.message : 'Assessment unavailable; retry without changing identity or payment.' }, e instanceof AssessmentError ? e.status : 503); }
  }
  return { GET: (request: Request, id: string) => handle(request, id, false), POST: (request: Request, id: string) => handle(request, id, true) };
}

import { renderReport } from '@/lib/fictional-comparison/compare.mjs';
import { comparisonScenario, isScenarioId } from '@/lib/fictional-comparison/scenarios';

export function GET(request: Request) {
  const url = new URL(request.url);
  const values = url.searchParams.getAll('scenario');
  const id = values.length === 0 ? 'seasonal' : values[0];
  if (values.length > 1 || !isScenarioId(id)) {
    return Response.json({ error: 'Choose a known fictional example.', code: 'INVALID_SCENARIO' }, { status: 400 });
  }
  return new Response(renderReport(comparisonScenario(id)), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="fictional-${id}-comparison.md"`,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-store',
    },
  });
}

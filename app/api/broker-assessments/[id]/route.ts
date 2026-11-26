import { configFromEnvironment, mountedAssessmentHandlers } from '@/lib/assessment/runtime';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const handlers = mountedAssessmentHandlers(configFromEnvironment(process.env));
export function GET(request: Request, { params }: { params: { id: string } }) { return handlers.GET(request, params.id); }
export function POST(request: Request, { params }: { params: { id: string } }) { return handlers.POST(request, params.id); }

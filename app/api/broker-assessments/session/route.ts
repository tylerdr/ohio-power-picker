import { assessmentSessionView } from '@/lib/assessment/session-view';
import { configFromEnvironment } from '@/lib/assessment/runtime';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const GET = assessmentSessionView(configFromEnvironment(process.env));

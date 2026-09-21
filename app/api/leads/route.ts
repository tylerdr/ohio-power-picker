const unavailable = () =>
  Response.json(
    { error: 'Automatic lead capture is unavailable; no request was stored or sent.' },
    { status: 503, headers: { 'Cache-Control': 'no-store' } }
  );

export async function POST() {
  return unavailable();
}

export async function GET() {
  return unavailable();
}

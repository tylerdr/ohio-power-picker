const unavailable = () =>
  Response.json(
    { error: 'Automatic rate alerts are unavailable. Use the manual rate-question email link.' },
    { status: 503, headers: { 'Cache-Control': 'no-store' } }
  );

export async function POST() {
  return unavailable();
}

import { promises as fs } from 'fs';
import path from 'path';

const SUBSCRIBERS_FILE = path.join(process.cwd(), 'data', 'subscribers.json');

type SubscriberRecord = {
  email: string;
  subscribedAt: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function readSubscribers(): Promise<SubscriberRecord[]> {
  try {
    const raw = await fs.readFile(SUBSCRIBERS_FILE, 'utf8');
    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item): item is SubscriberRecord =>
          typeof item?.email === 'string' && typeof item?.subscribedAt === 'string'
      );
    }

    return [];
  } catch {
    return [];
  }
}

export async function POST(request: Request) {
  let email = '';

  try {
    const body = await request.json();
    email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!email || !EMAIL_REGEX.test(email)) {
    return Response.json({ error: 'Please provide a valid email address.' }, { status: 400 });
  }

  try {
    const subscribers = await readSubscribers();
    const alreadySubscribed = subscribers.some((subscriber) => subscriber.email === email);

    if (alreadySubscribed) {
      return Response.json({ message: 'You are already subscribed for alerts.' });
    }

    const updatedSubscribers: SubscriberRecord[] = [
      ...subscribers,
      {
        email,
        subscribedAt: new Date().toISOString()
      }
    ];

    await fs.mkdir(path.dirname(SUBSCRIBERS_FILE), { recursive: true });
    await fs.writeFile(SUBSCRIBERS_FILE, JSON.stringify(updatedSubscribers, null, 2));

    return Response.json({ message: 'You are subscribed for rate alerts.' });
  } catch {
    return Response.json({ error: 'Unable to save your subscription right now.' }, { status: 500 });
  }
}

import { promises as fs } from 'fs';
import path from 'path';

const LEADS_FILE = path.join(process.cwd(), 'data', 'leads.json');

type LeadRecord = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  supplierId: string;
  supplierName: string;
  supplierRate: number;
  utility: string;
  estimatedKwh: number;
  yearlySavings: number;
  submittedAt: string;
  status: 'new' | 'contacted' | 'converted' | 'lost';
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\d\s\-\(\)]+$/;

async function readLeads(): Promise<LeadRecord[]> {
  try {
    const raw = await fs.readFile(LEADS_FILE, 'utf8');
    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      return parsed;
    }

    return [];
  } catch {
    return [];
  }
}

export async function POST(request: Request) {
  let body: any;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const {
    firstName,
    lastName,
    email,
    phone,
    address,
    city,
    zip,
    supplierId,
    supplierName,
    supplierRate,
    utility,
    estimatedKwh,
    yearlySavings,
    submittedAt,
  } = body;

  // Validation
  if (!firstName || !lastName || !email || !phone || !address || !city || !zip) {
    return Response.json({ error: 'All fields are required.' }, { status: 400 });
  }

  if (!EMAIL_REGEX.test(email)) {
    return Response.json({ error: 'Invalid email address.' }, { status: 400 });
  }

  if (!PHONE_REGEX.test(phone)) {
    return Response.json({ error: 'Invalid phone number.' }, { status: 400 });
  }

  if (!/^\d{5}$/.test(zip)) {
    return Response.json({ error: 'ZIP code must be 5 digits.' }, { status: 400 });
  }

  try {
    const leads = await readLeads();

    const newLead: LeadRecord = {
      id: `lead_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      zip: zip.trim(),
      supplierId,
      supplierName,
      supplierRate,
      utility,
      estimatedKwh,
      yearlySavings,
      submittedAt: submittedAt || new Date().toISOString(),
      status: 'new',
    };

    const updatedLeads = [...leads, newLead];

    await fs.mkdir(path.dirname(LEADS_FILE), { recursive: true });
    await fs.writeFile(LEADS_FILE, JSON.stringify(updatedLeads, null, 2));

    return Response.json({
      message: 'Your switching request has been submitted successfully.',
      leadId: newLead.id,
    });
  } catch (error) {
    console.error('Lead submission error:', error);
    return Response.json(
      { error: 'Unable to save your request right now. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const leads = await readLeads();

    // Return summary stats only (don't expose PII in public endpoint)
    const stats = {
      total: leads.length,
      new: leads.filter((l) => l.status === 'new').length,
      contacted: leads.filter((l) => l.status === 'contacted').length,
      converted: leads.filter((l) => l.status === 'converted').length,
      lost: leads.filter((l) => l.status === 'lost').length,
    };

    return Response.json(stats);
  } catch {
    return Response.json({ error: 'Unable to retrieve lead statistics.' }, { status: 500 });
  }
}

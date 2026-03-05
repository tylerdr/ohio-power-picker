import { promises as fs } from 'fs';
import path from 'path';

const RESEND_API_URL = 'https://api.resend.com/emails';

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

async function sendLeadNotification(lead: LeadRecord) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_ALERT_TO;
  const from = process.env.LEAD_ALERT_FROM || 'Ohio Electricity Rates <leads@ohioelectricityrates.com>';

  if (!apiKey || !to) {
    return;
  }

  const subject = `New Ohio lead: ${lead.firstName} ${lead.lastName} (${lead.utility})`;
  const html = `
    <h2>New Lead Submitted</h2>
    <p><strong>Name:</strong> ${lead.firstName} ${lead.lastName}</p>
    <p><strong>Email:</strong> ${lead.email}</p>
    <p><strong>Phone:</strong> ${lead.phone}</p>
    <p><strong>Address:</strong> ${lead.address}, ${lead.city}, OH ${lead.zip}</p>
    <p><strong>Utility:</strong> ${lead.utility}</p>
    <p><strong>Supplier:</strong> ${lead.supplierName} (${lead.supplierRate}/kWh)</p>
    <p><strong>Estimated Usage:</strong> ${lead.estimatedKwh} kWh/month</p>
    <p><strong>Estimated Savings:</strong> $${lead.yearlySavings}/year</p>
    <p><strong>Submitted:</strong> ${lead.submittedAt}</p>
    <hr />
    <p><strong>Lead ID:</strong> ${lead.id}</p>
  `;

  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
      reply_to: lead.email,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend email failed (${response.status}): ${body}`);
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

    try {
      await sendLeadNotification(newLead);
    } catch (emailError) {
      console.error('Lead notification email failed:', emailError);
    }

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

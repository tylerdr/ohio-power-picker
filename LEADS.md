# Lead Management — ohioelectricityrates.com

> **Current status (September 2026): disabled.** The public lead and rate-alert
> endpoints fail closed with HTTP 503 because this deployment has no durable
> storage, Resend account configuration, or verified broker/affiliate delivery
> destination. The public UI discloses the unavailable alert path and offers a
> manual rate-question email link. Do not treat the legacy schema or examples
> below as active customer capture.

## How Leads Work
When users click "Get This Plan" on any supplier, they fill out a lead capture form that collects:
- Full name (first + last)
- Email
- Phone
- Service address (street, city, ZIP)
- Current usage estimate (kWh/month)
- Supplier choice + rate + estimated savings

## Legacy Data Shape (Reference Only)
Leads are stored in `data/leads.json` with this structure:
```json
{
  "id": "lead_1234567890_abc123",
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "phone": "(614) 555-0123",
  "address": "123 Main St",
  "city": "Columbus",
  "zip": "43215",
  "supplierId": "clearview",
  "supplierName": "Clearview Energy",
  "supplierRate": 0.0649,
  "utility": "AEP Ohio",
  "estimatedKwh": 1000,
  "yearlySavings": 210,
  "submittedAt": "2026-03-05T12:34:56.789Z",
  "status": "new"
}
```

## Monetization Models

### Option 1: Lead Generation (Most Likely)
- **How it works**: Sell qualified leads to energy brokers or suppliers
- **Typical payout**: $20-50 per qualified lead, $100-200 per conversion
- **Setup needed**:
  1. Find energy broker partners (Ohio-specific)
  2. Negotiate payout terms (per-lead vs per-conversion)
  3. Set up automated lead delivery (email, webhook, or CSV export)
  4. Track conversion rates to optimize payout negotiations

### Option 2: Broker Partnership
- **How it works**: Partner with a single licensed broker who handles all enrollments
- **Typical payout**: $50-150 per completed enrollment
- **Setup needed**:
  1. Find a licensed Ohio electricity broker
  2. White-label the switching process (or send leads via API)
  3. Track conversions via unique referral codes or tracking pixels
  4. Monthly invoicing based on completed switches

### Option 3: Direct Affiliate (Less Common)
- **How it works**: Some large suppliers offer affiliate programs
- **Typical payout**: $50-100 per enrollment
- **Limitation**: Only works for suppliers with affiliate programs (rare in retail electricity)

## Recommended Next Steps
1. **Research Ohio energy brokers**: Google "Ohio electricity broker wholesale" or "Ohio energy consultant partners"
2. **Join industry groups**: National Energy Marketers Association (NEM), Retail Energy Supply Association (RESA)
3. **Cold outreach**: Email 5-10 Ohio brokers with lead sample data and conversion potential
4. **Negotiate payout**: Start at $30/qualified lead or 15% revenue share
5. **Automate delivery**: Build webhook to send new leads in real-time OR export CSV weekly

## Legacy Lead Alerts (Disabled)
The former file-backed implementation and optional Resend notification path
were removed from the public API. `POST /api/leads`, `GET /api/leads`, and
`POST /api/subscribe` return HTTP 503 with a no-store response; they do not
write files, send email, or claim that a lead was accepted. Re-enable this
surface only after a durable store, verified delivery provider, consent copy,
and an actual broker or affiliate destination are configured and tested.

## Accessing Historical Leads

### Via File (if an explicitly retained local fixture exists)
```bash
cat data/leads.json | jq '.[] | select(.status == "new")'
```

### Via API
The public API is intentionally unavailable until the prerequisites above are
met; it does not expose lead statistics.

### Future: Admin Dashboard
Create `/admin/leads` page (password-protected) to:
- View all leads in a table
- Filter by status, date, utility, supplier
- Export CSV for broker delivery
- Update lead status (new → contacted → converted/lost)

## Converting to Revenue
Once you have 10+ leads, you can:
1. **Batch export**: Export CSV and send to broker manually
2. **Prove value**: "We have 10 qualified leads in AEP Ohio territory, average $200/year savings, verified contact info"
3. **Negotiate payout**: Start conversation with "$30 per qualified lead or $100 per conversion, which works better for you?"
4. **Automate**: Once deal is signed, build webhook integration

## Important
- **Privacy**: Don't sell leads without explicit user consent (add terms to form footer)
- **Licensing**: We don't need a broker license if we're just referring leads (not enrolling customers)
- **Quality**: Track which leads convert so you can optimize form/targeting

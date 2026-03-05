# Lead Management — ohioelectricityrates.com

## How Leads Work
When users click "Get This Plan" on any supplier, they fill out a lead capture form that collects:
- Full name (first + last)
- Email
- Phone
- Service address (street, city, ZIP)
- Current usage estimate (kWh/month)
- Supplier choice + rate + estimated savings

## Data Storage
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

## Accessing Leads

### Via File
```bash
cat data/leads.json | jq '.[] | select(.status == "new")'
```

### Via API
```bash
# Get lead stats
curl https://ohioelectricityrates.com/api/leads

# Returns:
# {
#   "total": 42,
#   "new": 30,
#   "contacted": 8,
#   "converted": 3,
#   "lost": 1
# }
```

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

# Ohio Power Picker — AI Electricity Supplier Comparison App

## Overview
A Next.js app that helps Ohio homeowners find the best electricity supplier. Ohio is a deregulated electricity market — homeowners can choose their supplier, but ~72% of options are MORE expensive than the default utility rate. This app cuts through the noise.

## Target User
- Ohio residential homeowners
- Non-technical, just want to save money on electricity
- Todd Nathan (lives in Ohio) is the first user/stakeholder

## Core Flow
1. User enters their **zip code** and selects their **current utility** (e.g., AEP Ohio, Duke Energy Ohio, FirstEnergy/Ohio Edison, Dayton Power & Light)
2. App scrapes/fetches current PUCO "Apples to Apples" rate data OR uses a curated dataset
3. Shows the user's **Price to Compare** (their utility's default rate per kWh)
4. Lists all available suppliers sorted by savings potential
5. AI analyzes and recommends the best options based on: rate, contract length, cancellation fees, renewable %, rate type (fixed vs variable)
6. Color-coded: green = saves money, red = costs more than default

## Key Features
- **Zip code + utility lookup** — determines available suppliers
- **Price to Compare display** — shows the default rate they're currently paying
- **Supplier comparison table** — sortable by price, term, type
- **AI recommendation** — plain English explanation of best choice and why
- **Savings calculator** — "Based on average Ohio usage of 900 kWh/month, you'd save $X/year"
- **Warning flags** — variable rates, early termination fees, introductory rates that expire

## Ohio Utilities (service territories)
- AEP Ohio (Columbus area)
- Duke Energy Ohio (Cincinnati area)  
- Ohio Edison / FirstEnergy (Cleveland/Akron area)
- Dayton Power & Light / AES Ohio (Dayton area)
- Toledo Edison / FirstEnergy (Toledo area)
- The Illuminating Company / FirstEnergy (Cleveland area)

## Data Source
Since PUCO's Apples to Apples site doesn't have a public API, we'll:
1. **For MVP**: Use a realistic seed dataset of ~20-30 suppliers with current-ish rates
2. **Include a scraper script** that can pull from energychoice.ohio.gov
3. Store data in a local JSON file (no database needed for MVP)

## Tech Stack
- **Next.js 14+** (App Router)
- **TypeScript**
- **Tailwind CSS** (clean, modern UI)
- **Vercel AI SDK** for the AI recommendation (OpenAI)
- **No database** — JSON seed data for MVP
- **Deploy to Vercel**

## Pages
1. **/** — Landing page with zip code input, value prop
2. **/compare** — Results page with comparison table + AI recommendation
3. **/about** — Brief explainer about Ohio deregulation

## Design
- Clean, trustworthy, consumer-friendly
- Mobile-first (most people will use on phone)
- Green/blue color scheme (energy/trust)
- Big clear numbers for savings
- No clutter, no ads feeling

## Environment Variables Needed
- `OPENAI_API_KEY` — for AI recommendations (use Vercel AI SDK)

## DO NOT
- Over-engineer this. It's an MVP.
- Add authentication or user accounts
- Add a database
- Add more than 3 pages
- Use any UI library other than Tailwind
- Add tests (MVP speed)

## MUST
- Build clean and deploy-ready for Vercel
- Include realistic Ohio electricity rate data
- Mobile responsive
- Fast (static where possible)
- Include a clear CTA for each supplier recommendation

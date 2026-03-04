# CLAUDE.md — Ohio Power Picker

## What This Is
AI-powered Ohio electricity supplier comparison tool. Helps 4.5M Ohio residents find cheaper electricity rates vs their utility's default "Price to Compare" rate. 72% of third-party offers are MORE expensive — we surface the ones that actually save money.

## Tech Stack
- Next.js 14 (app router, pages router NOT used)
- Tailwind CSS (custom theme in tailwind.config.ts)
- Vercel AI SDK (`ai` package) + OpenAI for chat/recommendations
- No database — stateless, data from JSON files
- No auth — public tool

## Commands
```bash
npm run dev      # Dev server
npm run build    # Production build (MUST pass before committing)
npm run lint     # Lint
npm run scrape   # Fetch PUCO data (experimental)
```

## Project Structure
```
app/              # Next.js app router pages
  page.tsx        # Landing page (zip input, utility selector, scam shield, quiz)
  compare/        # Rate comparison dashboard
  analytics/      # Historical rate charts, scenario calculator
  about/          # Utility territory info
  api/chat/       # AI chat endpoint (Vercel AI SDK streaming)
  api/recommend/  # One-shot AI recommendation endpoint
components/       # React components (all client-side interactive)
lib/              # Utilities, types, data loading
  utilities.ts    # Ohio utility territories + Price to Compare rates
  data.ts         # Loads supplier JSON
  types.ts        # TypeScript interfaces
data/             # Static JSON data files
  suppliers.json  # PUCO-certified supplier offers
  historical-rates.json  # Rate history for analytics
scripts/          # Data pipeline scripts
  scrape-energychoice.ts  # PUCO scraper (cheerio-based)
```

## Design System
- Colors: sea (blue), leaf (green), sky (light blue), mist (bg), ink (text)
- Font: Fraunces (serif) for headings, system sans for body
- Cards: rounded-3xl, white/70 bg, backdrop-blur, shadow-card
- Mobile-first, responsive grid layouts

## Key Conventions
- Server components by default, 'use client' only when needed
- No chart libraries — CSS/SVG only for visualizations
- Supplier data is static JSON, not fetched at runtime (yet)
- All rates in $/kWh (e.g., 0.0649 = 6.49¢/kWh)
- formatRate() in lib/utils.ts handles display formatting

## DO NOT
- Install chart libraries (recharts, d3, chart.js)
- Add a database
- Add authentication
- Change the visual design language (green/blue/clean)
- Remove the Scam Shield or consumer education content
- Use pages router

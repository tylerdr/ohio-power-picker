# Ohio Power Picker

Compare Ohio electricity suppliers, estimate savings, and get AI guidance.

## Requirements
- Node.js 18+
- `OPENAI_API_KEY` in `.env.local`

## Getting started
```bash
npm install
npm run dev
```

## Scripts
- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run start` — production server
- `npm run scrape` — fetch data from EnergyChoice (experimental)

## Data
Seed supplier data lives in `data/suppliers.json`. Utility default rates are in `lib/utilities.ts`.

## Deploy
Ready for Vercel. Add `OPENAI_API_KEY` in project environment variables.

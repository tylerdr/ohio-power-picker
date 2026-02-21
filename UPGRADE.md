# UPGRADE v2 — Ohio Power Picker

## Bug Fix
1. **Fix markdown rendering in AI recommendation** — The AI response uses markdown (bold, bullets) but renders as raw text with `**` visible. Install `react-markdown` and render the completion through it instead of `whitespace-pre-line`.

## New Features

### 1. Homepage Comparison (No Login Required)
Show a quick comparison table RIGHT ON THE HOMEPAGE before the user even picks a utility. Show ALL Ohio utilities with their Price to Compare rates side-by-side, and a "best available rate" for each. User can see the landscape instantly.

### 2. Interactive AI Chat
Replace the one-shot AI recommendation with a full chat interface:
- Persistent chat panel on the compare page (slide-up or sidebar)
- User can ask natural language questions like "Which is cheapest for a family of 4?" or "What if I move in 6 months?"
- AI responds with formatted text and can reference the supplier data
- Use Vercel AI SDK `useChat` hook with `/api/chat` endpoint
- Chat should have the full supplier context injected as system message
- Make it feel like talking to a helpful neighbor, not a robot

### 3. Personalized Comparison Tool
Add a "Compare Side by Side" feature:
- User can select 2-3 suppliers to compare directly
- Show a visual comparison card with:
  - Rate per kWh (bar chart visual using CSS, no chart library needed)
  - Monthly cost estimate (with slider for usage: 500-2000 kWh)
  - Contract length timeline
  - Risk score (1-5 scale based on: variable rate, ETF amount, intro rate expiry)
  - Green/renewable percentage
- Usage slider updates all numbers in real-time

### 4. "Scam Shield" / Warning Section
Based on real Ohio complaints, add a prominent section:
- **Door-to-door scam alert** — "Never show your bill to door-to-door salespeople"
- **Variable rate trap** — explains how low intro rates spike after 1-3 months
- **Delivery vs Supply** — explains you ALWAYS pay delivery to your utility regardless of supplier
- **ETF gotchas** — early termination fees that lock you in
- **"Too good to be true" checker** — any rate more than 30% below Price to Compare gets an automatic warning
- Make this a collapsible FAQ-style section on the compare page AND a quick tips section on homepage

### 5. Quick Quiz / Recommendation Flow (Optional Nice-to-Have)
Simple 3-question flow on homepage:
1. "What matters most?" — Lowest price / Stable rate / Green energy / Short commitment
2. "How much electricity do you use?" — Low / Average / High (with kWh guidance)
3. "How long do you want to commit?" — Month-to-month / 6 months / 12+ months

Then auto-filter and rank suppliers based on answers.

## Technical Changes
- `npm install react-markdown` for markdown rendering
- New `/api/chat` route using `useChat` from Vercel AI SDK
- New components:
  - `components/ai-chat.tsx` — chat interface
  - `components/supplier-compare.tsx` — side-by-side comparison with usage slider
  - `components/scam-shield.tsx` — warning/education section
  - `components/quick-quiz.tsx` — recommendation quiz flow
- Update `app/page.tsx` — add homepage comparison table, scam tips, quiz
- Update `app/compare/page.tsx` — integrate chat, side-by-side compare, scam shield

## Design Rules
- Keep the existing clean green/blue aesthetic
- Mobile-first always
- No chart libraries — use CSS bars/progress bars for visuals
- Smooth animations with Tailwind transitions
- Chat should feel modern (like ChatGPT's interface but simpler)

## DO NOT
- Add any npm packages other than react-markdown
- Add authentication
- Add a database
- Break existing functionality
- Over-engineer — keep it clean and fast

# UX Simplification — Ohio Power Picker

## Problem
The app has too much going on. An average Ohio homeowner should be able to understand their best option in under 30 seconds. Right now it's overwhelming.

## Core Changes

### 1. Persistent Zip/Utility in Header
The site header (`components/site-header.tsx`) needs a compact zip code + utility selector that:
- Shows on ALL pages (not just homepage)
- Displays current selection: "43215 · AEP Ohio" as a clickable pill
- When clicked, shows a small dropdown/modal to change zip + utility
- When zip+utility are set, the Compare nav link works automatically
- Store selection in URL params so it persists across navigation
- On the homepage, the hero form ALSO sets this (they work together)

### 2. Simplify Compare Page Layout
Current: Home Profile → Results cards → 22-row table → AI Recommendation → Side-by-side Compare → AI Chat → Scam Shield → Utility switcher

New layout — progressive disclosure, ONE clear flow:

**Section 1: Your Home** (compact)
- Home profile picker (keep, it's good) BUT make it collapsible/minimizable after first set
- Show utility name + Price to Compare prominently

**Section 2: Top 3 Recommendations** (THE HERO)
- Show the TOP 3 best suppliers as large, beautiful cards
- Each card: supplier name, rate, monthly estimate, yearly savings, risk level, one-line why
- Big green "View Plan" CTA button on each
- This should be 80% of what users need. Most people stop here.

**Section 3: AI Assistant** (below the fold)
- Chat interface — "Not sure? Ask our AI assistant"
- Collapsible, starts minimized with a floating button or teaser

**Section 4: All Suppliers** (collapsed by default)
- "See all X suppliers" expandable section
- The full table, but hidden until they want it

**Section 5: Protect Yourself** (bottom)
- Scam Shield tips — keep as collapsible FAQ
- Much more compact than current

**REMOVE from compare page:**
- Side-by-side comparison tool (it's cool but adds complexity — move to a future "power user" mode)
- The standalone AI Recommendation section (redundant with AI Chat)
- The "How it works" card (the top 3 cards ARE the explanation)

### 3. Homepage Simplification
Current homepage is good but:
- The statewide comparison table is nice but should be BELOW the fold
- Quick Quiz should be more prominent — it's the fastest path to value
- Scam Shield compact tips are good, keep them

### 4. Design Polish
- Bigger, bolder typography for the key numbers (rate, savings)
- More whitespace between sections
- Cards should feel clickable and premium
- The top 3 recommendation cards should have subtle gradient backgrounds or colored left borders to differentiate
- Mobile: stack everything single column, big tap targets

## Files to Modify
- `components/site-header.tsx` — add persistent zip/utility selector
- `components/compare-content.tsx` — completely restructure layout
- `components/top-picks.tsx` — NEW: the hero top 3 recommendations component
- `app/compare/page.tsx` — pass URL params to header
- `app/page.tsx` — minor reorder
- REMOVE `components/supplier-compare.tsx` from compare page imports (keep file for later)
- REMOVE `components/ai-recommendation.tsx` from compare page imports

## DO NOT
- Change the data layer or API routes
- Remove any component files (just stop importing them)
- Break the home profile or supplier table functionality
- Add any new npm packages
- Over-complicate the header — keep it clean and minimal

## The Test
Can Todd's non-technical neighbor in Ohio open this on their phone, see their top 3 options in under 30 seconds, and confidently click "View Plan"? If yes, we nailed it.

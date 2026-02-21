# Analytics Page — Historical Rate Data & Scenarios

## Overview
New `/analytics` page showing historical Ohio electricity rate data, variable rate risk visualization, and scenario comparisons. All using CSS-only charts (no chart libraries). Must be fully mobile responsive.

## Data
Create `data/historical-rates.json` with realistic Ohio residential electricity rate data:
- Monthly data points from Jan 2022 to Dec 2025 (48 months)
- For each month: `{ period: "2022-01", avgRetailRate: 0.1147, avgVariableRate: 0.0923, avgFixedRate: 0.0872, priceToCompare: { "aep-ohio": 0.0834, "duke-energy": 0.0891, ... } }`
- Variable rates should show realistic seasonal volatility (spikes in Jan-Feb and Jul-Aug)
- Fixed rates should be relatively stable with gradual trends
- Base this on EIA Ohio residential data (avg ~11-14¢/kWh retail, supply portion ~7-10¢)

## Page Layout (`app/analytics/page.tsx`)

### Section 1: Rate Trends (Hero)
- Title: "Ohio Electricity Rate History"
- Subtitle: "See how rates have changed over the last 3 years"
- **CSS line chart** showing 3 lines over time:
  - Average variable supplier rate (volatile, colored orange/warning)
  - Average fixed supplier rate (stable, colored green)
  - Average Price to Compare / default rate (dashed, colored gray)
- X-axis: months (show every 3rd label)
- Y-axis: ¢/kWh
- Interactive: hover/tap on a data point shows tooltip with exact values
- Mobile: chart scrolls horizontally if needed, or simplifies to last 12 months

### Section 2: Variable Rate Risk Visualizer
- Title: "The Real Cost of Variable Rates"
- Show a scenario comparison:
  - Left card: "Fixed Rate at 6.49¢/kWh" — steady line, predictable monthly cost
  - Right card: "Variable starting at 5.49¢/kWh" — volatile line showing actual historical pattern
- Below: total cost comparison over 12 months
  - "Fixed: $XX total" vs "Variable: $XX total"
  - Show which one actually cost more
- Use realistic data showing variable rates spiking to 9-12¢ in peak months
- Big takeaway callout: "Variable rates started cheaper but cost $XX more over 12 months"

### Section 3: Seasonal Pattern
- Title: "When Rates Spike"
- CSS bar chart showing average rate by month (Jan-Dec) across all years
- Color code: blue for low months, orange for moderate, red for peak months
- Callout: "Peak months: January, February, July, August"
- Explanation: "Variable rates follow wholesale electricity prices, which spike during extreme weather"

### Section 4: Scenario Calculator
- Interactive tool: "What would YOU have paid?"
- Inputs (use the home profile kWh or let user adjust):
  - Monthly usage slider (500-2000 kWh)
  - Plan type toggle: Fixed vs Variable
  - Fixed rate input (pre-filled with 6.49¢ as example)
- Output: month-by-month cost table for the last 12 months
  - Shows what you'd have paid on the fixed plan vs what variable actually cost
  - Running total comparison
  - Highlight months where variable was cheaper (green) vs more expensive (red)

### Section 5: Key Insights (Bottom)
- Card grid with 4 insight cards:
  1. "Variable rates were cheaper than fixed X out of 48 months"
  2. "The highest variable rate spike: XX¢/kWh in [month]"
  3. "Average fixed rate saved $XX/year vs variable"
  4. "X% of Ohio homeowners are on the default (most expensive) rate"

## Technical Implementation
- New page: `app/analytics/page.tsx` (server component for data loading, client wrapper for interactivity)
- New component: `components/analytics-content.tsx` (client component managing all interactive state)
- New component: `components/rate-chart.tsx` (CSS-only line chart)
- New component: `components/seasonal-chart.tsx` (CSS-only bar chart)
- New component: `components/scenario-calculator.tsx` (interactive calculator)
- New data file: `data/historical-rates.json`
- Add "Analytics" to the nav items in site-header.tsx

## CSS Charts (NO CHART LIBRARIES)
For line charts: use SVG with `<polyline>` or `<path>` elements — this is clean, responsive, and needs no libraries.
For bar charts: use CSS `height` percentage on div elements.
All charts must be responsive and work on mobile.

## Mobile Requirements
- Charts should be readable on 375px screens
- Use horizontal scroll for wide charts OR show abbreviated data on mobile
- All cards stack single-column on mobile
- Big tap targets for interactive elements
- No tiny text — minimum 12px

## DO NOT
- Install recharts, chart.js, d3, or any chart library
- Make this overly complex — clean and clear beats feature-rich
- Forget to add Analytics to the header nav
- Use canvas elements — stick to SVG + CSS

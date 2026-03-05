export type UtilityPageConfig = {
  slug: string;
  utilityId: string;
  utilityName: string;
  pageTitle: string;
  territorySummary: string;
  majorCities: string[];
  suppliersNote: string;
  faq: Array<{
    question: string;
    answer: string;
  }>;
};

export const utilityPageConfigs: UtilityPageConfig[] = [
  {
    slug: 'aep-ohio',
    utilityId: 'aep-ohio',
    utilityName: 'AEP Ohio',
    pageTitle: 'AEP Ohio Electricity Rates and Supplier Comparison',
    territorySummary:
      'AEP Ohio serves much of central and parts of southern Ohio. Customers can keep AEP for delivery service while selecting a separate retail supplier for generation supply.',
    majorCities: ['Columbus', 'Newark', 'Lancaster', 'Marion', 'Chillicothe'],
    suppliersNote:
      'AEP territory usually has one of the broadest supplier menus in the state, including fixed, variable, and renewable plans.',
    faq: [
      {
        question: 'Does switching suppliers affect AEP outage response?',
        answer:
          'No. AEP Ohio remains responsible for poles, wires, and outage restoration even when you enroll with a different supplier.',
      },
      {
        question: 'How should I compare offers in AEP territory?',
        answer:
          'Benchmark each offer against AEP\'s Price to Compare, then evaluate term length, monthly fees, and cancellation terms before enrolling.',
      },
      {
        question: 'Can I switch back to default supply later?',
        answer:
          'Most customers can return to default service, but timing depends on billing cycles and enrollment processing windows.',
      },
    ],
  },
  {
    slug: 'duke-energy',
    utilityId: 'duke-energy',
    utilityName: 'Duke Energy Ohio',
    pageTitle: 'Duke Energy Ohio Rates vs Competitive Suppliers',
    territorySummary:
      'Duke Energy Ohio serves the Cincinnati region. Households can compare Duke\'s default supply rate against certified supplier offers while Duke continues delivery service.',
    majorCities: ['Cincinnati', 'Middletown', 'Hamilton', 'Mason', 'West Chester'],
    suppliersNote:
      'Duke territory typically features strong 12-month fixed options and a smaller set of variable offers compared with larger territories.',
    faq: [
      {
        question: 'Do Duke customers still pay delivery charges after switching suppliers?',
        answer:
          'Yes. Delivery charges remain on your bill because Duke still operates and maintains the local grid infrastructure.',
      },
      {
        question: 'What is the main risk in low variable offers?',
        answer:
          'Introductory variable rates can rise quickly after promo periods, so annual cost may exceed a slightly higher fixed rate.',
      },
      {
        question: 'What contract length do many households choose?',
        answer:
          'Twelve-month fixed terms are common because they balance rate stability and flexibility at renewal time.',
      },
    ],
  },
  {
    slug: 'ohio-edison',
    utilityId: 'ohio-edison',
    utilityName: 'Ohio Edison',
    pageTitle: 'Ohio Edison Electricity Supplier Comparison Guide',
    territorySummary:
      'Ohio Edison is part of the FirstEnergy system and serves much of northeast Ohio. Customers can select competitive suppliers while Ohio Edison remains the delivery utility.',
    majorCities: ['Akron', 'Canton', 'Mansfield', 'Ashtabula', 'Youngstown area'],
    suppliersNote:
      'Ohio Edison customers often see fixed-plan competition plus municipal aggregation overlaps in some communities.',
    faq: [
      {
        question: 'Can municipal aggregation change my supplier automatically?',
        answer:
          'In some communities, eligible residents may be enrolled in aggregation unless they opt out, so check local notices before selecting a private supplier.',
      },
      {
        question: 'Is Ohio Edison default supply always cheapest?',
        answer:
          'Not always. Default supply can be competitive at times, but fixed supplier plans may still offer lower effective annual pricing.',
      },
      {
        question: 'What should I verify before enrollment?',
        answer:
          'Review early termination fee, contract term, renewal terms, and any monthly recurring charge.',
      },
    ],
  },
  {
    slug: 'dayton-power-light',
    utilityId: 'aes-ohio',
    utilityName: 'Dayton Power & Light (AES Ohio)',
    pageTitle: 'Dayton Power & Light (AES Ohio) Supplier Rates',
    territorySummary:
      'Dayton Power & Light customers are now served through AES Ohio branding. Customers in this territory can compare competitive supply offers while AES Ohio remains the delivery utility.',
    majorCities: ['Dayton', 'Kettering', 'Springfield', 'Troy', 'Xenia'],
    suppliersNote:
      'Supplier variety is moderate in AES Ohio territory, with meaningful spread between fixed plans and variable intro rates.',
    faq: [
      {
        question: 'Is Dayton Power & Light the same as AES Ohio?',
        answer:
          'Yes. The service territory remains, but branding and utility references commonly appear as AES Ohio.',
      },
      {
        question: 'Can I compare suppliers without changing delivery service?',
        answer:
          'Yes. Switching suppliers changes only the generation supply component of your bill.',
      },
      {
        question: 'How should I evaluate variable offers in this territory?',
        answer:
          'Treat introductory rates as temporary and compare expected annual cost against fixed alternatives before enrolling.',
      },
    ],
  },
  {
    slug: 'toledo-edison',
    utilityId: 'toledo-edison',
    utilityName: 'Toledo Edison',
    pageTitle: 'Toledo Edison Electricity Rate Comparison',
    territorySummary:
      'Toledo Edison, also part of FirstEnergy, serves northwest Ohio. Customers can keep utility delivery service and choose an alternate generation supplier.',
    majorCities: ['Toledo', 'Bowling Green', 'Findlay', 'Fremont', 'Oregon'],
    suppliersNote:
      'Toledo Edison territory often includes competitive fixed offers and some low variable entries with higher risk profiles.',
    faq: [
      {
        question: 'Will my bill still come from Toledo Edison after switching?',
        answer:
          'In most cases yes, with supplier charges appearing on the same utility bill under the supply section.',
      },
      {
        question: 'Why do two similar rates produce different yearly costs?',
        answer:
          'Contract length, fees, and renewal terms can materially change total annual cost even when cents-per-kWh looks close.',
      },
      {
        question: 'Should I prioritize no-fee contracts?',
        answer:
          'Low-fee or no-fee contracts can reduce switching risk, especially if you expect to move or re-shop frequently.',
      },
    ],
  },
  {
    slug: 'illuminating-company',
    utilityId: 'illuminating',
    utilityName: 'The Illuminating Company',
    pageTitle: 'Illuminating Company (Cleveland) Electricity Rates',
    territorySummary:
      'The Illuminating Company serves much of the Cleveland-area lakefront territory. Customers can compare supplier rates while the utility continues to deliver power and manage reliability.',
    majorCities: ['Cleveland', 'Lakewood', 'Euclid', 'East Cleveland', 'Willoughby'],
    suppliersNote:
      'Cleveland-area shoppers often see a mix of fixed, renewable, and aggregation-adjacent options, so contract details matter.',
    faq: [
      {
        question: 'Does supplier choice impact outage restoration?',
        answer:
          'No. Utility crews and systems still handle restoration regardless of supplier enrollment.',
      },
      {
        question: 'Can green plans in this territory be competitive?',
        answer:
          'Some green plans are close to standard fixed pricing, while others carry a premium. Compare total contract value before deciding.',
      },
      {
        question: 'What is the safest first step for new shoppers?',
        answer:
          'Start with fixed-rate offers below or near the utility benchmark, then review fee language and renewal terms carefully.',
      },
    ],
  },
];

export const utilityPageMap = Object.fromEntries(
  utilityPageConfigs.map((config) => [config.slug, config]),
);

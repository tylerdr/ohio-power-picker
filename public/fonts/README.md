# Bundled site fonts

These unchanged Manrope and Fraunces WOFF2 subsets were emitted by the successful
local production build of `30107c0c21443dd845da5e0a2a86c41c289f8a02` on November 12,
2026. Their original content-based filenames and SHA-256 hashes are preserved in
`manifest.json`. No font outlines, names, weight data or subset contents changed.

`app/fonts.css` retains all 30 original face/weight/subset declarations plus both
fallback metric declarations. Only the generated family aliases and same-origin
file paths changed. The original two Latin subsets remain preloaded. All language
subsets remain available, including the original Cyrillic, Greek, Vietnamese and
extended Latin coverage. This preserves typography without build-time font fetching.

The existing Next 14 Google loader failed during production deployment
`dpl_CZcgszCdUvoSXpF39S47w162uncu` at its font-URL extension parsing expression
(`TypeError: Cannot read properties of null (reading '1')`). Bundling already-used
assets removes that external build dependency without a package, hosting,
authentication, TLS, tariff, customer-data or paid-runtime change.

Original licenses are included unchanged:

- Manrope: https://github.com/google/fonts/blob/main/ofl/manrope/OFL.txt
- Fraunces: https://github.com/google/fonts/blob/main/ofl/fraunces/OFL.txt

The Latin files are `8760c4774489e4ba-s.p.woff2` (Manrope, 24,436 bytes) and
`af4bf8399d1aacdf-s.p.woff2` (Fraunces, 36,560 bytes). Other subsets load only when
their unicode ranges are used. The total bundled font data is 156,000 bytes.

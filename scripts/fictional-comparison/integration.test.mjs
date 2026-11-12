import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as calculator from '../../lib/fictional-comparison/compare.mjs';

// Execute actual route/page/scenario modules after TS transpilation; reuse real React,
// Next Link and shadcn Button. No server, browser or external network is invoked.
const cache = new Map();
function load(relative) {
  const file = path.resolve(relative);
  if (cache.has(file)) return cache.get(file);
  const module = { exports: {} }; cache.set(file, module.exports);
  const nativeRequire = createRequire(file);
  const require = id => {
    if (id.endsWith('/compare.mjs') || id === './compare.mjs') return calculator;
    if (id.startsWith('@/') || id.startsWith('./')) {
      const base = id.startsWith('@/') ? path.resolve(id.slice(2)) : path.resolve(path.dirname(file), id);
      if (base.endsWith('.json')) return JSON.parse(fs.readFileSync(base,'utf8'));
      for (const extension of ['.ts','.tsx']) if (fs.existsSync(base + extension)) return load(base + extension);
    }
    return nativeRequire(id);
  };
  const js = ts.transpileModule(fs.readFileSync(file,'utf8'), { compilerOptions: {
    target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS,
    jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
  } }).outputText;
  new Function('require','module','exports',js)(require,module,module.exports);
  cache.set(file,module.exports); return module.exports;
}
const scenarios=load('lib/fictional-comparison/scenarios.ts');
const { default: Page, metadata }=load('app/comparison-lab/page.tsx');
const {GET}=load('app/comparison-lab/report/route.ts');

test('four examples change only explicit fictional assumptions, without state leakage',()=>{
  const first=scenarios.comparisonScenario('seasonal');
  assert.equal(first.results.find(x=>x.id==='harbor').totalCents,113100);
  assert.equal(scenarios.comparisonScenario('fees').results.find(x=>x.id==='harbor').modeledDifferenceCents,-99400);
  assert.equal(scenarios.comparisonScenario('renewal').results.find(x=>x.id==='meadow').status,'incomplete');
  assert.deepEqual(scenarios.comparisonScenario('tie').lowestModeledKnownCostIds,['baseline','harbor']);
  assert.deepEqual(scenarios.comparisonScenario('seasonal'),first);
});
test('actual page SSR exposes cost ledger, exclusions, keyboard navigation and scenario download',()=>{
  const html=renderToStaticMarkup(React.createElement(Page,{searchParams:{scenario:'seasonal'}}));
  for (const text of ['$1193.00','$1131.00','$1117.50','-$472.00','Incomplete','Excluded','0.105000','All tariffs and usage below are fictional','Delivery, taxes','Months left at horizon','Uncharged exit exposure']) assert(html.includes(text),text);
  assert(html.includes('href="/comparison-lab/report?scenario=seasonal"'));
  assert(html.includes('aria-current="page"')); assert(html.includes('tabindex="0"')); assert(html.includes('id="ledger-harbor"'));
  assert(!html.includes('<form')); assert(!html.includes('<input')); assert(!html.includes('/broker-assessment'));
});
test('fictional route social metadata overrides inherited savings copy',()=>{
  assert.match(metadata.openGraph.title,/Fictional/); assert.match(metadata.twitter.description,/No current offers/);
  assert.equal(metadata.robots.index,false);
});
test('invalid and duplicate page example queries fall back without reflecting payload',()=>{
  for (const scenario of ['<script>INJECTED</script>',['seasonal','fees']]) {
    const html=renderToStaticMarkup(React.createElement(Page,{searchParams:{scenario}}));
    assert(html.includes('Unknown example; showing seasonal usage.')); assert(!html.includes('INJECTED'));
  }
});
test('actual route downloads exact rendered fictional report for each selected scenario',async()=>{
  for(const {id} of scenarios.scenarioOptions) {
    const response=GET(new Request(`https://example.invalid/comparison-lab/report?scenario=${id}`));
    assert.equal(response.status,200); assert.equal(response.headers.get('Content-Type'),'text/markdown; charset=utf-8');
    assert.equal(response.headers.get('X-Content-Type-Options'),'nosniff'); assert.equal(response.headers.get('Cache-Control'),'no-store');
    assert.equal(response.headers.get('Content-Disposition'),`attachment; filename="fictional-${id}-comparison.md"`);
    assert.equal(await response.text(),calculator.renderReport(scenarios.comparisonScenario(id)));
  }
});
test('Markdown download describes only the supplied report, without saved recovery promise',async()=>{
  const text=await GET(new Request('https://example.invalid/comparison-lab/report')).text();
  assert(text.includes('no saved account, server custody, recovery packet'));
  assert(!text.includes('The recovery packet retains'));
});
test('route defaults to seasonal and rejects foreign, empty or duplicate scenarios',async()=>{
  assert.equal(GET(new Request('https://example.invalid/comparison-lab/report')).status,200);
  for(const query of ['scenario=','scenario=unknown','scenario=seasonal&scenario=fees','scenario=%3Cscript%3E']) {
    const response=GET(new Request(`https://example.invalid/comparison-lab/report?${query}`));
    assert.equal(response.status,400); assert.equal((await response.json()).code,'INVALID_SCENARIO');
  }
});
test('free page and report calculation execute while network calls are forbidden',async()=>{
  const original=globalThis.fetch;
  globalThis.fetch=()=>{throw new Error('Unexpected provider/network call');};
  try { renderToStaticMarkup(React.createElement(Page)); assert.equal(GET(new Request('https://example.invalid/comparison-lab/report')).status,200); }
  finally { globalThis.fetch=original; }
});

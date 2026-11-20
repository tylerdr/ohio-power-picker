import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Render the actual About page, data and shadcn/Next link components. Only shared
// header/footer chrome is omitted so it cannot supply a missing page disclosure.
const cache = new Map();
function load(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file);
  const module = { exports: {} };
  const nativeRequire = createRequire(file);
  const require = id => {
    if (['@/components/site-header', '@/components/site-footer'].includes(id)) return { __esModule: true, default: () => null };
    if (id.startsWith('@/') || id.startsWith('./')) {
      const base = id.startsWith('@/') ? path.resolve(id.slice(2)) : path.resolve(path.dirname(file), id);
      for (const ext of ['.ts', '.tsx']) if (fs.existsSync(base + ext)) return load(base + ext);
    }
    return nativeRequire(id);
  };
  const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: {
    target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS,
    jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
  } }).outputText;
  new Function('require', 'module', 'exports', js)(require, module, module.exports);
  cache.set(file, module.exports);
  return module.exports;
}
const Page = load('app/about/page.tsx').default;

test('About identifies archived supplier provenance and static benchmarks without relying on footer', () => {
  const html = renderToStaticMarkup(React.createElement(Page, {}));
  for (const phrase of [
    'PUCO-sourced snapshot scraped March 15, 2026',
    'Price to Compare values in this app are static repository values and are not verified live',
    'Confirm the current utility benchmark, supplier rate, term, fees, and eligibility',
    'archived supplier snapshot',
  ]) assert(html.includes(phrase), phrase);
  assert(!html.includes('seed data modeled'));
  assert(!html.includes('We plan to refresh data'));
});

test('About keeps fictional teaching examples separate and makes no payment or enrollment promise', () => {
  const html = renderToStaticMarkup(React.createElement(Page, {}));
  assert(html.includes('uses invented tariffs and usage'));
  assert(html.includes('does not establish current availability or achievable savings'));
  assert(html.includes('href="/comparison-lab"'));
  assert(html.includes('Open the free fictional comparison lab'));
  assert(!html.includes('/broker-assessment'));
  assert(!/<form\b|<input\b/.test(html));
});

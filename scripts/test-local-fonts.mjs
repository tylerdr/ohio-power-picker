import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { test } from 'node:test';

test('site fonts resolve only to bundled unchanged WOFF2 assets', () => {
  const css = fs.readFileSync('app/fonts.css', 'utf8');
  const manifest = JSON.parse(fs.readFileSync('public/fonts/manifest.json', 'utf8'));
  const urls = [...css.matchAll(/url\(([^)]+)\)/g)].map(x => x[1]);
  assert.equal(new Set(urls).size, 9);
  assert.equal((css.match(/@font-face/g) || []).length, 32);
  for (const url of urls) {
    assert.match(url, /^\/fonts\/[a-f0-9-]+(?:\.s)?[^/]*\.woff2$/);
    const name = url.slice('/fonts/'.length);
    const bytes = fs.readFileSync('public' + url);
    assert.equal(bytes.subarray(0, 4).toString(), 'wOF2');
    assert.equal(createHash('sha256').update(bytes).digest('hex'), manifest[name]);
  }
  for (const family of ['manrope', 'fraunces']) {
    assert.match(fs.readFileSync(`public/fonts/${family}-OFL.txt`, 'utf8'), /SIL OPEN FONT LICENSE Version 1.1/);
    assert(css.includes(`--font-${family}:`));
  }
});

test('root layout avoids Google font build loader and preloads existing Latin assets', () => {
  const layout = fs.readFileSync('app/layout.tsx', 'utf8');
  assert(!layout.includes('next/font/google'));
  assert(layout.includes("import './fonts.css'"));
  assert.equal((layout.match(/rel="preload"/g) || []).length, 2);
  for (const font of ['8760c4774489e4ba-s.p.woff2', 'af4bf8399d1aacdf-s.p.woff2']) {
    assert(layout.includes(`/fonts/${font}`));
  }
});

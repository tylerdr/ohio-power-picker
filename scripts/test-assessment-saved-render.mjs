import ts from 'typescript';import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import assert from 'node:assert/strict';import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';
const dir=await fs.mkdtemp(path.join(os.tmpdir(),'ohio-saved-render-'));await fs.symlink(path.resolve('node_modules'),path.join(dir,'node_modules'),'dir');
const files={'page':'app/broker-assessment/saved/page.tsx','saved-client':'lib/assessment/saved-client.ts','button':'components/ui/button.tsx','input':'components/ui/input.tsx','label':'components/ui/label.tsx','checkbox':'components/ui/checkbox.tsx','utils':'lib/utils.ts'};
for(const [name,file]of Object.entries(files)){
 const source=await fs.readFile(file,'utf8');let js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 js=js.replaceAll('@/lib/assessment/saved-client','./saved-client.mjs').replaceAll('@/lib/utils','./utils.mjs');
 for(const ui of ['button','input','label','checkbox'])js=js.replaceAll('@/components/ui/'+ui,'./'+ui+'.mjs');
 await fs.writeFile(path.join(dir,name+'.mjs'),js);
}
const {default:Page}=await import(path.join(dir,'page.mjs'));const html=renderToStaticMarkup(React.createElement(Page));
assert.match(html,/Prepare the first saved report/);assert.match(html,/id="initial-usage"/);assert.match(html,/id="initial-gap-scope"/);
assert.match(html,/<button[^>]*disabled=""[^>]*>Prepare and save first original<\/button>/);
assert.match(html,/Load original saved report/);assert(!html.includes('Immutable original report</h3>'));
assert.match(html,/does not create a registration/);
console.log('PASS actual saved-page server render: initial preparation controls, disabled-until-scope/reference gate, recovery action, no private original before authentication. SSR only; browser interaction not claimed.');
await fs.rm(dir,{recursive:true,force:true});

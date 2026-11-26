import ts from 'typescript';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
const temp=await fs.mkdtemp(path.join(os.tmpdir(),'ohio-custody-'));
await fs.symlink(path.resolve('node_modules'),path.join(temp,'node_modules'),'dir');
for(const n of ['report','custody','file-custody','invoice-authority','http']) {
 const source=await fs.readFile(`lib/assessment/${n}.ts`,'utf8');
 const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText.replace(/from '(\.\/[^']+)'/g,"from '$1.mjs'");
 await fs.writeFile(path.join(temp,`${n}.mjs`),js);
}
const {AssessmentCustody}=await import(path.join(temp,'custody.mjs'));
const {FileCustody}=await import(path.join(temp,'file-custody.mjs'));
const {invoiceAuthority}=await import(path.join(temp,'invoice-authority.mjs'));
const {assessmentHandlers}=await import(path.join(temp,'http.mjs'));
const root=path.join(temp,'rows');await fs.mkdir(root);const file=path.join(root,'case-a.json');
const actor={tenant:'tenant-a',owner:'owner-a'};
const registration={id:'case-a',...actor,customer:'synthetic-customer',invoice:'synthetic-invoice',account:'acct_1Re4ltEQ7c58oLZ4',livemode:false,scope:{revision:'scope-1',acceptedAt:'2026-10-22T12:00:00Z',kind:'measurement-gap-only',priceCents:50000,pilot:1,exclusions:['No enrollment','No guaranteed result']}};
const invoice={id:registration.invoice,customer:registration.customer,status:'paid',amountPaid:50000,currency:'usd',amountRefunded:0,disputed:false,paidOutOfBand:false,account:registration.account,livemode:false};
let state={...invoice},outage=false,reads=0,now='2026-10-23T12:00:00Z';
const reader={retrieveVerified:async()=>{reads++;if(outage)throw Error('outage');return structuredClone(state)}};
const authority=invoiceAuthority(reader,registration);
// This process runs synthetic prebuild assertions, not hosted persistence. Only
// synchronous fixture construction leaves the Vercel marker; restore it before
// any asynchronous custody operation. Never relax the production adapter guard.
function fixtureStore() {
 const vercel=process.env.VERCEL;
 try { delete process.env.VERCEL; return new FileCustody(root); }
 finally { if(vercel===undefined)delete process.env.VERCEL;else process.env.VERCEL=vercel; }
}
const service=()=>new AssessmentCustody(fixtureStore(),authority,()=>now);
const input={caseLabel:'Synthetic server case',territory:'ohio-edison',monthlyKwh:900,baselineAvailable:false,measurementGapScopeAccepted:true};
const access=(change)=>service().access(actor,'case-a',change);
const bytes=()=>fs.readFile(file,'utf8');
await fs.writeFile(file,JSON.stringify({registration}),{mode:0o600});let count=0;
async function test(name,fn){await fn();console.log('PASS',name);count++}
await test('production FileCustody rejects Vercel; fixture restores platform marker',async()=>{
 const vercel=process.env.VERCEL;
 try {
  process.env.VERCEL='1';
  assert.throws(()=>new FileCustody(root),/outside Vercel/);
  assert(fixtureStore() instanceof FileCustody);
  assert.equal(process.env.VERCEL,'1');
  assert.throws(()=>new FileCustody(root),/outside Vercel/);
  delete process.env.VERCEL;
  assert.throws(()=>new FileCustody('relative-fixture'),/explicit isolated/);
  fixtureStore();assert.equal(process.env.VERCEL,undefined);
 } finally { if(vercel===undefined)delete process.env.VERCEL;else process.env.VERCEL=vercel; }
});
await test('draft/unpaid never persisted',async()=>{for(const status of ['draft','open','void','uncollectible']){state={...invoice,status};await assert.rejects(access({expectedVersion:0,input}));assert.equal(JSON.parse(await bytes()).saved,undefined)}state={...invoice}});
const first=await access({expectedVersion:0,input});
await test('immutable original/accepted scope and exclusions retained',async()=>{assert.equal(first.version,1);assert.equal(first.original.scope.revision,'scope-1');assert.deepEqual(first.original.scope.exclusions,registration.scope.exclusions);assert.equal(first.original.sources[0].date,'2026-10-22')});
await test('foreign owner/tenant denied before provider read',async()=>{const n=reads;for(const bad of [{...actor,owner:'other'},{...actor,tenant:'other'}])await assert.rejects(service().access(bad,'case-a'));assert.equal(reads,n)});
await test('new instance recovers original; stale source label computed at read',async()=>{now='2026-10-24T00:00:00Z';const r=await access();assert.equal(r.original.report,first.original.report);assert.match(r.evidenceStatus,/DATED EVIDENCE/)});
await test('edits separate from original, stale write denied',async()=>{const r=await access({expectedVersion:1,input:{...input,monthlyKwh:1200}});assert.equal(r.version,2);assert.equal(r.editedInput.monthlyKwh,1200);assert.equal(r.original.input.monthlyKwh,900);assert.equal(r.original.report,first.original.report);await assert.rejects(access({expectedVersion:1,input}),/Stale/)});
await test('outage no mutation, retry recovers',async()=>{const before=await bytes();outage=true;await assert.rejects(access({expectedVersion:2,input}));assert.equal(await bytes(),before);outage=false;assert.equal((await access()).version,2)});
await test('refund/dispute/wrong account/customer/mode/out-of-band deny',async()=>{for(const patch of [{amountRefunded:1},{disputed:true},{account:'foreign'},{customer:'foreign'},{livemode:true},{paidOutOfBand:true},{amountPaid:49999}]){state={...invoice,...patch};await assert.rejects(access())}state={...invoice}});
await test('reversal on final rights check prevents write',async()=>{let n=0;const flip={retrieve:async()=>++n===1?invoice:{...invoice,amountRefunded:50000}};const before=await bytes();await assert.rejects(new AssessmentCustody(fixtureStore(),flip).access(actor,'case-a',{expectedVersion:2,input}));assert.equal(await bytes(),before)});
await test('concurrent updates cannot overwrite',async()=>{const r=await Promise.allSettled([access({expectedVersion:2,input}),access({expectedVersion:2,input:{...input,monthlyKwh:1000}})]);assert.equal(r.filter(x=>x.status==='fulfilled').length,1)});
await test('actual HTTP handlers authenticate, restrict origin, no-store, fail closed',async()=>{const req=new Request('https://example.test/api/broker-assessments/case-a');assert.equal((await assessmentHandlers(null).GET(req,'case-a')).status,503);assert.equal((await assessmentHandlers({authenticate:async()=>null,custody:service()}).GET(req,'case-a')).status,401);const h=assessmentHandlers({authenticate:async()=>actor,custody:service()});const r=await h.GET(req,'case-a');assert.equal(r.status,200);assert.match(r.headers.get('cache-control'),/no-store/);assert.equal((await r.json()).original.report,first.original.report);assert.equal((await h.POST(new Request(req.url,{method:'POST',headers:{origin:'https://foreign.test'},body:'{}'}),'case-a')).status,403)});
await test('HTTP edits persist version while preserving original, malformed/oversize rejected',async()=>{
 const h=assessmentHandlers({authenticate:async()=>actor,custody:service()});
 const req=body=>new Request('https://example.test/api/broker-assessments/case-a',{method:'POST',headers:{origin:'https://example.test','content-type':'application/json'},body});
 const before=await access();const r=await h.POST(req(JSON.stringify({expectedVersion:before.version,input:{...input,monthlyKwh:1500},owner:'forged'})),'case-a');
 assert.equal(r.status,200);const saved=await r.json();assert.equal(saved.version,before.version+1);assert.equal(saved.original.report,first.original.report);assert.equal(saved.editedInput.monthlyKwh,1500);
 assert.equal((await h.POST(req('{invalid'),'case-a')).status,400);
 assert.equal((await h.POST(req('x'.repeat(4097)),'case-a')).status,413);
 const foreign=assessmentHandlers({authenticate:async()=>({...actor,owner:'foreign'}),custody:service()});assert.equal((await foreign.GET(new Request('https://example.test'),'case-a')).status,404);
 outage=true;assert.equal((await h.GET(new Request('https://example.test'),'case-a')).status,503);outage=false;
 assert.equal((await h.GET(new Request('https://example.test'),'case-a')).status,200);
});
await test('missing authoritative reversal evidence rejected',async()=>{
 const broken=invoiceAuthority({retrieveVerified:async()=>({...invoice,disputed:undefined})},registration);
 await assert.rejects(new AssessmentCustody(fixtureStore(),broken).access(actor,'case-a'),/evidence/);
});
await test('corruption rejected',async()=>{const r=JSON.parse(await bytes());r.saved.original.report+='corrupt';await fs.writeFile(file,JSON.stringify(r));await assert.rejects(access(),/integrity/)});
console.log(`${count} focused new cases passed. Isolated filesystem/provider fixtures; not hosted acceptance.`);
await fs.rm(temp,{recursive:true,force:true});


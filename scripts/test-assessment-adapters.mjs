import ts from 'typescript';import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import assert from 'node:assert/strict';
const dir=await fs.mkdtemp(path.join(os.tmpdir(),'ohio-mounted-'));
await fs.symlink(path.resolve('node_modules'),path.join(dir,'node_modules'),'dir');
for(const name of ['assessment/report','assessment/custody','assessment/http','assessment/invoice-authority','assessment/postgrest-custody','assessment/stripe-invoice-reader','assessment/runtime','assessment/saved-client','assessment/session-view','supabase/server']){const source=await fs.readFile(`lib/${name}.ts`,'utf8');const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText.replace(/from '([.][^']+)'/g,"from '$1.mjs'");await fs.mkdir(path.dirname(path.join(dir,name)),{recursive:true});await fs.writeFile(path.join(dir,name+'.mjs'),js)}
const {mountedAssessmentHandlers,configFromEnvironment}=await import(path.join(dir,'assessment/runtime.mjs'));
const {prepareFirstSavedReport}=await import(path.join(dir,'assessment/saved-client.mjs'));
const {assessmentSessionView}=await import(path.join(dir,'assessment/session-view.mjs'));
const {PostgrestCustody}=await import(path.join(dir,'assessment/postgrest-custody.mjs'));
const config={target:{origin:'https://synthetic.supabase.co',tenant:'tenant-a',stripeAccount:'acct_1Re4ltEQ7c58oLZ4',livemode:false},publishableKey:'fixture-public',serviceKey:'fixture-service',stripeKey:'fixture-stripe'};
const claims={sub:'owner-a',session_id:'session-a',iss:config.target.origin+'/auth/v1',exp:Math.floor(Date.now()/1000)+3600};const token='fixture.'+Buffer.from(JSON.stringify(claims)).toString('base64url')+'.fixture';
const registration={id:'case-a',tenant:'tenant-a',owner:'owner-a',customer:'cus_a',invoice:'in_a',account:config.target.stripeAccount,livemode:false,scope:{revision:'scope-1',acceptedAt:'2026-10-22T12:00:00Z',kind:'measurement-gap-only',priceCents:50000,pilot:1,exclusions:['No enrollment']}};
let sessionLive=true,revokeAt='',actorChecks=0;
let row={registration},revision=0,mode=false,owner='owner-a',member=true,outage=false,status='paid',refunded=0,disputed=false,foreignCharge=false,conflict=false;const calls=[];
const json=x=>Response.json(x);
async function transport(raw,options){const u=new URL(raw),h=new Headers(options.headers);calls.push(u.pathname);
 if(outage)throw Error('fixture outage');
 if(u.hostname==='synthetic.supabase.co'){
  if(u.pathname==='/auth/v1/user'){assert.equal(h.get('apikey'),'fixture-public');assert.equal(h.get('authorization'),'Bearer '+token);return json({id:owner,is_anonymous:false,user_metadata:{tenant:'evil'}})}
  assert.equal(h.get('apikey'),'fixture-service');assert.equal(h.get('authorization'),'Bearer fixture-service');const body=JSON.parse(options.body);
  if(u.pathname.endsWith('ohio_assessment_actor')){actorChecks++;assert.equal(body.p_session,'session-a');return json(sessionLive&&member&&body.p_owner==='owner-a'?{owner:'owner-a',tenant:'tenant-a',session_id:'session-a'}:null)}
  assert.equal(body.p_session,'session-a');
  assert.equal(body.p_owner,'owner-a');assert.equal(body.p_tenant,'tenant-a');
  if(u.pathname.endsWith('ohio_assessment_load')){if(revokeAt==='load')sessionLive=false;return json(sessionLive?{row:structuredClone(row),revision}:null)}
  if(u.pathname.endsWith('ohio_assessment_commit')){if(revokeAt==='commit')sessionLive=false;if(!sessionLive||conflict||body.p_revision!==revision)return json(false);row={registration,saved:body.p_saved};revision++;if(revokeAt==='response')sessionLive=false;return json(true)}
 }
 assert.equal(u.hostname,'api.stripe.com');assert.equal(h.get('authorization'),'Bearer fixture-stripe');assert.equal(h.get('stripe-version'),'2024-06-20');
 if(u.pathname==='/v1/account')return json({id:config.target.stripeAccount});if(u.pathname==='/v1/balance')return json({livemode:mode});
 if(u.pathname==='/v1/invoices/in_a')return json({id:'in_a',customer:'cus_a',status,amount_paid:50000,currency:'usd',livemode:false,paid_out_of_band:false,pre_payment_credit_notes_amount:0,post_payment_credit_notes_amount:0,starting_balance:0,ending_balance:0,charge:{id:'ch_a',invoice:foreignCharge?'in_other':'in_a',payment_intent:'pi_a',customer:'cus_a',livemode:false,currency:'usd',amount_captured:50000,amount_refunded:refunded,disputed,paid:true,captured:true,status:'succeeded'},payment_intent:{id:'pi_a',latest_charge:'ch_a',status:'succeeded',customer:'cus_a',livemode:false,currency:'usd',amount_received:50000}});
 throw Error('Unexpected URL '+u.pathname);
}
const input={caseLabel:'Synthetic mounted case',territory:'ohio-edison',monthlyKwh:900,baselineAvailable:false,measurementGapScopeAccepted:true};
const request=(method='GET',body)=>new Request('https://preview.test/api/broker-assessments/case-a',{method,headers:{cookie:'__Host-ohio-access-token='+token,origin:'https://preview.test'},body:body===undefined?undefined:JSON.stringify(body)});
const h=()=>mountedAssessmentHandlers(config,transport);let passed=0;async function test(n,fn){if(process.argv.includes('--reader-session')&&!n.startsWith('reader:'))return;if(process.argv.includes('--cas-initial')&&!n.startsWith('cas:'))return;if(process.argv.includes('--session-revocation')&&!n.startsWith('session:'))return;await fn();passed++;console.log('PASS',n)}
await test('real mounted disabled route never reads transport',async()=>{assert.equal(configFromEnvironment({OHIO_ASSESSMENT_ENABLED:'true',VERCEL_ENV:'preview'}),null);assert.equal((await mountedAssessmentHandlers(null,()=>{throw Error('must not call')}).GET(request(),'case-a')).status,503)});
await test('remote session and fresh membership reject spoof/foreign owner',async()=>{owner='other';const n=calls.length;assert.equal((await h().GET(request(),'case-a')).status,401);assert(!calls.slice(n).includes('/v1/account'));owner='owner-a';member=false;assert.equal((await h().GET(request(),'case-a')).status,401);member=true});
await test('draft denied and does not commit custody',async()=>{status='draft';assert.equal((await h().POST(request('POST',{expectedVersion:0,input}),'case-a')).status,403);assert.equal(revision,0);status='paid'});
let original;
await test('concrete auth->RPC->invoice/charge->CAS mounts create/read/edit',async()=>{const r=await h().POST(request('POST',{expectedVersion:0,input}),'case-a');assert.equal(r.status,200);original=(await r.json()).original.report;const get=await h().GET(request(),'case-a');assert.equal((await get.json()).original.report,original);const edit=await h().POST(request('POST',{expectedVersion:1,input:{...input,monthlyKwh:1200}}),'case-a');assert.equal(edit.status,200);const v=await edit.json();assert.equal(v.original.report,original);assert.equal(v.editedInput.monthlyKwh,1200)});
await test('wrong actual key mode/foreign charge/refund/dispute fail closed',async()=>{for(const field of ['mode','foreignCharge','refunded','disputed']){if(field==='mode')mode=true;if(field==='foreignCharge')foreignCharge=true;if(field==='refunded')refunded=1;if(field==='disputed')disputed=true;const r=await h().GET(request(),'case-a');assert(r.status===403||r.status===503);mode=false;foreignCharge=false;refunded=0;disputed=false}});
await test('RPC compare-and-swap conflict has no success or overwrite',async()=>{conflict=true;const before=JSON.stringify(row);assert.equal((await h().POST(request('POST',{expectedVersion:2,input}),'case-a')).status,409);assert.equal(JSON.stringify(row),before);conflict=false});
await test('service outage denies; new mounted instance retries original',async()=>{outage=true;assert.equal((await h().GET(request(),'case-a')).status,503);outage=false;assert.equal((await (await h().GET(request(),'case-a')).json()).original.report,original)});
await test('store rejects returned foreign owner before callback',async()=>{let ran=false;const s=new PostgrestCustody(async()=>({revision:0,row:{registration:{...registration,owner:'other'}}}),{owner:'owner-a',tenant:'tenant-a',session:'session-a',expiresAt:Date.now()+60000});await assert.rejects(s.transact('case-a',async()=>{ran=true}));assert.equal(ran,false)});
await test('session: revoked during load never reaches provider or commit',async()=>{
 sessionLive=true;revokeAt='load';const before=JSON.stringify(row),n=calls.length;
 assert.equal((await h().GET(request(),'case-a')).status,404);
 assert(!calls.slice(n).includes('/v1/account'));assert.equal(JSON.stringify(row),before);
 sessionLive=true;revokeAt='';
});
await test('session: revoked after auth before CAS denies initial write',async()=>{
 row={registration};revision=0;sessionLive=true;revokeAt='commit';
 const r=await h().POST(request('POST',{expectedVersion:0,input}),'case-a');
 assert.equal(r.status,409);assert.equal(row.saved,undefined);assert.equal(revision,0);
 sessionLive=true;revokeAt='';
});
await test('session: revoked after read CAS before response releases no report',async()=>{
 row={registration};revision=0;sessionLive=true;revokeAt='';
 assert.equal((await h().POST(request('POST',{expectedVersion:0,input}),'case-a')).status,200);
 const original=row.saved.original.report;const n=actorChecks;
 revokeAt='response';const r=await h().GET(request(),'case-a');
 assert.equal(r.status,401);assert(!(await r.text()).includes(original));assert(actorChecks>=n+2);
 sessionLive=true;revokeAt='';assert.equal((await (await h().GET(request(),'case-a')).json()).original.report,original);
});
await test('session: SQL load/CAS carry session and final CAS locks live owner row',async()=>{
 const sql=await fs.readFile('documents/sql/assessment-custody-proposal.sql','utf8');
 assert.match(sql,/ohio_assessment_load\(p_id text,p_owner uuid,p_tenant uuid,p_session uuid\)/);
 assert.match(sql,/ohio_assessment_commit\(p_id text,p_owner uuid,p_tenant uuid,p_session uuid/);
 assert.match(sql,/s.id=p_session and s.user_id=p_owner[\s\S]*for share/);
 assert.match(sql,/session_id',s.id/);
});
await test('cas: malformed loaded revision denies before callback',async()=>{
 for(const bad of [null,undefined,-1,1.5,'0']) {
  let ran=false;const store=new PostgrestCustody(async()=>({revision:bad,row:{registration}}),{owner:'owner-a',tenant:'tenant-a',session:'session-a',expiresAt:Date.now()+60000});
  await assert.rejects(store.transact('case-a',async()=>{ran=true}));assert.equal(ran,false);
 }
});
await test('cas: missing/null/noninteger saved versions never call commit',async()=>{
 for(const bad of [undefined,null,0,-1,1.5,'1',{},9007199254740992]){
  let commits=0;const store=new PostgrestCustody(async name=>{if(name==='ohio_assessment_load')return {revision:0,row:{registration}};commits++;return true},{owner:'owner-a',tenant:'tenant-a',session:'session-a',expiresAt:Date.now()+60000});
  await assert.rejects(store.transact('case-a',async()=>({row:{registration,saved:{version:bad}},result:'invalid'})));assert.equal(commits,0);
 }
});
await test('cas: SQL source explicitly rejects null revision/version before casts',async()=>{
 const sql=await fs.readFile('documents/sql/assessment-custody-proposal.sql','utf8');
 assert.match(sql,/p_revision is null or p_revision < 0/);assert.match(sql,/r.revision is distinct from p_revision/);
 assert.match(sql,/jsonb_typeof\(p_saved->'version'\) is distinct from 'number'/);
 assert(sql.indexOf("jsonb_typeof(p_saved->'version')")<sql.indexOf("v := (p_saved->>'version')::bigint"));
 assert.match(sql,/v is distinct from 1/);assert.match(sql,/p_saved->'original' is distinct from r.saved->'original'/);
});
await test('cas: initial UI request mounts existing custody, retries preserve original',async()=>{
 row={registration};revision=0;sessionLive=true;revokeAt='';status='paid';
 let sent;const bridge=async(raw,options)=>{sent=JSON.parse(options.body);assert(!('owner' in sent));assert(!('tenant' in sent));return h().POST(new Request('https://preview.test'+raw,{...options,headers:{...options.headers,cookie:'__Host-ohio-access-token='+token,origin:'https://preview.test'}}),'case-a')};
 await assert.rejects(prepareFirstSavedReport('case-a',900,false,bridge),/Confirm/);
 const created=await prepareFirstSavedReport('case-a',900,true,bridge);assert.equal(sent.expectedVersion,0);assert.equal(created.version,1);assert.equal(created.original.scope.revision,'scope-1');
 const original=created.original.report;await assert.rejects(prepareFirstSavedReport('case-a',1200,true,bridge),/already exists/);
 assert.equal((await (await h().GET(request(),'case-a')).json()).original.report,original);
});
await test('cas: initial preparation denies draft and revoked session',async()=>{
 row={registration};revision=0;sessionLive=true;revokeAt='';status='draft';
 const bridge=async(raw,options)=>h().POST(new Request('https://preview.test'+raw,{...options,headers:{...options.headers,cookie:'__Host-ohio-access-token='+token,origin:'https://preview.test'}}),'case-a');
 await assert.rejects(prepareFirstSavedReport('case-a',900,true,bridge));assert.equal(row.saved,undefined);
 status='paid';revokeAt='commit';await assert.rejects(prepareFirstSavedReport('case-a',900,true,bridge));assert.equal(row.saved,undefined);sessionLive=true;revokeAt='';
});
await test('reader: session snapshot uses verified current owner/session, no token exposure',async()=>{
 sessionLive=true;member=true;owner='owner-a';revokeAt='';
 const handler=assessmentSessionView(config,transport);const r=await handler(request());assert.equal(r.status,200);assert.match(r.headers.get('cache-control'),/no-store/);
 const s=await r.json();assert.equal(s.owner,'owner-a');assert.equal(s.tenant,'tenant-a');assert.match(s.fingerprint,/^[a-f0-9]{64}$/);assert.equal(s.authChannel,'sb-synthetic-auth-token');assert(!JSON.stringify(s).includes(token));assert(!JSON.stringify(s).includes('fixture-service'));assert(!('session' in s));
 sessionLive=false;assert.equal((await handler(request())).status,401);sessionLive=true;
});
await test('reader: missing config/outage/foreign verified session never yields snapshot',async()=>{
 assert.equal((await assessmentSessionView(null,()=>{throw Error('no network')})(request())).status,503);
 owner='foreign';assert.equal((await assessmentSessionView(config,transport)(request())).status,401);owner='owner-a';
 outage=true;assert.equal((await assessmentSessionView(config,transport)(request())).status,503);outage=false;
});
console.log(`${passed} new concrete adapter/mounted-handler cases passed; transport fixtures only, no native SQL or hosted acceptance.`);
await fs.rm(dir,{recursive:true,force:true});

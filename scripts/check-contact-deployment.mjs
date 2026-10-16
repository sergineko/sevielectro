import assert from 'node:assert/strict';
import { readFile,writeFile } from 'node:fs/promises';
import { PRIVACY_VERSION } from '../src/lib/privacy.js';

const target = new URL(process.argv[2] || 'https://sevielectro.pages.dev/');
const assets = JSON.parse(await readFile(new URL('../src/data/static-assets.json',import.meta.url),'utf8'));
const requests = [];
async function get(path,options = {}) {
  const response = await fetch(new URL(path,target),{ ...options,signal:AbortSignal.timeout(15000) });
  requests.push({ path,status:response.status,headers:Object.fromEntries(['cache-control','cf-cache-status','etag','content-type'].map(header => [header,response.headers.get(header)])) });
  return response;
}
const home = await get('/');
assert.equal(home.status,200);
assert.match(home.headers.get('cache-control'),/max-age=0.*must-revalidate/);
const html = await home.text();
assert.ok(html.includes('Adjuntar archivos'));
assert.equal([...html.matchAll(/class="contact-email-link"/g)].length,2);
assert.ok(!html.includes('Gonzalo Sevilla'));
assert.ok(html.includes(assets.clients.src));
for (const path of [assets.clients.src,assets.font]) {
  const response = await get(path);
  assert.equal(response.status,200); assert.match(response.headers.get('cache-control'),/max-age=31536000.*immutable/);
  await response.arrayBuffer();
  const etag = response.headers.get('etag');
  if (etag) { const conditional = await get(path,{ headers:{ 'If-None-Match':etag } }); assert.equal(conditional.status,304); }
}
const method = await get('/api/contact');
assert.equal(method.status,405); assert.match(method.headers.get('cache-control'),/no-store/); await method.text();
const body = { name:'Prueba técnica',email:'audit@example.com',message:'Comprobación de validación sin enviar correo.',consent:'yes',privacyVersion:PRIVACY_VERSION };
for (const [token,status] of [[undefined,400],['audit-invalid-token',403]]) {
  const result = await get('/api/contact',{ method:'POST',headers:{ 'Content-Type':'application/json',Origin:target.origin },body:JSON.stringify({ ...body,turnstileToken:token }) });
  assert.equal(result.status,status); assert.match(result.headers.get('cache-control'),/no-store/);
  assert.equal((await result.json()).success,undefined);
}
await writeFile(new URL('../migration/audits/contact-public.json',import.meta.url),JSON.stringify({ date:new Date().toISOString(),target:target.href,passed:true,requests,limitations:['No se ha enviado ningún correo real. La recepción y Reply-To deben verificarse cuando se configure Resend.'] },null,2)+'\n');
console.log(JSON.stringify({ passed:true,requests:requests.length,form:'Sin token: 400; token inválido: 403; GET: 405',cache:'Recursos inmutables y respuestas condicionales 304; API no-store' },null,2));

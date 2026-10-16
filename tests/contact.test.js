import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequest, onRequestPost } from '../functions/api/contact.js';
import { checkFiles, validateAttachments, MAX_FILE_BYTES } from '../src/lib/attachments.js';
import { crc32 } from 'node:zlib';
import sharp from 'sharp';
import { PRIVACY_VERSION, PRIVACY_CONSENT } from '../src/lib/privacy.js';

const valid = { name:'Ana', email:'ana@example.com', message:'Necesito una instalación eléctrica', consent:'yes', privacyVersion:PRIVACY_VERSION, turnstileToken:'fresh-token' };
const security = { TURNSTILE_SECRET_KEY:'test-secret', TURNSTILE_ALLOWED_HOSTNAMES:'sevielectro.example' };
const env = { ...security, RESEND_API_KEY:'re_test', TO_EMAIL:'sevielectro81@gmail.com,sevielectro_81@hotmail.com', FROM_EMAIL:'contact@example.com' };
const context = (body,config = env,headers = {}) => ({ request:new Request('https://sevielectro.example/api/contact',{ method:'POST', headers:{ 'Content-Type':'application/json', ...headers }, body:JSON.stringify(body) }), env:config });
const verified = { success:true, action:'contact', hostname:'sevielectro.example' };
const pdf = { name:'plano.pdf', content:Buffer.from('%PDF-1.7\nexample\n%%EOF').toString('base64') };
async function mockNetwork(run,verification = verified,providerStatus = 200) {
  const original = globalThis.fetch, calls = [];
  globalThis.fetch = async (url,options) => {
    calls.push({ url, options, body:JSON.parse(options.body) });
    return new Response(JSON.stringify(String(url).includes('siteverify') ? verification : providerStatus === 200 ? { id:'test-email' } : { message:'secret-provider-detail',name:'validation_error' }),{ status:String(url).includes('siteverify') ? 200 : providerStatus });
  };
  try { await run(calls); } finally { globalThis.fetch = original; }
}

test('rechaza campos inválidos, JSON malformado y token ausente antes de llamadas externas',async () => {
  await mockNetwork(async calls => {
    for (const body of [{},{ ...valid,email:'incorrecto' },{ ...valid,consent:undefined },{ ...valid,name:42 },{ ...valid,message:'a'.repeat(5001) },{ ...valid,turnstileToken:'' },{ ...valid,turnstileToken:'a'.repeat(2049) }]) assert.equal((await onRequestPost(context(body))).status,400);
    const ctx = context(valid); ctx.request = new Request(ctx.request,{ body:'{' });
    assert.equal((await onRequestPost(ctx)).status,400);
    assert.equal(calls.length,0);
  });
});
test('solo POST del mismo origen, con respuestas privadas incluso para errores',async () => {
  assert.equal((await onRequestPost(context(valid,env,{ Origin:'https://external.example' }))).status,400);
  const result = onRequest({ request:new Request('https://sevielectro.example/api/contact') });
  assert.equal(result.status,405); assert.equal(result.headers.get('Allow'),'POST');
  assert.match(result.headers.get('Cache-Control'),/no-store/);
  assert.match(result.headers.get('Content-Type'),/application\/json/);
});
test('honeypot y ráfagas no consumen subrequests ni envían correos',async () => {
  await mockNetwork(async calls => {
    assert.equal((await onRequestPost(context({ ...valid,website:'spam' }))).status,200);
    for (let i = 0; i < 8; i++) assert.equal((await onRequestPost(context({},env,{ 'CF-Connecting-IP':'198.51.100.45' }))).status,400);
    const response = await onRequestPost(context(valid,env,{ 'CF-Connecting-IP':'198.51.100.45' }));
    assert.equal(response.status,429); assert.equal(response.headers.get('Retry-After'),'60'); assert.equal(calls.length,0);
  });
});
test('falla de forma cerrada sin secretos o sin servicio de verificación',async () => {
  await mockNetwork(async calls => {
    assert.equal((await onRequestPost(context(valid,{}))).status,503); assert.equal(calls.length,0);
    assert.equal((await onRequestPost(context(valid,security))).status,503); assert.equal(calls.length,1);
  });
  const original = globalThis.fetch; globalThis.fetch = async () => { throw new Error('internal-secret'); };
  try { const response = await onRequestPost(context(valid)); assert.equal(response.status,503); assert.ok(!(await response.text()).includes('internal-secret')); }
  finally { globalThis.fetch = original; }
});
test('tokens rechazados, reutilizados, con otra acción o hostname nunca llegan a Resend',async () => {
  for (const result of [{ success:false,'error-codes':['timeout-or-duplicate'] },{ ...verified,action:'login' },{ ...verified,hostname:'attacker.example' }]) {
    await mockNetwork(async calls => { assert.equal((await onRequestPost(context(valid))).status,403); assert.equal(calls.length,1); },result);
  }
});
test('valida adjuntos y envía una sola petición a Resend con contenido escapado y clave idempotente',async () => {
  await mockNetwork(async calls => {
    const body = { ...valid,name:'<script>alert(1)</script>',attachments:[pdf] };
    assert.equal((await onRequestPost(context(body))).status,200);
    assert.equal(calls.length,2);
    const sent = calls[1].body;
    assert.ok(sent.html.includes('&lt;script&gt;')); assert.ok(!sent.html.includes('<script>'));
    assert.deepEqual(sent.to,['sevielectro81@gmail.com','sevielectro_81@hotmail.com']);
    assert.equal(sent.from,env.FROM_EMAIL); assert.equal(sent.reply_to,valid.email); assert.equal(sent.attachments[0].content,pdf.content);
    assert.ok(sent.text.includes(PRIVACY_CONSENT)); assert.ok(sent.text.includes(PRIVACY_VERSION)); assert.ok(sent.html.includes(PRIVACY_VERSION));
    assert.equal(sent.attachments[0].filename,pdf.name); assert.equal(sent.attachments[0].content_type,'application/pdf');
    const key = calls[1].options.headers.get('Idempotency-Key');
    assert.match(key,/^contact-[a-f0-9]{64}$/);
    assert.equal((await onRequestPost(context({ ...body,turnstileToken:'another-fresh-token' }))).status,200);
    assert.equal(calls[3].options.headers.get('Idempotency-Key'),key);
    assert.equal((await onRequestPost(context({ ...body,attachments:[] }))).status,200);
    assert.notEqual(calls[5].options.headers.get('Idempotency-Key'),key);
  });
});
test('una versión de privacidad ausente o antigua exige revisar el aviso antes de contactar proveedores',async () => {
  await mockNetwork(async calls => {
    for (const privacyVersion of [undefined,'2020-01-01']) {
      const result = await onRequestPost(context({ ...valid,privacyVersion }));
      assert.equal(result.status,400); assert.match((await result.json()).error,/Recarga la página/);
    }
    assert.equal(calls.length,0);
  });
});
test('rechaza formato falsificado, archivos ejecutables y límites antes de Resend',async () => {
  await mockNetwork(async calls => {
    for (const attachments of [[{ name:'malware.exe',content:pdf.content }],[{ name:'fake.pdf',content:Buffer.from('not a pdf').toString('base64') }],[pdf,pdf,pdf,pdf],[{ name:'test.pdf',content:'!!!!' }]]) {
      assert.equal((await onRequestPost(context({ ...valid,attachments }))).status,400);
    }
    assert.ok(calls.every(call => call.url.includes('siteverify')));
  });
  assert.throws(() => checkFiles([{ name:'large.pdf',size:MAX_FILE_BYTES + 1 }]));
  assert.throws(() => checkFiles(Array.from({ length:3 },() => ({ name:'x.pdf',size:MAX_FILE_BYTES }))));
  assert.throws(() => validateAttachments([{ name:'archive.docx',content:Buffer.from('PK\x03\x04not-word').toString('base64') }]));
  assert.equal(validateAttachments().length,0);
});
test('limita el cuerpo antes de parsear o consultar proveedores',async () => {
  await mockNetwork(async calls => {
    assert.equal((await onRequestPost(context(valid,env,{ 'Content-Length':'999999999' }))).status,413);
    const stream = new ReadableStream({ start(controller) { controller.enqueue(new Uint8Array(15 * 1024 * 1024)); controller.close(); } });
    const request = new Request('https://sevielectro.example/api/contact',{ method:'POST',headers:{ 'Content-Type':'application/json' },body:stream,duplex:'half' });
    assert.equal((await onRequestPost({ request,env })).status,413); assert.equal(calls.length,0);
  });
});
test('los fallos del proveedor no revelan detalles internos ni declaran éxito',async () => {
  await mockNetwork(async calls => { const response = await onRequestPost(context(valid)); assert.equal(response.status,500); assert.ok(!(await response.text()).includes('secret-provider-detail')); assert.equal(calls.length,2); },verified,422);
});

function wordDocument(extra = []) {
  const local = [], central = []; let offset = 0;
  for (const [name,text] of [['[Content_Types].xml','<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>'],['word/document.xml','<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body/></w:document>'],...extra]) {
    const filename = Buffer.from(name), bytes = Buffer.from(text), checksum = crc32(bytes);
    const header = Buffer.alloc(30); header.writeUInt32LE(0x04034b50); header.writeUInt16LE(20,4); header.writeUInt32LE(checksum,14); header.writeUInt32LE(bytes.length,18); header.writeUInt32LE(bytes.length,22); header.writeUInt16LE(filename.length,26);
    local.push(header,filename,bytes);
    const directory = Buffer.alloc(46); directory.writeUInt32LE(0x02014b50); directory.writeUInt16LE(20,4); directory.writeUInt16LE(20,6); directory.writeUInt32LE(checksum,16); directory.writeUInt32LE(bytes.length,20); directory.writeUInt32LE(bytes.length,24); directory.writeUInt16LE(filename.length,28); directory.writeUInt32LE(offset,42);
    central.push(directory,filename); offset += header.length + filename.length + bytes.length;
  }
  const directory = Buffer.concat(central), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50); end.writeUInt16LE(2 + extra.length,8); end.writeUInt16LE(2 + extra.length,10); end.writeUInt32LE(directory.length,12); end.writeUInt32LE(offset,16);
  return { name:'proyecto.docx',content:Buffer.concat([...local,directory,end]).toString('base64') };
}
test('acepta documentos Word y fotografías de los formatos anunciados',async () => {
  const docx = wordDocument();
  assert.equal(validateAttachments([docx])[0].contentType,'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  assert.throws(() => validateAttachments([wordDocument([['word/vbaProject.bin','macro']])]));
  const legacy = { name:'plano.doc',content:Buffer.from([208,207,17,224,161,177,26,225]).toString('base64') };
  assert.equal(validateAttachments([legacy])[0].contentType,'application/msword');
  for (const [format,mime] of [['png','image/png'],['jpeg','image/jpeg'],['webp','image/webp']]) {
    const bytes = await sharp({ create:{ width:2,height:2,channels:3,background:'#dd2036' } }).toFormat(format).toBuffer();
    assert.equal(validateAttachments([{ name:`foto.${format}`,content:bytes.toString('base64') }])[0].contentType,mime);
  }
  await mockNetwork(async calls => { assert.equal((await onRequestPost(context({ ...valid,attachments:[docx] }))).status,200); assert.equal(calls[1].body.attachments[0].content,docx.content); });
});

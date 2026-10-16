import { Resend } from 'resend';
import { MAX_TOTAL_BYTES, validateAttachments } from '../../src/lib/attachments.js';

const MAX_BODY_BYTES = Math.ceil(MAX_TOTAL_BYTES / 3) * 4 + 32768;
const attempts = new Map();
const json = (body,status = 200,extra = {}) => new Response(JSON.stringify(body), {
  status, headers:{ 'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'private, no-store', 'X-Content-Type-Options':'nosniff', ...extra },
});
const escapeHtml = value => value.replace(/[&<>"']/g,char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));

function burstBlocked(ip) {
  if (!ip) return false;
  const now = Date.now(), previous = attempts.get(ip);
  if (previous && previous.until > now) return ++previous.count > 8;
  // Bounded, per-isolate burst guard; Turnstile remains mandatory.
  if (attempts.size >= 4096) {
    for (const [key,item] of attempts) if (item.until <= now) attempts.delete(key);
    if (attempts.size >= 4096) attempts.delete(attempts.keys().next().value);
  }
  attempts.set(ip,{ count:1, until:now + 60000 });
  return false;
}

async function readBody(request) {
  if (Number(request.headers.get('Content-Length')) > MAX_BODY_BYTES) throw new RangeError();
  const reader = request.body?.getReader();
  if (!reader) throw new SyntaxError();
  const decoder = new TextDecoder('utf-8',{ fatal:true });
  let raw = '', size = 0;
  try {
    while (true) {
      const { value,done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) { await reader.cancel(); throw new RangeError(); }
      raw += decoder.decode(value,{ stream:true });
    }
    return JSON.parse(raw + decoder.decode());
  } finally { reader.releaseLock(); }
}

export async function onRequestPost({ request,env }) {
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) return json({ error:'Origen de solicitud no permitido.' },400);
  if (request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json') return json({ error:'Se requiere un cuerpo JSON.' },400);
  const ip = request.headers.get('CF-Connecting-IP');
  if (burstBlocked(ip)) return json({ error:'Has realizado varios intentos. Espera un minuto antes de volver a enviar.' },429,{ 'Retry-After':'60' });
  let body;
  try { body = await readBody(request); }
  catch (error) { return json({ error:error instanceof RangeError ? 'La solicitud supera el tamaño permitido.' : 'El JSON no es válido.' },error instanceof RangeError ? 413 : 400); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ error:'Datos no válidos.' },400);
  if (body.website) return json({ success:true });
  const fields = {}, limits = { name:100, email:254, phone:30, service:100, message:5000 };
  for (const [key,limit] of Object.entries(limits)) {
    if (body[key] !== undefined && typeof body[key] !== 'string') return json({ error:'Los campos deben ser texto.' },400);
    fields[key] = (body[key] || '').trim();
    if (fields[key].length > limit) return json({ error:'Algún campo supera la longitud permitida.' },400);
  }
  const { name,email,phone,service,message } = fields;
  if (!name || !email || message.length < 10 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || /[\r\n]/.test(email) || body.consent !== 'yes') return json({ error:'Revisa el nombre, el email, la descripción (mínimo 10 caracteres) y la aceptación de privacidad.' },400);
  if (typeof body.turnstileToken !== 'string' || !body.turnstileToken || body.turnstileToken.length > 2048) return json({ error:'No se ha completado la comprobación de seguridad. Inténtalo de nuevo.' },400);
  const hostnames = (env.TURNSTILE_ALLOWED_HOSTNAMES || '').split(',').map(host => host.trim().toLowerCase()).filter(Boolean);
  if (!env.TURNSTILE_SECRET_KEY || !hostnames.length) return json({ error:'La comprobación de seguridad no está disponible. Contacta por teléfono o email.' },503);
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{
      method:'POST', headers:{ 'Content-Type':'application/json' }, signal:AbortSignal.timeout(8000),
      body:JSON.stringify({ secret:env.TURNSTILE_SECRET_KEY, response:body.turnstileToken, ...(ip ? { remoteip:ip } : {}) }),
    });
    if (!response.ok) throw new Error();
    const verified = await response.json();
    if (verified.success !== true || verified.action !== 'contact' || !hostnames.includes(verified.hostname?.toLowerCase())) return json({ error:'La comprobación de seguridad no es válida o ha caducado. Vuelve a enviar el formulario.' },403);
  } catch { return json({ error:'No se ha podido comprobar la seguridad. Inténtalo de nuevo en unos instantes.' },503); }
  let attachments;
  try { attachments = validateAttachments(body.attachments); }
  catch (error) { return json({ error:error.message },400); }
  const recipients = [...new Set((env.TO_EMAIL || '').split(',').map(address => address.trim()).filter(Boolean))];
  if (!env.RESEND_API_KEY || !env.FROM_EMAIL || !recipients.length || recipients.length > 10 || recipients.some(address => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address))) return json({ error:'El servicio de correo no está configurado. Contacta por teléfono o email.' },503);
  try {
    const resend = new Resend(env.RESEND_API_KEY);
    const rows = [['Nombre',name],['Email',email],['Teléfono',phone || 'No indicado'],['Servicio',service || 'Consulta general']].map(([label,value]) => `<tr><td style="padding:12px;border-bottom:1px solid #334155;color:#94a3b8">${label}</td><td style="padding:12px;border-bottom:1px solid #334155">${escapeHtml(value)}</td></tr>`).join('');
    const payload = {
      from:env.FROM_EMAIL, to:recipients, replyTo:email,
      subject:`Nueva consulta web · ${service || 'SeviElectro'}`.replace(/[\r\n]/g,' '),
      html:`<!doctype html><html lang="es"><body style="margin:0;padding:32px;background:#080d18;color:#f1f5f9;font-family:Arial,sans-serif"><div style="max-width:600px;margin:auto;border:1px solid #334155;border-radius:14px;padding:32px;background:#0f172a"><p style="color:#fb7185;letter-spacing:2px">SEVIELECTRO / CONTACTO</p><h1 style="font-size:26px">Una nueva idea por conectar.</h1><table style="width:100%;border-collapse:collapse">${rows}</table><h2 style="font-size:16px;margin-top:28px">Descripción</h2><p style="line-height:1.8;white-space:pre-wrap">${escapeHtml(message)}</p>${attachments.length ? `<p style="color:#cbd5e1">Archivos adjuntos: ${attachments.map(file => escapeHtml(file.filename)).join(', ')}</p>` : ''}</div></body></html>`,
      text:`Nueva consulta SeviElectro\nNombre: ${name}\nEmail: ${email}\nTeléfono: ${phone || 'No indicado'}\nServicio: ${service || 'Consulta general'}\n\n${message}`,
      ...(attachments.length ? { attachments } : {}),
    };
    const digest = await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(payload)));
    const idempotencyKey = 'contact-' + Array.from(new Uint8Array(digest),byte => byte.toString(16).padStart(2,'0')).join('');
    const { error } = await resend.emails.send(payload,{ idempotencyKey, signal:AbortSignal.timeout(12000) });
    if (error) return json({ error:'No hemos podido enviar el mensaje. Inténtalo más tarde.' },500);
    return json({ success:true });
  } catch { return json({ error:'El servicio de correo no está disponible. Inténtalo más tarde.' },500); }
}

export function onRequest(context) {
  return context.request.method === 'POST' ? onRequestPost(context) : json({ error:'Método no permitido.' },405,{ Allow:'POST' });
}

import { Resend } from 'resend';
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
const escapeHtml = value => value.replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
export async function onRequestPost(context) {
 const { request, env } = context;
 const origin = request.headers.get('Origin');
 if (origin && origin !== new URL(request.url).origin) return json({error:'Origen de solicitud no permitido.'},400);
 if (!request.headers.get('Content-Type')?.includes('application/json')) return json({error:'Se requiere un cuerpo JSON.'},400);
 let body;
 try { const raw = await request.text(); if (new TextEncoder().encode(raw).length > 16000) return json({error:'El mensaje es demasiado largo.'},400); body=JSON.parse(raw); } catch { return json({error:'El JSON no es válido.'},400); }
 if (!body || typeof body !== 'object' || Array.isArray(body)) return json({error:'Datos no válidos.'},400);
 if (body.website) return json({success:true});
 const fields = {}; const limits={name:100,email:254,phone:30,service:100,message:5000};
 for (const [key, limit] of Object.entries(limits)) { if(body[key] !== undefined && typeof body[key] !== 'string') return json({error:'Los campos deben ser texto.'},400); fields[key]=(body[key] || '').trim(); if(fields[key].length>limit) return json({error:'Algún campo supera la longitud permitida.'},400); }
 const {name,email,phone,service,message}=fields;
 if (!name || !email || message.length<10 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || /[\r\n]/.test(email) || body.consent !== 'yes') return json({error:'Revisa el nombre, el email, la descripción (mínimo 10 caracteres) y la aceptación de privacidad.'},400);
 if (!env.RESEND_API_KEY || !env.TO_EMAIL || !env.FROM_EMAIL) return json({error:'El servicio de correo no está configurado. Prueba por otro medio de contacto.'},500);
 try {
  const resend = new Resend(env.RESEND_API_KEY);
  const rows = [['Nombre',name],['Email',email],['Teléfono',phone || 'No indicado'],['Servicio',service || 'Consulta general']].map(([label,value])=>`<tr><td style="padding:12px;border-bottom:1px solid #334155;color:#94a3b8">${label}</td><td style="padding:12px;border-bottom:1px solid #334155">${escapeHtml(value)}</td></tr>`).join('');
  const {error}=await resend.emails.send({from:env.FROM_EMAIL,to:env.TO_EMAIL,replyTo:email,subject:`Nueva consulta web · ${service || 'SeviElectro'}`.replace(/[\r\n]/g,' '),html:`<!doctype html><html lang="es"><body style="margin:0;padding:32px;background:#080d18;color:#f1f5f9;font-family:Arial,sans-serif"><div style="max-width:600px;margin:auto;border:1px solid #334155;border-radius:14px;padding:32px;background:#0f172a"><p style="color:#fbbf24;letter-spacing:2px">SEVIELECTRO / CONTACTO</p><h1 style="font-size:26px">Una nueva idea por conectar.</h1><table style="width:100%;border-collapse:collapse">${rows}</table><h2 style="font-size:16px;margin-top:28px">Descripción</h2><p style="line-height:1.8;white-space:pre-wrap">${escapeHtml(message)}</p></div></body></html>`,text:`Nueva consulta SeviElectro\nNombre: ${name}\nEmail: ${email}\nTeléfono: ${phone || 'No indicado'}\nServicio: ${service || 'Consulta general'}\n\n${message}`});
  if(error) return json({error:'No hemos podido enviar el mensaje. Inténtalo más tarde.'},500);
  return json({success:true});
 } catch { return json({error:'El servicio de correo no está disponible. Inténtalo más tarde.'},500); }
}
export function onRequest(context) { if(context.request.method==='POST') return onRequestPost(context); return new Response(JSON.stringify({error:'Método no permitido.'}),{status:405,headers:{'Content-Type':'application/json; charset=utf-8',Allow:'POST'}}); }

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
export default function ContactForm() {
 const [status,setStatus]=useState('idle'); const [error,setError]=useState('');
 const [ready,setReady]=useState(false); const successRef=useRef(null);
 useEffect(()=>setReady(true),[]);
 useEffect(()=>{if(status==='success') successRef.current?.focus();},[status]);
 async function submit(event) {
  event.preventDefault(); if(status==='loading') return;
  const form=event.currentTarget; const values=Object.fromEntries(new FormData(form)); setStatus('loading'); setError('');
  try {
   const response=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(values),signal:AbortSignal.timeout(20000)});
   const data=await response.json().catch(()=>null);
   if(!response.ok || data?.success!==true) throw new Error(data?.error || 'No hemos podido enviar el mensaje. Inténtalo de nuevo o contacta por teléfono.');
   setStatus('success');
  }
  catch(e) { setError(e.name==='TimeoutError'?'La conexión ha tardado demasiado. Inténtalo de nuevo.':e instanceof TypeError?'Comprueba tu conexión e inténtalo de nuevo.':e.message || 'No hemos podido enviar el mensaje. Inténtalo de nuevo.'); setStatus('error'); }
 }
 if(status==='success') return <div className="success-panel" ref={successRef} tabIndex={-1} role="status" aria-live="polite"><CheckCircle2 size={42}/><h3>¡Mensaje enviado!</h3><p>Gracias por contar con SeviElectro. Revisaremos tu consulta para ponernos en contacto contigo.</p><button className="button secondary" onClick={()=>setStatus('idle')}>Enviar otro mensaje <ArrowUpRight size={18}/></button></div>;
 return <form onSubmit={submit} className="contact-form" aria-busy={status==='loading'}>
  <div className="form-heading"><h3>Todo empieza con una conversación.</h3><p>Cuéntanos qué necesitas. Los campos con * son obligatorios.</p></div>
  <fieldset disabled={!ready || status==='loading'}><div className="form-row"><label>Nombre completo *<input className="bg-slate-950/60 border-slate-800 focus:border-blue-500" name="name" autoComplete="name" required maxLength={100} placeholder="¿Cómo te llamas?" /></label><label>Email *<input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="tu@email.com" /></label></div>
  <div className="form-row"><label>Teléfono<input name="phone" type="tel" autoComplete="tel" maxLength={30} placeholder="Tu número de contacto" /></label><label>Tipo de servicio<select name="service" defaultValue=""><option value="" disabled>Selecciona una opción</option>{['Cableado estructurado','Cámaras de seguridad','Alarmas residenciales y contra incendios','Instalaciones eléctricas','Otra consulta'].map(s=><option key={s}>{s}</option>)}</select></label></div>
  <label>Descripción del proyecto *<textarea name="message" required minLength={10} maxLength={5000} rows={4} placeholder="Háblanos de tu espacio y de lo que tienes en mente…" /></label>
  <div className="honeypot" aria-hidden="true"><label>Dejar vacío<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
  <label className="consent"><input type="checkbox" name="consent" required value="yes"/><span>He leído la <a href="/privacidad/">política de privacidad</a> y acepto el tratamiento de mis datos para responder a mi consulta. *</span></label>
  {status==='error' && <div className="form-error" role="alert"><AlertCircle size={18}/>{error}</div>}
  <button className="button primary submit" disabled={!ready || status==='loading'} type="submit">{!ready?'Preparando formulario…':status==='loading'?<><Loader2 className="spin" size={18}/>Enviando…</>:<>Enviar mi consulta <ArrowUpRight size={19}/></>}</button></fieldset>
  <p className="form-note">Tus ideas, en buenas manos. Tus datos, también.</p>
 </form>;
}

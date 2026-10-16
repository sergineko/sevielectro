import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Loader2, CheckCircle2, AlertCircle, Paperclip, FileText, X } from 'lucide-react';
import { ACCEPT_FILES, checkFiles } from '../lib/attachments';
import { createTurnstile } from '../lib/turnstile';
import { PRIVACY_VERSION } from '../lib/privacy';

const fileSize = bytes => bytes < 1024 * 1024 ? `${Math.ceil(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
function encodeFile(file) {
  return new Promise((resolve,reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ name:file.name, content:reader.result.split(',')[1] });
    reader.onerror = () => reject(new Error('No se ha podido leer un archivo. Selecciónalo de nuevo.'));
    reader.readAsDataURL(file);
  });
}

export default function ContactForm({ siteKey = '' }) {
  const [status,setStatus] = useState('idle'), [error,setError] = useState('');
  const [phase,setPhase] = useState(''), [files,setFiles] = useState([]), [fileError,setFileError] = useState('');
  const [ready,setReady] = useState(false);
  const successRef = useRef(null), challengeRef = useRef(null), controller = useRef(null), pendingController = useRef(null);
  const locked = useRef(false), alive = useRef(false), fileInput = useRef(null);
  useEffect(() => {
    alive.current = true; setReady(true);
    return () => { alive.current = false; controller.current?.destroy(); };
  },[]);
  useEffect(() => { if (status === 'success') successRef.current?.focus(); },[status]);

  function prepareSecurity() {
    if (!siteKey) return Promise.reject(new Error('El formulario se está configurando. Contacta por teléfono o email.'));
    if (controller.current) return Promise.resolve(controller.current);
    if (!pendingController.current) pendingController.current = createTurnstile(challengeRef.current,siteKey)
      .then(widget => { if (!alive.current) { widget.destroy(); throw new Error('Formulario cerrado.'); } controller.current = widget; return widget; })
      .finally(() => { pendingController.current = null; });
    return pendingController.current;
  }
  function selectFiles(event) {
    const selected = [...files,...event.target.files];
    event.target.value = '';
    try { checkFiles(selected); setFiles(selected); setFileError(''); }
    catch (error) { setFileError(error.message); }
  }
  async function submit(event) {
    event.preventDefault();
    if (locked.current) return;
    const form = event.currentTarget;
    try { checkFiles(files); } catch (error) { setFileError(error.message); return; }
    locked.current = true; setStatus('loading'); setError(''); setFileError(''); setPhase('Comprobando seguridad…');
    const values = Object.fromEntries(new FormData(form));
    values.privacyVersion = PRIVACY_VERSION;
    try {
      const widget = await prepareSecurity();
      values.turnstileToken = await widget.execute();
      // Encode only after validation; no background uploads or extra requests.
      setPhase('Enviando consulta…');
      values.attachments = [];
      for (const file of files) values.attachments.push(await encodeFile(file));
      const response = await fetch('/api/contact',{
        method:'POST', headers:{ 'Content-Type':'application/json' }, cache:'no-store',
        body:JSON.stringify(values), signal:AbortSignal.timeout(files.length ? 180000 : 30000),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || data?.success !== true) throw new Error(data?.error || 'No hemos podido enviar el mensaje. Inténtalo de nuevo o contacta por teléfono.');
      controller.current?.destroy(); controller.current = null;
      setFiles([]); setStatus('success');
    } catch (error) {
      if (alive.current) {
        setError(error.name === 'TimeoutError' ? 'La conexión ha tardado demasiado. Inténtalo de nuevo.' : error instanceof TypeError ? 'Comprueba tu conexión e inténtalo de nuevo.' : error.message || 'No hemos podido enviar el mensaje. Inténtalo de nuevo.');
        setStatus('error');
      }
    } finally { locked.current = false; }
  }
  if (status === 'success') return <div className="success-panel" ref={successRef} tabIndex={-1} role="status" aria-live="polite"><CheckCircle2 size={42}/><h3>¡Mensaje enviado!</h3><p>Gracias por contar con SeviElectro. Revisaremos tu consulta para ponernos en contacto contigo.</p><button className="button secondary" onClick={() => setStatus('idle')}>Enviar otro mensaje <ArrowUpRight size={18}/></button></div>;
  return <form onSubmit={submit} onFocusCapture={() => { prepareSecurity().catch(() => {}); }} className="contact-form" aria-busy={status === 'loading'}>
    <div className="form-heading"><h3>Todo empieza con una conversación.</h3><p>Cuéntanos qué necesitas. Los campos con * son obligatorios.</p></div>
    <fieldset disabled={!ready || status === 'loading'}>
      <div className="form-row"><label>Nombre completo *<input name="name" autoComplete="name" required maxLength={100} placeholder="¿Cómo te llamas?" /></label><label>Email *<input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="tu@email.com" /></label></div>
      <div className="form-row"><label>Teléfono<input name="phone" type="tel" autoComplete="tel" maxLength={30} placeholder="Tu número de contacto" /></label><label>Tipo de servicio<select name="service" defaultValue=""><option value="" disabled>Selecciona una opción</option>{['Cableado estructurado','Cámaras de seguridad','Alarmas residenciales y contra incendios','Instalaciones eléctricas','Otra consulta'].map(service => <option key={service}>{service}</option>)}</select></label></div>
      <label>Descripción del proyecto *<textarea name="message" required minLength={10} maxLength={5000} rows={3} placeholder="Háblanos de tu espacio y de lo que tienes en mente…" /></label>
      <div className="attachment-area">
        <input ref={fileInput} id="contact-files" className="attachment-input" type="file" multiple accept={ACCEPT_FILES} aria-label="Seleccionar archivos adjuntos" aria-describedby="attachment-help" onChange={selectFiles}/>
        <button type="button" className="attachment-add" aria-describedby="attachment-help" onClick={() => fileInput.current?.click()} disabled={files.length >= 3}><Paperclip size={18}/><span>Adjuntar archivos</span><small>{files.length ? `${files.length} / 3` : 'Opcional · hasta 3'}</small></button>
        <p id="attachment-help">PDF, Word, JPG, PNG o WebP · 5 MB por archivo · 10 MB en total.</p>
        {files.length > 0 && <ul className="attachment-list" aria-label="Archivos seleccionados">{files.map((file,index) => <li key={`${file.name}-${index}`}><FileText size={17}/><span><strong>{file.name}</strong><small>{fileSize(file.size)}</small></span><button type="button" aria-label={`Quitar ${file.name}`} onClick={() => { setFiles(files.filter((_,i) => i !== index)); setFileError(''); }}><X size={17}/></button></li>)}</ul>}
        {fileError && <p className="attachment-error" role="alert">{fileError}</p>}
      </div>
      <div className="honeypot" aria-hidden="true"><label>Dejar vacío<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <label className="consent"><input type="checkbox" name="consent" required value="yes"/><span>He leído la <a href="/privacidad/">política de privacidad</a> y acepto el tratamiento de mis datos para responder a mi consulta. *</span></label>
      {status === 'error' && <div className="form-error" role="alert"><AlertCircle size={18} aria-hidden="true"/>{error}</div>}
      <button className="button primary submit" disabled={!ready || status === 'loading'} type="submit">{!ready ? 'Preparando formulario…' : status === 'loading' ? <><Loader2 className="spin" size={18}/><span role="status" aria-live="polite">{phase}</span></> : <>Enviar mi consulta <ArrowUpRight size={19}/></>}</button>
    </fieldset>
    <div ref={challengeRef} className="contact-challenge"/>
    <p className="form-note">Protegido con Cloudflare Turnstile. <a href="https://www.cloudflare.com/turnstile-privacy-policy/" target="_blank" rel="noopener noreferrer">Privacidad de Cloudflare</a>.</p>
  </form>;
}

let scriptPromise;
export function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve,reject) => {
    const script = document.createElement('script');
    const timer = setTimeout(fail,15000);
    function fail() {
      clearTimeout(timer); script.remove(); scriptPromise = undefined;
      reject(new Error('No se ha podido cargar la comprobación de seguridad. Comprueba tu conexión o contacta por teléfono.'));
    }
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.onload = () => {
      clearTimeout(timer);
      if (window.turnstile) resolve(window.turnstile); else fail();
    };
    script.onerror = fail;
    document.head.append(script);
  });
  return scriptPromise;
}

export async function createTurnstile(container,siteKey) {
  const api = await loadTurnstile();
  if (!container.isConnected) throw new Error('Vuelve a abrir el formulario.');
  let pending, timer;
  const settle = (error,token) => {
    clearTimeout(timer);
    const current = pending; pending = undefined;
    if (current) error ? current.reject(error) : current.resolve(token);
  };
  const widget = api.render(container,{
    sitekey:siteKey, action:'contact', language:'es', theme:'dark', size:'flexible',
    execution:'execute', appearance:'interaction-only', retry:'never',
    'refresh-expired':'manual', 'refresh-timeout':'manual', 'response-field':false,
    callback:token => settle(null,token),
    'error-callback':() => { settle(new Error('La comprobación de seguridad ha fallado. Inténtalo de nuevo.')); return true; },
    'expired-callback':() => settle(new Error('La comprobación ha caducado. Inténtalo de nuevo.')),
    'timeout-callback':() => settle(new Error('La comprobación ha tardado demasiado. Inténtalo de nuevo.')),
  });
  return {
    execute() {
      api.reset(widget);
      return new Promise((resolve,reject) => {
        pending = { resolve,reject };
        timer = setTimeout(() => settle(new Error('La comprobación ha caducado. Inténtalo de nuevo.')),120000);
        try { api.execute(widget); } catch { settle(new Error('Vuelve a intentar la comprobación de seguridad.')); }
      });
    },
    destroy() { settle(new Error('Formulario cerrado.')); api.remove(widget); },
  };
}

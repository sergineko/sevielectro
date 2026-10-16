# SeviElectro · Migración a Astro

Rediseño de https://sevielectro.com/ conservando su identidad y contenido. Astro 7 estático, React 18 para el formulario, Tailwind 4 y Cloudflare Pages Functions con Resend.

Desplegado en [sevielectro.pages.dev](https://sevielectro.pages.dev/). La conexión del dominio definitivo y la configuración de envío con Resend siguen pendientes. Este despliegue no ha cambiado los DNS del dominio original. Configuración y verificaciones en [migration/DEPLOYMENT.md](migration/DEPLOYMENT.md).

## Qué se conserva

- Logotipo original sin redibujar; azul corporativo, rojo y lema original.
- Cuatro servicios reales: cableado estructurado, cámaras, alarmas e instalaciones.
- Los 14 logotipos de clientes, tres miembros del equipo y diecisiete fotografías de la galería.
- Fotografías de los sectores y retrato del gerente; mensaje del gerente.
- Quito (Ecuador), teléfono +593 98 412 0086, los dos emails y enlaces de redes y WhatsApp.
- Anclas originales `#servicios`, `#clientes`, `#equipos`, `#galeria`, `#contacto` y `#content`.

La galería añade filtros y ampliación accesible con teclado (Escape y flechas). El menú móvil funciona sin React. Las fuentes, imágenes y logotipos se sirven localmente. No se han añadido testimonios, clientes, certificaciones ni promesas de urgencias.

La portada utiliza la fotografía original a todo el ancho y el titular superpuesto, manteniendo la composición de la versión anterior con un acabado moderno. Sus estilos están en `src/styles/hero.css`; los ajustes compartidos de tarjetas, navegación y secciones, en `src/styles/modern.css`.

## Archivos de la migración

`migration/inventory.json` contiene la procedencia y rutas de los 44 recursos importados. `migration/original-home.html` y `migration/original-styles.css` documentan el origen. Los originales se guardan sin modificación en `public/media/original/`; las copias WebP de entrega están en `public/media/optimized/`. `src/data/content.js` y `src/data/media.json` centralizan el contenido.

`public/_redirects` conserva `/index.php` y las antiguas URLs de los recursos importados. El contenido visible de la web original es una sola página con anclas. Las rutas internas de administración, APIs y feeds de WordPress no forman parte de la nueva web.

## Desarrollo

Node 24 recomendado (`.node-version`); mínimo 22.22.0. `npm install`, `npm run dev`. También se incluye `pnpm-lock.yaml` para instalaciones reproducibles con pnpm. `npm run build` genera `dist` y `npm test` comprueba el backend, la conservación de contenido y la calidad de las salidas después de compilar. Los pasos `predev` y `prebuild` preparan las variantes de imagen automáticamente.

El preview estático no ejecuta la Function de correo. Para probarla: `npx wrangler pages dev dist` y secretos en `.dev.vars` (ignorado por Git).

## Cloudflare Pages y Resend

Comando de build: `npm run build`. Salida: `dist`. La carpeta `functions/` debe permanecer en la raíz del repositorio. El despliegue por Git o `npx wrangler pages deploy dist` desde la raíz incorpora las Functions; no uses una subida manual de archivos estáticos.

Variables del servidor: `RESEND_API_KEY`, `TO_EMAIL`, `FROM_EMAIL`, `TURNSTILE_SECRET_KEY`, `TURNSTILE_ALLOWED_HOSTNAMES`. Guarda las dos claves como secretos cifrados. `PUBLIC_TURNSTILE_SITE_KEY` es una variable pública obligatoria de build para el formulario. El remitente debe pertenecer a un dominio verificado en Resend. Variables públicas opcionales de build: `PUBLIC_SITE_URL`, `PUBLIC_PHONE`, `PUBLIC_EMAIL`; por defecto se usan los datos originales. Nunca uses prefijo PUBLIC_ para secretos.

No se ha probado el envío real: necesita las credenciales y comprobar la recepción. El formulario muestra un error si falta configuración.

Antes de publicar, completa los datos fiscales y los borradores legales/privacidad, confirma que el contacto y el equipo siguen vigentes y comprueba un envío real. El formulario exige Turnstile con comprobación en servidor y muestra su interacción solo cuando Cloudflare la necesita. El script se carga al interactuar con el formulario y el desafío se ejecuta al enviar. Incluye honeypot, control de origen, límite de cuerpo, guardia de ráfagas por IP y claves idempotentes de Resend. La guardia es por instancia de Function, no un límite distribuido; para tráfico abusivo elevado configura una regla de tasa en el WAF del dominio cuando se conecte.

## Equipo y navegación actualizados

El equipo se edita en `src/data/content.js`. Verónica Sevilla ocupa el cargo de Gestión Administrativa. Su retrato se copia desde `img/Veronica Sevilla.jpeg` a `public/media/team/veronica-sevilla.jpeg`. René Mauricio Sevilla muestra iniciales hasta disponer de su foto; se añade la ruta en `photo`, sus dimensiones en `width`/`height` y el encuadre en `position`.

La navegación sigue el orden visual de las secciones. El desplazamiento mantiene la URL sin fragmentos, conserva los enlaces originales como alternativa sin JavaScript y admite enlaces antiguos con ancla, limpiando la dirección después de situarse en la sección. Los logotipos de cabecera y pie vuelven suavemente al inicio sin recargar la portada; desde otras páginas enlazan a la portada con normalidad.

La galería presenta cinco imágenes seleccionadas y permite recorrer diecisiete fotografías en el visor: nueve originales y ocho fotografías de Facebook sin rótulos añadidos. Los filtros limitan la colección del visor a la categoría elegida, manteniendo hasta cinco imágenes destacadas. La procedencia queda en `migration/social-sources.json`; originales y miniaturas se sirven localmente desde `public/media/social/`. Los recursos adicionales se registran en `src/data/social-media.json` para conservarlos al regenerar las optimizaciones.

El visor ocupa la pantalla, muestra la fotografía sin recortarla y añade una tira de miniaturas, contador, progreso y una vista de mosaico para elegir directamente cualquier trabajo. Admite flechas, Inicio/Fin, Escape y gestos horizontales en pantallas táctiles; respeta la preferencia de movimiento reducido. La carga incluye indicador y reintento si falla la fotografía.

Las catorce tarjetas de clientes son enlaces accesibles a sus canales oficiales. Farmacias Mi Doctorcito enlaza a su Instagram por indicación del titular; Banco Promerica enlaza a Produbanco, su presencia actual en Ecuador. El pie de todas las páginas incluye el crédito de creación con enlace a https://sergiotech.es/.

## Rendimiento, accesibilidad y SEO

La revisión y los informes Lighthouse están en [migration/audits/README.md](migration/audits/README.md). Resultado local: 100 en rendimiento, accesibilidad, buenas prácticas y SEO tanto en móvil como en escritorio, confirmado en tres ejecuciones móviles consecutivas. La transferencia móvil medida se reduce un 53 % respecto al inicio de la auditoría.

`scripts/prepare-media.mjs` genera variantes WebP, AVIF para portada y logotipo, sus tamaños y las imágenes sociales a partir del material original. `src/components/ResponsiveImage.astro` añade tamaños adaptados a cada sección y alternativa WebP para los recursos AVIF. Los estilos se incluyen en el HTML para evitar peticiones que retrasen la primera pintura. La caché inmutable se limita a nombres con huella; las cabeceras y rutas de Cloudflare se definen en `public/_headers` y `public/_routes.json`. El formulario se activa al acercarse al contacto.

La integración heredada `@astrojs/tailwind` se ha sustituido por el plugin oficial `@tailwindcss/vite` al actualizar a Tailwind 4 y Astro 7. La configuración CSS y el diseño propio se conservan. La auditoría final de dependencias y las pruebas automatizadas están documentadas junto a las mediciones. La validación pública de caché, HTTPS, PageSpeed y entrega real del correo se realiza tras desplegar en Cloudflare.

## Google Search Console y descubrimiento

La [revisión de rastreo e indexación](migration/audits/SEARCH-CONSOLE.md) documenta el acceso de buscadores. Todas las páginas públicas permiten indexación y seguimiento de enlaces, incluidas las legales por petición del usuario. `robots.txt` permite cualquier crawler; el sitemap anuncia cuatro páginas canónicas y 18 imágenes. La página 404 conserva su estado de error y queda fuera del índice.

`npm run audit:indexability` comprueba 43 respuestas HTTP sobre el preview local. Después del despliegue puede repetirse con `npm run audit:indexability -- https://sevielectro.com/`. El informe diferencia la comprobación local del acceso público y no presupone que las políticas de Cloudflare estén configuradas.

La variable pública opcional `PUBLIC_GOOGLE_SITE_VERIFICATION` incorpora el token HTML real de Search Console para una propiedad de prefijo de URL. Las propiedades de dominio se verifican con el registro DNS facilitado por Google. No se ha verificado ni modificado una propiedad de Search Console desde este proyecto.

## Adjuntos, caché y peticiones

Resend admite adjuntos mediante `attachments` con contenido Base64. El formulario permite hasta 3 archivos opcionales: PDF, DOC, DOCX, JPG/JPEG, PNG y WebP; máximo 5 MiB por archivo y 10 MiB en total. La interfaz anuncia esos límites como MB. Se envían dentro de una única solicitud JSON a `/api/contact`, sin subidas previas, almacenamiento público ni descargas desde URLs aportadas por visitantes. El servidor vuelve a comprobar límites, extensión y firma binaria; en DOCX inspecciona el directorio ZIP sin descomprimir y rechaza `vbaProject.bin`. Esta comprobación de formato no equivale a un antivirus ni analiza macros de DOC antiguos. Los adjuntos quedan sujetos a la retención del correo y de Resend.

La Function solo se invoca en `/api/contact`; el resto del sitio se sirve desde el CDN de Pages. Los recursos con huella (`/_astro`, `/media/responsive`, `/media/static`) tienen un año de caché inmutable. Los catorce logotipos se reúnen en un SVG compartido, conservando las marcas y enlaces. Fuente, iconos e imagen social también usan huellas. El HTML se revalida al visitarlo para que los nuevos despliegues se vean de inmediato; Pages mantiene su distribución y caché en el CDN. Las imágenes, la fuente y los scripts conservan un año de caché en el navegador. El API nunca se almacena en caché. `TO_EMAIL` admite una lista separada por comas y se configura con `sevielectro81@gmail.com,sevielectro_81@hotmail.com`. Se realiza una única llamada a Resend con ambos destinatarios; `Reply-To` contiene el email validado del visitante. El remitente sigue siendo una dirección verificada de SeviElectro. No se añaden Workers intermediarios ni reglas Cache Everything.

Turnstile está creado en la cuenta de SeviElectro en modo gestionado, con pre-clearance desactivado. En producción están configuradas su clave pública, clave secreta cifrada y lista cerrada de hostnames: `sevielectro.pages.dev,sevielectro.com,www.sevielectro.com`. Si se crean despliegues de vista previa que deban admitir envíos, configura sus variables y dominios de forma explícita. No publiques las claves de prueba de Cloudflare.

Fuentes: [Adjuntos de Resend](https://resend.com/docs/dashboard/emails/attachments), [formatos no admitidos](https://resend.com/docs/knowledge-base/what-attachment-types-are-not-supported), [configuración de Turnstile](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/widget-configurations/), [Siteverify](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/) y [caché de Pages](https://developers.cloudflare.com/pages/configuration/serving-pages/).
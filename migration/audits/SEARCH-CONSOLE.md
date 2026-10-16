# SEO, rastreo internacional y puesta en servicio

Revisión: 16 de octubre de 2026. Sitio nuevo: https://sevielectro.pages.dev/. Dominio definitivo: https://sevielectro.com/.

## Resultado técnico

- Cuatro páginas públicas estáticas, cada una con un título, descripción y canonical propios, un único H1 y el idioma `es-EC`. No dependen de ejecutar React para entregar el contenido principal.
- `robots.txt` permite el acceso general con `User-agent: *` y `Allow: /`. No hay `Disallow`, retrasos de rastreo, `nosnippet`, `noimageindex` ni cabeceras restrictivas de indexación en las páginas públicas. La página inexistente responde 404 y queda fuera del sitemap.
- Sitemap XML con cuatro páginas y 18 imágenes, incluidos los trabajos accesibles desde el visor. Canónicas, sitemap, OpenGraph, imagen social y referencias de Schema.org utilizan el dominio definitivo configurado mediante `PUBLIC_SITE_URL`.
- Datos estructurados enlazados `Electrician`, `WebSite` y `WebPage`, con dirección postal completa, teléfono con prefijo internacional, redes oficiales e idioma. El catálogo de cuatro servicios procede de los mismos datos que las tarjetas visibles. La dirección del contacto y la de los documentos legales proceden de una única fuente. No se han inventado reseñas, valoraciones, horarios, precios, coordenadas ni cobertura mundial.
- Metadatos OpenGraph y Twitter, tipo y dimensiones de imagen social y texto alternativo. Fuentes e imágenes propias y optimizadas; recursos con huella y caché larga. No se añaden peticiones de terceros para generar SEO.
- El sitio tiene una sola versión en español. No se han anunciado traducciones inexistentes mediante `hreflang`, ni se redirige a los visitantes por idioma o país. Su localización comercial en Quito es compatible con el descubrimiento desde otros países, sin afirmar que la empresa preste servicios en todo el mundo.
- Verificación HTML opcional de Search Console con `PUBLIC_GOOGLE_SITE_VERIFICATION` y Bing Webmaster Tools con `PUBLIC_BING_SITE_VERIFICATION` (`msvalidate.01`). Solo se emiten si se facilita un token real. No se ha accedido ni verificado una propiedad de esas plataformas.

Compilación correcta y 24 pruebas automatizadas aprobadas. La auditoría HTTP comprueba 11 identificadores de rastreadores: Googlebot, Googlebot-Image, Bingbot, DuckDuckBot, Applebot, YandexBot, Baiduspider, Slurp, MojeekBot, OAI-SearchBot y PerplexityBot. Comprueba respuesta, metadatos, grafos JSON-LD, recursos y coherencia de contenido. Cambiar un User-Agent no reproduce las IP verificadas de los buscadores ni una prueba desde cada país; el acceso general no garantiza indexación ni posiciones en resultados.

Sobre la compilación publicada `61412f0` en Pages, la auditoría realiza 62 solicitudes sin errores técnicos y registra una advertencia por el dominio pendiente. Lighthouse móvil público: **100 en rendimiento, accesibilidad, buenas prácticas y SEO**, con LCP 1,4 s, TBT 0 ms y CLS 0. Informes completos en `seo-international-mobile.report.html/json`. Es una medición de laboratorio, no una garantía de puntuaciones constantes, datos CrUX o ranking.

## Estado real del dominio y del formulario

La comprobación pública del 16 de octubre confirma que `sevielectro.com` todavía sirve la web anterior de WordPress. `www.sevielectro.com` redirige a ese dominio. El sitio nuevo funciona en Pages, con canónica al dominio definitivo para preparar la sustitución y evitar presentar ambos como versiones oficiales independientes.

Mientras el dominio definitivo no sirva la compilación de Astro, no debe afirmarse que el nuevo SEO ya esté aplicado en `sevielectro.com`. Sus nuevas imágenes sociales y otros recursos absolutos también deben verificarse de nuevo allí al completar la migración. La auditoría pública registra esta transición como una advertencia separada del resultado técnico del sitio de Pages.

En la configuración de producción de la cuenta de Cloudflare de SeviElectro siguen ausentes `RESEND_API_KEY` y `FROM_EMAIL`. El formulario conserva la protección antispam, pero la entrega real del correo requiere terminar esa configuración. No se ha enviado correo de prueba durante esta revisión. Los enlaces de teléfono, correo y WhatsApp permiten contacto directo.

## Repetir y completar el lanzamiento

```sh
npm run build
npm test
npm run audit:indexability -- https://sevielectro.pages.dev/
```

El informe público se guarda en `indexability-public.json`; el local, en `indexability-local.json`. Al probar Pages se revisa también la portada del dominio canónico para detectar si todavía muestra la versión anterior. Una advertencia de transición de dominio no se oculta ni se presenta como una publicación definitiva en ese dominio.

Cuando se disponga de la gestión DNS:

1. Conectar el dominio personalizado al mismo proyecto Pages, preservando los registros del correo y de otros servicios; decidir una única variante HTTPS canónica y redirigir las demás.
2. Comprobar en el dominio definitivo los estados HTTP, la ausencia de desafíos o bloqueos a rastreadores legítimos, las redirecciones de WordPress, el sitemap y todos los recursos anunciados. No crear excepciones de seguridad basadas únicamente en un User-Agent suplantable.
3. Verificar la propiedad del dominio en Google Search Console y Bing Webmaster Tools con el método real del titular. Enviar `/sitemap.xml` e inspeccionar la URL publicada. Estos pasos requieren la propiedad verificada; no se han simulado ni dado por hechos.
4. Repetir `npm run audit:indexability -- https://sevielectro.com/`, las pruebas de resultados enriquecidos y la medición de rendimiento allí. Observar después los informes de indexación y los datos de usuarios reales.
5. Finalizar Resend con un remitente de dominio verificado y probar un envío real autorizado con recepción en ambos buzones y respuesta al visitante.

No se han cambiado DNS, titularidad del dominio, reglas de seguridad ni credenciales durante esta revisión SEO.

## Referencias primarias

- [Google: datos estructurados de empresas locales](https://developers.google.com/search/docs/appearance/structured-data/local-business).
- [Schema.org: WebSite](https://schema.org/WebSite) y [catálogos de servicios](https://schema.org/hasOfferCatalog).
- [Google: URLs canónicas](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [versiones lingüísticas](https://developers.google.com/search/docs/specialty/international/localized-versions), [directivas de robots](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag) e [imágenes en sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps).
- [Google Search Console: verificación de propiedad](https://support.google.com/webmasters/answer/9008080).
- [Bing: inicio y envío del sitemap](https://www4.bing.com/webmasters/help/getting-started-checklist-66a806de) y [verificación mediante msvalidate.01](https://learn.microsoft.com/en-us/bingwebmaster/verifying-wordpress) (el mismo metadato también se utiliza en la web estática).

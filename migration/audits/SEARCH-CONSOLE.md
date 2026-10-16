# Rastreo e indexación · 16 de octubre de 2026

El proyecto Astro permite el rastreo y la indexación de todas sus páginas públicas. La comprobación se ha realizado sobre la compilación local; no se ha modificado la web de producción ni ninguna cuenta de Google o Cloudflare.

## Resultado

- `robots.txt` devuelve HTTP 200 y una política común para todos los rastreadores: `User-agent: *` y `Allow: /`. No se añaden `Disallow`, demoras, exclusiones para bots de búsqueda o descubrimiento ni políticas que impidan reutilizar las vistas previas.
- Las cuatro páginas públicas (`/`, `/aviso-legal/`, `/privacidad/`, `/cookies/`) devuelven HTTP 200, tienen un canonical único y permiten `index, follow`. Se han retirado los `noindex` que tenían los documentos legales.
- Las directivas permiten vistas previas grandes de imágenes y no imponen un máximo de caracteres del fragmento ni duración de vista previa de vídeo. No hay `nosnippet`, `noimageindex` ni cabeceras `X-Robots-Tag` restrictivas en la configuración del proyecto.
- El sitemap contiene las cuatro direcciones canónicas y 18 fotografías: portada y los 17 trabajos de la galería. Esto permite anunciar a Google también las fotografías cuyo visor necesita interacción.
- Los enlaces internos a las páginas legales usan las mismas direcciones que sus canonical y el sitemap. Se han añadido redirecciones 301 de los alias habituales de WordPress `/wp-sitemap.xml` y `/sitemap_index.xml` al sitemap nuevo.
- El contenido principal, enlaces, textos alternativos e imágenes están presentes en el HTML estático. La navegación con URL limpia no elimina los enlaces HTML que siguen los rastreadores.
- La página de error conserva HTTP 404 y `noindex, follow`; no forma parte del sitemap. No se convierte una URL inexistente en una página pública indexable.
- `PUBLIC_GOOGLE_SITE_VERIFICATION` permite incorporar el token real de verificación HTML de una propiedad de prefijo de URL, si se facilita. Sin token no se genera una etiqueta de verificación vacía o inventada. No se encontró una etiqueta de verificación que preservar en el HTML original archivado.

Se han aprobado 16 pruebas automatizadas. La auditoría HTTP realiza 42 peticiones y comprueba cuatro páginas, 18 imágenes, scripts y fuente tipográfica. Con los agentes de usuario Googlebot, Googlebot-Image, Bingbot, OAI-SearchBot y PerplexityBot se obtiene la misma portada y acceso HTTP 200 a robots y sitemap. No se han observado bloqueos en la versión local.

Los informes `search-console-mobile.report.html/json` y `search-console-desktop.report.html/json` mantienen las cuatro categorías de Lighthouse en 100 tras los cambios de indexación.

## Repetir la auditoría

Con la compilación servida por `npm run preview`:

```sh
npm run audit:indexability
```

Después de desplegar el proyecto en el dominio definitivo:

```sh
npm run audit:indexability -- https://sevielectro.com/
```

El resultado queda en `indexability-local.json` o `indexability-public.json`, dentro de esta carpeta. La prueba pública está preparada, pero no se ha ejecutado sobre este nuevo diseño publicado porque todavía no se ha desplegado. La consulta del robots del dominio actual no pudo verificarse con la herramienta de navegación; no se infiere que el dominio esté bloqueado por ese fallo de consulta.

Cambiar la cabecera User-Agent comprueba que la aplicación no discrimina ese identificador; no reproduce las direcciones IP ni las verificaciones de identidad de los bots reales. La prueba no sustituye a la inspección de URL publicada de Search Console.

## Cloudflare y Search Console al publicar

1. Comprobar en el dominio de producción que no hay autenticación de Cloudflare Access, desafíos o reglas WAF que impidan el acceso a los rastreadores legítimos. Revisar las políticas de búsqueda y agentes de descubrimiento y el robots gestionado: Cloudflare puede añadir reglas que no están en este repositorio. Las excepciones deben dirigirse a rastreadores verificados; no conviene basarlas únicamente en un User-Agent que cualquiera puede imitar.
2. Inspeccionar las respuestas finales de `/`, `/robots.txt`, `/sitemap.xml` y las páginas legales. Una etiqueta `index` no anula un `noindex` añadido por el alojamiento: Google aplica la directiva más restrictiva.
3. Comprobar la propiedad existente de `sevielectro.com` en Search Console. Para una propiedad de dominio se utiliza el registro DNS indicado por Google; para una propiedad de prefijo puede usarse el token HTML opcional. La verificación de propiedad no se ha realizado desde este proyecto.
4. Enviar o comprobar `https://sevielectro.com/sitemap.xml` en la propiedad correspondiente y utilizar «Inspección de URLs → Probar URL publicada» para confirmar el acceso real de Google. Consultar posteriormente los informes de páginas e imágenes.
5. Hacer esta comprobación en el dominio de producción. Cloudflare Pages añade `X-Robots-Tag: noindex` a sus despliegues temporales de preview; esa cabecera no proviene del HTML de esta web.

Las páginas legales se han redactado para Ecuador y mantienen su indexabilidad. Falta confirmar nombre legal o razón social, RUC y domicilio del titular, además de las verificaciones operativas documentadas en [LEGAL-ECUADOR.md](../LEGAL-ECUADOR.md). No se han completado con datos inventados.

Permitir el rastreo, verificar la propiedad y enviar el sitemap no garantiza que Google u otro buscador indexe o posicione una página: la decisión final pertenece a cada buscador.

Referencias oficiales: [directivas de robots de Google](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag), [sitemap de imágenes](https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps), [verificación de propiedad](https://support.google.com/webmasters/answer/9008080), [robots gestionado de Cloudflare](https://developers.cloudflare.com/bots/additional-configurations/managed-robots-txt/), [indexación de previews de Pages](https://developers.cloudflare.com/pages/configuration/preview-deployments/#preview-indexing-by-search-engines).

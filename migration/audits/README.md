# Auditoría de calidad · 16 de octubre de 2026

Se ha medido la compilación estática local en `http://127.0.0.1:4321/` con Lighthouse 13.5.0 y Chrome, usando la simulación móvil predeterminada y el preset de escritorio. No se ha publicado ni alterado la web de producción.

| Categoría | Antes, móvil | Final, móvil | Final, escritorio |
| --- | ---: | ---: | ---: |
| Rendimiento | 95 | 100 | 100 |
| Accesibilidad | 97 | 100 | 100 |
| Buenas prácticas | 100 | 100 | 100 |
| SEO | 100 | 100 | 100 |

| Métrica | Antes, móvil | Final, móvil | Final, escritorio |
| --- | ---: | ---: | ---: |
| Primera pintura (FCP) | 1,2 s | 0,9 s | 0,3 s |
| Contenido principal (LCP) | 2,9 s | 1,7 s | 0,5 s |
| Bloqueo total (TBT) | 0 ms | 0 ms | 0 ms |
| Cambios de diseño (CLS) | 0 | 0 | 0 |
| Transferencia observada | 588 KiB | 276 KiB | 367 KiB |

La transferencia móvil se reduce un 53 %. Las tres mediciones móviles consecutivas dan 100 en las cuatro categorías, con LCP de 1,7 a 1,9 s. Se han utilizado los ajustes habituales de Lighthouse, sin modificar la limitación de red, CPU o la puntuación. Los valores pueden variar entre mediciones. Son pruebas de laboratorio; no equivalen a datos CrUX de usuarios reales ni certifican el cumplimiento completo de accesibilidad o el posicionamiento en buscadores.

## Mejoras aplicadas

- Variantes WebP de distintos tamaños para logos, fotos, equipo y galería, con `srcset` y `sizes`. Los originales permanecen intactos. Los nombres de entrega incluyen una huella del contenido para invalidar la caché al cambiar una foto.
- AVIF para la fotografía de portada y el logotipo, con selección nativa mediante `picture` y alternativa WebP. Se mantienen dimensiones, encuadre y colores de los recursos originales.
- Estilos incluidos en el HTML para eliminar las dos peticiones que bloqueaban la primera pintura. El visor conserva todos sus estilos desde la primera apertura. El coste de repetir el CSS en los documentos legales se acepta para priorizar la carga inicial de esta web de una página.
- Imagen principal con carga inmediata y prioridad alta. El resto usa carga diferida. El visor carga una copia optimizada de alta resolución al seleccionar una fotografía y ajusta sus miniaturas según el modo de visualización.
- El código React del formulario se descarga al acercarse a la sección de contacto. El formulario queda protegido contra envíos antes de activarse y muestra una alternativa sin JavaScript.
- Corrección del contraste en la sección de clientes y contador de filtros. Etiquetas naturales en los botones de la galería, controles táctiles más cómodos e inputs móviles de 16 px para evitar zoom al escribir.
- Errores del formulario comprensibles aunque el servidor devuelva HTML o la conexión falle; foco accesible en la confirmación de envío.
- Canonical, metadescripción, datos estructurados `Electrician` coherentes con la configuración, imagen social de 1200 × 630, iconos derivados del logo original, sitemap y robots generados para el dominio configurado.
- Cuatro páginas públicas indexables y una página 404 propia. Por petición del usuario se ha retirado el `noindex` de las páginas legales; solo el error 404 conserva esa directiva. Se ha comprobado que una ruta inexistente responde con HTTP 404.
- `_headers` con caché larga para recursos con huella y cabeceras de seguridad. `_routes.json` limita las Functions a `/api/*` para servir el contenido estático directamente.
- Actualización a Astro 7.4.0, su integración React 7.1.0, Tailwind 4.3.3 mediante el plugin oficial de Vite y Sharp 0.35.5. La auditoría final de dependencias no detecta vulnerabilidades conocidas. Node 24 recomendado, mínimo 22.22.0.

## Validación y archivos

- Compilación correcta y 16 pruebas automatizadas aprobadas, incluyendo backend, conservación de contenido, variantes de imagen, salidas SEO y cobertura del sitemap.
- Revisión visual en escritorio y móvil de 390 px: menú, galería, mosaico, cambio de fotos, retorno al inicio y activación diferida del formulario. Sin errores de consola observados.
- Rutas `/`, `/privacidad`, `/robots.txt` y `/sitemap.xml` responden HTTP 200. Ruta inexistente: HTTP 404.
- `before-mobile.report.html/json`, `after-mobile.report.html/json` y `after-desktop.report.html/json` contienen los informes completos.
- `summary.json` conserva las métricas numéricas; `dependencies-final.json` conserva el resultado de la auditoría de dependencias.
- `mobile-100-run-1.report.json`, `mobile-100-run-2.json` y `mobile-100-run-3.json` documentan las tres verificaciones móviles; `desktop-100.report.json` documenta la verificación de escritorio. `before-100-mobile.report.html/json` conserva el resultado anterior de 99 puntos.
- La [revisión posterior para Search Console](SEARCH-CONSOLE.md) incluye 42 comprobaciones HTTP de rastreadores, el sitemap ampliado y dos nuevos informes Lighthouse, `search-console-mobile` y `search-console-desktop`, que mantienen 100 en las cuatro categorías.
- La nueva presentación del mensaje del gerente conserva el retrato y el texto originales. Se ha revisado en móvil de 390 px y escritorio, sin desbordamiento horizontal ni errores de consola. Los informes `manager-message-mobile.report.html/json` y `manager-message-desktop.report.html/json` mantienen 100 en las cuatro categorías de Lighthouse local.
- El acabado general posterior incorpora portada con fotografía separada, tarjetas más legibles, detalles visuales comunes y seguimiento de la sección activa mediante `IntersectionObserver`. Conserva los recursos originales, la URL limpia, la galería y la carga diferida del formulario. Revisión visual en móvil de 390 px, tableta de 768 px y escritorio; 16 pruebas aprobadas. Los informes `modern-mobile.report.html/json` y `modern-desktop.report.html/json` mantienen 100 en las cuatro categorías de Lighthouse local.
- Por preferencia del titular, la portada final recupera la fotografía original a todo el ancho, el titular superpuesto en dos líneas y los accesos directos, con degradados y detalles acordes al acabado moderno. Sus estilos se concentran en `src/styles/hero.css`. Revisada en móvil y escritorio, con 16 pruebas aprobadas y 100 en las cuatro categorías de los informes `immersive-hero-mobile.report.html/json` y `immersive-hero-desktop.report.html/json`. La captura final está en `migration/portada-integrada.jpg`.

Para repetir la medición, compila con `npm run build`, ejecuta `npm run preview` y usa `npx lighthouse http://127.0.0.1:4321/ --chrome-flags="--headless"`. Añade `--preset=desktop` para escritorio. Lighthouse requiere Chrome instalado.

## Comprobaciones tras el despliegue

La caché y las cabeceras de `_headers` se aplican en Cloudflare Pages, no en el preview de Astro. Tras publicar deben comprobarse por HTTPS en el dominio final, junto con los redireccionamientos de WordPress y una nueva medición de PageSpeed Insights. Los Core Web Vitals de campo requieren tráfico y datos reales.

Antes de habilitar el formulario públicamente siguen pendientes los datos y textos legales definitivos, las credenciales de Resend y un envío real con comprobación de recepción. No se han inventado datos fiscales, horarios o certificaciones para completar el marcado SEO.

Referencias: [Lighthouse](https://developer.chrome.com/docs/lighthouse/overview), [optimización del LCP](https://web.dev/articles/optimize-lcp), [estilos en línea de Astro](https://docs.astro.build/en/reference/configuration-reference/#buildinlinestylesheets), [codificación AVIF](https://sharp.pixelplumbing.com/api-output/#avif), [cabeceras de Cloudflare Pages](https://developers.cloudflare.com/pages/configuration/headers/), [rutas de Functions](https://developers.cloudflare.com/pages/functions/routing/), [actualización de Astro](https://docs.astro.build/en/guides/upgrade-to/v7/), [Tailwind en Astro](https://docs.astro.build/en/guides/styling/#tailwind).

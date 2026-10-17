# Auditoría de calidad · 16 de octubre de 2026

Las primeras mediciones siguientes corresponden a la compilación estática local en `http://127.0.0.1:4321/`, con Lighthouse 13.5.0 y Chrome. Se conservan como historial. El sitio se publicó posteriormente en Cloudflare Pages y su resultado público actual figura en el apartado de abajo.

## Resultado público tras caché y reducción de peticiones

**Revisión SEO posterior:** la compilación publicada `61412f0` incorpora dirección completa y catálogo compartido en el JSON-LD enlazado de empresa, web y páginas. `seo-international-mobile.report.html/json` da **100/100/100/100** sobre Pages (móvil), LCP 1,4 s, TBT 0 ms y CLS 0. Se aprueban 24 pruebas y 62 comprobaciones HTTP con once identificadores de rastreadores. El [informe de indexación actualizado](SEARCH-CONSOLE.md) distingue estos resultados de la conexión del dominio definitivo y Resend, que siguen pendientes.

Mediciones sobre `https://sevielectro.pages.dev/`, con la simulación móvil habitual y el preset de escritorio, sin alterar la limitación de red o CPU de Lighthouse:

| Categoría | Antes, móvil | Publicada, móvil | Publicada, escritorio |
| --- | ---: | ---: | ---: |
| Rendimiento | 98 | 99 | 100 |
| Accesibilidad | 100 | 100 | 100 |
| Buenas prácticas | 100 | 100 | 100 |
| SEO | 100 | 100 | 100 |

La carga móvil inicial pasa de **21 solicitudes HTTP y 242.263 bytes** a **6 solicitudes y 119.181 bytes**: 71 % menos peticiones y 51 % menos transferencia. FCP 1,1 s, LCP 1,8 s, TBT 0 ms y CLS 0. Se cuentan las solicitudes HTTP, no las entradas `data:` de las imágenes incorporadas en el sprite. La galería, los clientes y el formulario descargan recursos al acercarse o interactuar: las cifras no representan recorrer toda la web ni enviar un formulario.

Informes: `cache-before-mobile.json`, `cache-after-mobile.report.html/json` y `cache-after-desktop.report.html/json`. El resultado móvil real es **99**, sin prometer 100 constante ni equivalencia con CrUX. El HTML se revalida al visitar, los recursos con huella se conservan un año como inmutables y la API nunca se cachea. `contact-public.json` documenta cabeceras, 304 y rechazo de solicitudes inválidas, sin correos reales.

La revisión legal posterior incorpora `legal-mobile.report.html/json`: política de privacidad local con **100/100/100/100**, tras corregir el tamaño táctil de los dos enlaces de correo. Las tres páginas mantienen carga estática, metadatos propios y ausencia de bloqueos de indexación. Compilación correcta y **22 pruebas** aprobadas, incluidas versión de consentimiento, adjuntos, destinatarios y `Reply-To`.

## Historial de las primeras mediciones locales

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

Actualización del 17 de octubre: las credenciales de Resend ya están configuradas en Pages y el plan gratuito confirmado. Para activar el envío siguen pendientes los [registros DNS del remitente](../RESEND-DNS.md), su verificación y la comprobación de recepción. Los textos de Ecuador ya incorporan los datos de identificación facilitados por el usuario; quedan las condiciones operativas de conservación y proveedores descritas en [LEGAL-ECUADOR.md](../LEGAL-ECUADOR.md). No se han inventado datos fiscales, horarios o certificaciones para completar el marcado SEO.

Referencias: [Lighthouse](https://developer.chrome.com/docs/lighthouse/overview), [optimización del LCP](https://web.dev/articles/optimize-lcp), [estilos en línea de Astro](https://docs.astro.build/en/reference/configuration-reference/#buildinlinestylesheets), [codificación AVIF](https://sharp.pixelplumbing.com/api-output/#avif), [cabeceras de Cloudflare Pages](https://developers.cloudflare.com/pages/configuration/headers/), [rutas de Functions](https://developers.cloudflare.com/pages/functions/routing/), [actualización de Astro](https://docs.astro.build/en/guides/upgrade-to/v7/), [Tailwind en Astro](https://docs.astro.build/en/guides/styling/#tailwind).

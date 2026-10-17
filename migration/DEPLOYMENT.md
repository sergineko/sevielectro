# Despliegue de SeviElectro

Revisión: 17 de octubre de 2026.

Sitio público: https://sevielectro.pages.dev/

Código publicado y verificado: `87718657601ac14c096e391b7f906e9908323b8c`. Despliegue Pages `a94f0bfb-d404-4480-97b6-d96c7ed4be94` · https://a94f0bfb.sevielectro.pages.dev/. Reimplementación correcta con las nueve variables de producción, incluidas las dos de Resend.

El sitio queda publicado en Pages. La cuenta de Resend ya está registrada y se ha confirmado su plan gratuito. Se ha preparado el dominio remitente `notificaciones.sevielectro.com`, todavía sin verificar porque el usuario no tiene acceso al DNS. La conexión del dominio web definitivo sigue pendiente. No se ha modificado el DNS.

Proyecto Pages `sevielectro`, en la cuenta **Sevielectro_81@hotmail.com's Account**, ID `dcd34e5f3ff2cf026a8977a7bd863685`. Conexión directa con `sergineko/sevielectro`, rama `main`. No se ha alterado la cuenta de Cloudflare de los otros proyectos ni reinstalado la aplicación GitHub.

## Configuración

| Campo | Valor |
| --- | --- |
| Código fuente | `8771865` (incluye el retrato adaptable de René Mauricio) |
| Marco / salida | Astro estático |
| Raíz | Raíz del repositorio |
| Compilación | `pnpm run build` |
| Salida | `dist` |
| `NODE_VERSION` | `24` |
| `PNPM_VERSION` | `11.25.0` |
| `PUBLIC_SITE_URL` | `https://sevielectro.com` |
| Caché de compilación | Activada |

La integración Git compila las modificaciones de `main`. Los commits que solo incorporan documentación y pruebas de auditoría usan `[CF-Pages-Skip]` para evitar reconstrucciones innecesarias.

## Recursos y caché

El HTML utiliza `public, max-age=0, must-revalidate`: el navegador revalida en cada visita y puede recibir un 304. La CDN de Pages sirve los recursos estáticos directamente. Imágenes, fuente, iconos y sprite de clientes usan nombres con huella y `max-age=31536000, immutable`. Se conservan los recursos anteriores para no romper páginas que siguieran en caché.

La Function solo recibe `/api/contact`; todas sus respuestas usan `private, no-store`. No se ha añadido un Worker intermedio ni una regla global Cache Everything. Los archivos del formulario no se almacenan en la caché de recursos públicos.

## Formulario y protección

- Turnstile Managed configurado para `sevielectro.pages.dev` y `sevielectro.com`, sin pre-clearance. Su script se carga al interactuar con el formulario; ejecuta la comprobación al enviar. Si se supera automáticamente no se abre una ventana.
- Variables de **producción** configuradas: clave pública de Turnstile, secreto cifrado, lista cerrada de hostnames y `TO_EMAIL=sevielectro81@gmail.com,sevielectro_81@hotmail.com`.
- `FROM_EMAIL=SeviElectro <formulario@notificaciones.sevielectro.com>` y `RESEND_API_KEY` guardados en la configuración de producción de Pages, la clave como secreto cifrado. Clave creada con autorización expresa del usuario, nombre `SeviElectro Pages - formulario`, permiso `Sending access` y alcance `All domains` (única opción ofrecida por el panel antes de verificar el dominio). No se ha guardado su valor en archivos ni en Git. El dominio de envío se ha creado en Resend, región Irlanda, con TLS obligatorio y recepción desactivada. Los [tres registros DNS](RESEND-DNS.md) están preparados. No se ha enviado correo real ni confirmado su recepción.
- La comprobación pública de Turnstile se superó automáticamente. El resultado posterior fue el error esperado por falta de configuración de correo. La prueba no acredita la entrega de Resend.
- Adjuntos opcionales: hasta tres PDF, DOC, DOCX, JPG, PNG o WebP, 5 MB por archivo y 10 MB en conjunto. Validación de formato y tamaño en servidor; no se presenta como un antivirus. Un envío válido usa como máximo dos peticiones externas: Siteverify y Resend.
- `Reply-To` toma el correo validado del visitante; ambos buzones reciben la consulta. El correo registra la aceptación y versión del aviso de privacidad. Las pruebas del backend verifican estos campos con proveedores simulados y la idempotencia de reintentos.
- Las variables de protección anteriores se añadieron en producción; las vistas previas necesitan su propia configuración si se desea habilitar el formulario en ellas.

## Comprobaciones

- Compilación correcta y 24 pruebas automatizadas aprobadas.
- Retrato de René Mauricio incorporado, con encuadre revisado en ordenador, tablet y móvil. Original conservado y versiones WebP adaptables con caché inmutable. Se ha verificado que el HTML y la fotografía de la URL pública corresponden a esta versión.
- [Auditoría pública de caché y formulario](audits/contact-public.json): HTML revalidable, recursos inmutables, respuestas 304, GET del endpoint 405, ausencia de token 400 y token inválido 403, sin enviar correos.
- [Auditoría de indexabilidad](audits/indexability-public.json): 62 solicitudes, cuatro páginas públicas, sitemap con 18 imágenes, once identificadores de rastreadores, robots sin restricciones generales y ruta inexistente con HTTP 404. Metadatos únicos y JSON-LD de negocio, web y páginas verificados. Sin bloqueo observado con esos User-Agent; no reproduce las IP verificadas ni pruebas desde cada país. La auditoría advierte que el dominio canónico todavía sirve WordPress.
- Portada pública: Lighthouse móvil **99/100/100/100**, escritorio **100/100/100/100**. La carga inicial móvil pasa de 21 peticiones y 242.263 bytes a 6 peticiones y 119.181 bytes; LCP 1,8 s, TBT 0 ms, CLS 0. [Informes](audits/README.md).
- Revisión SEO pública posterior, sobre `61412f0`: Lighthouse móvil **100/100/100/100**, LCP 1,4 s, TBT 0 ms y CLS 0. Informe `seo-international-mobile.report.html/json`. Son valores de laboratorio de esta medición, no datos CrUX ni posiciones garantizadas en buscadores.
- Política de privacidad: auditoría móvil local con 100 en las cuatro categorías; revisión visual de las tres páginas legales en móvil y escritorio.
- Identificación actualizada en Aviso legal y Privacidad: nombre legal, RUC y domicilio completo facilitados por el usuario, sin el aviso de datos pendientes. Se verifican en el HTML público con versión `2026-10-16.2`. La captura de comprobación se conserva solo en local.
- Galería: filtros y recuentos promocionales retirados, etiquetas de categoría conservadas, cinco fotografías principales y una fila adicional de dos trabajos y una tarjeta «Ver todos nuestros trabajos». Se han incorporado las seis fotografías entregadas por el usuario en `img/galería/`, con títulos y textos alternativos propios, cinco de Instalaciones y una de Iluminación. La colección tiene 23 fotos y conserva las 17 anteriores. El montaje de tableros aparece en la muestra principal; la tarjeta abre la octava fotografía, «Iluminación en espacios de reunión». Se han comprobado las seis fotos en el visor, el mosaico y la vista móvil sin desbordamiento. Los originales se movieron sin alterar sus bytes a `public/media/gallery/original/`; la bandeja de entrada queda libre. Las variantes de 640 píxeles pesan en conjunto 353.776 bytes frente a 1.261.086 de los originales (72 % menos). El sitemap incluye ahora 24 imágenes contando la portada, con 67 comprobaciones locales de rastreo correctas. Los controles de indexabilidad se adaptan al tamaño de la colección, sin fijarlo a la cifra anterior.

## Pendiente para el lanzamiento con el dominio

1. La identificación legal ya está incorporada con los datos facilitados por el usuario. Confirmar la conservación efectiva de los buzones y los contratos y garantías de los proveedores descritos en [la revisión de Ecuador](LEGAL-ECUADOR.md).
2. Añadir los [registros DNS preparados](RESEND-DNS.md) y verificar el dominio remitente en Resend. La clave de envío ya está guardada como secreto en Pages. Una vez verificado, restringir su alcance a este dominio si el panel ofrece esa opción, sin ampliar permisos.
3. Realizar un envío real autorizado con adjunto y verificar recepción en los dos buzones y respuesta directa al visitante. Hasta entonces no está comprobada la entrega.
4. Conectar `sevielectro.com` cuando se complete la gestión del dominio, conservando los registros del correo y demás servicios. No se ha cambiado DNS ni titularidad.
5. Revisar HTTPS, redirecciones, caché y rastreo en el dominio definitivo, verificar su propiedad en Search Console y enviar `/sitemap.xml`. Las canónicas y el sitemap ya usan ese dominio.

Los textos ecuatorianos y la identificación están incorporados. Las verificaciones operativas indicadas siguen siendo independientes: publicar las páginas no acredita por sí solo el cumplimiento integral de la empresa.

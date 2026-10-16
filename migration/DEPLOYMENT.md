# Despliegue de SeviElectro

Revisión: 16 de octubre de 2026.

Sitio público: https://sevielectro.pages.dev/

Despliegue de producción verificado: https://a215bdf6.sevielectro.pages.dev/ · código `39b96f6c6ae096451e0406cbb9dbf62f1bc261b9`.

Proyecto Pages `sevielectro`, en la cuenta **Sevielectro_81@hotmail.com's Account**, ID `dcd34e5f3ff2cf026a8977a7bd863685`. Conexión directa con `sergineko/sevielectro`, rama `main`. No se ha alterado la cuenta de Cloudflare de los otros proyectos ni reinstalado la aplicación GitHub.

## Configuración

| Campo | Valor |
| --- | --- |
| Código fuente | `39b96f6` (textos legales de Ecuador y versión de privacidad) |
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
- `RESEND_API_KEY` y `FROM_EMAIL` todavía no están configuradas. El servidor rechaza el envío con un error comprensible; no se ha enviado correo real ni confirmado su recepción.
- La comprobación pública de Turnstile se superó automáticamente. El resultado posterior fue el error esperado por falta de configuración de correo. La prueba no acredita la entrega de Resend.
- Adjuntos opcionales: hasta tres PDF, DOC, DOCX, JPG, PNG o WebP, 5 MB por archivo y 10 MB en conjunto. Validación de formato y tamaño en servidor; no se presenta como un antivirus. Un envío válido usa como máximo dos peticiones externas: Siteverify y Resend.
- `Reply-To` toma el correo validado del visitante; ambos buzones reciben la consulta. El correo registra la aceptación y versión del aviso de privacidad. Las pruebas del backend verifican estos campos con proveedores simulados y la idempotencia de reintentos.
- Las variables de protección anteriores se añadieron en producción; las vistas previas necesitan su propia configuración si se desea habilitar el formulario en ellas.

## Comprobaciones

- Compilación correcta y 22 pruebas automatizadas aprobadas.
- [Auditoría pública de caché y formulario](audits/contact-public.json): HTML revalidable, recursos inmutables, respuestas 304, GET del endpoint 405, ausencia de token 400 y token inválido 403, sin enviar correos.
- [Auditoría de indexabilidad](audits/indexability-public.json): cuatro páginas públicas, sitemap con 18 imágenes, robots sin restricciones generales y ruta inexistente con HTTP 404. Sin bloqueo observado con los User-Agent de los buscadores revisados. No reproduce las IP verificadas de los rastreadores ni garantiza indexación.
- Portada pública: Lighthouse móvil **99/100/100/100**, escritorio **100/100/100/100**. La carga inicial móvil pasa de 21 peticiones y 242.263 bytes a 6 peticiones y 119.181 bytes; LCP 1,8 s, TBT 0 ms, CLS 0. [Informes](audits/README.md).
- Política de privacidad: auditoría móvil local con 100 en las cuatro categorías; revisión visual de las tres páginas legales en móvil y escritorio.

## Pendiente para el lanzamiento con el dominio

1. La identificación legal ya está incorporada con los datos facilitados por el usuario. Confirmar la conservación efectiva de los buzones y los contratos y garantías de los proveedores descritos en [la revisión de Ecuador](LEGAL-ECUADOR.md).
2. Verificar en Resend el dominio o subdominio remitente mediante sus registros DNS. Añadir `RESEND_API_KEY` como secreto y `FROM_EMAIL` con ese remitente verificado, y volver a desplegar.
3. Realizar un envío real autorizado con adjunto y verificar recepción en los dos buzones y respuesta directa al visitante. Hasta entonces no está comprobada la entrega.
4. Conectar `sevielectro.com` cuando se complete la gestión del dominio, conservando los registros del correo y demás servicios. No se ha cambiado DNS ni titularidad.
5. Revisar HTTPS, redirecciones, caché y rastreo en el dominio definitivo, verificar su propiedad en Search Console y enviar `/sitemap.xml`. Las canónicas y el sitemap ya usan ese dominio.

Los textos ecuatorianos y la identificación están incorporados. Las verificaciones operativas indicadas siguen siendo independientes: publicar las páginas no acredita por sí solo el cumplimiento integral de la empresa.

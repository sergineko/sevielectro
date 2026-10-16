# Primer despliegue de SeviElectro

Fecha: 16 de octubre de 2026.

URL publicada: https://sevielectro.pages.dev/

Proyecto Cloudflare Pages: `sevielectro`, creado en la cuenta de destino indicada por el titular. El proyecto se ha conectado directamente con `sergineko/sevielectro`, sin reinstalar la aplicación de GitHub ni cambiar otros proyectos.

## Configuración

| Campo | Valor |
| --- | --- |
| Repositorio | https://github.com/sergineko/sevielectro |
| Rama de producción | `main` |
| Código desplegado | `214c641beb96e26c942c1904feed472eeacdc1c1` |
| Marco | Astro, salida estática |
| Directorio raíz | Raíz del repositorio |
| Compilación | `pnpm run build` |
| Directorio de salida | `dist` |
| `NODE_VERSION` | `24` |
| `PNPM_VERSION` | `11.25.0` |
| `PUBLIC_SITE_URL` | `https://sevielectro.com` |

Cloudflare ha instalado Node 24.13.1 y pnpm 11.25.0 y ha publicado correctamente el sitio y su Function. La integración Git queda preparada para compilar los próximos cambios de `main`.

## Comprobaciones públicas

- `node scripts/check-indexability.mjs https://sevielectro.pages.dev/`: 42 solicitudes correctas, cuatro páginas canónicas y 18 imágenes anunciadas en el sitemap. Informe en [audits/indexability-public.json](audits/indexability-public.json).
- Portada, páginas públicas, recursos de imagen, fuente y scripts accesibles. La ruta inexistente conserva HTTP 404.
- Sin restricciones de indexación ni desafíos observados en las solicitudes con los User-Agent revisados. La prueba no reproduce las IP verificadas de los buscadores ni garantiza indexación.
- `/api/contact` devuelve HTTP 405 y JSON al consultar por GET, confirmando que se ejecuta la Function y se rechaza un método no permitido.
- La fuente mantiene `Cache-Control: public, max-age=604800`; las rutas antiguas `/wp-sitemap.xml` y `/sitemap_index.xml` redirigen con HTTP 301 a `/sitemap.xml`.

Las canónicas y el sitemap conservan `sevielectro.com` como dominio definitivo. La propiedad de Search Console y el estado real de indexación aún no se han verificado.

## Pendiente para el lanzamiento con el dominio

1. Verificar el dominio o subdominio remitente en Resend mediante los registros DNS facilitados por el servicio.
2. Configurar `RESEND_API_KEY` como secreto y los valores `FROM_EMAIL` y `TO_EMAIL` en el proyecto Pages, volver a desplegar y comprobar un envío real y su recepción.
3. Completar los datos y textos legales definitivos.
4. Conectar el dominio personalizado cuando el titular prepare su gestión DNS, conservando los registros de otros servicios.
5. Revisar HTTPS, redirecciones, caché, rastreo y mediciones sobre el dominio definitivo y dar de alta su sitemap en Search Console.

No se han introducido claves de Resend ni se ha probado el envío de correo real en este despliegue.

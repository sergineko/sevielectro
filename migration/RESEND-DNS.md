# Activación de Resend

Preparado el 17 de octubre de 2026 en la cuenta de SeviElectro, con el plan gratuito. El dominio remitente se ha creado en Resend, pero no se ha verificado: todavía no hay acceso al proveedor DNS.

- Dominio: `notificaciones.sevielectro.com`.
- Región: Irlanda (`eu-west-1`).
- Remitente del formulario: `SeviElectro <formulario@notificaciones.sevielectro.com>`.
- Destinatarios: `sevielectro81@gmail.com` y `sevielectro_81@hotmail.com`.
- Respuesta directa: email del visitante mediante `Reply-To`, ya implementado.
- Recepción de correo en Resend: desactivada; los buzones actuales siguen siendo los destinatarios.
- TLS obligatorio (`Enforced`) guardado en Resend: los envíos fallarán si el servidor destinatario no admite una conexión cifrada.

## Registros pendientes

Registros mostrados por el panel de Resend para este dominio. Los nombres relativos de la tabla corresponden a una zona DNS `sevielectro.com`. Si el proveedor añade automáticamente el dominio, no repetirlo en el campo de nombre.

| Tipo | Nombre relativo | Contenido | TTL |
| --- | --- | --- | --- |
| TXT | `resend._domainkey.notificaciones` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC9pR77dSkfck/vtrorn8l+rdeKXxTA/9mV+y05Nqrp84oh+iGUfIBAr9RkTeWTrUWAmslnJrAjIF/UL+7NtaXQtBKc4EU2r9e11Zp7WypgD50Es4XGBTxKAngJR+xromZ8zZskbDOyEGcLaEm6O4SX5EZYr8aHFoLTaZzeoJVc4QIDAQAB` | Auto |
| CNAME | `rsend.notificaciones` | `rsend-euw1.forge.rmta.net` | Auto |
| CNAME | `send.notificaciones` | `send.forge.rmta.net` | Auto |

En Cloudflare, los CNAME de correo deben estar en **Solo DNS**. Estos son registros nuevos del subdominio de envío: no sustituir los MX, SPF, DMARC ni los registros de la web del dominio principal. Revisar los registros de nuevo en Resend antes de aplicarlos si se elimina o recrea el dominio, porque la clave DKIM podría cambiar. La clave DKIM indicada es pública, no una clave API secreta.

## Finalizar cuando haya acceso al DNS

1. Añadir los tres registros en el proveedor autoritativo actual o en la nueva zona de Cloudflare cuando corresponda.
2. Pulsar **Verify DNS Records** en Resend y esperar a que la firma DKIM y el envío queden verificados.
3. Confirmar la configuración de producción de Pages: `FROM_EMAIL`, `RESEND_API_KEY` como secreto, ambos destinatarios y Turnstile.
4. Volver a desplegar Pages si han cambiado sus variables desde la última implementación.
5. Realizar un envío de prueba con datos ficticios y un adjunto de prueba, comprobar entrega en ambos buzones y `Reply-To` del visitante. No declarar el formulario operativo antes de esa comprobación.

La verificación del remitente y la conexión del dominio web son pasos distintos: verificar el correo no cambia dónde se publica `sevielectro.com`.

Referencias: [dominios verificados](https://resend.com/docs/dashboard/domains/introduction), [gestión de dominios y DNS](https://resend.com/docs/dashboard/domains/manage-domains), [precios de Resend](https://resend.com/pricing).

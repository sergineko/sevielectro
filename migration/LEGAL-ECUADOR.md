# Textos legales de Ecuador

Revisión: 16 de octubre de 2026. Ámbito: web informativa de SeviElectro en Quito; consultas y cotizaciones, sin contratación ni pagos automáticos.

Las páginas `/aviso-legal/`, `/privacidad/` y `/cookies/` sustituyen los textos provisionales. Describen el código y la configuración observados: Cloudflare Pages y Turnstile, Resend previsto para los envíos, dos buzones Gmail/Hotmail, adjuntos opcionales, sin analítica, publicidad o publicaciones sociales incrustadas. Siguen siendo estáticas, indexables y navegables sin JavaScript. Con JavaScript el índice desplaza suavemente sin dejar fragmentos en la URL.

## Identificación incorporada y decisiones operativas

El usuario ha facilitado los datos de identificación para su publicación: René Alcides Sevilla Huilcarema, RUC 1717622680001, y Chilibulo Alto, calle Virgen Pata, lote S496, Quito, Pichincha, Ecuador. Se han normalizado las mayúsculas y completado la ciudad, provincia y país con la ubicación conocida de la actividad. No se ha añadido un código postal ni una numeración distinta de la facilitada. No se ha realizado una consulta registral al SRI.

- **Identidad:** los tres datos constan en `src/data/legal-identity.js` y se muestran en Aviso legal y Privacidad. La comprobación de identificación pasa y el aviso de datos pendientes desaparece. La versión de privacidad se actualiza a `2026-10-16.2`, con fecha HTML válida e independiente del número de versión.
- **Conservación:** se explica el criterio de atención y seguimiento, y la conservación legal cuando corresponda. No se atribuye a Ecuador un plazo universal inexistente para toda consulta. La eliminación de los buzones y copias de trabajo debe gestionarla el titular: la web no puede borrar mensajes en Gmail/Hotmail ni promete borrados automáticos. El titular debe concretar y documentar sus plazos por categoría y la configuración real de registros y copias.
- **Proveedores y exterior:** se informa de Cloudflare, Resend, Google y Microsoft, sus finalidades y tratamiento internacional. Antes de activar el correo deben verificarse los contratos de encargo, roles de los proveedores, garantías de comunicaciones a responsables extranjeros y plazos reales. No se ha afirmado que se hayan firmado acuerdos ecuatorianos ni que Estados Unidos tenga una declaración de adecuación de la SPDP. Los contratos europeos no acreditan por sí solos garantías ecuatorianas. La resolución SPDP-SPD-2026-0004-R distingue el acceso por un encargado de una transferencia entre responsables; no permite asumir que todos los usos propios del proveedor sean encargos.
- **Seguridad:** el aviso identifica el interés legítimo y su límite. Corresponde al responsable documentar la ponderación exigible, revisar necesidad y proporcionalidad y atender objeciones. Cloudflare declara un rol propio para mejoras de Turnstile, además del tratamiento por cuenta de la web; no se presenta todo su tratamiento como un encargo.
- **Derechos:** se ofrecen los dos correos de la empresa, alternativa telefónica, verificación proporcionada de identidad, gratuidad, plazos de quince días para los derechos que los tienen en la LOPDP y reclamación ante la SPDP. No se ha inventado un delegado de protección de datos.

La aceptación y la versión del aviso se incluyen en el texto y HTML del correo. El servidor rechaza una versión ausente o antigua antes de consultar proveedores. No se añade una fecha variable al contenido para conservar la idempotencia; el mensaje entregado tiene sus cabeceras de fecha. Esto conserva una evidencia básica de la declaración del formulario, no certifica por sí solo todo el cumplimiento de la empresa.

## Mantenimiento de la identificación

1. Completar únicamente `legalName`, `ruc` y `address` en `src/data/legal-identity.js`, con los datos confirmados. El RUC se mantiene como texto para preservar sus dígitos.
2. Ejecutar `npm run legal:check` (o `pnpm legal:check`). El comando señala los campos vacíos sin imprimir sus valores; mientras falten datos sale con código 1. Es una comprobación de identificación, no una certificación de cumplimiento legal, y no bloquea las compilaciones actuales.
3. Compilar con `npm run build` y ejecutar las pruebas existentes. El componente compartido incorpora los datos en Aviso legal y Privacidad y retira automáticamente el aviso de identificación pendiente cuando los tres campos están completos. No es necesario editar los textos de cada página ni el formulario.
4. Subir a `main` para que Cloudflare Pages publique el cambio y verificar ambas páginas públicas. Si además cambian los tratamientos descritos, revisar y actualizar la versión de privacidad; completar la identificación sin cambiar la finalidad no requiere modificar manualmente todos los documentos.

La identificación ya está incorporada. La activación de Resend, el dominio y las verificaciones operativas anteriores se mantienen como tareas independientes, sin afirmar que los tres campos resuelvan por sí solos todas las obligaciones de la empresa.

## Fuentes primarias consultadas

- [Ley Orgánica de Protección de Datos Personales, Registro Oficial 459, 26 de mayo de 2021](https://repositorio.consejodecomunicacion.gob.ec/bitstream/CONSEJO_REP/246/1/LEY%20DATOS%20PERSONALES.pdf): licitud, información, derechos, encargados y comunicaciones internacionales.
- [Reglamento General, Decreto Ejecutivo 904, Registro Oficial 435, 13 de noviembre de 2023](https://www.bomberosguayaquil.gob.ec/wp-content/uploads/2024/03/REGLAMENTO-GENERAL-A-LA-LEY-ORGANICA-DE-PROTECCION-DE-DATOS-PERSONALES_compressed-1.pdf): consentimiento, conservación y tramitación de derechos.
- [Resoluciones de la SPDP](https://www.spdp.gob.ec/resoluciones/): SPDP-SPD-2026-0004-R sobre transferencias y comunicaciones, y SPDP-SPD-2025-0041-R sobre interés legítimo. [Consulta oficial de 2026, oficio SPDP-IRD-2026-0300-O](https://spdp.gob.ec/consultas2026/), sobre encargados y ubicación territorial. La consulta es un criterio técnico, no una certificación del proyecto.
- [Ley de Comercio Electrónico, Firmas Electrónicas y Mensajes de Datos](https://www.telecomunicaciones.gob.ec/wp-content/uploads/downloads/2012/11/Ley-de-Comercio-Electronico-Firmas-y-Mensajes-de-Datos.pdf) y [Ley Orgánica de Defensa del Consumidor](https://www.produccion.gob.ec/wp-content/uploads/2019/08/A2-LEY-ORGANICA-DE-DEFENSA-DEL-CONSUMIDOR.pdf): información, contratación y conservación de derechos obligatorios. No se ha impuesto un fuero exclusivo ni una exoneración absoluta.
- [Privacidad específica de Turnstile](https://www.cloudflare.com/turnstile-privacy-policy/), [cookies de Cloudflare](https://www.cloudflare.com/cookie-policy/) y [validación y vigencia de tokens](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/).
- [Seguridad, residencia y conservación de Resend](https://resend.com/security), [privacidad](https://resend.com/legal/privacy-policy), [DPA](https://resend.com/legal/dpa) y [subencargados](https://resend.com/legal/subprocessors).
- [Privacidad de Google](https://policies.google.com/privacy?hl=es) y [Microsoft](https://www.microsoft.com/es-es/privacy/privacystatement), para los proveedores de los dos buzones de destino.

No se ha utilizado la LSSI española ni se ha presentado la AEPD como autoridad ecuatoriana. La publicación del texto no sustituye la identificación del titular, las medidas de organización y la comprobación de los acuerdos de tratamiento efectivos.

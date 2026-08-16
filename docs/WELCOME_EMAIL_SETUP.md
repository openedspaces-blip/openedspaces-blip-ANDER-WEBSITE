# Correo de bienvenida de ANDERGO

La aplicación envía el correo de bienvenida solo después de una confirmación
exitosa de correo de Supabase Auth (o después de un registro que ya devuelve
sesión cuando _Confirm email_ está desactivado). El envío no bloquea ni revierte
la creación de la cuenta.

Se eligió **Resend** porque ofrece una API transaccional simple, tiene un plan
inicial económico y funciona sin cambios tanto en Render como en Vercel. No hay
credenciales de Resend en el cliente ni se usa `openedspaces@gmail.com` como
remitente.

## Verificar `andergo.online` en Resend

1. Crea o abre la cuenta de Resend que administrará los correos de ANDERGO.
2. Ve a **Domains** y agrega `andergo.online` (no `www.andergo.online`).
3. Copia en el DNS del dominio todos los registros que Resend indique: SPF,
   DKIM y el MX de retorno. No sustituyas registros existentes de correo; si
   existe SPF, integra el valor de Resend en el mismo registro SPF.
4. Espera a que el panel de Resend muestre el dominio con estado **Verified**.
5. En Render, abre el servicio `andergo-web` y define estas variables de
   entorno, todas del lado servidor:

   ```text
   WELCOME_EMAIL_ENABLED=true
   RESEND_API_KEY=re_...
   WELCOME_EMAIL_FROM=ANDERGO Language Academy <no-reply@andergo.online>
   WELCOME_EMAIL_REPLY_TO=support@andergo.online
   WELCOME_EMAIL_MAX_ATTEMPTS=3
   ```

   Para Vercel, configura las mismas variables en **Project Settings →
   Environment Variables**. `RESEND_API_KEY` nunca debe tener el prefijo
   `NEXT_PUBLIC_`.

6. Despliega la revisión que contiene esta integración. Al primer registro
   confirmado, el servicio consulta la API de Resend y exige que
   `andergo.online` siga mostrando estado `verified` antes de enviar desde
   `no-reply@andergo.online`.

La tabla `public.welcome_email_deliveries` guarda únicamente el UUID de cuenta,
estado, número de intentos, código de error seguro y el identificador de
proveedor. Tiene RLS activado, no otorga acceso a usuarios y evita duplicados
con una función de reclamación atómica y la clave de idempotencia de Resend.

## Copia inicial autorizada

Actualmente el entorno no tiene `RESEND_API_KEY` ni el sistema habilitado, por
lo que **no se envió** el correo a `crislahurygonzalez@gmail.com`. Después de
verificar el dominio, configurar las variables y desplegar, solicita una
prueba: se puede enviar una única copia manual con el mismo remitente y asunto
solo tras comprobar el estado `verified` de Resend.

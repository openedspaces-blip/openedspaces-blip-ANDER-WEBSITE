# ANDERGO Update 04 — Backend, Gamificación y 5 Mundos Completos

### (incluye rutas diferenciadas: A1–C2 en English, Español y Français; A1–B1 en Italiano, Português y Deutsch)

## Dónde insertar

Copia estos archivos/carpetas dentro de tu carpeta `ANDERGO-WEB` y reemplaza los existentes (o créalos si no existían):

**Frontend**

- `index.html`
- `src/js/script.js`
- `src/css/styles.css`
- `src/js/gamification/` (`state.js`, `xp.js`, `streaks.js`, `badges.js`, `missions.js`, `render.js`, `index.js`)
- `src/worlds/english/content.js`
- `src/worlds/spanish/content.js`
- `src/worlds/french/content.js`
- `src/worlds/italian/content.js`
- `src/worlds/german/content.js`

**Backend (nuevo — no existía en el proyecto)**

- `lib/config.js`
- `lib/supabaseClient.js`
- `lib/devStore.js`
- `lib/devToken.js`
- `lib/authService.js`
- `lib/gamification/` (`index.js`, `xp.js`, `badges.js`, `streaks.js`)
- `lib/lessonsData.js`
- `lib/lessonsService.js`
- `lib/httpHelpers.js`
- `lib/aiTutorService.js`
- `lib/server.js`
- `api/health.js`
- `api/ai/tutor.js`
- `api/auth.js`
- `api/auth/logout.js`
- `api/lessons.js`
- `api/lessons/[slug]/complete.js`
- `api/progress.js`
- `scripts/setup-database.js`
- `scripts/build-static.js`
- `scripts/verify-all.js`
- `supabase/migrations/202607080001_gamification.sql`
- `server.test.js` ← **reemplaza** a `server_test.js` (el nombre no coincidía con lo que pide `package.json`, por eso `npm test` no encontraba el archivo)
- `.env.example` (plantilla única de variables de entorno)

No borres `.git`, `.env`, `supabase/` (el resto de su contenido), `SUPABASE_RUN_THIS.sql`.

## Qué se corrigió

- **La cobertura curricular ahora se comunica por idioma**: English, Español y Français mantienen rutas A1–C2; Italiano, Português y Deutsch se ofrecen inicialmente hasta B1. El frontend ya limita los niveles disponibles mediante `COURSE_LEVELS_BY_LANGUAGE`, evitando presentar B2–C2 como rutas publicadas para esos tres idiomas.
- **Bug de contenido cruzado**: la pestaña de Francés mostraba un texto de lectura en italiano (copiado por error). Corregido.
- **`worlds/*/content.js` no existían**: `index.html` ya los cargaba con `<script src="worlds/...">`, pero como no existían, esas etiquetas fallaban en silencio en la consola del navegador. Ahora existen y están completos.
- **`server_test.js` vs `server.test.js`**: `package.json` corre `node --test server.test.js`, pero el archivo se llamaba `server_test.js`. `npm test` no encontraba nada. Renombrado.
- **Backend inexistente**: `package.json` y `vercel.json` ya referenciaban `lib/server.js` y `api/**/*.js`, pero no existían. Se construyó desde cero, usando `server_test.js` como contrato exacto y `SUPABASE_RUN_THIS.sql` como fuente del esquema real (`lessons`, `lesson_completions`, `lesson_progress`, `profiles`, `billing_plans`).
- **Ruta de aprendizaje fija a "English A1"**: ahora tiene selectores de idioma y nivel, y si el backend no responde, usa contenido local de respaldo (nunca queda vacía).

## Qué se agregó (gamificación)

- Motor de XP y niveles (100 XP por nivel), con barra de progreso visible en la tarjeta principal.
- Racha diaria (🔥) que se actualiza automáticamente al completar una lección.
- 11 insignias desbloqueables (primera lección, rachas, niveles, políglota, perfeccionista, etc.) en una nueva sección **Logros**.
- 3 misiones diarias que rotan cada día y otorgan XP extra al completarse.
- Preguntas de comprensión lectora (MCQ) ahora son interactivas: se puede hacer clic en una opción y ver si es correcta al instante, con XP por acierto.
- Ejercicios de las lecciones (hablar/escribir) tienen botón "Marcar como practicado".
- Celebraciones visuales (toast) al subir de nivel o desbloquear una insignia.
- El backend es la fuente de verdad de XP/streak/insignias una vez que el usuario inicia sesión (columnas nuevas en `profiles`: `xp`, `level`, `badges`, `longest_streak`, `last_active_date`, `access_tier` — ver la migración SQL nueva).

## Backend: cómo funciona

- Si configuras `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` en `.env`, el backend usa Supabase Auth de verdad y lee/escribe en tus tablas reales. También acepta `SUPABASE_KEY` como alias de `SUPABASE_ANON_KEY` para snippets frontend de Supabase.
- Si **no** los configuras, el backend funciona en "modo demo" con usuarios y progreso en memoria (para que `npm test`, `npm run dev` y una demo local funcionen sin ninguna cuenta externa). Esto se anuncia en `/api/health` (`configured: true/false`).
- Las lecciones se leen primero de Supabase (`lessons` con `target_language`); si no hay filas para ese idioma/nivel, se usa el contenido local en `lib/lessonsData.js` como respaldo, para que la ruta de aprendizaje nunca aparezca vacía en un proyecto recién clonado.
- **No hay integración de pagos real todavía.** Se agregó `profiles.access_tier` para poder marcar manualmente a un usuario como premium desde el dashboard de Supabase mientras tanto.

## Despliegue en Render

- La producción se despliega únicamente mediante el servicio `andergo-web` definido en `render.yaml`.
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Health Check:** `/api/health`
- `npm run build` (`scripts/build-static.js`) valida `index.html`, `src/css/styles.css`, `src/js/script.js` y `src/worlds/*/content.js`, y los espeja dentro de `public/`. `public/` está en `.gitignore`: se regenera en cada build, nunca se commitea.
- El servidor Express de `lib/server.js` sirve `public/` y las rutas de la API desde el mismo servicio web.
- Configura las variables de entorno en Render, **no** subas `.env` real:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY` (o `SUPABASE_KEY` como alias)
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_DATABASE_URL` (solo si vas a correr `npm run db:setup`)
  - `OPENAI_API_KEY` (respaldo del AI Tutor y para `npm run audio:generate`)
  - `OPENAI_MODEL` (opcional; por defecto `gpt-4.1-mini`)
  - `GROQ_API_KEY` (ruta rápida y económica principal del AI Tutor)
  - `GROQ_MODEL` (opcional; por defecto `openai/gpt-oss-20b`)
  - `CEREBRAS_API_KEY` (respaldo de streaming del AI Tutor)
  - `GEMINI_API_KEY` (para activar el AI Tutor real, gratis en https://aistudio.google.com/apikey)
  - `GEMINI_MODEL` (opcional; por defecto `gemini-flash-latest`)
  - `DEV_TOKEN_SECRET`
  - `PREMIUM_PRICE_USD`

## AI Tutor

- El botón **AI Tutor** ahora llama al backend (`POST /api/ai/tutor`) en vez de responder con texto fijo en frontend.
- La llamada real a Gemini (free tier de Google) se hace solo desde backend, vía `lib/geminiService.js`; la clave `GEMINI_API_KEY` nunca se expone al navegador.
- Si falta `GEMINI_API_KEY`, la UI muestra un mensaje claro indicando que el tutor IA todavía no está configurado.
- La interfaz acepta un prompt libre del usuario y además envía al backend el idioma, nivel y lección activa de la ruta para dar respuestas más útiles.

## Validación realizada

- `node --check` en los 24 archivos JS del proyecto (frontend + backend).
- `node --test server.test.js` → 4/4 tests originales pasando.
- Prueba manual end-to-end: registro → completar 2 lecciones → XP, nivel, insignias, racha y bloqueo de lecciones premium, todo verificado con respuestas reales del servidor.
- Simulación de navegador con jsdom: cambio de pestañas (incluyendo Italiano/Alemán, antes vacías), clic en niveles, respuesta de preguntas MCQ, y cambio de idioma/nivel en la ruta de aprendizaje — sin errores de JavaScript.
- `npm run build` (mirroring a `public/`) y `npm run verify:all` corridos de punta a punta.

> No se ejecutó contra un proyecto Supabase real (no tengo credenciales); todo lo anterior se validó en modo demo. Antes de producción, corre `npm run db:setup` con `SUPABASE_DATABASE_URL` configurado para aplicar la migración de gamificación, y prueba `npm test` de nuevo con `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` reales.

## Fase 2 (completada en esta entrega)

- Las rutas publicadas se organizan por cobertura diferenciada: English, Español y Français cuentan con **36 lecciones por idioma** (6 niveles × 6 habilidades); Italiano, Português y Deutsch se presentan inicialmente hasta B1 mientras se completa la revisión editorial de niveles superiores.
- Validado curricularmente: las rutas europeas de Italiano, Português y Deutsch se verifican para A1–B1 en cinco habilidades no auditivas; English, Español y Français mantienen la cobertura completa A1–C2. La insignia "Políglota" y el bloqueo Premium siguen funcionando por idioma.

## Qué sigue (fase 3 sugerida)

1. Integrar un procesador de pagos real (Stripe/Paddle) para que `profiles.access_tier` se actualice automáticamente en vez de manualmente.
2. Ampliar cada idioma más allá de las 8 lecciones actuales (más variedad dentro de cada nivel, no solo una por nivel).
3. Sonidos/animaciones adicionales para las celebraciones de racha y de subir de nivel.
4. Tabla de líderes (leaderboard) opcional usando `profiles.xp`.

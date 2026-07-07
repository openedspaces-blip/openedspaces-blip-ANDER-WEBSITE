# ANDERGO Update 03 — Homepage Perfection & Button Fixes

## Dónde insertar
Copia estos archivos dentro de tu carpeta `ANDERGO-WEB` y reemplaza los existentes:

- `index.html`
- `script.js`
- `package.json`
- `public/index.html`
- `public/script.js`

No borres `.git`, `.env`, `supabase/`, `api/`, `lib/` ni `scripts/`.

## Qué corrige
- Homepage más limpio: las secciones secundarias `Habilidades`, `Descargas` y `App` quedan ocultas hasta que el usuario las abre desde el menú.
- Botones principales funcionando con mensajes visibles: empezar gratis, continuar lección, definir metas, desbloquear premium y tutor IA.
- Navegación corregida para revelar secciones ocultas cuando se entra desde el menú.
- Mejor manejo de error al completar lecciones.
- Corrección de textos visibles y símbolos rotos.
- Renderizado más seguro de sugerencias dinámicas.
- Ajuste del engine de Node a `22.x` para despliegues más estables.

## Validación realizada
- `node --check script.js`
- `node --check public/script.js`
- `node --check lib/server.js`
- `node --check lib/apiHandlers.js`
- `node --check scripts/setup-database.js`
- `npm run build`

> No se ejecutó `npm test` porque el zip no trae `node_modules`. Después de copiar los cambios, ejecuta `npm install` y luego `npm test`.

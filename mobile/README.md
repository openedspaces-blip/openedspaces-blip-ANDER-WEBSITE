# ANDERGO Mobile

Base oficial Expo SDK 57 para Android e iOS.

## Desarrollo

```bash
npm install
npm run android
```

La URL del backend se configura sin secretos:

```bash
EXPO_PUBLIC_API_URL=https://andergo.online
```

La app no crea un segundo sistema de progreso. Autenticación, unidades, scores, Verbos y suscripciones deben consumir las mismas API protegidas del sitio. La primera pantalla ya comprueba `/api/health` y abre la ruta seleccionada; la siguiente fase sustituirá esa apertura web por pantallas nativas de inicio de sesión, ruta y actividad.

## Próximas piezas

1. Supabase Auth con almacenamiento seguro del token.
2. Cliente tipado para `/api/dashboard`, `/api/lessons` y `/api/verbs/progress`.
3. Ruta nativa y reproductor de audio probado en Android.
4. Caché de lecciones para lectura sin conexión.
5. Accesibilidad, pruebas en dispositivos y distribución interna con EAS.

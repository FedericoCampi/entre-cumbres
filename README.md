# Entre Cumbres

Landing de [Entre Cumbres](https://www.instagram.com/entre__cumbres/): trekking, ascensos y salidas personalizadas en Catamarca, Argentina.

Sitio estático (HTML + CSS). Para verlo, abrí `index.html` en el navegador.

## Contraseña

El sitio está protegido con contraseña mediante `middleware.js` (Vercel Routing Middleware).
La contraseña se lee de la variable de entorno `SITE_PASSWORD`:

- Local: definila en `.env` y corré `vercel dev`.
- Producción: Vercel → Settings → Environment Variables → `SITE_PASSWORD`, y volvé a deployar.

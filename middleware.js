// Protege todo el sitio con una contraseña definida en la variable de entorno SITE_PASSWORD.
// Vercel ejecuta este archivo como Routing Middleware antes de servir cualquier archivo estático.

const COOKIE = 'ec_auth';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 días

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function getCookie(request, name) {
  const header = request.headers.get('cookie') || '';
  const match = header.split(/;\s*/).find((c) => c.startsWith(name + '='));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

function loginPage(error) {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Entre Cumbres · Acceso</title>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400&family=Manrope:wght@400;600&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Manrope,system-ui,sans-serif;background:#f6f4ef;color:#262a26;min-height:100svh;display:grid;place-items:center;padding:24px}
  form{background:#fff;border:1px solid #e3dfd6;border-radius:16px;padding:40px 32px;width:100%;max-width:360px;text-align:center}
  h1{font-family:Fraunces,Georgia,serif;font-weight:400;font-size:1.8rem;margin-bottom:8px}
  p{color:#6f726b;font-size:.95rem;margin-bottom:24px}
  input{width:100%;padding:13px 16px;border:1px solid #e3dfd6;border-radius:999px;font:inherit;margin-bottom:12px;outline:none}
  input:focus{border-color:#5e6e58}
  button{width:100%;padding:13px 16px;border:0;border-radius:999px;background:#5e6e58;color:#fff;font:inherit;font-weight:600;cursor:pointer}
  button:hover{background:#4a5845}
  .error{color:#a3412f;font-size:.9rem;margin:-4px 0 12px}
</style>
</head>
<body>
<form method="POST">
  <h1>Entre Cumbres</h1>
  <p>Ingresá la contraseña para ver el sitio.</p>
  <input type="password" name="password" placeholder="Contraseña" autofocus required>
  ${error ? '<div class="error">Contraseña incorrecta.</div>' : ''}
  <button type="submit">Entrar</button>
</form>
</body>
</html>`;
}

function html(body, status = 200, headers = {}) {
  return new Response(body, {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', ...headers },
  });
}

export default async function middleware(request) {
  const password = process.env.SITE_PASSWORD;
  if (!password) return html('Falta configurar SITE_PASSWORD.', 500);

  const expected = await sha256('entre-cumbres:' + password);

  if (getCookie(request, COOKIE) === expected) return; // autenticado: sigue al archivo estático

  if (request.method === 'POST') {
    const form = await request.formData();
    if (form.get('password') === password) {
      return new Response(null, {
        status: 303,
        headers: {
          location: new URL(request.url).pathname,
          'set-cookie': `${COOKIE}=${expected}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`,
        },
      });
    }
    return html(loginPage(true), 401);
  }

  return html(loginPage(false), 401);
}

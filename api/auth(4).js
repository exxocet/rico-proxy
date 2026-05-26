// api/auth.js — proxy para todas las operaciones de autenticación
// Las keys viven en variables de entorno de Vercel, nunca en el HTML

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const RICO_SECRET  = process.env.RICO_SECRET;

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, email, password, access_token, data: userData } = req.body;

  // El secreto no es obligatorio en auth para que el SDK del browser funcione,
  // pero lo validamos si viene
  const secret = req.headers['x-rico-secret'] || req.body?._secret;
  if (secret && secret !== RICO_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const ACCIONES = ['login', 'register', 'forgot', 'update-password'];
  if (!ACCIONES.includes(action)) {
    return res.status(400).json({ error: 'Acción no válida' });
  }

  let url, body, method = 'POST';

  switch (action) {
    case 'login':
      url  = `${SUPABASE_URL}/auth/v1/token?grant_type=password`;
      body = { email, password };
      break;

    case 'register':
      url  = `${SUPABASE_URL}/auth/v1/signup`;
      body = { email, password, data: userData };
      break;

    case 'forgot':
      url  = `${SUPABASE_URL}/auth/v1/recover`;
      body = { email };
      break;

    case 'update-password':
      url    = `${SUPABASE_URL}/auth/v1/user`;
      method = 'PUT';
      body   = { password };
      break;
  }

  const headers = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_KEY,
    ...(action === 'update-password' && access_token
      ? { 'Authorization': `Bearer ${access_token}` }
      : { 'Authorization': `Bearer ${SUPABASE_KEY}` })
  };

  const response = await fetch(url, {
    method,
    headers,
    body: JSON.stringify(body)
  });

  const text = await response.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }

  return res.status(response.status).json(data);
}

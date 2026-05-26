// api/data.js — proxy para todas las operaciones REST de Supabase
// Las keys viven en variables de entorno de Vercel, nunca en el HTML

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const RICO_SECRET  = process.env.RICO_SECRET;

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Validar secreto
  const secret = req.headers['x-rico-secret'] || req.body?._secret;
  if (secret !== RICO_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tabla, metodo = 'GET', filtros = '', payload, prefer = '' } = req.body;

  if (!tabla) {
    return res.status(400).json({ error: 'Falta el parámetro tabla' });
  }

  // Tablas permitidas — solo las que necesita la app pública
  const TABLAS_PERMITIDAS = [
    'productos', 'categorias', 'pedidos', 'clientes',
    'detalle_pedido', 'usuarios_app', 'cupones',
    'config_envios', 'config_general', 'box_productos'
  ];
  if (!TABLAS_PERMITIDAS.includes(tabla)) {
    return res.status(403).json({ error: 'Tabla no permitida' });
  }

  // Métodos permitidos por tabla
  const SOLO_LECTURA = ['productos', 'categorias', 'config_envios', 'config_general', 'box_productos'];
  const metodosPermitidos = {
    GET: true,
    POST: !SOLO_LECTURA.includes(tabla),
    PATCH: !SOLO_LECTURA.includes(tabla),
    DELETE: false  // nunca desde el frontend público
  };
  if (!metodosPermitidos[metodo.toUpperCase()]) {
    return res.status(403).json({ error: `Método ${metodo} no permitido en ${tabla}` });
  }

  const url = `${SUPABASE_URL}/rest/v1/${tabla}${filtros}`;
  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    ...(prefer ? { 'Prefer': prefer } : {})
  };

  const fetchOptions = {
    method: metodo.toUpperCase(),
    headers,
    ...(payload && metodo !== 'GET' ? { body: JSON.stringify(payload) } : {})
  };

  const response = await fetch(url, fetchOptions);
  const text = await response.text();

  let data;
  try { data = JSON.parse(text); } catch { data = text; }

  return res.status(response.status).json(data);
}

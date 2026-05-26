// api/rpc.js — proxy para llamadas RPC de Supabase

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const RICO_SECRET  = process.env.RICO_SECRET;

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const secret = req.headers['x-rico-secret'] || req.body?._secret;
  if (secret !== RICO_SECRET) return res.status(401).json({ error: 'Unauthorized' });

  const { fn } = req.body;
  const FUNCIONES_PERMITIDAS = ['nextval_pedidos_app'];
  if (!FUNCIONES_PERMITIDAS.includes(fn)) {
    return res.status(403).json({ error: 'Función no permitida' });
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: '{}'
  });

  const text = await response.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return res.status(response.status).json(data);
}

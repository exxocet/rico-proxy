# RICO — Proxy API (Vercel)

## Setup

### 1. Subir a GitHub
Subí esta carpeta como repositorio en GitHub.

### 2. Conectar con Vercel
1. Entrá a vercel.com
2. "Add New Project" → importá el repo de GitHub
3. En **Environment Variables** agregá estas 3 variables:

| Variable | Valor |
|---|---|
| `SUPABASE_URL` | `https://uekcfkmpmbrbyltqxhmy.supabase.co` |
| `SUPABASE_KEY` | tu anon key de Supabase |
| `RICO_SECRET` | una contraseña que vos elijas (ej: `rico2026secreto`) |

4. Deploy → Vercel te da una URL tipo `https://rico-proxy.vercel.app`

### 3. Actualizar los HTMLs
Reemplazá en cada HTML:
- La URL de Supabase → la URL de Vercel
- La anon key → el RICO_SECRET que elegiste
- Las llamadas fetch → usan `/api/data`, `/api/auth`, `/api/rpc`

## Endpoints

### POST /api/auth
```json
{ "action": "login", "email": "...", "password": "..." }
{ "action": "register", "email": "...", "password": "...", "data": {...} }
{ "action": "forgot", "email": "..." }
{ "action": "update-password", "password": "...", "access_token": "..." }
```

### POST /api/data
```json
{
  "_secret": "tu-secreto",
  "tabla": "productos",
  "metodo": "GET",
  "filtros": "?activo=eq.true&order=nombre",
  "payload": null,
  "prefer": ""
}
```

### POST /api/rpc
```json
{ "_secret": "tu-secreto", "fn": "nextval_pedidos_app" }
```

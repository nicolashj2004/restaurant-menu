# Sabor Urbano — Menú digital premium

Menú digital interactivo para restaurante (QR de mesa) con panel administrativo completo.
Next.js 16 (App Router) + TypeScript + Tailwind + shadcn/ui + Framer Motion + Supabase (Postgres, Auth, Storage con RLS).

## Requisitos

- Node.js 20+
- Docker Desktop (para levantar Supabase localmente)

## Puesta en marcha

```bash
npm install

# Levanta Postgres/Auth/Storage local en Docker (deja el proceso corriendo)
npx supabase start

# Copia las variables de entorno (los valores por defecto ya funcionan con `supabase start`)
cp .env.local.example .env.local

# Aplica el esquema y los datos demo
npx supabase db reset

# Crea el usuario administrador de prueba y vincúlalo al restaurante demo
node scripts/seed-admin.mjs

# Arranca la app
npm run dev
```

Abre:
- **http://localhost:3000/menu** — menú público
- **http://localhost:3000/admin/login** — panel admin (`admin@saborurbano.com` / la contraseña que imprime `seed-admin.mjs`)
- **http://127.0.0.1:54323** — Supabase Studio (ver tablas, Storage, Auth)

Para detener Supabase local: `npx supabase stop`.

## Estructura

```
app/menu/…          rutas públicas del menú (Server Components)
app/admin/…          panel administrativo (protegido por Supabase Auth)
components/menu/      UI del menú público (cliente)
components/admin/      UI del panel admin (cliente)
components/ui/        primitivas shadcn/ui
lib/services/         acceso a datos (Supabase, un archivo por dominio)
lib/actions/           Server Actions ("use server") que llaman a los services
lib/validation/         esquemas zod para los formularios
lib/types/               tipos generados de la BD + tipos de dominio
supabase/migrations/     esquema SQL versionado
supabase/seed.sql         datos demo (restaurante, categorías, 20 platos)
scripts/seed-admin.mjs     crea el usuario admin de prueba
```

## Comandos útiles

```bash
npm run dev            # servidor de desarrollo (Turbopack)
npm run build           # build de producción
npm run lint             # ESLint
npx tsc --noEmit          # chequeo de tipos
npx supabase db reset      # reaplica migraciones + reseed (borra los datos actuales)
npx supabase gen types typescript --local   # regenera lib/types/database.ts si cambias el esquema
```

## Desplegar a producción

1. Crea un proyecto en [supabase.com](https://supabase.com), corre las migraciones de `supabase/migrations/` contra él (`npx supabase link` + `npx supabase db push`) y `supabase/seed.sql` si quieres los datos demo.
2. Sube el código a un repositorio y despliega en [Vercel](https://vercel.com/new) (o similar).
3. Configura las variables de entorno de `.env.local.example` con las credenciales de tu proyecto Supabase real y tu dominio en `NEXT_PUBLIC_SITE_URL`.
4. Crea tu usuario admin real: `supabase.auth.admin.createUser(...)` + una fila en `restaurant_admins` (puedes adaptar `scripts/seed-admin.mjs`).

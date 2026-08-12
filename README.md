# Sistema de Gestion de Licitaciones

Proyecto construido con Next.js, Prisma y PostgreSQL para administrar clientes, productos, licitaciones, pagos, usuarios y tareas automaticas.

## Requisitos

- Node.js 20+
- Supabase Postgres
- Supabase Storage para almacenar url de documentos de propuesta
- Resend para correos transaccionales
- Vercel Cron para Jobs

## Instalacion

```bash
npm install
npm run prisma:generate
```

## Variables de entorno

```env
DATABASE_URL=
DIRECT_URL=

JWT_SECRET=
JWT_EXPIRES_IN_HOURS=8

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=

RESEND_API_KEY=
RESEND_FROM_EMAIL=

JOBS_CRON_SECRET=
JOBS_SYSTEM_USER_ID=
```

## Ejecutar el proyecto

```bash
npm run dev
```

## Validaciones

```bash
npm run lint
npm run build
```

## Backend disponible

### Auth

- `POST /api/auth`

### Users - Solo admin

- `GET /api/users`
- `POST /api/users`
- `GET /api/users/[id]`
- `PATCH /api/users/[id]`
- `DELETE /api/users/[id]`

### Clients

- `GET /api/clients`
- `POST /api/clients`
- `GET /api/clients/[id]`
- `PATCH /api/clients/[id]`
- `DELETE /api/clients/[id]`

### Products

- `GET /api/products`
- `POST /api/products`
- `GET /api/products/[id]`
- `PATCH /api/products/[id]`
- `DELETE /api/products/[id]`

### Tenders

- `GET /api/tenders`
- `POST /api/tenders`
- `GET /api/tenders/[id]`
- `PATCH /api/tenders/[id]` activa licitacion
- `GET /api/tenders/[id]/history`
- `PATCH /api/tenders/[id]/finish`
- `PATCH /api/tenders/[id]/to-collect`
- `PATCH /api/tenders/[id]/lose`
- `GET /api/tenders/[id]/products`
- `POST /api/tenders/[id]/products`
- `DELETE /api/tenders/[id]/products?productId=...`
- `POST /api/tenders/[id]/proposal`
- `GET /api/tenders/[id]/payments`
- `POST /api/tenders/[id]/payments`

### Jobs

- `GET /api/jobs/tenders`
- `POST /api/jobs/tenders`

## Reglas de negocio principales

- Solo admin puede crear usuarios.
- Licitacion inicia en `BORRADOR`.
- Para pasar a `ACTIVA` se requiere documento de propuesta.
- Cada cambio de estado genera historial.
- No se pueden editar productos en estados cerrados.
- El total de productos no puede superar el presupuesto maximo.
- Los pagos solo se registran en `POR_COBRAR`.
- Si el saldo llega a 0, la licitacion pasa a `COBRADA`.
- El job cambia licitaciones vencidas a `PERDIDA`.
- El job envia recordatorios cuando faltan menos de 48 horas.

## Arquitectura

Se usa una separacion por modulo:

- `src/modules/tenders`: reglas de negocio de licitaciones
- `src/modules/users`: gestion de usuarios
- `src/modules/clients`: gestion de clientes
- `src/modules/products`: gestion de productos
- `src/modules/jobs`: ejecucion de tareas programadas
- `src/infrastructure`: integraciones externas

## Flujo rapido

1. Crear cliente y productos.
2. Crear licitacion en borrador.
3. Subir propuesta.
4. Activar licitacion.
5. Finalizar o marcar perdida.
6. Pasar a cobro y registrar pagos.

## Notas

- La base de datos usa Prisma conectado con Supabase mediante Session Poolers.
- El almacenamiento de propuestas se realiza en Supabase Storage.
- Los correos se envian con Resend.
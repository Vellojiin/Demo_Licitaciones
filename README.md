# Sistema de gestión de licitaciones

Aplicación web construida con Next.js 16, Prisma y PostgreSQL para gestionar clientes, productos, licitaciones, pagos, usuarios y tareas automáticas de negocio.

El proyecto combina una interfaz administrativa y un dashboard comercial, con autenticación por JWT, validaciones de negocio y automatización de estados para licitaciones.

## Características principales

- Autenticación y autorización por roles (`ADMIN` y `USER`)
- Gestión de usuarios, clientes y productos
- Creación de licitaciones con presupuesto máximo, deadline y estado
- Añadir productos a una licitación y validar presupuesto
- Subida de propuesta documental a Supabase Storage
- Cambio de estados de licitaciones con historial de transiciones
- Registro de pagos y control del saldo pendiente
- Jobs automáticos para licitaciones vencidas y recordatorios
- Envío de correos transaccionales con Resend
- Arquitectura modular por dominio

## Stack tecnológico

- Next.js 16
- React 19
- TypeScript
- Prisma ORM
- PostgreSQL (Supabase)
- Supabase Storage
- JWT + bcrypt
- Resend
- Tailwind CSS

## Requisitos previos

- Node.js 20+
- PostgreSQL o Supabase Postgres
- Bucket de almacenamiento en Supabase
- Cuenta de Resend para correos transaccionales
- Acceso a Vercel Cron o un scheduler equivalente para jobs

## Instalación

1. Clona el repositorio.
2. Instala dependencias:

```bash
npm install
```

3. Genera el cliente de Prisma:

```bash
npm run prisma:generate
```

## Variables de entorno

Crea un archivo `.env` basado en `.env.example`:

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

JWT_SECRET="tu-clave-secreta"
JWT_EXPIRES_IN_HOURS="8"

SUPABASE_URL="https://tu-proyecto.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="tu-key"
SUPABASE_STORAGE_BUCKET="propuestas"

RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="noreply@tudominio.com"

JOBS_CRON_SECRET="secreto-para-cron"
JOBS_SYSTEM_USER_ID="uuid-del-usuario-sistema"
```

### Variables clave

- `DATABASE_URL`: conexión principal a la base de datos
- `DIRECT_URL`: conexión directa requerida por Prisma para migraciones
- `JWT_SECRET`: firma la sesión del usuario
- `SUPABASE_STORAGE_BUCKET`: bucket donde se guardan los documentos de propuesta
- `JOBS_SYSTEM_USER_ID`: usuario interno que ejecuta procesos automáticos

## Base de datos

La estructura principal está definida en `prisma/schema.prisma` y contempla entidades como:

- `User`
- `Client`
- `Product`
- `Tender`
- `TenderProduct`
- `Payment`
- `TenderTransition`

Estados de licitación soportados:

- `BORRADOR`
- `ACTIVA`
- `FINALIZADA`
- `POR_COBRAR`
- `COBRADA`
- `PERDIDA`

## Ejecutar el proyecto

Modo desarrollo:

```bash
npm run dev
```

Aplicación disponible por defecto en:

```text
http://localhost:3000
```

## Validaciones

```bash
npm run lint
npm run build
```

## Estructura del proyecto

```text
app/
  admin/
  api/
  dashboard/
  login/
  page.tsx

src/
  modules/
    admin/
    auth/
    clients/
    dashboard/
    jobs/
    products/
    tenders/
    users/
  shared/

prisma/
  schema.prisma
```

## Módulos principales

### Autenticación

- `src/modules/auth`
- Login, registro, validación de credenciales y JWT

### Usuarios

- `src/modules/users`
- Administración de usuarios y roles

### Clientes

- `src/modules/clients`
- Datos de clientes y empresas

### Productos

- `src/modules/products`
- CRUD de productos del catálogo

### Licitaciones

- `src/modules/tenders`
- Lógica de negocio para crear, activar, cerrar, cobrar y perder licitaciones

### Jobs

- `src/modules/jobs`
- Procesos de automatización para vencimientos y recordatorios

## API disponible

### Autenticación

- `POST /api/auth`

### Usuarios (solo admin)

- `GET /api/users`
- `POST /api/users`
- `GET /api/users/[id]`
- `PATCH /api/users/[id]`
- `DELETE /api/users/[id]`

### Clientes

- `GET /api/clients`
- `POST /api/clients`
- `GET /api/clients/[id]`
- `PATCH /api/clients/[id]`
- `DELETE /api/clients/[id]`

### Productos

- `GET /api/products`
- `POST /api/products`
- `GET /api/products/[id]`
- `PATCH /api/products/[id]`
- `DELETE /api/products/[id]`

### Licitaciones

- `GET /api/tenders`
- `POST /api/tenders`
- `GET /api/tenders/[id]`
- `PATCH /api/tenders/[id]` → activa una licitación
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

- Solo un administrador puede crear usuarios.
- La licitación inicia en estado `BORRADOR`.
- Para pasar a `ACTIVA` debe existir un documento de propuesta.
- Cada cambio de estado genera un registro en el historial.
- No se pueden editar productos cuando la licitación está en un estado cerrado.
- El total de productos no puede superar el presupuesto máximo.
- Los pagos solo se registran si la licitación está en `POR_COBRAR`.
- Si el saldo llega a cero, la licitación pasa a `COBRADA`.
- El job de automatización marca licitaciones vencidas como `PERDIDA`.
- Se envían recordatorios cuando faltan menos de 48 horas para el deadline.

## Flujo de uso recomendado

1. Crear clientes y productos.
2. Crear una licitación en borrador.
3. Añadir productos y validar el presupuesto.
4. Subir la propuesta documental.
5. Activar la licitación.
6. Finalizarla, marcarla como perdida o moverla a cobro.
7. Registrar pagos hasta liquidar el saldo.

## Notas importantes

- La base de datos usa Prisma con PostgreSQL de Supabase.
- Los archivos de propuesta se almacenan en Supabase Storage.
- Los correos electrónicos se envían mediante Resend.
- Los cron jobs deben invocar una ruta protegida con el secreto configurado en `JOBS_CRON_SECRET`.

## Contribución

Este proyecto está pensado como una base para una aplicación de gestión comercial con reglas de negocio claras y una estructura modular fácil de mantener.

Si vas a modificar la lógica de negocio:

- mantén la separación por módulos
- reutiliza los casos de uso en lugar de lógica duplicada
- actualiza los tests o validaciones si cambias reglas de negocio

## Licencia

Este proyecto no define una licencia explícita en este repositorio; verifica con el propietario del código antes de distribuirlo o reutilizarlo en producción.
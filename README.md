# Legajo

Sistema de registro rápido de observaciones docentes. Integrado con Moodle vía Web Services.

**Stack**: SvelteKit 5 + TypeScript + MySQL (Drizzle ORM) + Tailwind CSS  
**Moodle**: 5.1.1 / 2025100601 — `https://aulavirtual.pds.edu.ar`

---

## Requisitos

- Node.js 20 LTS o superior
- MySQL 5.7+ (disponible en Nuthost cPanel)
- Moodle con Web Services habilitados y token del servicio "Legajo API"

---

## Setup inicial (desarrollo)

### 1. Clonar e instalar dependencias

```bash
cd legajo
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env`:

```env
MOODLE_URL=https://aulavirtual.pds.edu.ar
MOODLE_TOKEN=25e7560651d3efe7eb4cbb4f11701462
DATABASE_URL=mysql://usuario:contraseña@localhost:3306/legajo_db
SESSION_SECRET=genera-uno-con-el-comando-de-abajo
NODE_ENV=development
```

Generar `SESSION_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Crear base de datos en cPanel

1. Ir a cPanel → MySQL Databases
2. Crear base de datos: `legajo_db` (quedará como `cpanelusuario_legajo_db`)
3. Crear usuario MySQL con contraseña segura
4. Asignar todos los privilegios al usuario sobre la base de datos
5. Actualizar `DATABASE_URL` con los datos reales

### 4. Arrancar (crea tablas automáticamente en el primer inicio)

```bash
npm run dev
```

Las tablas se crean solas al iniciar. No hay que correr migraciones manualmente.

### 5. Crear docente de prueba

```bash
npm run db:seed
```

Credenciales: `docente@pds.edu.ar` / PIN `123456`

---

## Funciones de Moodle requeridas

Antes de usar el sistema, habilitar en Moodle:  
**Administración → Plugins → Web services → Servicios externos → Legajo API → Funciones**

| Función | Uso |
|---|---|
| `core_webservice_get_site_info` | Estado de conexión (ya habilitada) |
| `core_course_get_courses` | Listar cursos |
| `core_enrol_get_enrolled_users` | Alumnos por curso |
| `core_user_get_users` | Búsqueda de usuarios |

Verificar qué funciones están habilitadas en: `http://localhost:5173/admin/status`

---

## Scripts disponibles

```bash
npm run dev          # Servidor de desarrollo con hot reload
npm run build        # Build de producción (genera carpeta build/)
npm run start        # Arrancar servidor de producción (node build/index.js)
npm run check        # TypeScript + Svelte check
npm run db:seed      # Crear docente de prueba
npm run db:push      # Sincronizar schema con DB (drizzle-kit, útil en dev)
npm run db:generate  # Generar archivos de migración SQL (para producción)
```

---

## Estructura del proyecto

```
legajo/
├── src/
│   ├── lib/server/
│   │   ├── db/              ← Drizzle ORM + schema + init de tablas
│   │   ├── moodle/          ← Cliente Moodle + adaptadores v1/v2
│   │   ├── services/        ← Lógica de negocio (auth, cursos, observaciones)
│   │   └── session.ts       ← Cookies de sesión firmadas con HMAC
│   ├── routes/
│   │   ├── auth/            ← Login / logout
│   │   ├── cursos/          ← Lista de cursos y alumnos
│   │   ├── observaciones/   ← Wizard de carga + historial
│   │   ├── admin/status/    ← Estado de la conexión Moodle
│   │   └── api/             ← Endpoints JSON para fetch del cliente
│   ├── app.css              ← Tailwind v4 + componentes base
│   ├── app.html             ← Shell HTML con PWA manifest
│   ├── app.d.ts             ← Tipos de SvelteKit (App.Locals)
│   └── hooks.server.ts      ← Init DB + middleware de sesión
├── scripts/
│   └── seed.ts              ← Crear docente de prueba
├── .env.example
├── svelte.config.js
├── vite.config.ts
└── drizzle.config.ts
```

---

## Deploy en Nuthost (cPanel + Node.js)

### 1. Build local

```bash
npm run build
```

Esto genera la carpeta `build/` con el servidor Node.js.

### 2. Subir archivos al servidor

Subir por FTP o Git (recomendado):
- Todo el proyecto **excepto** `node_modules/` y `.env`
- La carpeta `build/` es lo más importante junto con `package.json`

### 3. Configurar Node.js en cPanel

1. cPanel → **Web Applications** (o "Setup Node.js App")
2. Crear nueva aplicación:
   - **Node.js version**: 20.x o superior
   - **Application root**: la carpeta del proyecto (ej: `legajo`)
   - **Application URL**: el dominio o subdominio
   - **Application startup file**: `build/index.js`
3. Guardar

### 4. Instalar dependencias en el servidor

Desde la terminal de cPanel (o SSH):
```bash
cd ~/legajo
npm install --omit=dev
```

### 5. Configurar variables de entorno

En cPanel → **Web Applications** → tu app → **Environment variables**:

```
MOODLE_URL=https://aulavirtual.pds.edu.ar
MOODLE_TOKEN=tu_token_real
DATABASE_URL=mysql://cpanelusuario_dbuser:contraseña@localhost:3306/cpanelusuario_legajo
SESSION_SECRET=tu_secreto_largo_aqui
NODE_ENV=production
```

**Importante**: En Nuthost, el host MySQL en producción es `localhost` (misma máquina). El usuario y la base de datos tienen el prefijo de tu cuenta de cPanel.

### 6. Correr seed en producción (primera vez)

Desde SSH:
```bash
cd ~/legajo
node --env-file=.env --import tsx/esm scripts/seed.ts
```

O instalar `tsx` globalmente:
```bash
npm install -g tsx
tsx --env-file=.env scripts/seed.ts
```

### 7. Reiniciar la aplicación

En cPanel → Web Applications → tu app → **Restart**

La app estará disponible en tu dominio. Las tablas se crean automáticamente en el primer request.

---

## Seguridad

- El `MOODLE_TOKEN` vive solo en `.env` y en `process.env`. Nunca se envía al cliente.
- Las cookies de sesión son `httpOnly`, `sameSite: lax`, y `secure: true` en producción.
- La firma de sesión usa HMAC-SHA256 con tiempo constante para prevenir timing attacks.
- Para rotar el token de Moodle: cambiar `MOODLE_TOKEN` en el entorno y reiniciar.
- Para rotar el secreto de sesión: cambiar `SESSION_SECRET` — todos los usuarios deberán re-loguearse.

---

## Roadmap

### Fase 2 (próximas semanas)
- [ ] Login con usuario y contraseña de Moodle (POST `/login/token.php`)
- [ ] PWA: service worker + caché offline básico
- [ ] Filtros por nombre en historial (no solo por ID)
- [ ] Panel de resumen por alumno

### Fase 3 (producción)
- [ ] Adapter para API REST v2 de Moodle (`/r.php/api/rest/v2`)
- [ ] Panel de familias (read-only)
- [ ] Exportar historial a PDF o CSV
- [ ] Escritura en Moodle (si los permisos del token lo permiten)

---

## Troubleshooting

**"MOODLE_TOKEN no está configurada"**  
→ Verificar que el archivo `.env` existe y tiene la variable. En producción, verificar las env vars en cPanel.

**"El token no tiene permisos para esta función"**  
→ Ir a `/admin/status` para ver qué funciones faltan. Habilitarlas en Moodle → Legajo API → Funciones.

**"No se pudo conectar con Moodle"**  
→ Verificar que `MOODLE_URL` no tiene slash final y que el servidor Moodle está accesible.

**La app no arranca en cPanel**  
→ Verificar que el startup file apunta a `build/index.js`. Revisar los logs en cPanel → Logs.

**Las tablas no se crean**  
→ Verificar que `DATABASE_URL` es correcta y que el usuario MySQL tiene permisos de `CREATE TABLE`.

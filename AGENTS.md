# AGENTS.md — Guía para agentes de código (Codex, Claude, etc.)

Leé este archivo COMPLETO antes de tocar nada. Resume cómo se trabaja en Legajo,
cómo se despliega en el hosting y cómo se cambia la base de datos sin romper
producción. Si algo de acá contradice lo que ves en el código, frená y preguntá.

---

## 1. Qué es Legajo

App web del **Instituto Puertas del Sol (Nivel Medio)**, en producción en
`https://app.pds.edu.ar`. La usan docentes, preceptoría, dirección, el gabinete
psicopedagógico y (a futuro) familias. Maneja **datos sensibles de menores**:
observaciones, faltas, amonestaciones, actas, sociogramas, casos del gabinete.
Un error de permisos acá es grave (Ley 26.061, Ley 25.326).

Módulos principales: observaciones, cursos (desde Moodle), preceptoría (faltas,
amonestaciones, reincorporaciones, actas, legajo del alumno), institucional
(efemérides, salidas con autorizaciones), agrupamientos (sociograma por
nominación, grupos, roles, ubicación inclusiva, tutoría), plano del aula
(`/aula`), gabinete psicopedagógico (`/gabinete`, alerta temprana, casos,
estadísticas, informes), modo pizarra (`/pizarra`), administración (`/admin`).

Todo el texto de la interfaz está en **español rioplatense** (voseo: "elegí",
"tocá"). Mantenelo así.

## 2. Stack

- **SvelteKit 2 + Svelte 5 con runes** (`$state`, `$derived`, `$effect`, `$props`).
  No uses la sintaxis vieja (`export let`, `$:`, stores para estado local).
- **adapter-node**: el build sale en `build/`.
- **Vite 8** (usa rolldown; **no hay esbuild** instalado).
- **Tailwind 4** (clases utilitarias; existen clases propias `card`, `btn-primary`,
  `form-input`, `form-label` en `src/app.css`).
- **Drizzle ORM 0.43 + mysql2** sobre **MariaDB/MySQL** del hosting.
- **Moodle Web Services** como fuente de cursos y alumnos (`src/lib/server/services/cursos.ts`).
  Un alumno se identifica por su **id de Moodle** (`alumno_moodle_id`).
- TypeScript, zod, bcryptjs (PIN), xlsx, pdfkit.

Estructura relevante:

```
src/lib/server/db/schema.ts        ← FUENTE DE VERDAD del esquema
src/lib/server/db/index.ts         ← conexión (pool mysql2, drizzle mode 'default')
src/lib/server/services/*.ts       ← lógica de negocio y consultas (authz.ts = permisos)
src/lib/server/agrupamientos/*.ts  ← algoritmos puros (grafo, emparejar, analizar…)
src/lib/server/gabinete/*.ts       ← alerta temprana, guía, acceso
src/lib/gabinete/categorias.ts     ← datos compartidos con el cliente (no van en $lib/server)
src/lib/components/                ← componentes Svelte
src/routes/                        ← páginas (+page.server.ts = load + actions)
drizzle/NNNN_*.sql + meta/_journal.json ← migraciones
scripts/                           ← migrate.mjs, seed.ts, reset-pin.mjs
build/                             ← SALIDA DEL BUILD, VERSIONADA EN GIT (ver §4)
app.cjs / app.js                   ← entradas para Passenger (cargan dotenv + build/index.js)
```

## 3. Entorno local (Windows)

- El repo vive en `C:\Users\poulk\OneDrive\Escritorio\moodlewebservices\legajo`.
- Comandos de validación (correlos SIEMPRE antes de entregar):
  - `npm run check` → svelte-check. **Hay una línea de base de 16 errores
    preexistentes** (tipado de columnas `date` en salidas, efemérides, actas,
    faltas, amonestaciones, reincorporaciones, export, bulk/observations,
    observaciones/historial). Tu cambio **no puede sumar errores nuevos**: si el
    total pasa de 16, es tuyo.
  - `npm run build` → tiene que terminar con `✔ done`.
- **No hay base de datos local garantizada** y **no hay suite de tests**. No
  intentes levantar la app contra la base de producción. Validá con `check` +
  `build`, y la lógica pura (algoritmos) con scripts chicos aparte.
- `.env` local NO se commitea (está en `.gitignore`). Nunca imprimas su
  contenido ni el de `DATABASE_URL` (tiene la contraseña).

## 4. Deploy al hosting (Nuthost, cPanel + Node.js/Passenger)

**Vos no tenés acceso al servidor.** Los comandos de servidor y de phpMyAdmin
los corre el usuario: tu trabajo es dejarle los pasos exactos, en orden.

### Cómo está montado

- Hosting **Nuthost** con cPanel. La app corre con **Phusion Passenger**
  ("Setup Node.js App" / "Web Applications" del cPanel).
- Carpeta de la app en el servidor: `/home7/roodjhvw/public_html/app.pds.edu.ar`
  (usuario de cPanel `roodjhvw`). Es un clon de este repo (`origin` = GitHub
  `pablokaegi/legajo`, rama **`main`**).
- **No hay CI/CD ni build en el servidor**: la carpeta `build/` se genera en local
  y **se commitea**. El servidor solo hace `git pull`.
- Las variables de entorno (`DATABASE_URL`, `MOODLE_URL`, `MOODLE_TOKEN`,
  `SESSION_SECRET`, `NODE_ENV`, `UPLOAD_DIR`, `BODY_SIZE_LIMIT`…) pueden estar en el
  `.env` del servidor y/o en las variables del panel de cPanel. **El `.env` del
  servidor tiene que tener finales de línea LF** (con CRLF los valores quedan con
  un `\r` pegado y fallan, por ejemplo el token de Moodle).
- `BODY_SIZE_LIMIT=15728640` (15 MB, para fotos). `UPLOAD_DIR=/home7/roodjhvw/uploads`
  (fuera de `public_html`).

### Procedimiento de deploy (siempre igual)

1. En local: cambios en `src/` (y migración si corresponde, ver §5).
2. `npm run check` (≤ 16 errores) y `npm run build` (`✔ done`).
3. Commit de **`src/` + `build/` + `drizzle/`** juntos, en `main`. Mensaje en
   español que explique el qué y el porqué. Si el cambio necesita migración,
   empezá el mensaje con `REQUIERE la migración NNNN`.
4. `git push origin main` (nunca `--force`).
5. Pasale al usuario, en este orden:
   1. el SQL de la migración (si hay) para phpMyAdmin — ver §5;
   2. el deploy:
      ```bash
      cd /home7/roodjhvw/public_html/app.pds.edu.ar && git pull && pkill -u roodjhvw -f index.js
      ```
      `pkill` mata el proceso; **Passenger lo vuelve a levantar con la primera
      visita**. El primer request después del reinicio puede dar un 500
      pasajero: recargar.
6. Verificación sin login: el identificador de build publicado tiene que ser
   igual al local:
   - local: `build/client/_app/version.json`
   - servidor: `https://app.pds.edu.ar/_app/version.json`

Si cambiaste `dependencies` en `package.json`, el usuario además tiene que correr
en el servidor `npm install --omit=dev` (en la carpeta de la app) **antes** del
`pkill`. Evitá agregar dependencias: preguntá primero.

Nunca: editar archivos directamente en el servidor, subir `.env`, hacer
`git push --force`, ni dejar `build/` desactualizado respecto de `src/`.

## 5. Base de datos y migraciones (LEER ENTERO)

### Dónde está

- MariaDB/MySQL del mismo hosting (host `localhost` desde la app).
- **Base de producción: `roodjhvw_legajo_db`.** En phpMyAdmin hay otras bases
  (`roodjhvw_agrupamientos`, `roodjhvw_aulago`) que **no son de Legajo**: no las
  toques aunque el nombre parezca relacionado.
- Para confirmar en qué base están las tablas:
  ```sql
  SELECT TABLE_SCHEMA, TABLE_NAME FROM information_schema.TABLES
  WHERE TABLE_NAME IN ('usuarios','sessions','agrupamiento_sesiones');
  ```

### Cómo se aplica un cambio de esquema

La producción fue sincronizada **a mano en phpMyAdmin** y NO está bajo control
de `__drizzle_migrations`. Por eso:

- **Prohibido** correr `npm run db:push` o `npm run db:migrate` contra producción.
  (`scripts/migrate.mjs` aborta si detecta una base existente; no uses `--force`.)
- Todo cambio de esquema sigue estos pasos:
  1. Cambiar `src/lib/server/db/schema.ts`.
  2. Crear `drizzle/NNNN_nombre.sql` con el número siguiente (la última es la que
     figure en `drizzle/meta/_journal.json`; hoy `0008`). El SQL tiene que ser
     **idempotente y aditivo**:
     - `CREATE TABLE IF NOT EXISTS …`
     - `ALTER TABLE … ADD COLUMN IF NOT EXISTS …` (sintaxis MariaDB)
     - `CREATE INDEX IF NOT EXISTS …`
     - columnas nuevas **NULL o con DEFAULT**, para no romper filas existentes.
  3. Registrar la entrada en `drizzle/meta/_journal.json` (`idx` y `tag`
     correlativos, `when` mayor que el anterior).
  4. Actualizar la tabla de `drizzle/README.md`.
  5. Darle al usuario el SQL **limpio para pegar en phpMyAdmin**:
     - sin las líneas `--> statement-breakpoint` (en MySQL `-->` no es un
       comentario válido y da error de sintaxis);
     - indicando que **primero seleccione la base `roodjhvw_legajo_db`**;
     - "MySQL ha devuelto un conjunto de valores vacío" = salió bien para
       `ALTER`/`CREATE`.
  6. Darle una consulta de verificación contra `information_schema.COLUMNS` /
     `TABLES` que confirme lo creado **en esa base**.
  7. **Recién después** el deploy (§4).

**El orden importa:** `db.select().from(tabla)` de Drizzle lista TODAS las
columnas de `schema.ts`. Si se despliega código con una columna nueva antes de
correr el `ALTER`, toda consulta a esa tabla falla con "Unknown column" (500).

- Nunca edites una migración ya publicada. Nunca `DROP`, `RENAME`, `MODIFY` que
  pierda datos, ni `TRUNCATE`, sin un plan explícito aprobado por el usuario y
  un **backup previo** (phpMyAdmin → Exportar de esas tablas).
- Ningún cambio de datos masivo (`UPDATE`/`DELETE` sin `WHERE` acotado). Si hace
  falta tocar datos, primero un `SELECT` con el mismo `WHERE` para que el
  usuario vea cuántas filas afecta.

### Trampas conocidas de Drizzle + MySQL en este repo

- **Fechas:** `date('x')` (modo por defecto) devuelve **objetos `Date`** en
  runtime aunque el código los trate como `'YYYY-MM-DD'`. Para columnas nuevas
  que se usan como fecha simple, usá `date('x', { mode: 'string' })`. No cambies
  el modo de columnas existentes sin revisar todos sus usos (por eso hay
  errores de tipos preexistentes en otros módulos).
- `boolean()` = `tinyint(1)`. `timestamp()` devuelve `Date`.
- **JSON en columnas `text`** (`grupos_json`, `categorias_json`, `bancos_json`,
  `prediccion_json`…): siempre `JSON.parse` dentro de `try/catch` y validando la
  forma (una fila corrupta no puede tirar una página).
- Inserts: el id se obtiene con `Number((result as { insertId: number }).insertId)`.
- Hay índices únicos (por ejemplo un voto por alumno y sesión): manejá
  `ER_DUP_ENTRY` (puede venir en `err.code` o en `err.cause.code`).

## 6. Seguridad y permisos (no negociable)

- Roles: `admin`, `directivo`, `preceptor`, `docente`, `gabinete`, `padre`
  (tabla `roles`). Helpers en `src/lib/server/services/authz.ts`
  (`esStaff`, `esPreceptorODirectivo`, `esDirectivoOAdmin`, `esGabineteOAdmin`,
  `veTodasLasSesiones`, `puedeVerAlumno`…). Los roles se leen en cada request.
- **Las form actions de SvelteKit NO ejecutan los `load` del layout.** Cada `load`
  y **cada action** tiene que verificar permisos por su cuenta. Usá los
  guardianes existentes: `exigirStaff`, `exigirSesion(usuario, id, 'ver'|'gestionar')`
  (`lib/server/agrupamientos/acceso.ts`), `exigirGabinete`
  (`lib/server/gabinete/acceso.ts`).
- **Autorización por objeto:** al borrar/editar por id, filtrá también por el
  padre (por ejemplo `WHERE id = ? AND sesion_id = ?`). Si no, hay IDOR.
- **No confíes en el formulario:** ids de alumnos, nombres, roles, montos… se
  validan contra datos del servidor (por ejemplo el padrón del curso que viene
  de Moodle). Los nombres se toman del padrón, no del form.
- Datos del **gabinete**: solo rol `gabinete` y `admin` (ni dirección ni docentes;
  los docentes pueden **derivar** pero no ver casos). El informe para familias
  excluye categorías urgentes y notas internas.
- **Rutas públicas** sin sesión: solo `/votar/[token]` y `/autorizar/[token]`
  (lista en `src/routes/+layout.server.ts`). No agregues otras sin pedirlo.
- **Modo pizarra** (`/pizarra`) es una pantalla pública del aula: solo nombres,
  grupos, roles y plano. Nunca casos, faltas, notas ni datos del sociograma.
- Acciones sensibles → auditar con `registrarAccion` (`services/audit.ts`). Nunca
  loguees PIN, tokens ni `DATABASE_URL`.
- PIN: bcrypt, no se pueden recuperar. Cuentas y cambio de PIN: `/admin/usuarios`
  o `scripts/reset-pin.mjs` (genera un `UPDATE` para phpMyAdmin).
- Encabezado `Permissions-Policy` en `src/hooks.server.ts`: micrófono habilitado
  solo para la propia app (lo usa el semáforo de ruido). No lo abras más.

## 7. Convenciones de código

- Seguí el estilo del archivo que estás tocando (nombres en español, comentarios
  breves que explican el porqué, misma densidad).
- La lógica va en `lib/server/services` o en módulos puros; las rutas quedan finas.
- El código de cliente **no puede importar `$lib/server/...`** (salvo `import type`).
  Datos compartidos van en `$lib/...` fuera de `server`.
- No agregues dependencias ni cambies versiones sin preguntar.
- Cambios chicos y enfocados; no reformatees archivos enteros.

## 8. Antes de decir "listo"

- [ ] `npm run check` sin errores nuevos (línea de base: 16).
- [ ] `npm run build` → `✔ done`.
- [ ] Permisos verificados en cada `load` y cada action nuevos.
- [ ] Si tocaste el esquema: migración idempotente + `_journal.json` +
      `drizzle/README.md` + SQL limpio para phpMyAdmin + consulta de verificación.
- [ ] Commit de `src/` + `build/` (+ `drizzle/`) y push a `main`.
- [ ] Le dejaste al usuario los pasos exactos y en orden (SQL → verificación →
      `git pull` + `pkill` → chequeo de `version.json`).
- [ ] Le dijiste con honestidad qué NO pudiste probar (por ejemplo, pantallas
      que requieren login).

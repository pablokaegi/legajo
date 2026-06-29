# Migraciones de base de datos

La **fuente de verdad del esquema** es `src/lib/server/db/schema.ts`. Las migraciones
de esta carpeta materializan ese esquema en SQL y son lo que se aplica en un deploy.

## Estado de las migraciones

| Archivo | Crea / cambia |
|---------|---------------|
| `0000_loving_sway` | `usuarios` (como `docentes`), `observaciones`, `cache_cursos`, `sync_logs` |
| `0001_usuarios_roles_sesiones` | rename `docentes`→`usuarios`, `roles`, `vinculos_familia`, `sessions` |
| `0002_registros` | `faltas`, `amonestaciones`, `reincorporaciones`, `actas` (+ tablas hijas), `logs_acciones`, `jobs` |
| `0003_obs_nullable` | afloja `actitud/tarea_completa/participacion` a NULL |
| `0004_agrupamientos` | `agrupamiento_sesiones`, `agrupamiento_votos`, `agrupamiento_grupos` |
| `0005_efemerides_salidas` | `efemerides`, `salidas`, `salidas_autorizaciones` |

`0002`–`0005` son **idempotentes** (`CREATE TABLE IF NOT EXISTS`): seguras de
re-aplicar. `0000`/`0001` NO lo son (crean/renombran desde cero) y solo deben
correr sobre una base vacía.

## Cómo provisionar una base NUEVA

1. Crear la base MySQL vacía y poner `DATABASE_URL` en `.env`.
2. `npm run db:migrate` → aplica `0000`→`0005` en orden y deja todo creado.
3. `npm run db:seed` (opcional) para usuarios iniciales.

## Base de producción EXISTENTE

La producción actual fue sincronizada **a mano** (SQL pegado en phpMyAdmin), así que
NO está registrada en `__drizzle_migrations`. **No corras `npm run db:migrate` sobre
ella**: el script lo detecta y aborta (el historial `0000`/`0001` no es idempotente y
la dejaría a medias). Ya está al día con el esquema.

En boot, `initDb` se saltea en producción (`SKIP_DB_INIT=1` / `NODE_ENV=production`),
así que nunca se migra automáticamente.

## Regla de oro

Al cambiar `schema.ts`, agregá una migración nueva **idempotente** (`IF NOT EXISTS` /
`ADD COLUMN` con guarda) y registrala en `meta/_journal.json` con el `idx`/`tag`
correlativos. No edites una migración ya publicada (cambia su hash y rompe entornos
que ya la aplicaron).

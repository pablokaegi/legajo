import {
  mysqlTable,
  int,
  varchar,
  boolean,
  timestamp,
  text,
  tinyint
} from 'drizzle-orm/mysql-core';

// ─── Docentes ─────────────────────────────────────────────────────────────────
// Los docentes tienen cuenta en Moodle. En Fase 2 el login se delega a Moodle
// (ver src/lib/server/services/auth.ts para el punto de extensión).
export const docentes = mysqlTable('docentes', {
  id: int('id').primaryKey().autoincrement(),
  moodleUserId: int('moodle_user_id').notNull(),
  nombre: varchar('nombre', { length: 100 }).notNull(),
  email: varchar('email', { length: 200 }).notNull().unique(),
  pinHash: varchar('pin_hash', { length: 255 }).notNull(),
  activo: boolean('activo').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// ─── Observaciones ────────────────────────────────────────────────────────────
// alumnoMoodleId / cursoMoodleId son referencias externas a Moodle.
// Moodle es la fuente de verdad de alumnos y cursos; acá guardamos el ID y
// el nombre en el momento del registro para no depender de Moodle en lectura.
export const observaciones = mysqlTable('observaciones', {
  id: int('id').primaryKey().autoincrement(),
  docenteId: int('docente_id').notNull().references(() => docentes.id),
  alumnoMoodleId: int('alumno_moodle_id').notNull(),
  alumnoNombre: varchar('alumno_nombre', { length: 200 }).notNull(),
  cursoMoodleId: int('curso_moodle_id').notNull(),
  cursoNombre: varchar('curso_nombre', { length: 200 }).notNull(),
  actitud: tinyint('actitud').notNull(),         // 1–5
  tareaCompleta: boolean('tarea_completa').notNull(),
  participacion: tinyint('participacion').notNull(), // 1–5
  observacionTexto: varchar('observacion_texto', { length: 500 }),
  fecha: varchar('fecha', { length: 10 }).notNull(), // YYYY-MM-DD
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// ─── Logs de sincronización ───────────────────────────────────────────────────
export const syncLogs = mysqlTable('sync_logs', {
  id: int('id').primaryKey().autoincrement(),
  tipo: varchar('tipo', { length: 50 }).notNull(),
  status: varchar('status', { length: 20 }).notNull(), // 'ok' | 'error'
  mensaje: varchar('mensaje', { length: 500 }).notNull(),
  payloadJson: text('payload_json'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// ─── Caché de cursos ──────────────────────────────────────────────────────────
// TTL manejado por la lógica de negocio (cachedAt + 1h).
// Evita llamadas repetidas a Moodle en cada carga de página.
export const cacheCursos = mysqlTable('cache_cursos', {
  moodleId: int('moodle_id').primaryKey(),
  nombre: varchar('nombre', { length: 200 }).notNull(),
  shortname: varchar('shortname', { length: 100 }).notNull(),
  dataJson: text('data_json').notNull(),
  cachedAt: timestamp('cached_at').defaultNow().notNull()
});

export type Docente = typeof docentes.$inferSelect;
export type NuevoDocente = typeof docentes.$inferInsert;
export type Observacion = typeof observaciones.$inferSelect;
export type NuevaObservacion = typeof observaciones.$inferInsert;
export type SyncLog = typeof syncLogs.$inferSelect;

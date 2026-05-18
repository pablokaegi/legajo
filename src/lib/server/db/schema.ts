import {
  mysqlTable,
  int,
  varchar,
  boolean,
  timestamp,
  text,
  tinyint,
  index,
  uniqueIndex
} from 'drizzle-orm/mysql-core';

// ─── Usuarios ─────────────────────────────────────────────────────────────────
// Antes "docentes". Ahora unificamos a un único concepto de "usuario" que puede
// tener uno o más roles (docente, preceptor, directivo, padre).
export const usuarios = mysqlTable('usuarios', {
  id: int('id').primaryKey().autoincrement(),
  // moodleUserId es opcional: los padres no tienen cuenta Moodle.
  moodleUserId: int('moodle_user_id'),
  nombre: varchar('nombre', { length: 100 }).notNull(),
  email: varchar('email', { length: 200 }).notNull().unique(),
  telefono: varchar('telefono', { length: 30 }),
  pinHash: varchar('pin_hash', { length: 255 }).notNull(),
  activo: boolean('activo').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// ─── Roles ────────────────────────────────────────────────────────────────────
// Un usuario tiene N filas en `roles`. `scope` permite acotar el rol
// (ej. preceptor SOLO del curso 42 → scope = 'curso:42').
// Si scope es NULL, el rol aplica a toda la institución.
export const roles = mysqlTable('roles', {
  id: int('id').primaryKey().autoincrement(),
  usuarioId: int('usuario_id').notNull().references(() => usuarios.id),
  rol: varchar('rol', { length: 20 }).notNull(),
  // 'docente' | 'preceptor' | 'directivo' | 'padre'
  scope: varchar('scope', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull()
}, (t) => ({
  idxUsuario: index('idx_roles_usuario').on(t.usuarioId),
  uqRol: uniqueIndex('uq_roles_usuario_rol_scope').on(t.usuarioId, t.rol, t.scope)
}));

// ─── Vínculos de familia ──────────────────────────────────────────────────────
// Padre/madre/tutor ←→ alumno (referenciado por su moodleUserId).
// `verificado` lo activa un directivo o preceptor; sin verificación, el padre
// no puede ver datos del alumno (ver authz.ts).
export const vinculosFamilia = mysqlTable('vinculos_familia', {
  id: int('id').primaryKey().autoincrement(),
  padreId: int('padre_id').notNull().references(() => usuarios.id),
  alumnoMoodleId: int('alumno_moodle_id').notNull(),
  parentesco: varchar('parentesco', { length: 30 }),
  verificado: boolean('verificado').notNull().default(false),
  verificadoPor: int('verificado_por').references(() => usuarios.id),
  verificadoAt: timestamp('verificado_at'),
  createdAt: timestamp('created_at').defaultNow().notNull()
}, (t) => ({
  idxPadre: index('idx_vinc_padre').on(t.padreId),
  idxAlumno: index('idx_vinc_alumno').on(t.alumnoMoodleId),
  uqVinculo: uniqueIndex('uq_vinc_padre_alumno').on(t.padreId, t.alumnoMoodleId)
}));

// ─── Sesiones ─────────────────────────────────────────────────────────────────
// Sesiones revocables. La cookie del cliente NO contiene datos del usuario,
// solo el id de sesión firmado con HMAC. Cada request carga la sesión de DB.
export const sessions = mysqlTable('sessions', {
  id: varchar('id', { length: 64 }).primaryKey(), // 32 bytes hex
  usuarioId: int('usuario_id').notNull().references(() => usuarios.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  revokedAt: timestamp('revoked_at'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: varchar('user_agent', { length: 255 })
}, (t) => ({
  idxUsuario: index('idx_sessions_usuario').on(t.usuarioId),
  idxExpires: index('idx_sessions_expires').on(t.expiresAt)
}));

// ─── Observaciones ────────────────────────────────────────────────────────────
export const observaciones = mysqlTable('observaciones', {
  id: int('id').primaryKey().autoincrement(),
  usuarioId: int('usuario_id').notNull().references(() => usuarios.id),
  alumnoMoodleId: int('alumno_moodle_id').notNull(),
  alumnoNombre: varchar('alumno_nombre', { length: 200 }).notNull(),
  cursoMoodleId: int('curso_moodle_id').notNull(),
  cursoNombre: varchar('curso_nombre', { length: 200 }).notNull(),
  actitud: tinyint('actitud').notNull(),
  tareaCompleta: boolean('tarea_completa').notNull(),
  participacion: tinyint('participacion').notNull(),
  observacionTexto: varchar('observacion_texto', { length: 500 }),
  fecha: varchar('fecha', { length: 10 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
}, (t) => ({
  idxAlumno: index('idx_obs_alumno').on(t.alumnoMoodleId, t.fecha),
  idxCurso: index('idx_obs_curso').on(t.cursoMoodleId, t.fecha),
  idxUsuario: index('idx_obs_usuario').on(t.usuarioId, t.fecha)
}));

// ─── Logs de sincronización ───────────────────────────────────────────────────
export const syncLogs = mysqlTable('sync_logs', {
  id: int('id').primaryKey().autoincrement(),
  tipo: varchar('tipo', { length: 50 }).notNull(),
  status: varchar('status', { length: 20 }).notNull(),
  mensaje: varchar('mensaje', { length: 500 }).notNull(),
  payloadJson: text('payload_json'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// ─── Caché de cursos ──────────────────────────────────────────────────────────
export const cacheCursos = mysqlTable('cache_cursos', {
  moodleId: int('moodle_id').primaryKey(),
  nombre: varchar('nombre', { length: 200 }).notNull(),
  shortname: varchar('shortname', { length: 100 }).notNull(),
  dataJson: text('data_json').notNull(),
  cachedAt: timestamp('cached_at').defaultNow().notNull()
});

// ─── Tipos ────────────────────────────────────────────────────────────────────
export type Usuario = typeof usuarios.$inferSelect;
export type NuevoUsuario = typeof usuarios.$inferInsert;
export type Rol = typeof roles.$inferSelect;
export type NuevoRol = typeof roles.$inferInsert;
export type VinculoFamilia = typeof vinculosFamilia.$inferSelect;
export type Sesion = typeof sessions.$inferSelect;
export type Observacion = typeof observaciones.$inferSelect;
export type NuevaObservacion = typeof observaciones.$inferInsert;
export type SyncLog = typeof syncLogs.$inferSelect;

export type RolNombre = 'docente' | 'preceptor' | 'directivo' | 'padre';

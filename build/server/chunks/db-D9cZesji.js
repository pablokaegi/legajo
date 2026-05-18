import { _ as __exportAll } from './chunk-BBx_TEkp.js';
import { b as private_env } from './shared-server-9-2j12mp.js';
import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import { mysqlTable, timestamp, boolean, varchar, int, index, uniqueIndex, text, tinyint } from 'drizzle-orm/mysql-core';
import { resolve } from 'node:path';

//#region src/lib/server/db/schema.ts
var schema_exports = /* @__PURE__ */ __exportAll({
	cacheCursos: () => cacheCursos,
	observaciones: () => observaciones,
	roles: () => roles,
	sessions: () => sessions,
	syncLogs: () => syncLogs,
	usuarios: () => usuarios,
	vinculosFamilia: () => vinculosFamilia
});
var usuarios = mysqlTable("usuarios", {
	id: int("id").primaryKey().autoincrement(),
	moodleUserId: int("moodle_user_id"),
	nombre: varchar("nombre", { length: 100 }).notNull(),
	email: varchar("email", { length: 200 }).notNull().unique(),
	telefono: varchar("telefono", { length: 30 }),
	pinHash: varchar("pin_hash", { length: 255 }).notNull(),
	activo: boolean("activo").notNull().default(true),
	createdAt: timestamp("created_at").defaultNow().notNull()
});
var roles = mysqlTable("roles", {
	id: int("id").primaryKey().autoincrement(),
	usuarioId: int("usuario_id").notNull().references(() => usuarios.id),
	rol: varchar("rol", { length: 20 }).notNull(),
	scope: varchar("scope", { length: 50 }),
	createdAt: timestamp("created_at").defaultNow().notNull()
}, (t) => ({
	idxUsuario: index("idx_roles_usuario").on(t.usuarioId),
	uqRol: uniqueIndex("uq_roles_usuario_rol_scope").on(t.usuarioId, t.rol, t.scope)
}));
var vinculosFamilia = mysqlTable("vinculos_familia", {
	id: int("id").primaryKey().autoincrement(),
	padreId: int("padre_id").notNull().references(() => usuarios.id),
	alumnoMoodleId: int("alumno_moodle_id").notNull(),
	parentesco: varchar("parentesco", { length: 30 }),
	verificado: boolean("verificado").notNull().default(false),
	verificadoPor: int("verificado_por").references(() => usuarios.id),
	verificadoAt: timestamp("verificado_at"),
	createdAt: timestamp("created_at").defaultNow().notNull()
}, (t) => ({
	idxPadre: index("idx_vinc_padre").on(t.padreId),
	idxAlumno: index("idx_vinc_alumno").on(t.alumnoMoodleId),
	uqVinculo: uniqueIndex("uq_vinc_padre_alumno").on(t.padreId, t.alumnoMoodleId)
}));
var sessions = mysqlTable("sessions", {
	id: varchar("id", { length: 64 }).primaryKey(),
	usuarioId: int("usuario_id").notNull().references(() => usuarios.id),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	revokedAt: timestamp("revoked_at"),
	ipAddress: varchar("ip_address", { length: 45 }),
	userAgent: varchar("user_agent", { length: 255 })
}, (t) => ({
	idxUsuario: index("idx_sessions_usuario").on(t.usuarioId),
	idxExpires: index("idx_sessions_expires").on(t.expiresAt)
}));
var observaciones = mysqlTable("observaciones", {
	id: int("id").primaryKey().autoincrement(),
	usuarioId: int("usuario_id").notNull().references(() => usuarios.id),
	alumnoMoodleId: int("alumno_moodle_id").notNull(),
	alumnoNombre: varchar("alumno_nombre", { length: 200 }).notNull(),
	cursoMoodleId: int("curso_moodle_id").notNull(),
	cursoNombre: varchar("curso_nombre", { length: 200 }).notNull(),
	actitud: tinyint("actitud").notNull(),
	tareaCompleta: boolean("tarea_completa").notNull(),
	participacion: tinyint("participacion").notNull(),
	observacionTexto: varchar("observacion_texto", { length: 500 }),
	fecha: varchar("fecha", { length: 10 }).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull()
}, (t) => ({
	idxAlumno: index("idx_obs_alumno").on(t.alumnoMoodleId, t.fecha),
	idxCurso: index("idx_obs_curso").on(t.cursoMoodleId, t.fecha),
	idxUsuario: index("idx_obs_usuario").on(t.usuarioId, t.fecha)
}));
var syncLogs = mysqlTable("sync_logs", {
	id: int("id").primaryKey().autoincrement(),
	tipo: varchar("tipo", { length: 50 }).notNull(),
	status: varchar("status", { length: 20 }).notNull(),
	mensaje: varchar("mensaje", { length: 500 }).notNull(),
	payloadJson: text("payload_json"),
	createdAt: timestamp("created_at").defaultNow().notNull()
});
var cacheCursos = mysqlTable("cache_cursos", {
	moodleId: int("moodle_id").primaryKey(),
	nombre: varchar("nombre", { length: 200 }).notNull(),
	shortname: varchar("shortname", { length: 100 }).notNull(),
	dataJson: text("data_json").notNull(),
	cachedAt: timestamp("cached_at").defaultNow().notNull()
});
//#endregion
//#region src/lib/server/db/index.ts
if (!private_env.DATABASE_URL) throw new Error("[legajo] DATABASE_URL no está configurada. Revisá tu archivo .env");
var pool = mysql.createPool({
	uri: private_env.DATABASE_URL,
	waitForConnections: true,
	connectionLimit: private_env.DB_POOL_SIZE ? parseInt(private_env.DB_POOL_SIZE, 10) : 10,
	enableKeepAlive: true
});
var db = drizzle(pool, {
	schema: schema_exports,
	mode: "default"
});
async function tableExists(name) {
	const conn = await pool.getConnection();
	try {
		const [rows] = await conn.query(`SELECT COUNT(*) as cnt FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?`, [name]);
		return Number(rows[0]?.cnt) > 0;
	} finally {
		conn.release();
	}
}
async function seedJournalForExistingTables() {
	if (await tableExists("__drizzle_migrations")) return;
	const hasDocentes = await tableExists("docentes");
	const hasUsuarios = await tableExists("usuarios");
	if (!hasDocentes && !hasUsuarios) return;
	const conn = await pool.getConnection();
	try {
		await conn.query(`
      CREATE TABLE __drizzle_migrations (
        id bigint unsigned AUTO_INCREMENT PRIMARY KEY,
        hash text NOT NULL,
        created_at bigint
      )
    `);
		await conn.query(`INSERT INTO __drizzle_migrations (hash, created_at) VALUES ('d41d8cd98f00b204e9800998ecf8427e_0000_loving_sway', ?)`, [Date.now()]);
		if (hasUsuarios) {
			await conn.query(`INSERT INTO __drizzle_migrations (hash, created_at) VALUES ('0001_usuarios_roles_sesiones', ?)`, [Date.now()]);
			console.log("[legajo] Journal creado — migraciones 0000 y 0001 marcadas como aplicadas");
		} else console.log("[legajo] Journal creado — 0000 marcada, 0001 se ejecutara ahora");
	} finally {
		conn.release();
	}
}
async function initDb() {
	try {
		await seedJournalForExistingTables();
	} catch (err) {
		console.error("[legajo] Error al preparar journal:", err instanceof Error ? err.message : String(err));
	}
	const MAX_RETRIES = 3;
	const RETRY_DELAY_MS = 2e3;
	for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) try {
		await migrate(db, { migrationsFolder: resolve("drizzle") });
		console.log("[legajo] Base de datos inicializada correctamente");
		return;
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		if (msg.includes("already exists")) {
			console.log("[legajo] Tablas ya existen, migracion omitida");
			return;
		}
		console.error(`[legajo] Intento ${attempt}/${MAX_RETRIES}: ${msg}`);
		if (attempt < MAX_RETRIES) await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
	}
	console.error("[legajo] No se pudo inicializar la base de datos.");
}

export { sessions as a, cacheCursos as c, db as d, initDb as i, observaciones as o, roles as r, syncLogs as s, usuarios as u, vinculosFamilia as v };
//# sourceMappingURL=db-D9cZesji.js.map

import { _ as __exportAll } from './chunk-BBx_TEkp.js';
import { p as private_env } from './shared-server-asDUS7ug.js';
import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import { mysqlTable, timestamp, boolean, varchar, int, index, uniqueIndex, text, bigint, date, tinyint } from 'drizzle-orm/mysql-core';
import { resolve } from 'node:path';

//#region src/lib/server/db/schema.ts
var schema_exports = /* @__PURE__ */ __exportAll({
	actas: () => actas,
	actasAlumnos: () => actasAlumnos,
	actasAsistentes: () => actasAsistentes,
	actasTareas: () => actasTareas,
	actasVersiones: () => actasVersiones,
	agrupamientoGrupos: () => agrupamientoGrupos,
	agrupamientoSesiones: () => agrupamientoSesiones,
	agrupamientoVotos: () => agrupamientoVotos,
	amonestaciones: () => amonestaciones,
	cacheCursos: () => cacheCursos,
	efemerides: () => efemerides,
	faltas: () => faltas,
	faltasAlumnos: () => faltasAlumnos,
	jobs: () => jobs,
	logsAcciones: () => logsAcciones,
	observaciones: () => observaciones,
	reincorporaciones: () => reincorporaciones,
	roles: () => roles,
	salidas: () => salidas,
	salidasAutorizaciones: () => salidasAutorizaciones,
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
	actitud: tinyint("actitud"),
	tareaCompleta: boolean("tarea_completa"),
	participacion: tinyint("participacion"),
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
var faltas = mysqlTable("faltas", {
	id: bigint("id", {
		mode: "number",
		unsigned: true
	}).primaryKey().autoincrement(),
	fecha: date("fecha").notNull(),
	tipo: varchar("tipo", { length: 32 }).notNull(),
	descripcion: text("descripcion"),
	preceptorId: int("preceptor_id").notNull().references(() => usuarios.id),
	cursoMoodleId: int("curso_moodle_id").notNull(),
	cursoNombre: varchar("curso_nombre", { length: 200 }).notNull(),
	estado: varchar("estado", { length: 16 }).notNull().default("registrada"),
	visibilidad: varchar("visibilidad", { length: 16 }).notNull().default("publica"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull()
}, (t) => ({
	idxPreceptor: index("idx_faltas_preceptor").on(t.preceptorId),
	idxCurso: index("idx_faltas_curso").on(t.cursoMoodleId, t.fecha)
}));
var faltasAlumnos = mysqlTable("faltas_alumnos", {
	faltaId: bigint("falta_id", {
		mode: "number",
		unsigned: true
	}).notNull().references(() => faltas.id, { onDelete: "cascade" }),
	alumnoMoodleId: int("alumno_moodle_id").notNull(),
	alumnoNombre: varchar("alumno_nombre", { length: 200 }).notNull(),
	nota: text("nota"),
	createdAt: timestamp("created_at").defaultNow().notNull()
}, (t) => ({ idxAlumno: index("idx_faltas_alumnos_alumno").on(t.alumnoMoodleId, t.faltaId) }));
var amonestaciones = mysqlTable("amonestaciones", {
	id: bigint("id", {
		mode: "number",
		unsigned: true
	}).primaryKey().autoincrement(),
	alumnoMoodleId: int("alumno_moodle_id").notNull(),
	alumnoNombre: varchar("alumno_nombre", { length: 200 }).notNull(),
	fecha: date("fecha").notNull(),
	gravedad: varchar("gravedad", { length: 8 }).notNull(),
	motivo: text("motivo").notNull(),
	preceptorId: int("preceptor_id").notNull().references(() => usuarios.id),
	accionesSugeridas: text("acciones_sugeridas"),
	cursoMoodleId: int("curso_moodle_id"),
	cursoNombre: varchar("curso_nombre", { length: 200 }),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull()
}, (t) => ({
	idxAlumno: index("idx_amon_alumno").on(t.alumnoMoodleId, t.fecha),
	idxPreceptor: index("idx_amon_preceptor").on(t.preceptorId)
}));
var reincorporaciones = mysqlTable("reincorporaciones", {
	id: bigint("id", {
		mode: "number",
		unsigned: true
	}).primaryKey().autoincrement(),
	alumnoMoodleId: int("alumno_moodle_id").notNull(),
	alumnoNombre: varchar("alumno_nombre", { length: 200 }).notNull(),
	fechaReincorporacion: date("fecha_reincorporacion").notNull(),
	preceptorId: int("preceptor_id").notNull().references(() => usuarios.id),
	observaciones: text("observaciones"),
	documentoUrl: varchar("documento_url", { length: 500 }),
	linkedFaltaId: bigint("linked_falta_id", {
		mode: "number",
		unsigned: true
	}).references(() => faltas.id, { onDelete: "set null" }),
	createdAt: timestamp("created_at").defaultNow().notNull()
}, (t) => ({ idxAlumno: index("idx_reinc_alumno").on(t.alumnoMoodleId) }));
var actas = mysqlTable("actas", {
	id: bigint("id", {
		mode: "number",
		unsigned: true
	}).primaryKey().autoincrement(),
	fecha: date("fecha").notNull(),
	titulo: varchar("titulo", { length: 300 }).notNull(),
	resumen: text("resumen").notNull(),
	acuerdos: text("acuerdos"),
	estado: varchar("estado", { length: 16 }).notNull().default("abierta"),
	createdBy: int("created_by").notNull().references(() => usuarios.id),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var actasAsistentes = mysqlTable("actas_asistentes", {
	actaId: bigint("acta_id", {
		mode: "number",
		unsigned: true
	}).notNull().references(() => actas.id, { onDelete: "cascade" }),
	usuarioId: int("usuario_id").notNull().references(() => usuarios.id),
	rol: varchar("rol", { length: 32 })
});
var actasAlumnos = mysqlTable("actas_alumnos", {
	actaId: bigint("acta_id", {
		mode: "number",
		unsigned: true
	}).notNull().references(() => actas.id, { onDelete: "cascade" }),
	alumnoMoodleId: int("alumno_moodle_id").notNull(),
	alumnoNombre: varchar("alumno_nombre", { length: 200 }).notNull()
});
var actasTareas = mysqlTable("actas_tareas", {
	id: bigint("id", {
		mode: "number",
		unsigned: true
	}).primaryKey().autoincrement(),
	actaId: bigint("acta_id", {
		mode: "number",
		unsigned: true
	}).notNull().references(() => actas.id, { onDelete: "cascade" }),
	descripcion: text("descripcion").notNull(),
	responsableId: int("responsable_id").references(() => usuarios.id, { onDelete: "set null" }),
	dueDate: date("due_date"),
	estado: varchar("estado", { length: 16 }).notNull().default("pendiente"),
	createdAt: timestamp("created_at").defaultNow().notNull()
});
var actasVersiones = mysqlTable("actas_versiones", {
	id: bigint("id", {
		mode: "number",
		unsigned: true
	}).primaryKey().autoincrement(),
	actaId: bigint("acta_id", {
		mode: "number",
		unsigned: true
	}).notNull().references(() => actas.id, { onDelete: "cascade" }),
	resumen: text("resumen").notNull(),
	acuerdos: text("acuerdos"),
	editadoPor: int("editado_por").notNull().references(() => usuarios.id),
	createdAt: timestamp("created_at").defaultNow().notNull()
}, (t) => ({ idxVersiones: index("idx_actas_versiones").on(t.actaId, t.createdAt) }));
var logsAcciones = mysqlTable("logs_acciones", {
	id: bigint("id", {
		mode: "number",
		unsigned: true
	}).primaryKey().autoincrement(),
	usuarioId: int("usuario_id").references(() => usuarios.id),
	accion: varchar("accion", { length: 50 }).notNull(),
	tablaDestino: varchar("tabla_destino", { length: 50 }),
	idDestino: varchar("id_destino", { length: 50 }),
	payloadJson: text("payload_json"),
	ip: varchar("ip", { length: 45 }),
	createdAt: timestamp("created_at").defaultNow().notNull()
}, (t) => ({
	idxUsuario: index("idx_logs_usuario").on(t.usuarioId, t.createdAt),
	idxTabla: index("idx_logs_tabla").on(t.tablaDestino, t.idDestino)
}));
var jobs = mysqlTable("jobs", {
	id: varchar("id", { length: 36 }).primaryKey(),
	tipo: varchar("tipo", { length: 50 }).notNull(),
	estado: varchar("estado", { length: 16 }).notNull().default("pendiente"),
	payloadJson: text("payload_json"),
	resultadoJson: text("resultado_json"),
	usuarioId: int("usuario_id").references(() => usuarios.id),
	total: int("total").notNull().default(0),
	procesados: int("procesados").notNull().default(0),
	errores: int("errores").notNull().default(0),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull()
}, (t) => ({ idxUsuario: index("idx_jobs_usuario").on(t.usuarioId, t.createdAt) }));
var efemerides = mysqlTable("efemerides", {
	id: int("id").primaryKey().autoincrement(),
	fecha: date("fecha").notNull(),
	titulo: varchar("titulo", { length: 200 }).notNull(),
	descripcion: text("descripcion"),
	cursosResponsables: text("cursos_responsables"),
	docenteResponsable: varchar("docente_responsable", { length: 200 }),
	estado: varchar("estado", { length: 20 }).notNull().default("planificado"),
	notas: text("notas"),
	createdBy: int("created_by").notNull().references(() => usuarios.id),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull()
}, (t) => ({ idxFecha: index("idx_efem_fecha").on(t.fecha) }));
var salidas = mysqlTable("salidas", {
	id: int("id").primaryKey().autoincrement(),
	titulo: varchar("titulo", { length: 200 }).notNull(),
	fecha: date("fecha").notNull(),
	destino: varchar("destino", { length: 300 }).notNull(),
	descripcion: text("descripcion"),
	responsableNombre: varchar("responsable_nombre", { length: 200 }).notNull(),
	cursoNombre: varchar("curso_nombre", { length: 200 }).notNull(),
	cantidadAlumnos: int("cantidad_alumnos"),
	costoEstimado: varchar("costo_estimado", { length: 50 }),
	estado: varchar("estado", { length: 20 }).notNull().default("borrador"),
	uploadToken: varchar("upload_token", { length: 36 }).notNull(),
	documentoPath: varchar("documento_path", { length: 500 }),
	documentoNombre: varchar("documento_nombre", { length: 200 }),
	documentoSubidoAt: timestamp("documento_subido_at"),
	notas: text("notas"),
	createdBy: int("created_by").notNull().references(() => usuarios.id),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull()
}, (t) => ({
	idxFecha: index("idx_salidas_fecha").on(t.fecha),
	uqToken: uniqueIndex("uq_salidas_token").on(t.uploadToken)
}));
var salidasAutorizaciones = mysqlTable("salidas_autorizaciones", {
	id: int("id").primaryKey().autoincrement(),
	salidaId: int("salida_id").notNull().references(() => salidas.id, { onDelete: "cascade" }),
	alumnoMoodleId: int("alumno_moodle_id").notNull(),
	alumnoNombre: varchar("alumno_nombre", { length: 200 }).notNull(),
	uploadToken: varchar("upload_token", { length: 36 }).notNull(),
	documentoPath: varchar("documento_path", { length: 500 }),
	documentoNombre: varchar("documento_nombre", { length: 200 }),
	documentoSubidoAt: timestamp("documento_subido_at"),
	createdAt: timestamp("created_at").defaultNow().notNull()
}, (t) => ({
	idxSalida: index("idx_salidaaut_salida").on(t.salidaId),
	idxAlumno: index("idx_salidaaut_alumno").on(t.alumnoMoodleId),
	uqToken: uniqueIndex("uq_salidaaut_token").on(t.uploadToken),
	uqSalidaAl: uniqueIndex("uq_salidaaut_salida_alumno").on(t.salidaId, t.alumnoMoodleId)
}));
var agrupamientoSesiones = mysqlTable("agrupamiento_sesiones", {
	id: int("id").primaryKey().autoincrement(),
	cursoMoodleId: int("curso_moodle_id").notNull(),
	cursoNombre: varchar("curso_nombre", { length: 200 }).notNull(),
	titulo: varchar("titulo", { length: 200 }).notNull(),
	fecha: date("fecha").notNull(),
	estado: varchar("estado", { length: 16 }).notNull().default("abierta"),
	cantidadEvaluar: int("cantidad_evaluar").notNull().default(5),
	votoToken: varchar("voto_token", { length: 36 }),
	notas: text("notas"),
	createdBy: int("created_by").notNull().references(() => usuarios.id),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull()
}, (t) => ({
	idxCurso: index("idx_agrup_sesion_curso").on(t.cursoMoodleId),
	idxFecha: index("idx_agrup_sesion_fecha").on(t.fecha),
	uqToken: uniqueIndex("uq_agrup_sesion_token").on(t.votoToken)
}));
var agrupamientoVotos = mysqlTable("agrupamiento_votos", {
	id: int("id").primaryKey().autoincrement(),
	sesionId: int("sesion_id").notNull().references(() => agrupamientoSesiones.id, { onDelete: "cascade" }),
	votanteMoodleId: int("votante_moodle_id").notNull(),
	votanteNombre: varchar("votante_nombre", { length: 200 }).notNull(),
	calificaciones: text("calificaciones").notNull(),
	bloqueadoMoodleId: int("bloqueado_moodle_id"),
	bloqueadoNombre: varchar("bloqueado_nombre", { length: 200 }),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull()
}, (t) => ({
	idxSesion: index("idx_agrup_voto_sesion").on(t.sesionId),
	uqVotante: uniqueIndex("uq_agrup_voto_sesion_votante").on(t.sesionId, t.votanteMoodleId)
}));
var agrupamientoGrupos = mysqlTable("agrupamiento_grupos", {
	id: int("id").primaryKey().autoincrement(),
	sesionId: int("sesion_id").notNull().references(() => agrupamientoSesiones.id, { onDelete: "cascade" }),
	nombre: varchar("nombre", { length: 200 }).notNull(),
	modo: varchar("modo", { length: 20 }).notNull(),
	gruposJson: text("grupos_json").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull()
}, (t) => ({ idxSesion: index("idx_agrup_grupos_sesion").on(t.sesionId) }));
//#endregion
//#region src/lib/server/db/index.ts
if (!private_env.DATABASE_URL) throw new Error("[legajo] DATABASE_URL no está configurada. Revisá tu archivo .env");
var db = drizzle(mysql.createPool({
	uri: private_env.DATABASE_URL,
	waitForConnections: true,
	connectionLimit: private_env.DB_POOL_SIZE ? parseInt(private_env.DB_POOL_SIZE, 10) : 10,
	enableKeepAlive: true
}), {
	schema: schema_exports,
	mode: "default"
});
async function initDb() {
	if (private_env.SKIP_DB_INIT === "1" || private_env.NODE_ENV === "production") {
		console.log("[legajo] initDb omitido (SKIP_DB_INIT=1 o NODE_ENV=production)");
		return;
	}
	try {
		await migrate(db, { migrationsFolder: resolve("drizzle") });
		console.log("[legajo] Base de datos inicializada correctamente");
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		if (msg.includes("already exists")) {
			console.log("[legajo] Tablas ya existen, migracion omitida");
			return;
		}
		console.error("[legajo] Error al inicializar DB:", msg);
	}
}

export { amonestaciones as a, syncLogs as b, cacheCursos as c, db as d, efemerides as e, faltasAlumnos as f, agrupamientoSesiones as g, agrupamientoVotos as h, initDb as i, agrupamientoGrupos as j, salidasAutorizaciones as k, salidas as l, actas as m, actasAsistentes as n, observaciones as o, actasAlumnos as p, actasTareas as q, roles as r, sessions as s, actasVersiones as t, usuarios as u, vinculosFamilia as v, logsAcciones as w, faltas as x, reincorporaciones as y, jobs as z };
//# sourceMappingURL=db-BwfbdrtT.js.map

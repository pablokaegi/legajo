import { d as db, n as logsAcciones } from './db-XKMgjins.js';

//#region src/lib/server/services/audit.ts
async function registrarAccion(params) {
	try {
		await db.insert(logsAcciones).values({
			usuarioId: params.usuarioId ?? null,
			accion: params.accion,
			tablaDestino: params.tablaDestino ?? null,
			idDestino: params.idDestino != null ? String(params.idDestino) : null,
			payloadJson: params.payload != null ? JSON.stringify(params.payload) : null,
			ip: params.ip ?? null
		});
	} catch (err) {
		console.error("[legajo] Error al registrar accion de auditoria:", err instanceof Error ? err.message : err);
	}
}
function ipDe(request) {
	return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? null;
}

export { ipDe as i, registrarAccion as r };
//# sourceMappingURL=audit-ptP7jPlB.js.map

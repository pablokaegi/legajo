import { r as registrarAccion } from './audit-Dz9I-BN1.js';
import { e as exigirGabinete } from './acceso-mvVGKflq.js';
import { n as normalizarPeriodo, e as estadisticasACsv, a as estadisticasGabinete } from './gabineteEstadisticas-B-7efXoI.js';
import './db-CLN6I8p_.js';
import './chunk-BBx_TEkp.js';
import './shared-server-asDUS7ug.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import './authz-BVdVv-6k.js';
import 'drizzle-orm';
import '@sveltejs/kit';
import './categorias-BK8Z_nGh.js';
import './guia-EGVtkUDu.js';

//#region src/routes/gabinete/estadisticas/csv/+server.ts
var GET = async ({ locals, url }) => {
	const usuarioId = await exigirGabinete(locals.usuario);
	const periodo = normalizarPeriodo(url.searchParams.get("desde"), url.searchParams.get("hasta"));
	const csv = estadisticasACsv(await estadisticasGabinete(periodo));
	await registrarAccion({
		usuarioId,
		accion: "gabinete.estadisticas.csv",
		payload: periodo
	});
	return new Response(csv, { headers: {
		"Content-Type": "text/csv; charset=utf-8",
		"Content-Disposition": `attachment; filename="gabinete_${periodo.desde}_${periodo.hasta}.csv"`,
		"Cache-Control": "no-store"
	} });
};

export { GET };
//# sourceMappingURL=_server.ts-BhgPXv2J.js.map

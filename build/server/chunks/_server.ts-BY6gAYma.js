import { e as exigirGabinete } from './acceso-B66Nug0v.js';
import { n as normalizarPeriodo, e as estadisticasACsv, a as estadisticasGabinete } from './gabineteEstadisticas-DbJ6MEAo.js';
import { r as registrarAccion } from './audit-DjKqoMaH.js';
import './authz-DQJuia-E.js';
import './db-D7hI4G6x.js';
import './index.js-D6_LEqEo.js';
import '@sveltejs/kit/internal';
import '@sveltejs/kit';
import '@sveltejs/kit/internal/server';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import './categorias-BW0OCDku.js';
import './guia-YkJkXwF5.js';

// src/routes/gabinete/estadisticas/csv/+server.ts
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
//# sourceMappingURL=_server.ts-BY6gAYma.js.map

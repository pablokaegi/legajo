import { h as head, e as escape_html, a as ensure_array_like, b as attr } from './dev-BsmPEhme.js';

//#region src/routes/admin/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const ROL_LABEL = {
			admin: "Administrador",
			directivo: "Director/a",
			preceptor: "Preceptor/a",
			docente: "Docente",
			padre: "Familia"
		};
		const accesos = [
			{
				href: "/admin/status",
				icon: "🔌",
				titulo: "Conexión a Moodle",
				desc: "Estado del web service y funciones habilitadas."
			},
			{
				href: "/admin/logs",
				icon: "📜",
				titulo: "Logs del sistema",
				desc: "Sincronización con Moodle y auditoría de acciones."
			},
			{
				href: "/admin/conectados",
				icon: "👥",
				titulo: "Últimos conectados",
				desc: "Sesiones recientes de los usuarios."
			}
		];
		head("1jef3w8", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Configuración — Legajo</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-4"><div class="grid grid-cols-3 gap-2"><div class="card text-center"><p class="text-2xl font-bold text-indigo-700">${escape_html(data.totalUsuarios)}</p> <p class="text-xs text-gray-500">Usuarios</p></div> <div class="card text-center"><p class="text-2xl font-bold text-green-600">${escape_html(data.usuariosActivos)}</p> <p class="text-xs text-gray-500">Activos</p></div> <div class="card text-center"><p class="text-2xl font-bold text-blue-600">${escape_html(data.sesionesActivas)}</p> <p class="text-xs text-gray-500">Sesiones activas</p></div></div> <div class="card space-y-2"><p class="text-sm font-semibold text-gray-800">Roles asignados</p> `);
		if (Object.keys(data.porRol).length === 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="text-sm text-gray-500">No hay roles asignados todavía.</p>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="space-y-1"><!--[-->`);
			const each_array = ensure_array_like(Object.entries(data.porRol));
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let [rol, cant] = each_array[$$index];
				$$renderer.push(`<div class="flex items-center justify-between text-sm"><span class="text-gray-700">${escape_html(ROL_LABEL[rol] ?? rol)}</span> <span class="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">${escape_html(cant)}</span></div>`);
			}
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]--></div> <div class="space-y-2"><!--[-->`);
		const each_array_1 = ensure_array_like(accesos);
		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let a = each_array_1[$$index_1];
			$$renderer.push(`<a${attr("href", a.href)} class="card block hover:border-indigo-300 transition-colors flex items-center gap-3"><span class="text-2xl flex-shrink-0">${escape_html(a.icon)}</span> <div class="min-w-0"><p class="text-sm font-semibold text-gray-800">${escape_html(a.titulo)}</p> <p class="text-xs text-gray-500">${escape_html(a.desc)}</p></div></a>`);
		}
		$$renderer.push(`<!--]--></div></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-Bmq1aDC4.js.map

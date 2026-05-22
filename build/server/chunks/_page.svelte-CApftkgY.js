import { h as head, e as escape_html, a as ensure_array_like, c as attr_class, s as stringify } from './dev-BsmPEhme.js';

//#region src/routes/admin/conectados/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		function fechaHora(d) {
			return new Date(d).toLocaleString("es-AR", {
				day: "2-digit",
				month: "2-digit",
				year: "2-digit",
				hour: "2-digit",
				minute: "2-digit"
			});
		}
		function dispositivo(ua) {
			if (!ua) return "Desconocido";
			if (/Android/i.test(ua)) return "Android";
			if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
			if (/Windows/i.test(ua)) return "Windows";
			if (/Macintosh|Mac OS/i.test(ua)) return "Mac";
			if (/Linux/i.test(ua)) return "Linux";
			return "Otro";
		}
		function iniciales(n) {
			return n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
		}
		head("132kqyw", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Últimos conectados — Configuración</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-3"><p class="text-xs text-gray-500">Últimas ${escape_html(data.conexiones.length)} sesiones iniciadas. Una sesión "activa" sigue
    vigente; "cerrada" venció o se cerró sesión.</p> `);
		if (data.conexiones.length === 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="card text-center py-8"><p class="text-gray-500 text-sm">No hay sesiones registradas.</p></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="space-y-2"><!--[-->`);
			const each_array = ensure_array_like(data.conexiones);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let c = each_array[$$index];
				$$renderer.push(`<div class="card flex items-center gap-3"><div class="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0">${escape_html(iniciales(c.nombre))}</div> <div class="flex-1 min-w-0"><p class="text-sm font-medium text-gray-900 truncate">${escape_html(c.nombre)}</p> <p class="text-xs text-gray-500 truncate">${escape_html(c.email)}</p> <p class="text-xs text-gray-400">🕒 ${escape_html(fechaHora(c.createdAt))} · 💻 ${escape_html(dispositivo(c.userAgent))}${escape_html(c.ip ? ` · ${c.ip}` : "")}</p></div> <span${attr_class(`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${stringify(c.activa ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}`)}>${escape_html(c.activa ? "Activa" : "Cerrada")}</span></div>`);
			}
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]--></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-CApftkgY.js.map

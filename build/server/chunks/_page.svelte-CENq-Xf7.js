import { h as head, e as escape_html, b as attr, a as ensure_array_like, c as attr_class, s as stringify, d as derived } from './dev-BsmPEhme.js';
import './client2-Ds2pOMTK.js';
import './internal-Bh7K86Ic.js';
import '@sveltejs/kit/internal';
import './chunk-BBx_TEkp.js';
import '@sveltejs/kit/internal/server';

//#region src/routes/admin/usuarios/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, form } = $$props;
		const ROL_LABEL = {
			admin: "Admin",
			directivo: "Dirección",
			preceptor: "Preceptoría",
			docente: "Docente",
			gabinete: "Gabinete psicopedagógico",
			padre: "Familia"
		};
		const PATRON_PIN = "\\d{6,8}";
		let abierto = null;
		let filtro = "";
		let lista = derived(() => (data.usuarios));
		head("11qi1t6", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Usuarios — Configuración</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-3">`);
		if (form?.error) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">${escape_html(form.error)}</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (form?.ok) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-3 py-2">${escape_html(form.ok)}</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="flex items-center gap-2"><input type="search"${attr("value", filtro)} placeholder="Buscar por nombre o email…" class="form-input text-sm flex-1"/> <button class="btn-primary text-sm">+ Nueva cuenta</button></div> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="space-y-2"><!--[-->`);
		const each_array_1 = ensure_array_like(lista());
		for (let $$index_3 = 0, $$length = each_array_1.length; $$index_3 < $$length; $$index_3++) {
			let u = each_array_1[$$index_3];
			$$renderer.push(`<div${attr_class(`card space-y-2 ${stringify(u.activo ? "" : "opacity-60")}`)}><div class="flex items-start justify-between gap-2"><div class="min-w-0"><p class="text-sm font-semibold text-gray-900 truncate">${escape_html(u.nombre)}${escape_html(u.id === data.yoId ? " (vos)" : "")}${escape_html(u.activo ? "" : " · desactivada")}</p> <p class="text-xs text-gray-500 truncate">${escape_html(u.email)}</p> <div class="flex flex-wrap gap-1 mt-1">`);
			const each_array_2 = ensure_array_like(u.roles);
			if (each_array_2.length !== 0) {
				$$renderer.push("<!--[-->");
				for (let $$index_1 = 0, $$length = each_array_2.length; $$index_1 < $$length; $$index_1++) {
					let r = each_array_2[$$index_1];
					$$renderer.push(`<span class="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">${escape_html(ROL_LABEL[r] ?? r)}</span>`);
				}
			} else {
				$$renderer.push("<!--[!-->");
				$$renderer.push(`<span class="text-[11px] text-gray-400">sin roles</span>`);
			}
			$$renderer.push(`<!--]--></div></div> <button class="text-xs text-indigo-600 hover:underline flex-shrink-0">${escape_html(abierto === u.id ? "Cerrar" : "Editar")}</button></div> `);
			if (abierto === u.id) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<form method="POST" action="?/roles" class="border-t border-gray-100 pt-2 space-y-2"><input type="hidden" name="usuarioId"${attr("value", u.id)}/> <div class="flex flex-wrap gap-3"><!--[-->`);
				const each_array_3 = ensure_array_like(data.rolesDisponibles);
				for (let $$index_2 = 0, $$length = each_array_3.length; $$index_2 < $$length; $$index_2++) {
					let r = each_array_3[$$index_2];
					$$renderer.push(`<label class="flex items-center gap-1.5 text-sm text-gray-700"><input type="checkbox" name="rol"${attr("value", r)}${attr("checked", u.roles.includes(r), true)}/> ${escape_html(ROL_LABEL[r] ?? r)}</label>`);
				}
				$$renderer.push(`<!--]--></div> <button type="submit" class="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 text-white">Guardar roles</button></form> <form method="POST" action="?/pin" class="flex items-end gap-2"><input type="hidden" name="usuarioId"${attr("value", u.id)}/> <div class="flex-1"><label class="form-label"${attr("for", `pin-${stringify(u.id)}`)}>Nuevo PIN</label> <input${attr("id", `pin-${stringify(u.id)}`)} name="pin" type="password" inputmode="numeric"${attr("pattern", PATRON_PIN)} autocomplete="new-password" class="form-input text-sm" required=""/></div> <button type="submit" class="text-xs px-3 py-2 rounded-lg bg-gray-100 hover:bg-indigo-100">Cambiar PIN</button></form> `);
				if (u.id !== data.yoId) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<form method="POST" action="?/activo"><input type="hidden" name="usuarioId"${attr("value", u.id)}/> <input type="hidden" name="activo"${attr("value", u.activo ? "0" : "1")}/> <button type="submit"${attr_class(`text-xs ${stringify(u.activo ? "text-red-500" : "text-green-700")} hover:underline`)}>${escape_html(u.activo ? "Desactivar cuenta" : "Reactivar cuenta")}</button></form>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]-->`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]--></div></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-CENq-Xf7.js.map

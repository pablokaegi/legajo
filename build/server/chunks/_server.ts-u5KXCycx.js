import { b as esDirectivo } from './authz-qx5pRuic.js';
import { o as obtenerHistorialFiltrado } from './observaciones-D_z9t4Xc.js';
import { json } from '@sveltejs/kit';
import PDFDocument from 'pdfkit';
import * as XLSX from 'xlsx';
import './db-C42nfPYx.js';
import './chunk-BBx_TEkp.js';
import './shared-server-9-2j12mp.js';
import 'mysql2/promise';
import 'drizzle-orm/mysql2';
import 'drizzle-orm/mysql2/migrator';
import 'drizzle-orm/mysql-core';
import 'node:path';
import 'drizzle-orm';
import 'zod';

//#region src/lib/server/services/export.ts
var ACTITUD_LABELS = [
	"",
	"Muy bajo",
	"Bajo",
	"Regular",
	"Bueno",
	"Excelente"
];
function generarPDF(observaciones, titulo) {
	return new Promise((resolve, reject) => {
		const doc = new PDFDocument({
			margin: 40,
			size: "A4"
		});
		const chunks = [];
		doc.on("data", (chunk) => chunks.push(chunk));
		doc.on("end", () => resolve(Buffer.concat(chunks)));
		doc.on("error", reject);
		doc.fontSize(18).font("Helvetica-Bold").text(titulo, { align: "center" });
		doc.moveDown(.5);
		doc.fontSize(9).font("Helvetica").text(`Generado: ${(/* @__PURE__ */ new Date()).toLocaleDateString("es-AR")} — ${observaciones.length} registro/s`);
		doc.moveDown(1);
		const colX = [
			40,
			140,
			310,
			380,
			430,
			490
		];
		const headers = [
			"Fecha",
			"Alumno",
			"Curso",
			"Actitud",
			"Tarea",
			"Part."
		];
		doc.fontSize(8).font("Helvetica-Bold");
		headers.forEach((h, i) => doc.text(h, colX[i], doc.y));
		const tableTop = doc.y - 14;
		doc.moveTo(40, tableTop + 12).lineTo(570, tableTop + 12).stroke();
		let y = tableTop + 18;
		doc.font("Helvetica");
		for (const obs of observaciones) {
			if (y > 750) {
				doc.addPage();
				y = 40;
			}
			doc.fontSize(8).fillColor("#000000");
			doc.text(obs.fecha, colX[0], y, { width: 95 });
			doc.text(obs.alumnoNombre, colX[1], y, { width: 165 });
			doc.text(obs.cursoNombre, colX[2], y, { width: 65 });
			doc.text(`${obs.actitud}/5`, colX[3], y, { width: 45 });
			doc.text(obs.tareaCompleta ? "Si" : "No", colX[4], y, { width: 55 });
			doc.text(`${obs.participacion}/5`, colX[5], y, { width: 45 });
			y += 14;
			if (obs.observacionTexto) {
				doc.fontSize(7).fillColor("#555555");
				doc.text(`"${obs.observacionTexto}"`, colX[0], y, { width: 500 });
				doc.fillColor("#000000");
				y += 14;
			}
			y += 4;
		}
		doc.fontSize(7).fillColor("#999999");
		doc.text("Legajo — Sistema de observaciones docentes", 40, 780, { align: "center" });
		doc.end();
	});
}
function generarXLS(observaciones) {
	const rows = observaciones.map((obs) => ({
		Fecha: obs.fecha,
		Alumno: obs.alumnoNombre,
		Curso: obs.cursoNombre,
		Actitud: `${obs.actitud}/5 (${ACTITUD_LABELS[obs.actitud] ?? ""})`,
		"Tarea completa": obs.tareaCompleta ? "Si" : "No",
		Participacion: `${obs.participacion}/5`,
		Observacion: obs.observacionTexto ?? ""
	}));
	const ws = XLSX.utils.json_to_sheet(rows);
	ws["!cols"] = [
		{ wch: 12 },
		{ wch: 30 },
		{ wch: 25 },
		{ wch: 18 },
		{ wch: 15 },
		{ wch: 15 },
		{ wch: 50 }
	];
	const wb = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(wb, ws, "Observaciones");
	return XLSX.write(wb, {
		bookType: "xlsx",
		type: "buffer"
	});
}
function generarInformeAlumno(observaciones, docenteNombre) {
	const alumno = observaciones[0]?.alumnoNombre ?? "Alumno";
	const lines = [];
	lines.push(`INFORME DE OBSERVACIONES`);
	lines.push(`Alumno: ${alumno}`);
	lines.push(`Docente: ${docenteNombre}`);
	lines.push(`Fecha del informe: ${(/* @__PURE__ */ new Date()).toLocaleDateString("es-AR")}`);
	lines.push(`Total de registros: ${observaciones.length}`);
	lines.push("─".repeat(35));
	for (const obs of observaciones) {
		lines.push("");
		lines.push(`Fecha: ${obs.fecha} — ${obs.cursoNombre}`);
		lines.push(`Actitud: ${obs.actitud}/5 (${ACTITUD_LABELS[obs.actitud] ?? ""})`);
		lines.push(`Participacion: ${obs.participacion}/5`);
		lines.push(`Tarea: ${obs.tareaCompleta ? "Completa" : "Incompleta"}`);
		if (obs.observacionTexto) lines.push(`Observacion: "${obs.observacionTexto}"`);
	}
	lines.push("");
	lines.push("─".repeat(35));
	lines.push("Informe generado desde Legajo");
	return lines.join("\n");
}
function generarLinkWhatsApp(texto) {
	return `https://wa.me/?text=${encodeURIComponent(texto)}`;
}
function generarLinkMail(asunto, cuerpo, destino) {
	const params = new URLSearchParams();
	params.set("subject", asunto);
	params.set("body", cuerpo);
	return `mailto:${""}?${params.toString()}`;
}
//#endregion
//#region src/routes/api/export/+server.ts
var GET = async ({ url, locals }) => {
	if (!locals.usuario) return json({ error: "No autorizado" }, { status: 401 });
	const formato = url.searchParams.get("formato") ?? "pdf";
	const alumno = url.searchParams.get("alumno")?.trim() || void 0;
	const curso = url.searchParams.get("curso")?.trim() || void 0;
	if (![
		"pdf",
		"xls",
		"whatsapp",
		"email"
	].includes(formato)) return json({ error: "Formato no soportado. Usar: pdf, xls, whatsapp, email" }, { status: 400 });
	const omitUsuarioFilter = await esDirectivo(locals.usuario.usuarioId);
	const { observaciones } = await obtenerHistorialFiltrado({
		usuarioId: locals.usuario.usuarioId,
		alumno,
		curso,
		limit: 500,
		offset: 0,
		omitUsuarioFilter
	});
	if (observaciones.length === 0) return json({ error: "No hay observaciones para exportar con los filtros seleccionados" }, { status: 404 });
	const nombreAlumno = observaciones[0]?.alumnoNombre ?? "alumno";
	const titulo = alumno ? `Observaciones — ${nombreAlumno}` : `Observaciones — ${locals.usuario.nombre}`;
	if (formato === "whatsapp" || formato === "email") {
		const texto = generarInformeAlumno(observaciones, locals.usuario.nombre);
		const asunto = `Informe de observaciones — ${nombreAlumno}`;
		if (formato === "whatsapp") return json({ url: generarLinkWhatsApp(texto) });
		return json({ url: generarLinkMail(asunto, texto) });
	}
	if (formato === "pdf") {
		const buffer = await generarPDF(observaciones, titulo);
		const filename = alumno ? `observaciones-${nombreAlumno.replace(/\s+/g, "-")}.pdf` : `observaciones-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.pdf`;
		return new Response(new Uint8Array(buffer), { headers: {
			"Content-Type": "application/pdf",
			"Content-Disposition": `attachment; filename="${filename}"`
		} });
	}
	if (formato === "xls") {
		const buffer = generarXLS(observaciones);
		const filename = alumno ? `observaciones-${nombreAlumno.replace(/\s+/g, "-")}.xlsx` : `observaciones-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.xlsx`;
		return new Response(new Uint8Array(buffer), { headers: {
			"Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			"Content-Disposition": `attachment; filename="${filename}"`
		} });
	}
	return json({ error: "Formato no implementado" }, { status: 400 });
};

export { GET };
//# sourceMappingURL=_server.ts-u5KXCycx.js.map

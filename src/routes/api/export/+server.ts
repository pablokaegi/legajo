import { json } from '@sveltejs/kit';
import { obtenerHistorialFiltrado } from '$lib/server/services/observaciones.js';
import { esDirectivo } from '$lib/server/services/authz.js';
import {
  generarPDF,
  generarXLS,
  generarInformeAlumno,
  generarLinkWhatsApp,
  generarLinkMail
} from '$lib/server/services/export.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
  if (!locals.usuario) {
    return json({ error: 'No autorizado' }, { status: 401 });
  }

  const formato = url.searchParams.get('formato') ?? 'pdf';
  const alumno = url.searchParams.get('alumno')?.trim() || undefined;
  const curso = url.searchParams.get('curso')?.trim() || undefined;

  if (!['pdf', 'xls', 'whatsapp', 'email'].includes(formato)) {
    return json({ error: 'Formato no soportado. Usar: pdf, xls, whatsapp, email' }, { status: 400 });
  }

  const omitUsuarioFilter = await esDirectivo(locals.usuario.usuarioId);

  const { observaciones } = await obtenerHistorialFiltrado({
    usuarioId: locals.usuario.usuarioId,
    alumno,
    curso,
    limit: 500,
    offset: 0,
    omitUsuarioFilter
  });

  if (observaciones.length === 0) {
    return json({ error: 'No hay observaciones para exportar con los filtros seleccionados' }, { status: 404 });
  }

  const nombreAlumno = observaciones[0]?.alumnoNombre ?? 'alumno';
  const titulo = alumno
    ? `Observaciones — ${nombreAlumno}`
    : `Observaciones — ${locals.usuario.nombre}`;

  if (formato === 'whatsapp' || formato === 'email') {
    const texto = generarInformeAlumno(observaciones, locals.usuario.nombre);
    const asunto = `Informe de observaciones — ${nombreAlumno}`;

    if (formato === 'whatsapp') {
      return json({ url: generarLinkWhatsApp(texto) });
    }

    return json({ url: generarLinkMail(asunto, texto) });
  }

  if (formato === 'pdf') {
    const buffer = await generarPDF(observaciones, titulo);
    const filename = alumno
      ? `observaciones-${nombreAlumno.replace(/\s+/g, '-')}.pdf`
      : `observaciones-${new Date().toISOString().split('T')[0]}.pdf`;
    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  }

  if (formato === 'xls') {
    const buffer = generarXLS(observaciones);
    const filename = alumno
      ? `observaciones-${nombreAlumno.replace(/\s+/g, '-')}.xlsx`
      : `observaciones-${new Date().toISOString().split('T')[0]}.xlsx`;
    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  }

  return json({ error: 'Formato no implementado' }, { status: 400 });
};

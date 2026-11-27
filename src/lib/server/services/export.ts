import PDFDocument from 'pdfkit';
import * as XLSX from 'xlsx';
import type { Observacion } from '../db/schema.js';

const ACTITUD_LABELS = ['', 'Muy bajo', 'Bajo', 'Regular', 'Bueno', 'Excelente'];

export function generarPDF(observaciones: Observacion[], titulo: string): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(18).font('Helvetica-Bold').text(titulo, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(9).font('Helvetica').text(`Generado: ${new Date().toLocaleDateString('es-AR')} — ${observaciones.length} registro/s`);
    doc.moveDown(1);

    const colX = [40, 140, 310, 380, 430, 490];
    const headers = ['Fecha', 'Alumno', 'Curso', 'Actitud', 'Tarea', 'Part.'];

    doc.fontSize(8).font('Helvetica-Bold');
    headers.forEach((h, i) => doc.text(h, colX[i], doc.y));
    const tableTop = doc.y - 14;
    doc.moveTo(40, tableTop + 12).lineTo(570, tableTop + 12).stroke();

    let y = tableTop + 18;

    doc.font('Helvetica');
    for (const obs of observaciones) {
      if (y > 750) {
        doc.addPage();
        y = 40;
      }

      doc.fontSize(8).fillColor('#000000');
      doc.text(obs.fecha, colX[0], y, { width: 95 });
      doc.text(obs.alumnoNombre, colX[1], y, { width: 165 });
      doc.text(obs.cursoNombre, colX[2], y, { width: 65 });
      doc.text(`${obs.actitud}/5`, colX[3], y, { width: 45 });
      doc.text(obs.tareaCompleta ? 'Si' : 'No', colX[4], y, { width: 55 });
      doc.text(`${obs.participacion}/5`, colX[5], y, { width: 45 });

      y += 14;

      if (obs.observacionTexto) {
        doc.fontSize(7).fillColor('#555555');
        doc.text(`"${obs.observacionTexto}"`, colX[0], y, { width: 500 });
        doc.fillColor('#000000');
        y += 14;
      }

      y += 4;
    }

    doc.fontSize(7).fillColor('#999999');
    doc.text('Legajo — Sistema de observaciones docentes', 40, 780, { align: 'center' });

    doc.end();
  });
}

export function generarXLS(observaciones: Observacion[]): Buffer {
  const rows = observaciones.map(obs => ({
    Fecha: obs.fecha,
    Alumno: obs.alumnoNombre,
    Curso: obs.cursoNombre,
    Actitud: `${obs.actitud}/5 (${ACTITUD_LABELS[obs.actitud] ?? ''})`,
    'Tarea completa': obs.tareaCompleta ? 'Si' : 'No',
    Participacion: `${obs.participacion}/5`,
    Observacion: obs.observacionTexto ?? ''
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 12 }, { wch: 30 }, { wch: 25 },
    { wch: 18 }, { wch: 15 }, { wch: 15 }, { wch: 50 }
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Observaciones');
  return XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' }) as Buffer;
}

export function generarInformeAlumno(observaciones: Observacion[], docenteNombre: string): string {
  const alumno = observaciones[0]?.alumnoNombre ?? 'Alumno';
  const lines: string[] = [];

  lines.push(`INFORME DE OBSERVACIONES`);
  lines.push(`Alumno: ${alumno}`);
  lines.push(`Docente: ${docenteNombre}`);
  lines.push(`Fecha del informe: ${new Date().toLocaleDateString('es-AR')}`);
  lines.push(`Total de registros: ${observaciones.length}`);
  lines.push('─'.repeat(35));

  for (const obs of observaciones) {
    lines.push('');
    lines.push(`Fecha: ${obs.fecha} — ${obs.cursoNombre}`);
    lines.push(`Actitud: ${obs.actitud}/5 (${ACTITUD_LABELS[obs.actitud] ?? ''})`);
    lines.push(`Participacion: ${obs.participacion}/5`);
    lines.push(`Tarea: ${obs.tareaCompleta ? 'Completa' : 'Incompleta'}`);
    if (obs.observacionTexto) {
      lines.push(`Observacion: "${obs.observacionTexto}"`);
    }
  }

  lines.push('');
  lines.push('─'.repeat(35));
  lines.push('Informe generado desde Legajo');
  return lines.join('\n');
}

export function generarLinkWhatsApp(texto: string): string {
  return `https://wa.me/?text=${encodeURIComponent(texto)}`;
}

export function generarLinkMail(asunto: string, cuerpo: string, destino?: string): string {
  const params = new URLSearchParams();
  if (destino) params.set('to', destino);
  params.set('subject', asunto);
  params.set('body', cuerpo);
  return `mailto:${destino ?? ''}?${params.toString()}`;
}

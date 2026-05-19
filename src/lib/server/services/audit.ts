import { db } from '../db/index.js';
import { logsAcciones } from '../db/schema.js';

export async function registrarAccion(params: {
  usuarioId?: number | null;
  accion: string;
  tablaDestino?: string;
  idDestino?: string | number;
  payload?: unknown;
  ip?: string | null;
}): Promise<void> {
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
    // No romper el request si falla el log de auditoría
    console.error('[legajo] Error al registrar accion de auditoria:', err instanceof Error ? err.message : err);
  }
}

export function ipDe(request: Request): string | null {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    null
  );
}

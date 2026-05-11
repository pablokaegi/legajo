import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { docentes } from '../db/schema.js';

export async function verifyPin(
  email: string,
  pin: string
): Promise<{ docenteId: number; email: string; nombre: string } | null> {
  const result = await db
    .select()
    .from(docentes)
    .where(eq(docentes.email, email))
    .limit(1);

  const docente = result[0];
  if (!docente || !docente.activo) return null;

  const valid = await bcrypt.compare(pin, docente.pinHash);
  if (!valid) return null;

  return {
    docenteId: docente.id,
    email: docente.email,
    nombre: docente.nombre
  };
}

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 12);
}

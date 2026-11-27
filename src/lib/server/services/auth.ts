import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { usuarios } from '../db/schema.js';

export interface AuthResult {
  usuarioId: number;
  email: string;
  nombre: string;
}

export async function verifyPin(email: string, pin: string): Promise<AuthResult | null> {
  const result = await db
    .select()
    .from(usuarios)
    .where(eq(usuarios.email, email))
    .limit(1);

  const usuario = result[0];
  if (!usuario || !usuario.activo) return null;

  const valid = await bcrypt.compare(pin, usuario.pinHash);
  if (!valid) return null;

  return {
    usuarioId: usuario.id,
    email: usuario.email,
    nombre: usuario.nombre
  };
}

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 12);
}

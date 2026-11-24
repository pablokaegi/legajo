import { d as db, u as usuarios } from './db-D7hI4G6x.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// src/lib/server/services/auth.ts
async function verifyPin(email, pin) {
	const usuario = (await db.select().from(usuarios).where(eq(usuarios.email, email)).limit(1))[0];
	if (!usuario || !usuario.activo) return null;
	if (!await bcrypt.compare(pin, usuario.pinHash)) return null;
	return {
		usuarioId: usuario.id,
		email: usuario.email,
		nombre: usuario.nombre
	};
}
async function hashPin(pin) {
	return bcrypt.hash(pin, 12);
}

export { hashPin as h, verifyPin as v };
//# sourceMappingURL=auth-5HTKZdvP.js.map

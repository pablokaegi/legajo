import { d as db, u as usuarios } from './db-DeyHlLbL.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

//#region src/lib/server/services/auth.ts
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
//# sourceMappingURL=auth-CIbo1M3X.js.map

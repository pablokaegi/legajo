import bcrypt from 'bcryptjs';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../src/lib/server/db/schema.js';
import { docentes } from '../src/lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

async function seed() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('ERROR: DATABASE_URL no está configurada');
    process.exit(1);
  }

  const pool = mysql.createPool({ uri: url, connectionLimit: 2 });
  const db = drizzle(pool, { schema, mode: 'default' });

  try {
    const existing = await db.select().from(docentes).where(eq(docentes.email, 'docente@pds.edu.ar')).limit(1);
    if (existing.length > 0) {
      console.log('Docente de prueba ya existe (docente@pds.edu.ar)');
      return;
    }

    const pinHash = await bcrypt.hash('123456', 12);
    await db.insert(docentes).values({
      moodleUserId: 1,
      nombre: 'Docente de Prueba',
      email: 'docente@pds.edu.ar',
      pinHash,
      activo: true
    });

    console.log('Docente de prueba creado');
    console.log('  Email: docente@pds.edu.ar');
    console.log('  PIN:   123456');
  } finally {
    await pool.end();
  }
}

seed().catch(err => {
  console.error('Error en seed:', err);
  process.exit(1);
});

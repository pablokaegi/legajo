import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import { env } from '$env/dynamic/private';
import * as schema from './schema.js';
import { resolve } from 'node:path';

if (!env.DATABASE_URL) {
  throw new Error('[legajo] DATABASE_URL no está configurada. Revisá tu archivo .env');
}

const pool = mysql.createPool({
  uri: env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: env.DB_POOL_SIZE ? parseInt(env.DB_POOL_SIZE, 10) : 10,
  enableKeepAlive: true
});

export const db = drizzle(pool, { schema, mode: 'default' });

export async function initDb(): Promise<void> {
  // En producción NUNCA migrar en boot. Las migraciones son un paso de deploy.
  // Para correrlas explícitamente: npm run db:migrate (script aparte).
  if (env.SKIP_DB_INIT === '1' || env.NODE_ENV === 'production') {
    console.log('[legajo] initDb omitido (SKIP_DB_INIT=1 o NODE_ENV=production)');
    return;
  }

  try {
    await migrate(db, { migrationsFolder: resolve('drizzle') });
    console.log('[legajo] Base de datos inicializada correctamente');
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('already exists')) {
      console.log('[legajo] Tablas ya existen, migracion omitida');
      return;
    }
    console.error('[legajo] Error al inicializar DB:', msg);
  }
}

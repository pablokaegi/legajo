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

async function tableExists(name: string): Promise<boolean> {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query<mysql.RowDataPacket[]>(
      `SELECT COUNT(*) as cnt FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?`,
      [name]
    );
    return Number(rows[0]?.cnt) > 0;
  } finally {
    conn.release();
  }
}

async function seedJournalForExistingTables(): Promise<void> {
  const hasJournal = await tableExists('__drizzle_migrations');
  if (hasJournal) return;

  const hasDocentes = await tableExists('docentes');
  const hasUsuarios = await tableExists('usuarios');

  // DB completamente vacia: migrate aplicara 0000 y 0001.
  if (!hasDocentes && !hasUsuarios) return;

  const conn = await pool.getConnection();
  try {
    await conn.query(`
      CREATE TABLE __drizzle_migrations (
        id bigint unsigned AUTO_INCREMENT PRIMARY KEY,
        hash text NOT NULL,
        created_at bigint
      )
    `);
    await conn.query(
      `INSERT INTO __drizzle_migrations (hash, created_at) VALUES ('d41d8cd98f00b204e9800998ecf8427e_0000_loving_sway', ?)`,
      [Date.now()]
    );
    if (hasUsuarios) {
      await conn.query(
        `INSERT INTO __drizzle_migrations (hash, created_at) VALUES ('0001_usuarios_roles_sesiones', ?)`,
        [Date.now()]
      );
      console.log('[legajo] Journal creado — migraciones 0000 y 0001 marcadas como aplicadas');
    } else {
      console.log('[legajo] Journal creado — 0000 marcada, 0001 se ejecutara ahora');
    }
  } finally {
    conn.release();
  }
}

export async function initDb(): Promise<void> {
  try {
    await seedJournalForExistingTables();
  } catch (err) {
    console.error('[legajo] Error al preparar journal:', err instanceof Error ? err.message : String(err));
  }

  const MAX_RETRIES = 3;
  const RETRY_DELAY_MS = 2000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await migrate(db, { migrationsFolder: resolve('drizzle') });
      console.log('[legajo] Base de datos inicializada correctamente');
      return;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('already exists')) {
        console.log('[legajo] Tablas ya existen, migracion omitida');
        return;
      }
      console.error(`[legajo] Intento ${attempt}/${MAX_RETRIES}: ${msg}`);
      if (attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
      }
    }
  }

  console.error('[legajo] No se pudo inicializar la base de datos.');
}

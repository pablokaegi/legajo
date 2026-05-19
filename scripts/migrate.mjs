// Aplica migraciones Drizzle de forma explícita (paso de deploy, NO de boot).
// Uso: npm run db:migrate
import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { migrate } from 'drizzle-orm/mysql2/migrator';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL no configurada');
  process.exit(1);
}

const pool = mysql.createPool({ uri: url, connectionLimit: 2 });
const db = drizzle(pool);

try {
  await migrate(db, { migrationsFolder: 'drizzle' });
  console.log('OK: migraciones aplicadas');
} catch (err) {
  console.error('FALLO migración:', err instanceof Error ? err.message : err);
  process.exit(1);
} finally {
  await pool.end();
}

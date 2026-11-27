// Aplica migraciones Drizzle de forma explícita (paso de deploy, NO de boot).
// Uso: npm run db:migrate
//
// GUARDA DE SEGURIDAD: si la base YA tiene tablas de la app pero no está bajo
// control de migraciones (__drizzle_migrations vacía/ausente), abortamos. El
// historial 0000/0001 no es idempotente (CREATE/RENAME desde cero); aplicarlo
// sobre una base ya poblada la dejaría a medias. Una base existente ya está
// sincronizada a mano: NO se migra. Sólo se migra una base nueva/vacía.
import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { migrate } from 'drizzle-orm/mysql2/migrator';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL no configurada');
  process.exit(1);
}

const forzar = process.argv.includes('--force');
const pool = mysql.createPool({ uri: url, connectionLimit: 2 });

try {
  // ¿La base ya tiene tablas de la app?
  const [appTables] = await pool.query(
    "SHOW TABLES LIKE 'usuarios'"
  );
  const tieneApp = appTables.length > 0;

  // ¿Está bajo control de migraciones?
  const [migTables] = await pool.query(
    "SHOW TABLES LIKE '__drizzle_migrations'"
  );
  let migRegistradas = 0;
  if (migTables.length > 0) {
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS n FROM `__drizzle_migrations`'
    );
    migRegistradas = rows[0]?.n ?? 0;
  }

  if (tieneApp && migRegistradas === 0 && !forzar) {
    console.error(
      '\n⛔ ABORTADO: la base ya tiene tablas de la app pero no está bajo control de migraciones.\n' +
      '   Una base existente ya está sincronizada a mano; correr migrate desde 0000\n' +
      '   (no idempotente) la dejaría a medias.\n\n' +
      '   • Base NUEVA/vacía: no debería tener la tabla `usuarios`. Verificá DATABASE_URL.\n' +
      '   • Base EXISTENTE: NO migres. Ya está al día.\n' +
      '   • Si SABÉS lo que hacés (p.ej. baseline manual): volvé a correr con --force.\n'
    );
    process.exitCode = 1;
  } else {
    const db = drizzle(pool);
    await migrate(db, { migrationsFolder: 'drizzle' });
    console.log('OK: migraciones aplicadas');
  }
} catch (err) {
  console.error('FALLO migración:', err instanceof Error ? err.message : err);
  process.exitCode = 1;
} finally {
  await pool.end();
}

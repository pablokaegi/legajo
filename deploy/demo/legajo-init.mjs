import { randomInt } from 'node:crypto';
import { readFile, rename, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const url = new URL(process.env.DATABASE_URL);
const curso = Number(process.env.MOODLE_AULA_CURSO_ID);
if (process.env.LEGAJO_DEMO_ALOJADA !== '1' || url.protocol !== 'mysql:' || url.hostname !== 'db' ||
    url.port !== '3306' || url.pathname !== '/legajo_demo' || url.username !== 'legajo_demo' ||
    !Number.isSafeInteger(curso) || curso < 2) {
  throw new Error('La inicialización requiere la base legajo_demo y el curso ficticio de Alere.');
}

const personas = [
  { email: 'admin@alere.example', nombre: 'Administración Alere', rol: 'admin' },
  { email: 'docente@alere.example', nombre: 'Docente de Ciencias', rol: 'docente' },
  { email: 'gabinete@alere.example', nombre: 'Gabinete de Ciencias', rol: 'gabinete' }
];
const archivo = '/var/legajo-demo/accesos-legajo.json';
const db = await mysql.createConnection(process.env.DATABASE_URL);
try {
  const [[control]] = await db.query("SELECT DATABASE() AS nombre, GET_LOCK('alere_demo_migracion', 180) AS bloqueo");
  if (control.nombre !== 'legajo_demo' || Number(control.bloqueo) !== 1) throw new Error('No se pudo reservar la base de la demo.');
  execFileSync(process.execPath, ['scripts/migrate.mjs'], { stdio: 'inherit' });

  let cuentas;
  try {
    cuentas = JSON.parse(await readFile(archivo, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    const [existentes] = await db.query('SELECT id FROM usuarios WHERE email IN (?)', [personas.map((p) => p.email)]);
    if (existentes.length) throw new Error('Recuperá el volumen de accesos de esta demo antes de reinicializar.');
    cuentas = personas.map(({ email }) => ({ email, pin: String(randomInt(10000000, 100000000)) }));
    await writeFile(archivo + '.nuevo', JSON.stringify(cuentas, null, 2), { mode: 0o600 });
    await rename(archivo + '.nuevo', archivo);
  }
  await db.beginTransaction();
  for (const persona of personas) {
    const registro = cuentas.find((c) => c.email === persona.email);
    if (!registro || !/^\d{8}$/.test(registro.pin)) throw new Error('Revisá el archivo privado de accesos de Legajo.');
    const [encontradas] = await db.execute('SELECT id FROM usuarios WHERE email = ? FOR UPDATE', [persona.email]);
    if (encontradas.length) continue;
    const [alta] = await db.execute('INSERT INTO usuarios (nombre, email, pin_hash) VALUES (?, ?, ?)',
      [persona.nombre, persona.email, await bcrypt.hash(registro.pin, 12)]);
    const scope = persona.rol === 'admin' ? null : 'curso:' + curso;
    await db.execute('INSERT INTO roles (usuario_id, rol, scope) VALUES (?, ?, ?)', [alta.insertId, persona.rol, scope]);
  }
  await db.commit();
  console.log('Base de Alere y cuentas de demostración listas.');
} catch (error) {
  await db.rollback();
  throw error;
} finally {
  await db.end();
}

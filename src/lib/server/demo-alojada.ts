type Entorno = Record<string, string | undefined>;

/** La demo comercial tiene una base y un campus propios. Se valida antes de crear el pool o enviar tokens. */
export function comprobarDemoAlojada(entorno: Entorno) {
  if (entorno.LEGAJO_DEMO_ALOJADA !== '1') return;
  const db = URL.parse(entorno.DATABASE_URL ?? '');
  if (!db || db.protocol !== 'mysql:' || db.hostname !== 'db' || (db.port && db.port !== '3306') ||
      db.username !== 'legajo_demo' || db.pathname !== '/legajo_demo' || db.search || db.hash) {
    throw new Error('La demo Alere requiere su base legajo_demo en el servicio db.');
  }
  const campus = URL.parse(entorno.DEMO_MOODLE_ORIGIN ?? '');
  const sitio = URL.parse(entorno.ORIGIN ?? '');
  const hostDemo = /^campus\.(?:alere\.(?:[a-z]{2,24}|(?:com|org|edu|net|co)\.[a-z]{2})|(?:[0-9]{1,3}-){3}[0-9]{1,3}\.(?:sslip|nip)\.io)$/;
  if (!campus || campus.protocol !== 'https:' || campus.href !== campus.origin + '/' ||
      !hostDemo.test(campus.hostname) || !sitio || sitio.protocol !== 'https:' ||
      sitio.href !== sitio.origin + '/' || sitio.hostname !== campus.hostname.replace(/^campus\./,'legajo.')) {
    throw new Error('Configurá el origen HTTPS del campus independiente de Alere.');
  }
  for (const clave of ['MOODLE_URL', 'MOODLE_AULA_URL'] as const) {
    const destino = URL.parse(entorno[clave] ?? '');
    if (destino?.href !== campus.href) throw new Error('Los servicios de la demo deben usar su propio campus.');
  }
}

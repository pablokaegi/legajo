// Genera el SQL para resetear el PIN de un usuario (los PIN se guardan con
// bcrypt y no se pueden recuperar). No toca la base: imprime un UPDATE para
// pegar en phpMyAdmin. Uso:  node scripts/reset-pin.mjs
import bcrypt from 'bcryptjs';
import readline from 'node:readline';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
let oculto = false;
// No mostrar el PIN mientras se escribe.
rl._writeToOutput = (s) => {
  if (!oculto || s.includes('\n')) rl.output.write(s);
};
const lineas = rl[Symbol.asyncIterator]();
const preguntar = async (q, ocultar = false) => {
  oculto = false;
  rl.output.write(q);
  oculto = ocultar;
  const { value } = await lineas.next();
  oculto = false;
  if (ocultar) rl.output.write('\n');
  return String(value ?? '').trim();
};

const email = (await preguntar('Email del usuario: ')).toLowerCase();
if (!/^[^@\s']+@[^@\s']+$/.test(email)) {
  console.error('Email inválido.');
  process.exit(1);
}
const pin = await preguntar('PIN nuevo (6 a 8 dígitos): ', true);
const pin2 = await preguntar('Repetí el PIN: ', true);
rl.close();
if (!/^\d{6,8}$/.test(pin)) {
  console.error('El PIN tiene que tener entre 6 y 8 dígitos.');
  process.exit(1);
}
if (pin !== pin2) {
  console.error('Los PIN no coinciden.');
  process.exit(1);
}

const hash = await bcrypt.hash(pin, 12);
console.log('\nPegá esto en phpMyAdmin (pestaña SQL):\n');
console.log(`UPDATE usuarios SET pin_hash = '${hash}', activo = 1 WHERE email = '${email}';`);
console.log('\nDebe decir "1 fila afectada". Si dice 0, el email no existe en la tabla usuarios.');

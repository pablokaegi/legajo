import { execFile } from 'node:child_process';
import { resolve } from 'node:path';

const maximoPorPista = 5 * 1024 * 1024;
const pistaLarga = 'Un audio supera los 5 MiB admitidos por capítulo. Acortá su guion o dividilo en dos pasos.';

function ejecutar(programa: string, argumentos: string[], entrada: string, maxBuffer: number, signal: AbortSignal) {
  return new Promise<Buffer>((cumplir, rechazar) => {
    const proceso = execFile(programa, argumentos, { encoding: 'buffer', windowsHide: true, maxBuffer, signal },
      (error, stdout) => {
        if (error?.code === 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER') rechazar(new RangeError(pistaLarga));
        else if (error) rechazar(error);
        else cumplir(stdout);
      });
    proceso.stdin?.on('error', rechazar);
    proceso.stdin?.end(entrada, 'utf8');
  });
}

export async function sintetizarAudios(guiones: string[]): Promise<string[]> {
  if (!guiones.length) return [];
  const signal = AbortSignal.timeout(90_000);
  if (process.platform === 'win32') {
    const salida = await ejecutar('powershell.exe', ['-NoProfile', '-NonInteractive', '-File', resolve('scripts/audio-libro.ps1')],
      JSON.stringify(guiones), 55 * 1024 * 1024, signal);
    const audios = salida.toString('utf8').trim().split(/\r?\n/);
    if (audios.length !== guiones.length || audios.some((wav) => Buffer.from(wav.slice(0, 16), 'base64').toString('ascii', 0, 4) !== 'RIFF')) {
      throw new Error('El sintetizador devolvió un audio inválido.');
    }
    if (audios.some((wav) => Buffer.byteLength(wav, 'base64') > maximoPorPista)) throw new RangeError(pistaLarga);
    return audios;
  }

  const audios: string[] = [];
  for (const guion of guiones) {
    const wav = await ejecutar('espeak-ng', ['-v', 'es-419', '-b', '1', '--stdin', '--stdout'], guion, maximoPorPista, signal);
    // eSpeak escribe PCM mono de 16 bits. Sobre stdout deja tamaños provisionales porque el pipe no admite seek.
    if (wav.length <= 44 || wav.length % 2 !== 0 || wav.toString('ascii', 0, 4) !== 'RIFF' ||
        wav.toString('ascii', 8, 16) !== 'WAVEfmt ' || wav.readUInt32LE(16) !== 16 ||
        wav.readUInt16LE(20) !== 1 || wav.readUInt16LE(22) !== 1 || wav.readUInt16LE(34) !== 16 ||
        wav.toString('ascii', 36, 40) !== 'data') throw new Error('eSpeak NG devolvió un WAV inesperado.');
    wav.writeUInt32LE(wav.length - 8, 4);
    wav.writeUInt32LE(wav.length - 44, 40);
    audios.push(wav.toString('base64'));
  }
  return audios;
}

<script lang="ts">
  // Semáforo de ruido con el micrófono del equipo. El audio se analiza en el
  // navegador: no se graba ni se envía a ningún lado.
  import { onDestroy } from 'svelte';

  let activo = $state(false);
  let nivel = $state(0); // 0-100, suavizado
  let sensibilidad = $state(50);
  let error = $state('');
  let stream: MediaStream | null = null;
  let ctx: AudioContext | null = null;
  let raf = 0;

  // Umbrales en función de la sensibilidad: más sensible = se pone rojo antes.
  let umbralAmarillo = $derived(70 - sensibilidad * 0.4);
  let umbralRojo = $derived(90 - sensibilidad * 0.4);
  type Estado = 'verde' | 'amarillo' | 'rojo';
  let estado = $derived<Estado>(nivel >= umbralRojo ? 'rojo' : nivel >= umbralAmarillo ? 'amarillo' : 'verde');
  const COLOR = { verde: '#16a34a', amarillo: '#f59e0b', rojo: '#dc2626' } as const;
  const TEXTO = { verde: 'Volumen adecuado', amarillo: 'Bajemos un poco', rojo: 'Mucho ruido' } as const;

  async function activar() {
    error = '';
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      ctx = new AudioContext();
      const src = ctx.createMediaStreamSource(stream);
      const an = ctx.createAnalyser();
      an.fftSize = 1024;
      src.connect(an);
      const buf = new Float32Array(an.fftSize);
      activo = true;
      const loop = () => {
        an.getFloatTimeDomainData(buf);
        let suma = 0;
        for (const v of buf) suma += v * v;
        const rms = Math.sqrt(suma / buf.length);
        const db = 20 * Math.log10(rms || 1e-6); // ~ -60 (silencio) a 0
        const valor = Math.max(0, Math.min(100, ((db + 60) / 60) * 100));
        nivel = nivel * 0.85 + valor * 0.15;
        raf = requestAnimationFrame(loop);
      };
      loop();
    } catch {
      error = 'No se pudo usar el micrófono. Revisá que la pizarra (o la PC conectada) tenga micrófono y dale permiso al navegador.';
    }
  }
  function apagar() {
    cancelAnimationFrame(raf);
    stream?.getTracks().forEach((t) => t.stop());
    ctx?.close().catch(() => {});
    stream = null;
    ctx = null;
    activo = false;
    nivel = 0;
  }
  onDestroy(apagar);
</script>

<div class="flex flex-col items-center gap-6 py-4">
  {#if !activo}
    <p class="text-2xl text-gray-600 text-center max-w-2xl">
      Muestra en grande si el volumen del aula está bien. Usa el micrófono del equipo; el sonido no se graba ni se envía.
    </p>
    <button onclick={activar} class="px-12 py-6 rounded-2xl bg-indigo-600 text-white text-3xl font-bold">🎤 Activar</button>
    {#if error}<p class="text-xl text-red-600 text-center max-w-2xl">{error}</p>{/if}
  {:else}
    <div class="w-64 h-64 md:w-80 md:h-80 rounded-full transition-colors duration-300 flex items-center justify-center"
      style="background:{COLOR[estado]}">
      <span class="text-white text-3xl md:text-4xl font-extrabold text-center px-6">{TEXTO[estado]}</span>
    </div>
    <div class="w-full max-w-3xl h-6 bg-gray-200 rounded-full overflow-hidden">
      <div class="h-full rounded-full" style="width:{nivel}%; background:{COLOR[estado]}"></div>
    </div>
    <label class="flex items-center gap-4 text-xl text-gray-700">
      Sensibilidad
      <input type="range" min="0" max="100" bind:value={sensibilidad} class="w-64" />
    </label>
    <button onclick={apagar} class="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 text-xl">Apagar micrófono</button>
  {/if}
</div>

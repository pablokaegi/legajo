<script lang="ts">
  // Temporizador grande para actividades. Mientras corre, avisa al marco de la
  // pizarra que hay actividad (así no se cierra la sesión en medio de un trabajo).
  import { onDestroy } from 'svelte';

  const PRESETS = [1, 2, 3, 5, 10, 15, 20, 30];
  let totalMs = $state(5 * 60 * 1000);
  let restanteMs = $state(5 * 60 * 1000);
  let fin = 0;
  let corriendo = $state(false);
  let terminado = $state(false);
  let tick: ReturnType<typeof setInterval> | undefined;
  let ultimoAviso = 0;
  let audio: AudioContext | null = null; // se crea con un toque (requisito de Android)

  const mmss = (ms: number) => {
    const s = Math.ceil(ms / 1000);
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  };
  let fraccion = $derived(totalMs > 0 ? restanteMs / totalMs : 0);
  let color = $derived(terminado ? 'text-red-600' : fraccion <= 0.1 ? 'text-red-600' : fraccion <= 0.25 ? 'text-amber-500' : 'text-gray-900');
  let barra = $derived(fraccion <= 0.1 ? '#dc2626' : fraccion <= 0.25 ? '#f59e0b' : '#4f46e5');

  function fijar(min: number) {
    detener();
    totalMs = restanteMs = min * 60 * 1000;
    terminado = false;
  }
  function sumar(min: number) {
    const nuevo = Math.max(60 * 1000, restanteMs + min * 60 * 1000);
    if (corriendo) fin += nuevo - restanteMs;
    totalMs = Math.max(totalMs, nuevo);
    restanteMs = nuevo;
  }
  function iniciar() {
    if (restanteMs <= 0) return;
    try { audio ??= new AudioContext(); audio.resume?.(); } catch { audio = null; }
    terminado = false;
    fin = Date.now() + restanteMs;
    corriendo = true;
    tick = setInterval(() => {
      restanteMs = Math.max(0, fin - Date.now());
      if (Date.now() - ultimoAviso > 30000) {
        ultimoAviso = Date.now();
        window.dispatchEvent(new Event('pizarra:actividad'));
      }
      if (restanteMs <= 0) { detener(); terminado = true; sonar(); }
    }, 200);
  }
  function detener() {
    corriendo = false;
    if (tick) clearInterval(tick);
  }
  function reiniciar() {
    detener();
    restanteMs = totalMs;
    terminado = false;
  }
  function sonar() {
    try {
      const ctx = audio ?? new AudioContext();
      [0, 0.4, 0.8].forEach((t) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.frequency.value = 880;
        g.gain.setValueAtTime(0.3, ctx.currentTime + t);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.3);
        o.connect(g).connect(ctx.destination);
        o.start(ctx.currentTime + t);
        o.stop(ctx.currentTime + t + 0.3);
      });
    } catch { /* sin audio */ }
  }
  onDestroy(detener);
</script>

<div class="flex flex-col items-center gap-6 py-4">
  <p class="font-mono font-extrabold tabular-nums leading-none text-[7rem] md:text-[11rem] {color} {terminado ? 'animate-pulse' : ''}">
    {terminado ? '¡Tiempo!' : mmss(restanteMs)}
  </p>
  <div class="w-full max-w-4xl h-5 bg-gray-200 rounded-full overflow-hidden">
    <div class="h-full rounded-full transition-[width] duration-200" style="width:{fraccion * 100}%; background:{barra}"></div>
  </div>

  <div class="flex flex-wrap justify-center gap-3">
    {#if corriendo}
      <button onclick={detener} class="px-12 py-6 rounded-2xl bg-amber-500 text-white text-3xl font-bold">⏸ Pausa</button>
    {:else}
      <button onclick={iniciar} class="px-12 py-6 rounded-2xl bg-indigo-600 text-white text-3xl font-bold">▶ Iniciar</button>
    {/if}
    <button onclick={reiniciar} class="px-6 py-6 rounded-2xl bg-gray-100 text-gray-700 text-2xl">↺</button>
    <button onclick={() => sumar(-1)} class="px-6 py-6 rounded-2xl bg-gray-100 text-gray-700 text-2xl">−1 min</button>
    <button onclick={() => sumar(1)} class="px-6 py-6 rounded-2xl bg-gray-100 text-gray-700 text-2xl">+1 min</button>
  </div>

  <div class="flex flex-wrap justify-center gap-2">
    {#each PRESETS as m}
      <button onclick={() => fijar(m)}
        class="px-5 py-3 rounded-xl text-xl font-semibold {totalMs === m * 60000 && !corriendo ? 'bg-indigo-100 text-indigo-800' : 'bg-white border border-gray-200 text-gray-700'}">
        {m} min
      </button>
    {/each}
  </div>
</div>

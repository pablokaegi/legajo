<script lang="ts">
  // Elegir alumno al azar sin repetir hasta que pasen todos: reparte la
  // participación (llamado aleatorio — Dallimore et al., 2013). La ronda se
  // guarda en este equipo; "no está hoy" solo lo excluye del sorteo (no es
  // una inasistencia: esa la registra preceptoría).
  import { onMount } from 'svelte';

  interface Alumno { id: number; nombre: string }
  interface Props { cursoId: number; roster: Alumno[] }
  let { cursoId, roster }: Props = $props();

  const hoy = new Date().toISOString().slice(0, 10);
  const kRonda = `pizarra:azar:${cursoId}`;
  const kAusentes = `pizarra:ausentes:${cursoId}:${hoy}`;

  let pasaron = $state<number[]>([]);
  let ausentes = $state<number[]>([]);
  let actual = $state<Alumno | null>(null);
  let mostrado = $state('');
  let girando = $state(false);
  let verLista = $state(false);

  const leer = (k: string): number[] => {
    try { const v = JSON.parse(localStorage.getItem(k) ?? '[]'); return Array.isArray(v) ? v.map(Number) : []; }
    catch { return []; }
  };
  const guardar = () => {
    try {
      localStorage.setItem(kRonda, JSON.stringify(pasaron));
      localStorage.setItem(kAusentes, JSON.stringify(ausentes));
    } catch { /* sin almacenamiento: funciona igual durante la clase */ }
  };
  onMount(() => { pasaron = leer(kRonda); ausentes = leer(kAusentes); });

  let presentes = $derived(roster.filter((a) => !ausentes.includes(a.id)));
  let disponibles = $derived(presentes.filter((a) => !pasaron.includes(a.id)));

  const azar = (n: number) => {
    const b = new Uint32Array(1);
    crypto.getRandomValues(b);
    return b[0] % n;
  };

  async function elegir() {
    if (girando || presentes.length === 0) return;
    if (disponibles.length === 0) pasaron = []; // terminó la ronda: empieza otra
    const pool = roster.filter((a) => !ausentes.includes(a.id) && !pasaron.includes(a.id));
    const elegido = pool[azar(pool.length)];
    girando = true;
    actual = null;
    for (let i = 0; i < 14; i++) {
      mostrado = presentes[azar(presentes.length)].nombre;
      await new Promise((r) => setTimeout(r, 60 + i * 8));
    }
    mostrado = elegido.nombre;
    actual = elegido;
    pasaron = [...pasaron, elegido.id];
    girando = false;
    guardar();
  }
  function noEstaHoy(a: Alumno) {
    ausentes = ausentes.includes(a.id) ? ausentes.filter((x) => x !== a.id) : [...ausentes, a.id];
    pasaron = pasaron.filter((x) => x !== a.id);
    if (actual?.id === a.id) { actual = null; mostrado = ''; }
    guardar();
  }
  function reiniciar() {
    pasaron = [];
    actual = null;
    mostrado = '';
    guardar();
  }
</script>

<div class="flex flex-col items-center gap-6 py-4">
  <div class="w-full max-w-4xl min-h-48 rounded-3xl bg-white border-4 {actual ? 'border-indigo-500' : 'border-gray-200'} flex items-center justify-center p-6">
    {#if mostrado}
      <p class="text-5xl md:text-7xl font-extrabold text-center {girando ? 'text-gray-400' : 'text-indigo-700'}">{mostrado}</p>
    {:else}
      <p class="text-3xl text-gray-400">Tocá “Elegir” 🎲</p>
    {/if}
  </div>

  <div class="flex flex-wrap justify-center gap-3">
    <button onclick={elegir} disabled={girando || presentes.length === 0}
      class="px-12 py-6 rounded-2xl bg-indigo-600 text-white text-3xl font-bold active:bg-indigo-700 disabled:opacity-50">
      🎲 Elegir
    </button>
    {#if actual}
      <button onclick={() => actual && noEstaHoy(actual)} class="px-6 py-6 rounded-2xl bg-gray-100 text-gray-700 text-xl">
        No está hoy
      </button>
    {/if}
  </div>

  <p class="text-xl text-gray-600">
    Faltan pasar <strong>{disponibles.length}</strong> de {presentes.length}
    {#if ausentes.length}<span class="text-gray-400"> · {ausentes.length} no están hoy</span>{/if}
  </p>

  <div class="flex flex-wrap justify-center gap-3">
    <button onclick={reiniciar} class="px-5 py-3 rounded-xl bg-gray-100 text-gray-700 text-lg">↺ Nueva ronda</button>
    <button onclick={() => (verLista = !verLista)} class="px-5 py-3 rounded-xl bg-gray-100 text-gray-700 text-lg">
      {verLista ? 'Ocultar lista' : '¿Quién no está hoy?'}
    </button>
  </div>

  {#if verLista}
    <div class="w-full max-w-5xl space-y-2">
      <p class="text-base text-gray-500 text-center">
        Tocá a quien no está para que no salga sorteado. No queda registrado como falta.
      </p>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
        {#each roster as a}
          <button onclick={() => noEstaHoy(a)}
            class="px-3 py-3 rounded-xl text-lg text-left {ausentes.includes(a.id) ? 'bg-gray-200 text-gray-400 line-through' : pasaron.includes(a.id) ? 'bg-indigo-50 text-indigo-800' : 'bg-white border border-gray-200 text-gray-800'}">
            {a.nombre}
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>

<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import type { AlumnoRef } from '$lib/server/agrupamientos/tipos';

  let { data, form } = $props();

  let sesion = $derived(data.sesion);
  let modo = $state<'afinidad' | 'heterogeneo' | 'aleatorio'>('afinidad');
  let nombreGuardar = $state('');
  let mostrarGuardar = $state(false);

  // Aleatorio: se calcula en el cliente y se puede re-mezclar
  let aleatorioGrupos = $state<AlumnoRef[][]>([]);
  function mezclarAleatorio() {
    const arr = [...data.roster];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    const grupos: AlumnoRef[][] = [];
    for (let i = 0; i < arr.length; i += data.tamano) grupos.push(arr.slice(i, i + data.tamano));
    aleatorioGrupos = grupos;
  }
  $effect(() => {
    if (aleatorioGrupos.length === 0 && data.roster.length > 0) mezclarAleatorio();
  });

  function cambiarTamano(n: number) {
    goto(`?tamano=${n}`, { invalidateAll: true, noScroll: true });
  }

  // Grupos de la pestaña activa, normalizados a AlumnoRef[][]
  let gruposActuales = $derived.by<AlumnoRef[][]>(() => {
    if (modo === 'afinidad') return data.afinidad.map((g) => g.miembros);
    if (modo === 'heterogeneo')
      return data.heterogeneo.map((g) => g.miembros.map((m) => ({ id: m.id, nombre: m.nombre })));
    return aleatorioGrupos;
  });

  function iniciales(n: string) {
    return n.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  }

  const NIVEL_COLOR: Record<string, string> = {
    alto: 'bg-green-100 text-green-700',
    medio: 'bg-blue-100 text-blue-700',
    bajo: 'bg-gray-100 text-gray-600'
  };

  const MODOS = [
    { id: 'afinidad', lbl: '🤝 Afinidad', desc: 'Junta a los que se eligieron entre sí y evita los bloqueos.' },
    { id: 'heterogeneo', lbl: '⚖️ Heterogéneo', desc: 'Mezcla parejo: populares y menos elegidos repartidos en cada grupo.' },
    { id: 'aleatorio', lbl: '🎲 Aleatorio', desc: 'Grupos al azar, sin tener en cuenta la votación.' }
  ] as const;
</script>

<svelte:head><title>Grupos — {sesion.titulo}</title></svelte:head>

<div class="space-y-4">
  <div class="flex items-center gap-2">
    <a href="/institucional/agrupamientos/{sesion.id}" class="text-indigo-600 text-sm hover:underline">← Panel</a>
    <h2 class="text-lg font-bold text-gray-900">Armar grupos</h2>
  </div>

  {#if form?.error}
    <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">{form.error}</div>
  {/if}
  {#if form?.ok}
    <div class="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-3 py-2">Guardado.</div>
  {/if}

  <div class="card">
    <p class="text-sm font-semibold text-gray-800">{sesion.titulo}</p>
    <p class="text-xs text-gray-500">🎓 {sesion.cursoNombre} · 🗳️ {data.totalVotos} votos</p>
  </div>

  <!-- Selector de modo -->
  <div class="bg-white border border-gray-200 rounded-xl overflow-x-auto">
    <nav class="flex min-w-max">
      {#each MODOS as m}
        <button onclick={() => (modo = m.id)}
          class="px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors
                 {modo === m.id
                   ? 'border-indigo-600 text-indigo-700 bg-indigo-50'
                   : 'border-transparent text-gray-600 hover:bg-gray-50'}">
          {m.lbl}
        </button>
      {/each}
    </nav>
  </div>

  <p class="text-xs text-gray-500">{MODOS.find((m) => m.id === modo)?.desc}</p>

  <!-- Controles -->
  <div class="flex items-center gap-3 flex-wrap">
    {#if modo !== 'afinidad'}
      <div class="flex items-center gap-1.5">
        <span class="text-xs text-gray-500">Tamaño:</span>
        {#each [2, 3, 4, 5] as n}
          <button onclick={() => cambiarTamano(n)}
            class="w-7 h-7 rounded-lg text-xs font-semibold transition-colors
                   {data.tamano === n ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-indigo-100'}">
            {n}
          </button>
        {/each}
      </div>
    {/if}
    {#if modo === 'aleatorio'}
      <button onclick={mezclarAleatorio} class="text-xs text-indigo-600 hover:underline">🎲 Volver a mezclar</button>
    {/if}
    <button onclick={() => (mostrarGuardar = !mostrarGuardar)} class="text-xs text-indigo-600 hover:underline ml-auto">
      💾 Guardar esta agrupación
    </button>
  </div>

  {#if mostrarGuardar}
    <form method="POST" action="?/guardar"
      use:enhance={() => async ({ update, result }) => {
        await update({ reset: false });
        if (result.type === 'success') { mostrarGuardar = false; nombreGuardar = ''; }
      }}
      class="card flex gap-2 items-end">
      <div class="flex-1">
        <label class="form-label" for="ng">Nombre de la agrupación</label>
        <input id="ng" type="text" name="nombre" bind:value={nombreGuardar}
          placeholder="Ej: Grupos TP de octubre" class="form-input text-sm" required />
      </div>
      <input type="hidden" name="modo" value={modo} />
      <input type="hidden" name="gruposJson" value={JSON.stringify(gruposActuales)} />
      <button type="submit" class="btn-primary text-sm">Guardar</button>
    </form>
  {/if}

  <!-- Grupos -->
  {#if gruposActuales.length === 0}
    <div class="card text-center py-8"><p class="text-gray-500 text-sm">No se pudieron armar grupos.</p></div>
  {:else}
    <div class="grid gap-2 sm:grid-cols-2">
      {#each gruposActuales as grupo, i}
        <div class="card space-y-2">
          <div class="flex items-center justify-between">
            <p class="text-sm font-semibold text-gray-800">Grupo {i + 1}</p>
            {#if modo === 'afinidad' && data.afinidad[i]}
              <span class="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                afinidad {data.afinidad[i].afinidadPromedio}
              </span>
            {/if}
          </div>
          <div class="space-y-1">
            {#each grupo as m, j}
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {iniciales(m.nombre)}
                </div>
                <span class="text-sm text-gray-800 flex-1">{m.nombre}</span>
                {#if modo === 'heterogeneo' && data.heterogeneo[i]?.miembros[j]}
                  <span class="text-xs px-2 py-0.5 rounded-full {NIVEL_COLOR[data.heterogeneo[i].miembros[j].nivel]}">
                    {data.heterogeneo[i].miembros[j].nivel}
                  </span>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Agrupaciones guardadas -->
  {#if data.guardados.length > 0}
    <div class="card space-y-2">
      <p class="text-sm font-semibold text-gray-800">Agrupaciones guardadas</p>
      {#each data.guardados as g}
        <div class="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-gray-50">
          <span class="flex-1 text-sm text-gray-800">
            {g.nombre}
            <span class="text-xs text-gray-400">· {g.modo} · {g.grupos.length} grupos</span>
          </span>
          <form method="POST" action="?/eliminar" use:enhance>
            <input type="hidden" name="grupoId" value={g.id} />
            <button type="submit" class="text-xs text-gray-400 hover:text-red-500">✕</button>
          </form>
        </div>
      {/each}
    </div>
  {/if}
</div>

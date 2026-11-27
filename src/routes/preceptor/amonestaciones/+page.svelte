<script lang="ts">
  import { onMount } from 'svelte';
  let { data } = $props();

  const GRAVEDAD_COLOR: Record<string, string> = {
    leve:    'bg-yellow-100 text-yellow-700',
    mediana: 'bg-orange-100 text-orange-700',
    grave:   'bg-red-100 text-red-700'
  };

  let busqueda = $state('');
  let filtroGravedad = $state('');
  let listaFiltrada = $state<any[]>(data.lista);

  onMount(() => {
    listaFiltrada = data.lista;
  });

  function filtrar() {
    const q = busqueda.trim().toLowerCase();
    const g = filtroGravedad;
    listaFiltrada = data.lista.filter((a: any) => {
      const matchTexto = !q ||
        (a.alumnoNombre ?? '').toLowerCase().includes(q) ||
        (a.cursoNombre ?? '').toLowerCase().includes(q);
      const matchGravedad = !g || a.gravedad === g;
      return matchTexto && matchGravedad;
    });
  }

  function setGravedad(g: string) {
    filtroGravedad = g;
    filtrar();
  }

  function limpiar() {
    busqueda = '';
    filtroGravedad = '';
    listaFiltrada = data.lista;
  }

  function buildPageUrl(p: number) {
    const params = new URLSearchParams();
    if (p > 1) params.set('page', String(p));
    return `?${params.toString()}`;
  }
</script>

<svelte:head><title>Amonestaciones — Legajo</title></svelte:head>

<div class="space-y-4">
  <div class="flex items-center justify-between">
    <h2 class="text-lg font-bold text-gray-900">Amonestaciones</h2>
    <a href="/preceptor/amonestaciones/nueva" class="btn-primary text-sm">+ Nueva</a>
  </div>

  <!-- Buscador -->
  <div class="relative">
    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">🔍</span>
    <input
      type="text"
      bind:value={busqueda}
      oninput={filtrar}
      placeholder="Buscar por alumno o curso..."
      class="form-input pl-9 w-full text-sm"
    />
    {#if busqueda}
      <button
        onclick={limpiar}
        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-xs"
      >✕</button>
    {/if}
  </div>

  <!-- Filtro gravedad -->
  <div class="flex gap-2 overflow-x-auto pb-1">
    {#each [['', 'Todas'], ['leve', 'Leve'], ['mediana', 'Mediana'], ['grave', 'Grave']] as [val, lbl]}
      <button
        onclick={() => setGravedad(val)}
        class="text-xs px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors
               {filtroGravedad === val ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 text-gray-600 hover:border-indigo-300'}"
      >{lbl}</button>
    {/each}
  </div>

  {#if busqueda || filtroGravedad}
    <p class="text-xs text-indigo-600">{listaFiltrada.length} de {data.lista.length} amonestaciones</p>
  {/if}

  {#if data.lista.length === 0}
    <div class="card text-center py-10">
      <p class="text-3xl mb-2">⚠️</p>
      <p class="text-gray-500 text-sm">No hay amonestaciones registradas.</p>
      <a href="/preceptor/amonestaciones/nueva" class="mt-3 inline-block text-sm text-indigo-600 hover:underline">Registrar la primera</a>
    </div>
  {:else if listaFiltrada.length === 0}
    <div class="card text-center py-8">
      <p class="text-2xl mb-2">🔍</p>
      <p class="text-gray-500 text-sm">No hay amonestaciones que coincidan.</p>
      <button onclick={limpiar} class="mt-2 text-sm text-indigo-600 hover:underline">Ver todas</button>
    </div>
  {:else}
    <div class="space-y-2">
      {#each listaFiltrada as amon}
        <div class="card space-y-1">
          <div class="flex items-center justify-between gap-2">
            <span class="text-sm font-semibold text-gray-800">{amon.alumnoNombre}</span>
            <span class="text-xs px-2 py-0.5 rounded-full {GRAVEDAD_COLOR[amon.gravedad] ?? 'bg-gray-100 text-gray-600'}">{amon.gravedad}</span>
          </div>
          {#if amon.cursoNombre}<p class="text-xs text-gray-500">{amon.cursoNombre}</p>{/if}
          <p class="text-xs text-gray-600 line-clamp-2">{amon.motivo}</p>
          <p class="text-xs text-gray-400">📅 {amon.fecha}</p>
        </div>
      {/each}
    </div>
    <div class="flex gap-2 justify-center pt-2">
      {#if data.page > 1}
        <a href={buildPageUrl(data.page - 1)} class="text-sm text-indigo-600 hover:underline">← Anterior</a>
      {/if}
      <span class="text-sm text-gray-500">Página {data.page}</span>
      {#if data.lista.length === 20}
        <a href={buildPageUrl(data.page + 1)} class="text-sm text-indigo-600 hover:underline">Siguiente →</a>
      {/if}
    </div>
  {/if}
</div>

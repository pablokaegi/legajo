<script lang="ts">
  import { goto } from '$app/navigation';

  let { data } = $props();

  const GRAVEDAD_COLOR: Record<string, string> = {
    leve:    'bg-yellow-100 text-yellow-700',
    mediana: 'bg-orange-100 text-orange-700',
    grave:   'bg-red-100 text-red-700'
  };

  let alumnoQ = $state(data.alumnoQ);
  let cursoQ  = $state(data.cursoQ);

  function buildUrl(extraParams: Record<string, string> = {}) {
    const p = new URLSearchParams();
    const a  = extraParams.alumno   ?? alumnoQ;
    const c  = extraParams.curso    ?? cursoQ;
    const g  = extraParams.gravedad ?? (data.gravedad ?? '');
    const pg = extraParams.page     ?? '1';
    if (a)  p.set('alumno',   a);
    if (c)  p.set('curso',    c);
    if (g)  p.set('gravedad', g);
    if (pg !== '1') p.set('page', pg);
    return `?${p.toString()}`;
  }

  function buscar() { goto(buildUrl()); }

  function limpiar() {
    alumnoQ = '';
    cursoQ  = '';
    goto('/preceptor/amonestaciones');
  }

  const hayFiltros = $derived(!!data.alumnoQ || !!data.cursoQ || !!data.gravedad);
</script>

<svelte:head><title>Amonestaciones — Legajo</title></svelte:head>

<div class="space-y-4">
  <div class="flex items-center justify-between">
    <h2 class="text-lg font-bold text-gray-900">Amonestaciones</h2>
    <a href="/preceptor/amonestaciones/nueva" class="btn-primary text-sm">+ Nueva</a>
  </div>

  <!-- Filtros -->
  <div class="bg-white rounded-xl border border-gray-200 p-3 space-y-2">
    <div class="flex gap-2">
      <input
        type="search"
        bind:value={alumnoQ}
        placeholder="🔍 Buscar alumno..."
        class="form-input flex-1 text-sm"
        onkeydown={(e) => e.key === 'Enter' && buscar()}
      />
      <input
        type="search"
        bind:value={cursoQ}
        placeholder="📚 Curso..."
        class="form-input w-28 text-sm"
        onkeydown={(e) => e.key === 'Enter' && buscar()}
      />
    </div>
    <div class="flex gap-2">
      <button
        onclick={buscar}
        class="flex-1 bg-indigo-600 text-white text-xs font-medium py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Buscar
      </button>
      {#if hayFiltros}
        <button onclick={limpiar} class="text-xs text-gray-400 hover:text-gray-700 px-2">Limpiar</button>
      {/if}
    </div>
    {#if hayFiltros}
      <p class="text-xs text-indigo-600">
        {#if data.alumnoQ}Alumno: <strong>{data.alumnoQ}</strong>{/if}
        {#if data.alumnoQ && data.cursoQ} · {/if}
        {#if data.cursoQ}Curso: <strong>{data.cursoQ}</strong>{/if}
        {#if (data.alumnoQ || data.cursoQ) && data.gravedad} · {/if}
        {#if data.gravedad}Gravedad: <strong>{data.gravedad}</strong>{/if}
      </p>
    {/if}
  </div>

  <!-- Filtro gravedad -->
  <div class="flex gap-2 overflow-x-auto pb-1">
    {#each [['', 'Todas'], ['leve', 'Leve'], ['mediana', 'Mediana'], ['grave', 'Grave']] as [val, lbl]}
      <a
        href={buildUrl({ gravedad: val, page: '1' })}
        class="text-xs px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors
               {data.gravedad === (val || null) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 text-gray-600 hover:border-indigo-300'}"
      >{lbl}</a>
    {/each}
  </div>

  {#if data.lista.length === 0}
    <div class="card text-center py-10">
      <p class="text-3xl mb-2">⚠️</p>
      {#if hayFiltros}
        <p class="text-gray-500 text-sm">No hay amonestaciones que coincidan.</p>
        <button onclick={limpiar} class="mt-2 text-sm text-indigo-600 hover:underline">Ver todas</button>
      {:else}
        <p class="text-gray-500 text-sm">No hay amonestaciones registradas.</p>
        <a href="/preceptor/amonestaciones/nueva" class="mt-3 inline-block text-sm text-indigo-600 hover:underline">Registrar la primera</a>
      {/if}
    </div>
  {:else}
    <div class="space-y-2">
      {#each data.lista as amon}
        <div class="card space-y-1">
          <div class="flex items-center justify-between gap-2">
            <span class="text-sm font-semibold text-gray-800">{amon.alumnoNombre}</span>
            <span class="text-xs px-2 py-0.5 rounded-full {GRAVEDAD_COLOR[amon.gravedad] ?? 'bg-gray-100 text-gray-600'}">
              {amon.gravedad}
            </span>
          </div>
          {#if amon.cursoNombre}<p class="text-xs text-gray-500">{amon.cursoNombre}</p>{/if}
          <p class="text-xs text-gray-600 line-clamp-2">{amon.motivo}</p>
          <p class="text-xs text-gray-400">📅 {amon.fecha}</p>
        </div>
      {/each}
    </div>
    <div class="flex gap-2 justify-center pt-2">
      {#if data.page > 1}
        <a href={buildUrl({ page: String(data.page - 1) })} class="text-sm text-indigo-600 hover:underline">← Anterior</a>
      {/if}
      <span class="text-sm text-gray-500">Página {data.page}</span>
      {#if data.lista.length === 20}
        <a href={buildUrl({ page: String(data.page + 1) })} class="text-sm text-indigo-600 hover:underline">Siguiente →</a>
      {/if}
    </div>
  {/if}
</div>

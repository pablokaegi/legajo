<script lang="ts">
  let { data } = $props();

  const GRAVEDAD_COLOR: Record<string, string> = {
    leve:    'bg-yellow-100 text-yellow-700',
    mediana: 'bg-orange-100 text-orange-700',
    grave:   'bg-red-100 text-red-700'
  };

  function buildPageUrl(page: number) {
    const p = new URLSearchParams();
    if (data.alumnoQ)  p.set('alumno',   data.alumnoQ);
    if (data.cursoQ)   p.set('curso',    data.cursoQ);
    if (data.gravedad) p.set('gravedad', data.gravedad);
    if (page > 1) p.set('page', String(page));
    return `?${p.toString()}`;
  }

  function gravedadUrl(val: string) {
    const p = new URLSearchParams();
    if (data.alumnoQ) p.set('alumno', data.alumnoQ);
    if (data.cursoQ)  p.set('curso',  data.cursoQ);
    if (val) p.set('gravedad', val);
    return `?${p.toString()}`;
  }

  const hayFiltros = data.alumnoQ || data.cursoQ || data.gravedad;
</script>

<svelte:head><title>Amonestaciones — Legajo</title></svelte:head>

<div class="space-y-4">
  <div class="flex items-center justify-between">
    <h2 class="text-lg font-bold text-gray-900">Amonestaciones</h2>
    <a href="/preceptor/amonestaciones/nueva" class="btn-primary text-sm">+ Nueva</a>
  </div>

  <!-- Filtros (form GET nativo) -->
  <form method="GET" action="/preceptor/amonestaciones" class="bg-white rounded-xl border border-gray-200 p-3 space-y-2">
    {#if data.gravedad}
      <input type="hidden" name="gravedad" value={data.gravedad} />
    {/if}
    <div class="flex gap-2">
      <input
        type="search"
        name="alumno"
        value={data.alumnoQ}
        placeholder="🔍 Buscar alumno..."
        class="form-input flex-1 text-sm"
      />
      <input
        type="search"
        name="curso"
        value={data.cursoQ}
        placeholder="📚 Curso..."
        class="form-input w-28 text-sm"
      />
    </div>
    <div class="flex gap-2">
      <button
        type="submit"
        class="flex-1 bg-indigo-600 text-white text-xs font-medium py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Buscar
      </button>
      {#if hayFiltros}
        <a href="/preceptor/amonestaciones" class="text-xs text-gray-400 hover:text-gray-700 px-2 flex items-center">
          Limpiar
        </a>
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
  </form>

  <!-- Filtro gravedad -->
  <div class="flex gap-2 overflow-x-auto pb-1">
    {#each [['', 'Todas'], ['leve', 'Leve'], ['mediana', 'Mediana'], ['grave', 'Grave']] as [val, lbl]}
      <a
        href={gravedadUrl(val)}
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
        <a href={buildPageUrl(data.page - 1)} class="text-sm text-indigo-600 hover:underline">← Anterior</a>
      {/if}
      <span class="text-sm text-gray-500">Página {data.page}</span>
      {#if data.lista.length === 20}
        <a href={buildPageUrl(data.page + 1)} class="text-sm text-indigo-600 hover:underline">Siguiente →</a>
      {/if}
    </div>
  {/if}
</div>

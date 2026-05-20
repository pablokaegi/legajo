<script lang="ts">
  let { data } = $props();

  let busqueda = $state('');
  let filtroEstado = $state(data.estado ?? '');

  const listaFiltrada = $derived(
    data.lista.filter((acta) => {
      const q = busqueda.trim().toLowerCase();
      const matchTexto = !q ||
        acta.titulo.toLowerCase().includes(q) ||
        acta.resumen.toLowerCase().includes(q) ||
        acta.alumnos.some((a: { alumnoNombre: string }) =>
          a.alumnoNombre.toLowerCase().includes(q)
        );
      const matchEstado = !filtroEstado || acta.estado === filtroEstado;
      return matchTexto && matchEstado;
    })
  );

  function buildPageUrl(page: number) {
    const p = new URLSearchParams();
    if (filtroEstado) p.set('estado', filtroEstado);
    if (page > 1) p.set('page', String(page));
    return `?${p.toString()}`;
  }
</script>

<svelte:head><title>Actas — Legajo</title></svelte:head>

<div class="space-y-4">
  <div class="flex items-center justify-between">
    <h2 class="text-lg font-bold text-gray-900">Actas de seguimiento</h2>
    <a href="/preceptor/actas/nueva" class="btn-primary text-sm">+ Nueva acta</a>
  </div>

  <!-- Buscador instantáneo -->
  <div class="relative">
    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
    <input
      type="search"
      bind:value={busqueda}
      placeholder="Buscar por alumno, título o resumen..."
      class="form-input pl-9 w-full text-sm"
    />
    {#if busqueda}
      <button
        onclick={() => busqueda = ''}
        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-xs"
      >✕</button>
    {/if}
  </div>

  <!-- Filtro estado -->
  <div class="flex gap-2 overflow-x-auto pb-1">
    {#each [['', 'Todas'], ['abierta', 'Abiertas'], ['cerrada', 'Cerradas']] as [val, lbl]}
      <button
        onclick={() => filtroEstado = val}
        class="text-xs px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors
               {filtroEstado === val ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 text-gray-600 hover:border-indigo-300'}"
      >{lbl}</button>
    {/each}
  </div>

  {#if busqueda || filtroEstado}
    <p class="text-xs text-indigo-600">{listaFiltrada.length} de {data.lista.length} actas</p>
  {/if}

  {#if data.lista.length === 0}
    <div class="card text-center py-10">
      <p class="text-3xl mb-2">📄</p>
      <p class="text-gray-500 text-sm">No hay actas registradas.</p>
      <a href="/preceptor/actas/nueva" class="mt-3 inline-block text-sm text-indigo-600 hover:underline">Crear la primera</a>
    </div>
  {:else if listaFiltrada.length === 0}
    <div class="card text-center py-8">
      <p class="text-2xl mb-2">🔍</p>
      <p class="text-gray-500 text-sm">No hay actas que coincidan.</p>
      <button onclick={() => { busqueda = ''; filtroEstado = ''; }} class="mt-2 text-sm text-indigo-600 hover:underline">Ver todas</button>
    </div>
  {:else}
    <div class="space-y-2">
      {#each listaFiltrada as acta}
        <a href="/preceptor/actas/{acta.id}" class="card block hover:border-indigo-300 transition-colors space-y-1">
          <div class="flex items-start justify-between gap-2">
            <p class="text-sm font-semibold text-gray-800 flex-1">{acta.titulo}</p>
            <span class="text-xs px-2 py-0.5 rounded-full flex-shrink-0
                         {acta.estado === 'abierta' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}">
              {acta.estado}
            </span>
          </div>
          {#if acta.alumnos && acta.alumnos.length > 0}
            <p class="text-xs text-indigo-600">
              👤 {acta.alumnos.map((a: { alumnoNombre: string }) => a.alumnoNombre).join(', ')}
            </p>
          {/if}
          <p class="text-xs text-gray-500">📅 {acta.fecha}</p>
          <p class="text-xs text-gray-600 line-clamp-2">{acta.resumen}</p>
        </a>
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

<script lang="ts">
  let { data } = $props();

  const GRAVEDAD_COLOR: Record<string, string> = {
    leve: 'bg-yellow-100 text-yellow-700',
    mediana: 'bg-orange-100 text-orange-700',
    grave: 'bg-red-100 text-red-700'
  };
</script>

<svelte:head><title>Amonestaciones — Legajo</title></svelte:head>

<div class="space-y-4">
  <div class="flex items-center justify-between">
    <h2 class="text-lg font-bold text-gray-900">Amonestaciones</h2>
    <a href="/preceptor/amonestaciones/nueva" class="btn-primary text-sm">+ Nueva</a>
  </div>

  <!-- Filtros de gravedad -->
  <div class="flex gap-2 overflow-x-auto pb-1">
    {#each [['', 'Todas'], ['leve', 'Leve'], ['mediana', 'Mediana'], ['grave', 'Grave']] as [val, lbl]}
      <a
        href="?{val ? `gravedad=${val}` : ''}"
        class="text-xs px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors
               {data.gravedad === (val || null) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 text-gray-600 hover:border-indigo-300'}"
      >{lbl}</a>
    {/each}
  </div>

  {#if data.lista.length === 0}
    <div class="card text-center py-10">
      <p class="text-3xl mb-2">⚠️</p>
      <p class="text-gray-500 text-sm">No hay amonestaciones registradas.</p>
      <a href="/preceptor/amonestaciones/nueva" class="mt-3 inline-block text-sm text-indigo-600 hover:underline">Registrar la primera</a>
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
        <a href="?page={data.page - 1}{data.gravedad ? `&gravedad=${data.gravedad}` : ''}" class="text-sm text-indigo-600 hover:underline">← Anterior</a>
      {/if}
      <span class="text-sm text-gray-500">Página {data.page}</span>
      {#if data.lista.length === 20}
        <a href="?page={data.page + 1}{data.gravedad ? `&gravedad=${data.gravedad}` : ''}" class="text-sm text-indigo-600 hover:underline">Siguiente →</a>
      {/if}
    </div>
  {/if}
</div>

<script lang="ts">
  let { data } = $props();
</script>

<svelte:head><title>Actas — Legajo</title></svelte:head>

<div class="space-y-4">
  <div class="flex items-center justify-between">
    <h2 class="text-lg font-bold text-gray-900">Actas de seguimiento</h2>
    <a href="/preceptor/actas/nueva" class="btn-primary text-sm">+ Nueva acta</a>
  </div>

  <div class="flex gap-2">
    {#each [['', 'Todas'], ['abierta', 'Abiertas'], ['cerrada', 'Cerradas']] as [val, lbl]}
      <a href="?{val ? `estado=${val}` : ''}"
        class="text-xs px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors
               {data.estado === (val || null) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 text-gray-600 hover:border-indigo-300'}"
      >{lbl}</a>
    {/each}
  </div>

  {#if data.lista.length === 0}
    <div class="card text-center py-10">
      <p class="text-3xl mb-2">📄</p>
      <p class="text-gray-500 text-sm">No hay actas registradas.</p>
      <a href="/preceptor/actas/nueva" class="mt-3 inline-block text-sm text-indigo-600 hover:underline">Crear la primera</a>
    </div>
  {:else}
    <div class="space-y-2">
      {#each data.lista as acta}
        <a href="/preceptor/actas/{acta.id}" class="card block hover:border-indigo-300 transition-colors space-y-1">
          <div class="flex items-start justify-between gap-2">
            <p class="text-sm font-semibold text-gray-800 flex-1">{acta.titulo}</p>
            <span class="text-xs px-2 py-0.5 rounded-full flex-shrink-0
                         {acta.estado === 'abierta' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}">
              {acta.estado}
            </span>
          </div>
          <p class="text-xs text-gray-500">📅 {acta.fecha}</p>
          <p class="text-xs text-gray-600 line-clamp-2">{acta.resumen}</p>
        </a>
      {/each}
    </div>
    <div class="flex gap-2 justify-center pt-2">
      {#if data.page > 1}
        <a href="?page={data.page - 1}{data.estado ? `&estado=${data.estado}` : ''}" class="text-sm text-indigo-600 hover:underline">← Anterior</a>
      {/if}
      <span class="text-sm text-gray-500">Página {data.page}</span>
      {#if data.lista.length === 20}
        <a href="?page={data.page + 1}{data.estado ? `&estado=${data.estado}` : ''}" class="text-sm text-indigo-600 hover:underline">Siguiente →</a>
      {/if}
    </div>
  {/if}
</div>

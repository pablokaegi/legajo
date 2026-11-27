<svelte:head><title>Reincorporaciones — Legajo</title></svelte:head>
<script lang="ts">
  let { data } = $props();
</script>

<div class="space-y-4">
  <div class="flex items-center justify-between">
    <h2 class="text-lg font-bold text-gray-900">Reincorporaciones</h2>
    <a href="/preceptor/reincorporaciones/nueva" class="btn-primary text-sm">+ Nueva</a>
  </div>

  {#if data.lista.length === 0}
    <div class="card text-center py-10">
      <p class="text-3xl mb-2">✅</p>
      <p class="text-gray-500 text-sm">No hay reincorporaciones registradas.</p>
    </div>
  {:else}
    <div class="space-y-2">
      {#each data.lista as r}
        <div class="card space-y-1">
          <p class="text-sm font-semibold text-gray-800">{r.alumnoNombre}</p>
          <p class="text-xs text-gray-500">📅 Fecha de reincorporación: <strong>{r.fechaReincorporacion}</strong></p>
          {#if r.observaciones}<p class="text-xs text-gray-600 line-clamp-2">{r.observaciones}</p>{/if}
          {#if r.documentoUrl}
            <a href={r.documentoUrl} target="_blank" rel="noopener" class="text-xs text-indigo-600 hover:underline">📎 Ver documento</a>
          {/if}
        </div>
      {/each}
    </div>
    <div class="flex gap-2 justify-center pt-2">
      {#if data.page > 1}
        <a href="?page={data.page - 1}" class="text-sm text-indigo-600 hover:underline">← Anterior</a>
      {/if}
      <span class="text-sm text-gray-500">Página {data.page}</span>
      {#if data.lista.length === 20}
        <a href="?page={data.page + 1}" class="text-sm text-indigo-600 hover:underline">Siguiente →</a>
      {/if}
    </div>
  {/if}
</div>

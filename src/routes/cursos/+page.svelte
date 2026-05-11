<script lang="ts">
  let { data } = $props();
</script>

<svelte:head>
  <title>Cursos — Legajo</title>
</svelte:head>

<div class="space-y-4">
  <h1 class="text-xl font-bold text-gray-900">Cursos</h1>

  {#if data.error}
    <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
      <p class="font-medium">No se pudieron cargar los cursos</p>
      <p class="mt-1 text-xs">{data.error}</p>
    </div>
  {:else if data.cursos.length === 0}
    <div class="card text-center py-10">
      <p class="text-gray-500">No hay cursos disponibles</p>
      <p class="text-xs text-gray-400 mt-1">Verificá los permisos del token en Moodle</p>
    </div>
  {:else}
    <p class="text-sm text-gray-500">{data.cursos.length} cursos disponibles</p>
    <div class="space-y-2">
      {#each data.cursos as curso}
        <a
          href="/cursos/{curso.id}"
          class="card flex items-center justify-between hover:border-indigo-300 transition-colors group"
        >
          <div class="min-w-0">
            <p class="font-medium text-gray-900 truncate">{curso.displayname || curso.fullname}</p>
            <p class="text-xs text-gray-400 mt-0.5">{curso.shortname}</p>
          </div>
          <span class="text-gray-300 group-hover:text-indigo-400 transition-colors ml-3 flex-shrink-0">→</span>
        </a>
      {/each}
    </div>
  {/if}
</div>

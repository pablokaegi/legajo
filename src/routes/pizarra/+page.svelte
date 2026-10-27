<script lang="ts">
  let { data } = $props();
  let filtro = $state('');
  let cursos = $derived(
    filtro.trim() ? data.cursos.filter((c) => c.nombre.toLowerCase().includes(filtro.trim().toLowerCase())) : data.cursos
  );
</script>

<svelte:head><title>Modo pizarra</title></svelte:head>

<div class="max-w-5xl mx-auto space-y-4">
  <p class="text-2xl font-bold text-gray-900">¿Con qué curso estás?</p>
  <input type="search" bind:value={filtro} placeholder="Buscar curso…"
    class="w-full text-xl px-4 py-3 rounded-xl border border-gray-300 select-text" />
  <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
    {#each cursos as c}
      <a href="/pizarra/{c.id}"
        class="block p-6 rounded-2xl bg-white border-2 border-gray-200 text-xl font-semibold text-gray-900 text-center active:bg-indigo-50 hover:border-indigo-400">
        {c.nombre}
      </a>
    {:else}
      <p class="text-lg text-gray-500 col-span-full">No se pudieron cargar los cursos.</p>
    {/each}
  </div>
</div>

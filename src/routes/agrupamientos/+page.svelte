<script lang="ts">
  let { data } = $props();

  const ESTADO_COLOR: Record<string, string> = {
    abierta: 'bg-blue-100 text-blue-700',
    cerrada: 'bg-green-100 text-green-700'
  };

  let busqueda = $state('');
  let filtroEstado = $state(data.estado ?? '');

  let listaFiltrada = $derived(
    data.lista.filter((s) => {
      const q = busqueda.trim().toLowerCase();
      const matchTexto =
        !q ||
        (s.titulo ?? '').toLowerCase().includes(q) ||
        (s.cursoNombre ?? '').toLowerCase().includes(q);
      const matchEstado = !filtroEstado || s.estado === filtroEstado;
      return matchTexto && matchEstado;
    })
  );

  function limpiar() {
    busqueda = '';
    filtroEstado = '';
  }
</script>

<svelte:head><title>Agrupamientos — Legajo</title></svelte:head>

<div class="space-y-4">
  <div class="flex items-center justify-between">
    <h2 class="text-lg font-bold text-gray-900">Agrupamientos</h2>
    <a href="/agrupamientos/nueva" class="btn-primary text-sm">+ Nueva</a>
  </div>

  <p class="text-xs text-gray-500">
    Sociograma del curso: cargá las preferencias de los alumnos y generá grupos por
    afinidad junto con un análisis psicopedagógico de la dinámica social.
  </p>

  <div class="relative">
    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">🔍</span>
    <input
      type="text"
      bind:value={busqueda}
      placeholder="Buscar por título o curso..."
      class="form-input pl-9 w-full text-sm"
    />
    {#if busqueda}
      <button onclick={limpiar} class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">✕</button>
    {/if}
  </div>

  <div class="flex gap-2 overflow-x-auto pb-1">
    {#each [['', 'Todas'], ['abierta', 'Abiertas'], ['cerrada', 'Cerradas']] as [val, lbl]}
      <button
        onclick={() => (filtroEstado = val)}
        class="text-xs px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors
               {filtroEstado === val
                 ? 'bg-indigo-600 border-indigo-600 text-white'
                 : 'border-gray-300 text-gray-600 hover:border-indigo-300'}"
      >{lbl}</button>
    {/each}
  </div>

  {#if data.lista.length === 0}
    <div class="card text-center py-10">
      <p class="text-3xl mb-2">🧩</p>
      <p class="text-gray-500 text-sm">No hay sesiones de agrupamiento registradas.</p>
      <a href="/agrupamientos/nueva" class="mt-3 inline-block text-sm text-indigo-600 hover:underline">
        Crear la primera
      </a>
    </div>
  {:else if listaFiltrada.length === 0}
    <div class="card text-center py-8">
      <p class="text-2xl mb-2">🔍</p>
      <p class="text-gray-500 text-sm">No hay sesiones que coincidan.</p>
      <button onclick={limpiar} class="mt-2 text-sm text-indigo-600 hover:underline">Ver todas</button>
    </div>
  {:else}
    <div class="space-y-2">
      {#each listaFiltrada as s}
        <a
          href="/agrupamientos/{s.id}"
          class="card block hover:border-indigo-300 transition-colors space-y-1"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-800">{s.titulo}</p>
              <p class="text-xs text-gray-500">🎓 {s.cursoNombre}</p>
            </div>
            <span class="text-xs px-2 py-0.5 rounded-full flex-shrink-0 {ESTADO_COLOR[s.estado] ?? 'bg-gray-100 text-gray-600'}">
              {s.estado}
            </span>
          </div>
          <p class="text-xs text-gray-500">📅 {s.fecha} · 🗳️ {s.cantidadVotos} voto/s cargado/s</p>
        </a>
      {/each}
    </div>
  {/if}
</div>

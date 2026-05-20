<script lang="ts">
  import { onMount } from 'svelte';
  let { data } = $props();

  const ESTADO_COLOR: Record<string, string> = {
    planificado: 'bg-blue-100 text-blue-700',
    realizado:   'bg-green-100 text-green-700',
    cancelado:   'bg-gray-100 text-gray-500'
  };

  let busqueda = $state('');
  let filtroEstado = $state(data.estado ?? '');
  let listaFiltrada = $state<any[]>(data.lista);

  onMount(() => { listaFiltrada = data.lista; });

  function filtrar() {
    const q = busqueda.trim().toLowerCase();
    const e = filtroEstado;
    listaFiltrada = data.lista.filter((ev: any) => {
      const matchTexto = !q ||
        (ev.titulo ?? '').toLowerCase().includes(q) ||
        (ev.docenteResponsable ?? '').toLowerCase().includes(q);
      const matchEstado = !e || ev.estado === e;
      return matchTexto && matchEstado;
    });
  }

  function setEstado(e: string) { filtroEstado = e; filtrar(); }
  function limpiar() { busqueda = ''; filtroEstado = ''; listaFiltrada = data.lista; }

  function parseCursos(json: string | null): string {
    if (!json) return '';
    try {
      const arr = JSON.parse(json);
      if (Array.isArray(arr)) return arr.map((c: any) => c.cursoNombre ?? c).join(', ');
    } catch {}
    return json;
  }
</script>

<svelte:head><title>Efemérides — Legajo</title></svelte:head>

<div class="space-y-4">
  <div class="flex items-center justify-between">
    <h2 class="text-lg font-bold text-gray-900">Efemérides y Actos</h2>
    <a href="/institucional/efemerides/nueva" class="btn-primary text-sm">+ Nueva</a>
  </div>

  <div class="relative">
    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">🔍</span>
    <input type="text" bind:value={busqueda} oninput={filtrar}
      placeholder="Buscar por título o docente..."
      class="form-input pl-9 w-full text-sm" />
    {#if busqueda}
      <button onclick={limpiar} class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">✕</button>
    {/if}
  </div>

  <div class="flex gap-2 overflow-x-auto pb-1">
    {#each [['', 'Todos'], ['planificado', 'Planificado'], ['realizado', 'Realizado'], ['cancelado', 'Cancelado']] as [val, lbl]}
      <button onclick={() => setEstado(val)}
        class="text-xs px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors
               {filtroEstado === val ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 text-gray-600 hover:border-indigo-300'}"
      >{lbl}</button>
    {/each}
  </div>

  {#if data.lista.length === 0}
    <div class="card text-center py-10">
      <p class="text-3xl mb-2">📅</p>
      <p class="text-gray-500 text-sm">No hay efemérides registradas.</p>
      <a href="/institucional/efemerides/nueva" class="mt-3 inline-block text-sm text-indigo-600 hover:underline">Crear la primera</a>
    </div>
  {:else if listaFiltrada.length === 0}
    <div class="card text-center py-8">
      <p class="text-2xl mb-2">🔍</p>
      <p class="text-gray-500 text-sm">No hay efemérides que coincidan.</p>
      <button onclick={limpiar} class="mt-2 text-sm text-indigo-600 hover:underline">Ver todas</button>
    </div>
  {:else}
    <div class="space-y-2">
      {#each listaFiltrada as ev}
        <a href="/institucional/efemerides/{ev.id}" class="card block hover:border-indigo-300 transition-colors space-y-1">
          <div class="flex items-start justify-between gap-2">
            <p class="text-sm font-semibold text-gray-800 flex-1">{ev.titulo}</p>
            <span class="text-xs px-2 py-0.5 rounded-full flex-shrink-0 {ESTADO_COLOR[ev.estado] ?? 'bg-gray-100 text-gray-600'}">{ev.estado}</span>
          </div>
          <p class="text-xs text-gray-500">📅 {ev.fecha}</p>
          {#if ev.docenteResponsable}
            <p class="text-xs text-gray-600">👤 {ev.docenteResponsable}</p>
          {/if}
          {#if ev.cursosResponsables}
            <p class="text-xs text-indigo-600">📚 {parseCursos(ev.cursosResponsables)}</p>
          {/if}
          {#if ev.descripcion}
            <p class="text-xs text-gray-500 line-clamp-2">{ev.descripcion}</p>
          {/if}
        </a>
      {/each}
    </div>
  {/if}
</div>

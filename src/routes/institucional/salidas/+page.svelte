<script lang="ts">
  import { onMount } from 'svelte';
  let { data } = $props();

  const ESTADO_COLOR: Record<string, string> = {
    borrador:  'bg-gray-100 text-gray-600',
    aprobado:  'bg-blue-100 text-blue-700',
    realizado: 'bg-green-100 text-green-700',
    cancelado: 'bg-red-100 text-red-600'
  };

  let busqueda = $state('');
  let filtroEstado = $state(data.estado ?? '');
  let listaFiltrada = $state<any[]>(data.lista);

  onMount(() => { listaFiltrada = data.lista; });

  function filtrar() {
    const q = busqueda.trim().toLowerCase();
    const e = filtroEstado;
    listaFiltrada = data.lista.filter((s: any) => {
      const matchTexto = !q ||
        (s.titulo ?? '').toLowerCase().includes(q) ||
        (s.destino ?? '').toLowerCase().includes(q) ||
        (s.cursoNombre ?? '').toLowerCase().includes(q) ||
        (s.responsableNombre ?? '').toLowerCase().includes(q);
      const matchEstado = !e || s.estado === e;
      return matchTexto && matchEstado;
    });
  }

  function setEstado(e: string) { filtroEstado = e; filtrar(); }
  function limpiar() { busqueda = ''; filtroEstado = ''; listaFiltrada = data.lista; }
</script>

<svelte:head><title>Salidas Didácticas — Legajo</title></svelte:head>

<div class="space-y-4">
  <div class="flex items-center justify-between">
    <h2 class="text-lg font-bold text-gray-900">Salidas Didácticas</h2>
    <a href="/institucional/salidas/nueva" class="btn-primary text-sm">+ Nueva</a>
  </div>

  <div class="relative">
    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">🔍</span>
    <input type="text" bind:value={busqueda} oninput={filtrar}
      placeholder="Buscar por destino, curso o docente..."
      class="form-input pl-9 w-full text-sm" />
    {#if busqueda}
      <button onclick={limpiar} class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">✕</button>
    {/if}
  </div>

  <div class="flex gap-2 overflow-x-auto pb-1">
    {#each [['', 'Todas'], ['borrador','Borrador'], ['aprobado','Aprobado'], ['realizado','Realizado'], ['cancelado','Cancelado']] as [val, lbl]}
      <button onclick={() => setEstado(val)}
        class="text-xs px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors
               {filtroEstado === val ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 text-gray-600 hover:border-indigo-300'}"
      >{lbl}</button>
    {/each}
  </div>

  {#if data.lista.length === 0}
    <div class="card text-center py-10">
      <p class="text-3xl mb-2">🚌</p>
      <p class="text-gray-500 text-sm">No hay salidas didácticas registradas.</p>
      <a href="/institucional/salidas/nueva" class="mt-3 inline-block text-sm text-indigo-600 hover:underline">Crear la primera</a>
    </div>
  {:else if listaFiltrada.length === 0}
    <div class="card text-center py-8">
      <p class="text-2xl mb-2">🔍</p>
      <p class="text-gray-500 text-sm">No hay salidas que coincidan.</p>
      <button onclick={limpiar} class="mt-2 text-sm text-indigo-600 hover:underline">Ver todas</button>
    </div>
  {:else}
    <div class="space-y-2">
      {#each listaFiltrada as s}
        <a href="/institucional/salidas/{s.id}" class="card block hover:border-indigo-300 transition-colors space-y-1">
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-800">{s.titulo}</p>
              <p class="text-xs text-gray-500">📍 {s.destino}</p>
            </div>
            <div class="flex flex-col items-end gap-1 flex-shrink-0">
              <span class="text-xs px-2 py-0.5 rounded-full {ESTADO_COLOR[s.estado] ?? 'bg-gray-100 text-gray-600'}">{s.estado}</span>
              {#if s.documentoPath}
                <span class="text-xs text-green-600">📎 Doc. subido</span>
              {/if}
            </div>
          </div>
          <p class="text-xs text-gray-500">📅 {s.fecha} · {s.cursoNombre}</p>
          <p class="text-xs text-gray-600">👤 {s.responsableNombre}</p>
        </a>
      {/each}
    </div>
  {/if}
</div>

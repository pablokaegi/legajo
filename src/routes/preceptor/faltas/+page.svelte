<script lang="ts">
  import { onMount } from 'svelte';
  let { data } = $props();

  const TIPO_LABEL: Record<string, string> = {
    ausente: 'Ausente', retraso: 'Retraso',
    salida_anticipada: 'Salida anticipada', otra: 'Otra'
  };
  const TIPO_COLOR: Record<string, string> = {
    ausente:           'bg-red-100 text-red-700',
    retraso:           'bg-yellow-100 text-yellow-700',
    salida_anticipada: 'bg-orange-100 text-orange-700',
    otra:              'bg-gray-100 text-gray-700'
  };

  let busqueda = $state('');
  let listaFiltrada = $state<any[]>(data.lista);

  onMount(() => {
    listaFiltrada = data.lista;
  });

  function filtrar() {
    const q = busqueda.trim().toLowerCase();
    if (!q) { listaFiltrada = data.lista; return; }
    listaFiltrada = data.lista.filter((f: any) => {
      const enCurso  = (f.cursoNombre ?? '').toLowerCase().includes(q);
      const enAlumno = (f.alumnos ?? []).some((a: any) => a.alumnoNombre.toLowerCase().includes(q));
      return enCurso || enAlumno;
    });
  }

  function limpiar() {
    busqueda = '';
    listaFiltrada = data.lista;
  }

  function buildPageUrl(p: number) {
    const params = new URLSearchParams();
    if (p > 1) params.set('page', String(p));
    return `?${params.toString()}`;
  }
</script>

<svelte:head><title>Faltas — Legajo</title></svelte:head>

<div class="space-y-4">
  <div class="flex items-center justify-between">
    <h2 class="text-lg font-bold text-gray-900">Faltas</h2>
    <a href="/preceptor/faltas/nueva" class="btn-primary text-sm">+ Nueva falta</a>
  </div>

  <!-- Buscador -->
  <div class="relative">
    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">🔍</span>
    <input
      type="text"
      bind:value={busqueda}
      oninput={filtrar}
      placeholder="Buscar por alumno o curso..."
      class="form-input pl-9 w-full text-sm"
    />
    {#if busqueda}
      <button
        onclick={limpiar}
        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-xs"
      >✕</button>
    {/if}
  </div>

  {#if busqueda}
    <p class="text-xs text-indigo-600">{listaFiltrada.length} de {data.lista.length} faltas</p>
  {/if}

  {#if data.lista.length === 0}
    <div class="card text-center py-10">
      <p class="text-3xl mb-2">📅</p>
      <p class="text-gray-500 text-sm">No hay faltas registradas.</p>
      <a href="/preceptor/faltas/nueva" class="mt-3 inline-block text-sm text-indigo-600 hover:underline">Registrar la primera</a>
    </div>
  {:else if listaFiltrada.length === 0}
    <div class="card text-center py-8">
      <p class="text-2xl mb-2">🔍</p>
      <p class="text-gray-500 text-sm">No hay faltas que coincidan con "<strong>{busqueda}</strong>".</p>
      <button onclick={limpiar} class="mt-2 text-sm text-indigo-600 hover:underline">Ver todas</button>
    </div>
  {:else}
    <div class="space-y-2">
      {#each listaFiltrada as falta}
        <div class="card space-y-1">
          <div class="flex items-center justify-between gap-2">
            <span class="text-sm font-semibold text-gray-800">{falta.cursoNombre}</span>
            <span class="text-xs px-2 py-0.5 rounded-full {TIPO_COLOR[falta.tipo] ?? 'bg-gray-100 text-gray-700'}">{TIPO_LABEL[falta.tipo] ?? falta.tipo}</span>
          </div>
          {#if falta.alumnos && falta.alumnos.length > 0}
            <p class="text-xs text-gray-600">👤 {falta.alumnos.map((a: any) => a.alumnoNombre).join(', ')}</p>
          {/if}
          <p class="text-xs text-gray-500">📅 {falta.fecha} · {falta.visibilidad === 'interna' ? '🔒 Interna' : '🌐 Pública'}</p>
          {#if falta.descripcion}<p class="text-xs text-gray-600 truncate">{falta.descripcion}</p>{/if}
          <span class="text-xs text-gray-400">Estado: {falta.estado}</span>
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

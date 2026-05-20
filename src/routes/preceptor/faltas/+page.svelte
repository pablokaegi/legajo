<script lang="ts">
  import { goto } from '$app/navigation';

  let { data } = $props();

  const TIPO_LABEL: Record<string, string> = {
    ausente: 'Ausente',
    retraso: 'Retraso',
    salida_anticipada: 'Salida anticipada',
    otra: 'Otra'
  };
  const TIPO_COLOR: Record<string, string> = {
    ausente:           'bg-red-100 text-red-700',
    retraso:           'bg-yellow-100 text-yellow-700',
    salida_anticipada: 'bg-orange-100 text-orange-700',
    otra:              'bg-gray-100 text-gray-700'
  };

  let alumnoQ = $state(data.alumnoQ);
  let cursoQ  = $state(data.cursoQ);

  function buildUrl(extraParams: Record<string, string> = {}) {
    const p = new URLSearchParams();
    const a = extraParams.alumno  ?? alumnoQ;
    const c = extraParams.curso   ?? cursoQ;
    const pg = extraParams.page   ?? '1';
    if (a)  p.set('alumno',  a);
    if (c)  p.set('curso',   c);
    if (pg !== '1') p.set('page', pg);
    return `?${p.toString()}`;
  }

  function buscar() {
    goto(buildUrl());
  }

  function limpiar() {
    alumnoQ = '';
    cursoQ  = '';
    goto('/preceptor/faltas');
  }

  const hayFiltros = $derived(!!data.alumnoQ || !!data.cursoQ);
</script>

<svelte:head>
  <title>Faltas — Legajo</title>
</svelte:head>

<div class="space-y-4">
  <div class="flex items-center justify-between">
    <h2 class="text-lg font-bold text-gray-900">Faltas</h2>
    <a href="/preceptor/faltas/nueva" class="btn-primary text-sm">+ Nueva falta</a>
  </div>

  <!-- Filtros -->
  <div class="bg-white rounded-xl border border-gray-200 p-3 space-y-2">
    <div class="flex gap-2">
      <input
        type="search"
        bind:value={alumnoQ}
        placeholder="🔍 Buscar alumno..."
        class="form-input flex-1 text-sm"
        onkeydown={(e) => e.key === 'Enter' && buscar()}
      />
      <input
        type="search"
        bind:value={cursoQ}
        placeholder="📚 Curso..."
        class="form-input w-28 text-sm"
        onkeydown={(e) => e.key === 'Enter' && buscar()}
      />
    </div>
    <div class="flex gap-2">
      <button
        onclick={buscar}
        class="flex-1 bg-indigo-600 text-white text-xs font-medium py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Buscar
      </button>
      {#if hayFiltros}
        <button
          onclick={limpiar}
          class="text-xs text-gray-400 hover:text-gray-700 px-2"
        >
          Limpiar
        </button>
      {/if}
    </div>
    {#if hayFiltros}
      <p class="text-xs text-indigo-600">
        {#if data.alumnoQ}Alumno: <strong>{data.alumnoQ}</strong>{/if}
        {#if data.alumnoQ && data.cursoQ} · {/if}
        {#if data.cursoQ}Curso: <strong>{data.cursoQ}</strong>{/if}
      </p>
    {/if}
  </div>

  {#if data.lista.length === 0}
    <div class="card text-center py-10">
      <p class="text-3xl mb-2">📅</p>
      {#if hayFiltros}
        <p class="text-gray-500 text-sm">No hay faltas que coincidan con los filtros.</p>
        <button onclick={limpiar} class="mt-2 text-sm text-indigo-600 hover:underline">Ver todas</button>
      {:else}
        <p class="text-gray-500 text-sm">No hay faltas registradas.</p>
        <a href="/preceptor/faltas/nueva" class="mt-3 inline-block text-sm text-indigo-600 hover:underline">Registrar la primera</a>
      {/if}
    </div>
  {:else}
    <div class="space-y-2">
      {#each data.lista as falta}
        <div class="card space-y-1">
          <div class="flex items-center justify-between gap-2">
            <span class="text-sm font-semibold text-gray-800">{falta.cursoNombre}</span>
            <span class="text-xs px-2 py-0.5 rounded-full {TIPO_COLOR[falta.tipo] ?? 'bg-gray-100 text-gray-700'}">
              {TIPO_LABEL[falta.tipo] ?? falta.tipo}
            </span>
          </div>
          <p class="text-xs text-gray-500">📅 {falta.fecha} · {falta.visibilidad === 'interna' ? '🔒 Interna' : '🌐 Pública'}</p>
          {#if falta.descripcion}
            <p class="text-xs text-gray-600 truncate">{falta.descripcion}</p>
          {/if}
          <div class="flex items-center justify-between pt-1">
            <span class="text-xs text-gray-400">Estado: {falta.estado}</span>
          </div>
        </div>
      {/each}
    </div>

    <!-- Paginación -->
    <div class="flex gap-2 justify-center pt-2">
      {#if data.page > 1}
        <a href={buildUrl({ page: String(data.page - 1) })} class="text-sm text-indigo-600 hover:underline">← Anterior</a>
      {/if}
      <span class="text-sm text-gray-500">Página {data.page}</span>
      {#if data.lista.length === 20}
        <a href={buildUrl({ page: String(data.page + 1) })} class="text-sm text-indigo-600 hover:underline">Siguiente →</a>
      {/if}
    </div>
  {/if}
</div>

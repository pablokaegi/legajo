<script lang="ts">
  import { page } from '$app/stores';

  let { data } = $props();

  let busqueda = $state('');
  let seleccionados = $state<Set<number>>(new Set());

  const esPreceptorODir = $derived(
    $page.data.usuario?.roles?.some((r: string) => ['preceptor', 'directivo'].includes(r)) ?? false
  );

  let alumnosFiltrados = $derived(
    busqueda.trim().length === 0
      ? data.alumnos
      : data.alumnos.filter(a =>
          a.fullname.toLowerCase().includes(busqueda.toLowerCase())
        )
  );

  function toggleAlumno(id: number) {
    const s = new Set(seleccionados);
    s.has(id) ? s.delete(id) : s.add(id);
    seleccionados = s;
  }

  function seleccionarTodos() {
    seleccionados = new Set(alumnosFiltrados.map(a => a.id));
  }

  function deseleccionarTodos() {
    seleccionados = new Set();
  }

  function urlBulk(destino: 'faltas' | 'amonestaciones' | 'reincorporaciones') {
    const ids = [...seleccionados].join(',');
    const base = `/preceptor/${destino}/nueva`;
    if (destino === 'faltas') {
      return `${base}?cursoId=${data.cursoId}&alumnos=${ids}`;
    }
    if (seleccionados.size === 1) {
      const id = [...seleccionados][0];
      const alumno = data.alumnos.find(a => a.id === id);
      const nombre = encodeURIComponent(alumno?.fullname ?? '');
      return `${base}?cursoId=${data.cursoId}&alumnoId=${id}&alumnoNombre=${nombre}`;
    }
    // Multiple students: pass comma-separated IDs; the form will show a selector
    return `${base}?cursoId=${data.cursoId}&alumnos=${ids}`;
  }
</script>

<svelte:head>
  <title>Alumnos del curso — Legajo</title>
</svelte:head>

<div class="space-y-4">
  <div class="flex items-center gap-2">
    <a href="/cursos" class="text-indigo-600 text-sm hover:underline">← Cursos</a>
  </div>

  <h1 class="text-xl font-bold text-gray-900">Alumnos</h1>

  {#if data.error}
    <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
      {data.error}
    </div>
  {:else if data.alumnos.length === 0}
    <div class="card text-center py-10">
      <p class="text-gray-500">No hay alumnos en este curso</p>
    </div>
  {:else}
    <!-- Búsqueda -->
    <input
      type="search"
      bind:value={busqueda}
      placeholder="Buscar alumno..."
      class="form-input"
    />

    <div class="flex items-center justify-between">
      <p class="text-sm text-gray-500">{alumnosFiltrados.length} alumno/s</p>
      {#if esPreceptorODir}
        <div class="flex gap-3 text-xs">
          <button onclick={seleccionarTodos} class="text-indigo-600 hover:underline">Seleccionar todos</button>
          {#if seleccionados.size > 0}
            <button onclick={deseleccionarTodos} class="text-gray-400 hover:underline">Ninguno</button>
          {/if}
        </div>
      {/if}
    </div>

    <div class="space-y-2">
      {#each alumnosFiltrados as alumno}
        <div class="card flex items-center gap-3
                    {esPreceptorODir && seleccionados.has(alumno.id) ? 'border-indigo-400 bg-indigo-50' : ''}">
          {#if esPreceptorODir}
            <button
              onclick={() => toggleAlumno(alumno.id)}
              class="w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors
                     {seleccionados.has(alumno.id) ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 hover:border-indigo-400'}"
              aria-label="Seleccionar {alumno.fullname}"
            >
              {#if seleccionados.has(alumno.id)}
                <span class="text-white text-xs font-bold leading-none">✓</span>
              {/if}
            </button>
          {/if}

          <div class="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <span class="text-indigo-600 font-semibold text-sm">
              {alumno.firstname[0]}{alumno.lastname[0]}
            </span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-gray-900 truncate">{alumno.fullname}</p>
            {#if alumno.email}
              <p class="text-xs text-gray-400 truncate">{alumno.email}</p>
            {/if}
          </div>
          <div class="flex gap-2 flex-shrink-0">
            <a
              href="/cursos/{data.cursoId}/alumnos/{alumno.id}/notas?nombre={encodeURIComponent(alumno.fullname)}"
              class="text-sm text-indigo-600 hover:underline"
              title="Ver notas"
            >📊</a>
            <a
              href="/observaciones/nueva?cursoId={data.cursoId}&alumnoId={alumno.id}&alumnoNombre={encodeURIComponent(alumno.fullname)}"
              class="text-sm text-indigo-600 hover:underline"
              title="Registrar observación"
            >✏️</a>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- Bulk action bar — shown to preceptor/directivo when students are selected -->
{#if esPreceptorODir && seleccionados.size > 0}
  <div class="fixed bottom-16 sm:bottom-4 left-0 right-0 flex justify-center px-4 z-20 pointer-events-none">
    <div class="bg-gray-900 text-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 max-w-sm w-full pointer-events-auto">
      <span class="text-sm font-semibold flex-1">
        {seleccionados.size} alumno{seleccionados.size !== 1 ? 's' : ''} seleccionado{seleccionados.size !== 1 ? 's' : ''}
      </span>
      <a
        href={urlBulk('faltas')}
        class="bg-amber-500 hover:bg-amber-400 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
        title="Registrar falta"
      >⏳ Falta</a>
      <a
        href={urlBulk('amonestaciones')}
        class="bg-red-500 hover:bg-red-400 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
        title="Registrar amonestación"
      >⚠️ Amonest.</a>
      <a
        href={urlBulk('reincorporaciones')}
        class="bg-green-600 hover:bg-green-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
        title="Registrar reincorporación"
      >↩️ Reinc.</a>
      <button
        onclick={deseleccionarTodos}
        class="text-gray-400 hover:text-white text-sm px-1 transition-colors"
        aria-label="Cerrar barra"
      >✕</button>
    </div>
  </div>
{/if}

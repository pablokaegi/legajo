<script lang="ts">
  import { goto } from '$app/navigation';

  let { data } = $props();

  let filtroAlumno = $state(data.filtros.alumno);
  let filtroCurso = $state(data.filtros.curso);
  let exportando = $state(false);
  let menuAlumno = $state<string | null>(null);

  function buildUrl(page?: number) {
    const params = new URLSearchParams();
    if (filtroAlumno) params.set('alumno', filtroAlumno);
    if (filtroCurso) params.set('curso', filtroCurso);
    if (page && page > 1) params.set('page', String(page));
    const qs = params.toString();
    return `/observaciones/historial${qs ? '?' + qs : ''}`;
  }

  function exportParams(alumno?: string): URLSearchParams {
    const params = new URLSearchParams();
    if (alumno) {
      params.set('alumno', alumno);
    } else {
      if (filtroAlumno) params.set('alumno', filtroAlumno);
      if (filtroCurso) params.set('curso', filtroCurso);
    }
    return params;
  }

  function aplicarFiltros() {
    goto(buildUrl(), { replaceState: true });
  }

  function limpiarFiltros() {
    filtroAlumno = '';
    filtroCurso = '';
    goto('/observaciones/historial', { replaceState: true });
  }

  function verAlumno(nombre: string) {
    goto(`/observaciones/historial?alumno=${encodeURIComponent(nombre)}`, { replaceState: true });
  }

  function irPagina(p: number) {
    goto(buildUrl(p), { replaceState: true });
  }

  async function exportarFiltro(formato: 'pdf' | 'xls') {
    exportando = true;
    try {
      const params = exportParams();
      params.set('formato', formato);
      const res = await fetch(`/api/export?${params.toString()}`);
      if (!res.ok) {
        const err = await res.json();
        alert(err.error ?? 'Error al exportar');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `observaciones.${formato === 'pdf' ? 'pdf' : 'xlsx'}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Error al generar el archivo');
    } finally {
      exportando = false;
    }
  }

  async function compartirAlumno(nombre: string, tipo: 'whatsapp' | 'email') {
    menuAlumno = null;
    exportando = true;
    try {
      const params = exportParams(nombre);
      params.set('formato', tipo);
      const res = await fetch(`/api/export?${params.toString()}`);
      if (!res.ok) {
        const err = await res.json();
        alert(err.error ?? 'Error al generar');
        return;
      }
      const { url } = await res.json();
      window.open(url, '_blank');
    } catch {
      alert('Error al generar el enlace');
    } finally {
      exportando = false;
    }
  }

  function toggleMenu(nombre: string) {
    menuAlumno = menuAlumno === nombre ? null : nombre;
  }

  const actitudLabel = (v: number) => ['', '😐', '🙂', '😊', '😄', '🌟'][v] ?? v;
</script>

<svelte:head>
  <title>Historial — Legajo</title>
</svelte:head>

<div class="space-y-4">
  <div class="flex items-center justify-between">
    <h1 class="text-xl font-bold text-gray-900">Historial</h1>
    <a href="/observaciones/nueva" class="text-sm text-indigo-600 hover:underline">+ Nueva</a>
  </div>

  {#if data.guardado}
    <div class="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-3 py-2">
      ✓ Observación guardada correctamente
    </div>
  {/if}

  <!-- Filtros -->
  <div class="card space-y-3">
    <p class="text-sm font-medium text-gray-700">Buscar alumno o curso</p>
    <div class="grid grid-cols-2 gap-2">
      <div>
        <label for="filtro-alumno" class="form-label text-xs">Alumno</label>
        <input
          id="filtro-alumno"
          type="search"
          bind:value={filtroAlumno}
          placeholder="Nombre o apellido"
          class="form-input text-sm py-2"
        />
      </div>
      <div>
        <label for="filtro-curso" class="form-label text-xs">Curso</label>
        <input
          id="filtro-curso"
          type="search"
          bind:value={filtroCurso}
          placeholder="Nombre del curso"
          class="form-input text-sm py-2"
        />
      </div>
    </div>
    <div class="flex gap-2">
      <button onclick={aplicarFiltros} class="btn-primary py-2 text-sm">Buscar</button>
      {#if filtroAlumno || filtroCurso}
        <button onclick={limpiarFiltros} class="btn-secondary py-2 text-sm">Limpiar</button>
      {/if}
    </div>
  </div>

  {#if data.observaciones.length === 0}
    <div class="card text-center py-10">
      <p class="text-gray-500">No hay observaciones registradas</p>
      <a href="/observaciones/nueva" class="text-indigo-600 text-sm mt-2 inline-block">
        Registrar la primera
      </a>
    </div>
  {:else}
    <!-- Exportar vista actual -->
    <div class="card space-y-3">
      <div>
        <p class="text-sm font-medium text-gray-700">Exportar historial</p>
        <p class="text-xs text-gray-400">Descarga el historial visible con los filtros aplicados</p>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <button
          onclick={() => exportarFiltro('pdf')}
          disabled={exportando}
          class="btn-secondary py-2 text-sm"
        >
          PDF
        </button>
        <button
          onclick={() => exportarFiltro('xls')}
          disabled={exportando}
          class="btn-secondary py-2 text-sm"
        >
          Excel
        </button>
      </div>
    </div>

    <p class="text-sm text-gray-500">
      {data.total} registro/s · Página {data.page} de {data.totalPages}
    </p>
    <div class="space-y-3">
      {#each data.observaciones as obs}
        <div class="card space-y-2">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <button
                onclick={() => verAlumno(obs.alumnoNombre)}
                class="font-semibold text-gray-900 truncate hover:text-indigo-600 transition-colors text-left"
              >
                {obs.alumnoNombre}
              </button>
              <p class="text-xs text-gray-400 truncate">{obs.cursoNombre}</p>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
              <span class="text-xs text-gray-400">{obs.fecha}</span>
              <div class="relative">
                <button
                  onclick={() => toggleMenu(obs.alumnoNombre)}
                  class="text-gray-400 hover:text-indigo-600 px-1 text-lg leading-none"
                  title="Compartir con la familia"
                >
                  ...
                </button>
                {#if menuAlumno === obs.alumnoNombre}
                  <div class="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 w-52">
                    <p class="px-3 py-1.5 text-xs text-gray-400 font-medium">Compartir con la familia</p>
                    <button
                      onclick={() => verAlumno(obs.alumnoNombre)}
                      class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Ver historial completo
                    </button>
                    <button
                      onclick={() => compartirAlumno(obs.alumnoNombre, 'whatsapp')}
                      class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Enviar por WhatsApp
                    </button>
                    <button
                      onclick={() => compartirAlumno(obs.alumnoNombre, 'email')}
                      class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Enviar por Email
                    </button>
                  </div>
                {/if}
              </div>
            </div>
          </div>

          <div class="flex gap-4 text-sm">
            <div class="flex items-center gap-1">
              <span class="text-gray-500">Actitud</span>
              <span class="font-semibold text-indigo-600">{obs.actitud}/5</span>
              <span>{actitudLabel(obs.actitud)}</span>
            </div>
            <div class="flex items-center gap-1">
              <span class="text-gray-500">Part.</span>
              <span class="font-semibold text-indigo-600">{obs.participacion}/5</span>
            </div>
            <div class="flex items-center gap-1">
              {#if obs.tareaCompleta}
                <span class="badge-ok">Tarea ✓</span>
              {:else}
                <span class="badge-error">Tarea ✗</span>
              {/if}
            </div>
          </div>

          {#if obs.observacionTexto}
            <p class="text-sm text-gray-600 border-t border-gray-100 pt-2 italic">
              "{obs.observacionTexto}"
            </p>
          {/if}
        </div>
      {/each}
    </div>

    {#if data.totalPages > 1}
      <div class="flex items-center justify-center gap-3 pt-2">
        <button
          onclick={() => irPagina(data.page - 1)}
          disabled={data.page <= 1}
          class="btn-secondary py-2 px-4 text-sm w-auto"
        >
          Anterior
        </button>
        <span class="text-sm text-gray-500">
          {data.page} / {data.totalPages}
        </span>
        <button
          onclick={() => irPagina(data.page + 1)}
          disabled={data.page >= data.totalPages}
          class="btn-secondary py-2 px-4 text-sm w-auto"
        >
          Siguiente
        </button>
      </div>
    {/if}
  {/if}
</div>

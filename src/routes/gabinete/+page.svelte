<script lang="ts">
  let { data } = $props();

  let filtroCurso = $state('');
  let cursos = $derived(
    filtroCurso.trim()
      ? data.cursos.filter((c) => c.nombre.toLowerCase().includes(filtroCurso.trim().toLowerCase()))
      : data.cursos
  );
  const fmt = (f: string | null) => (f ? new Date(f + 'T12:00:00').toLocaleDateString('es-AR') : '—');
</script>

<svelte:head><title>Gabinete — Legajo</title></svelte:head>

<div class="space-y-4">
  <!-- Resumen -->
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
    <a href="/gabinete/casos?estado=abiertos" class="card text-center hover:border-indigo-300">
      <p class="text-2xl font-bold text-indigo-700">{data.resumen.abiertos}</p>
      <p class="text-xs text-gray-500">Casos abiertos</p>
    </a>
    <a href="/gabinete/casos?estado=derivado" class="card text-center hover:border-indigo-300">
      <p class="text-2xl font-bold {data.resumen.conteo.derivado ? 'text-amber-600' : 'text-gray-400'}">
        {data.resumen.conteo.derivado ?? 0}
      </p>
      <p class="text-xs text-gray-500">Derivaciones sin evaluar</p>
    </a>
    <div class="card text-center">
      <p class="text-2xl font-bold {data.resumen.vencidas.length ? 'text-red-600' : 'text-gray-400'}">{data.resumen.vencidas.length}</p>
      <p class="text-xs text-gray-500">Revisiones vencidas</p>
    </div>
    <a href="/gabinete/casos?estado=abiertos&nivel=3" class="card text-center hover:border-indigo-300">
      <p class="text-2xl font-bold {data.resumen.nivel3 ? 'text-red-600' : 'text-gray-400'}">{data.resumen.nivel3}</p>
      <p class="text-xs text-gray-500">En nivel 3 (intensivo)</p>
    </a>
  </div>

  <!-- Derivaciones nuevas -->
  {#if data.derivados.length > 0}
    <div class="card space-y-2">
      <p class="text-sm font-semibold text-gray-800">📨 Derivaciones para evaluar</p>
      {#each data.derivados as c}
        <a href="/gabinete/casos/{c.id}" class="block rounded-lg border border-gray-200 p-2 hover:border-indigo-300">
          <p class="text-sm font-medium text-gray-900">{c.alumnoNombre}
            <span class="text-xs text-gray-400">· {c.cursoNombre ?? 'sin curso'}</span></p>
          <p class="text-xs text-gray-600 line-clamp-2 whitespace-pre-line">{c.motivo}</p>
        </a>
      {/each}
    </div>
  {/if}

  <!-- Revisiones vencidas -->
  {#if data.resumen.vencidas.length > 0}
    <div class="card space-y-2">
      <p class="text-sm font-semibold text-gray-800">⏰ Revisiones vencidas</p>
      <p class="text-xs text-gray-500">
        Monitorear el progreso con regularidad y ajustar el plan si no hay avance es lo que hace que un
        apoyo funcione. — Fuchs & Fuchs (2006).
      </p>
      {#each data.resumen.vencidas as c}
        <a href="/gabinete/casos/{c.id}" class="flex items-center justify-between rounded-lg border border-red-100 bg-red-50/40 p-2 hover:border-red-300">
          <span class="text-sm text-gray-900">{c.alumnoNombre} <span class="text-xs text-gray-400">· nivel {c.nivel}</span></span>
          <span class="text-xs text-red-700">revisar desde {fmt(c.proximaRevision)}</span>
        </a>
      {/each}
    </div>
  {/if}

  <!-- Alerta temprana por curso -->
  <div class="card space-y-2">
    <p class="text-sm font-semibold text-gray-800">🚦 Alerta temprana por curso</p>
    <p class="text-xs text-gray-500">
      Cruza asistencia, conducta, rendimiento y vínculos de cada alumno para detectar a tiempo a quién conviene
      acompañar. — Balfanz, Herzog & Mac Iver (2007); Allensworth & Easton (2007).
    </p>
    <input type="search" bind:value={filtroCurso} placeholder="Buscar curso…" class="form-input text-sm" />
    <div class="grid sm:grid-cols-2 gap-1.5 max-h-80 overflow-y-auto">
      {#each cursos as c}
        <a href="/gabinete/curso/{c.id}" class="text-sm px-3 py-2 rounded-lg bg-gray-50 hover:bg-indigo-50 text-gray-800 truncate">{c.nombre}</a>
      {:else}
        <p class="text-sm text-gray-500">No se pudieron cargar los cursos de Moodle.</p>
      {/each}
    </div>
  </div>
</div>

<script lang="ts">
  let { data } = $props();

  const MODULO_ICON: Record<string, string> = {
    assign: '📝',
    quiz: '❓',
    forum: '💬',
    workshop: '🔧',
    scorm: '📦',
    h5pactivity: '🎮',
    choice: '✅',
  };

  // Separar el total del curso de los ítems individuales
  let totalCurso = $derived(
    data.grades?.gradeitems.find(i => i.itemtype === 'course') ?? null
  );

  let items = $derived(
    data.grades?.gradeitems.filter(i => i.itemtype !== 'course') ?? []
  );

  function iconForModule(mod: string | null): string {
    if (!mod) return '📋';
    return MODULO_ICON[mod] ?? '📋';
  }

  function colorNota(percent: number | null): string {
    if (percent === null) return 'text-gray-400';
    if (percent >= 60) return 'text-green-600';
    if (percent >= 40) return 'text-yellow-600';
    return 'text-red-600';
  }
</script>

<svelte:head>
  <title>Notas — {data.alumnoNombre} — Legajo</title>
</svelte:head>

<div class="space-y-4">
  <!-- Encabezado -->
  <div class="flex items-center gap-2">
    <a href="/cursos/{data.courseId}" class="text-indigo-600 text-sm hover:underline">← Alumnos</a>
  </div>

  <div>
    <h1 class="text-xl font-bold text-gray-900">{data.alumnoNombre}</h1>
    {#if data.cursoNombre}
      <p class="text-sm text-gray-500">{data.cursoNombre}</p>
    {/if}
  </div>

  {#if data.error}
    <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
      {data.error}
    </div>
  {:else if !data.grades || items.length === 0}
    <div class="card text-center py-10">
      <p class="text-gray-500">No hay calificaciones registradas para este alumno</p>
    </div>
  {:else}
    <!-- Total del curso -->
    {#if totalCurso}
      <div class="card bg-indigo-50 border-indigo-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-indigo-500 font-medium uppercase tracking-wide">Promedio general</p>
            <p class="text-2xl font-bold {colorNota(totalCurso.gradepercent)} mt-0.5">
              {totalCurso.gradeformatted}
            </p>
          </div>
          {#if totalCurso.gradepercent !== null}
            <div class="text-right">
              <p class="text-sm text-gray-500">{Math.round(totalCurso.gradepercent)}%</p>
              <div class="w-24 h-2 bg-gray-200 rounded-full mt-1">
                <div
                  class="h-2 rounded-full {totalCurso.gradepercent >= 60 ? 'bg-green-500' : totalCurso.gradepercent >= 40 ? 'bg-yellow-500' : 'bg-red-500'}"
                  style="width: {Math.min(totalCurso.gradepercent, 100)}%"
                ></div>
              </div>
            </div>
          {/if}
        </div>
      </div>
    {/if}

    <!-- Lista de ítems -->
    <p class="text-sm text-gray-500">{items.length} actividad/es</p>

    <div class="space-y-2">
      {#each items as item}
        <div class="card">
          <div class="flex items-start gap-3">
            <span class="text-xl flex-shrink-0 mt-0.5">{iconForModule(item.itemmodule)}</span>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-gray-900 truncate">{item.itemname ?? 'Sin nombre'}</p>
              {#if item.itemmodule}
                <p class="text-xs text-gray-400 capitalize">{item.itemmodule}</p>
              {/if}
              {#if item.feedback}
                <p class="text-xs text-gray-500 mt-1 italic">"{item.feedback}"</p>
              {/if}
            </div>
            <div class="text-right flex-shrink-0">
              {#if item.graderaw === null}
                <p class="text-sm text-gray-400">Sin calificar</p>
              {:else}
                <p class="text-lg font-bold {colorNota(item.gradepercent)}">
                  {item.gradeformatted}
                </p>
                <p class="text-xs text-gray-400">/ {item.grademax}</p>
              {/if}
            </div>
          </div>

          <!-- Barra de progreso -->
          {#if item.graderaw !== null && item.gradepercent !== null}
            <div class="w-full h-1.5 bg-gray-100 rounded-full mt-2">
              <div
                class="h-1.5 rounded-full {item.gradepercent >= 60 ? 'bg-green-400' : item.gradepercent >= 40 ? 'bg-yellow-400' : 'bg-red-400'}"
                style="width: {Math.min(item.gradepercent, 100)}%"
              ></div>
            </div>
          {/if}
        </div>
      {/each}
    </div>

    <!-- Acceso rápido a nueva observación -->
    <a
      href="/observaciones/nueva?cursoId={data.courseId}&alumnoId={data.userId}&alumnoNombre={encodeURIComponent(data.alumnoNombre)}"
      class="btn-primary w-full text-center block"
    >
      ✏️ Registrar observación
    </a>
  {/if}
</div>

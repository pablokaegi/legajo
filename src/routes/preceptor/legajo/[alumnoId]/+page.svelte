<script lang="ts">
  let { data } = $props();
  const { legajo } = data;

  const GRAVEDAD_COLOR: Record<string, string> = {
    leve:    'bg-yellow-100 text-yellow-700',
    mediana: 'bg-orange-100 text-orange-700',
    grave:   'bg-red-100 text-red-700'
  };
  const TIPO_LABEL: Record<string, string> = {
    ausente: 'Ausente', retraso: 'Retraso',
    salida_anticipada: 'Salida anticipada', otra: 'Otra'
  };
  const TIPO_COLOR: Record<string, string> = {
    ausente: 'bg-red-100 text-red-700',
    retraso: 'bg-yellow-100 text-yellow-700',
    salida_anticipada: 'bg-orange-100 text-orange-700',
    otra: 'bg-gray-100 text-gray-700'
  };

  // Sección activa (tab)
  let seccion = $state<'observaciones' | 'faltas' | 'amonestaciones' | 'actas'>('observaciones');

  const tabs = [
    { id: 'observaciones', label: 'Observaciones', emoji: '📝', count: legajo.observaciones.length },
    { id: 'faltas',        label: 'Faltas',         emoji: '📅', count: legajo.faltas.length },
    { id: 'amonestaciones',label: 'Amonestaciones', emoji: '⚠️', count: legajo.amonestaciones.length },
    { id: 'actas',         label: 'Actas',          emoji: '📄', count: legajo.actas.length }
  ] as const;
</script>

<svelte:head><title>{legajo.alumnoNombre} — Legajo</title></svelte:head>

<div class="space-y-4">
  <!-- Encabezado -->
  <div>
    <a href="javascript:history.back()" class="text-indigo-600 text-sm hover:underline">← Volver</a>
    <div class="mt-2 flex items-center gap-3">
      <div class="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
        <span class="text-indigo-700 font-bold text-lg">
          {legajo.alumnoNombre.charAt(0).toUpperCase()}
        </span>
      </div>
      <div>
        <h1 class="text-xl font-bold text-gray-900">{legajo.alumnoNombre}</h1>
        <p class="text-xs text-gray-400">Moodle ID: {legajo.alumnoMoodleId}</p>
      </div>
    </div>
  </div>

  <!-- Resumen rápido -->
  <div class="grid grid-cols-4 gap-2">
    <div class="bg-blue-50 rounded-xl p-3 text-center">
      <p class="text-2xl font-bold text-blue-600">{legajo.observaciones.length}</p>
      <p class="text-xs text-blue-500">Obs.</p>
    </div>
    <div class="bg-red-50 rounded-xl p-3 text-center">
      <p class="text-2xl font-bold text-red-600">{legajo.faltas.length}</p>
      <p class="text-xs text-red-500">Faltas</p>
    </div>
    <div class="bg-orange-50 rounded-xl p-3 text-center">
      <p class="text-2xl font-bold text-orange-600">{legajo.amonestaciones.length}</p>
      <p class="text-xs text-orange-500">Amon.</p>
    </div>
    <div class="bg-green-50 rounded-xl p-3 text-center">
      <p class="text-2xl font-bold text-green-600">{legajo.actas.length}</p>
      <p class="text-xs text-green-500">Actas</p>
    </div>
  </div>

  <!-- Tabs -->
  <div class="flex gap-1 overflow-x-auto pb-1 border-b border-gray-200">
    {#each tabs as tab}
      <button
        onclick={() => seccion = tab.id}
        class="flex-shrink-0 text-xs px-3 py-2 rounded-t-lg transition-colors font-medium
               {seccion === tab.id
                 ? 'bg-indigo-600 text-white'
                 : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}"
      >
        {tab.emoji} {tab.label}
        {#if tab.count > 0}
          <span class="ml-1 px-1.5 py-0.5 rounded-full text-[10px]
                       {seccion === tab.id ? 'bg-indigo-400 text-white' : 'bg-gray-200 text-gray-600'}">
            {tab.count}
          </span>
        {/if}
      </button>
    {/each}
  </div>

  <!-- ── OBSERVACIONES ── -->
  {#if seccion === 'observaciones'}
    {#if legajo.observaciones.length === 0}
      <div class="card text-center py-8">
        <p class="text-2xl mb-2">📝</p>
        <p class="text-gray-500 text-sm">Sin observaciones registradas.</p>
        <a
          href="/observaciones/nueva?alumnoId={legajo.alumnoMoodleId}&alumnoNombre={encodeURIComponent(legajo.alumnoNombre)}"
          class="mt-2 inline-block text-sm text-indigo-600 hover:underline"
        >Registrar observación</a>
      </div>
    {:else}
      <div class="space-y-2">
        {#each legajo.observaciones as obs}
          <div class="card space-y-1">
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-400">📅 {obs.fecha}</span>
              {#if obs.cursoNombre}
                <span class="text-xs text-gray-500">{obs.cursoNombre}</span>
              {/if}
            </div>
            {#if obs.observacionTexto}
              <p class="text-sm text-gray-700">{obs.observacionTexto}</p>
            {/if}
            {#if obs.actitud != null || obs.tareaCompleta != null || obs.participacion != null}
              <div class="flex gap-3 text-xs text-gray-500 pt-1">
                {#if obs.actitud != null}<span>Actitud: <strong>{obs.actitud}/5</strong></span>{/if}
                {#if obs.tareaCompleta != null}<span>Tarea: <strong>{obs.tareaCompleta ? '✓' : '✗'}</strong></span>{/if}
                {#if obs.participacion != null}<span>Participación: <strong>{obs.participacion}/5</strong></span>{/if}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  {/if}

  <!-- ── FALTAS ── -->
  {#if seccion === 'faltas'}
    {#if legajo.faltas.length === 0}
      <div class="card text-center py-8">
        <p class="text-2xl mb-2">📅</p>
        <p class="text-gray-500 text-sm">Sin faltas registradas.</p>
        <a
          href="/preceptor/faltas/nueva?alumnoId={legajo.alumnoMoodleId}&alumnoNombre={encodeURIComponent(legajo.alumnoNombre)}"
          class="mt-2 inline-block text-sm text-indigo-600 hover:underline"
        >Registrar falta</a>
      </div>
    {:else}
      <div class="space-y-2">
        {#each legajo.faltas as falta}
          <div class="card space-y-1">
            <div class="flex items-center justify-between gap-2">
              <span class="text-sm font-semibold text-gray-800">{falta.cursoNombre}</span>
              <span class="text-xs px-2 py-0.5 rounded-full {TIPO_COLOR[falta.tipo] ?? 'bg-gray-100 text-gray-700'}">
                {TIPO_LABEL[falta.tipo] ?? falta.tipo}
              </span>
            </div>
            <p class="text-xs text-gray-500">📅 {falta.fecha} · {falta.visibilidad === 'interna' ? '🔒' : '🌐'} {falta.estado}</p>
            {#if falta.descripcion}
              <p class="text-xs text-gray-600">{falta.descripcion}</p>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  {/if}

  <!-- ── AMONESTACIONES ── -->
  {#if seccion === 'amonestaciones'}
    {#if legajo.amonestaciones.length === 0}
      <div class="card text-center py-8">
        <p class="text-2xl mb-2">⚠️</p>
        <p class="text-gray-500 text-sm">Sin amonestaciones registradas.</p>
        <a
          href="/preceptor/amonestaciones/nueva?alumnoId={legajo.alumnoMoodleId}&alumnoNombre={encodeURIComponent(legajo.alumnoNombre)}"
          class="mt-2 inline-block text-sm text-indigo-600 hover:underline"
        >Registrar amonestación</a>
      </div>
    {:else}
      <div class="space-y-2">
        {#each legajo.amonestaciones as amon}
          <div class="card space-y-1">
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs px-2 py-0.5 rounded-full {GRAVEDAD_COLOR[amon.gravedad] ?? 'bg-gray-100 text-gray-600'}">
                {amon.gravedad}
              </span>
              <span class="text-xs text-gray-400">📅 {amon.fecha}</span>
            </div>
            {#if amon.cursoNombre}<p class="text-xs text-gray-500">{amon.cursoNombre}</p>{/if}
            <p class="text-sm text-gray-700">{amon.motivo}</p>
            {#if amon.accionesSugeridas}
              <p class="text-xs text-gray-500 italic">📌 {amon.accionesSugeridas}</p>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  {/if}

  <!-- ── ACTAS ── -->
  {#if seccion === 'actas'}
    {#if legajo.actas.length === 0}
      <div class="card text-center py-8">
        <p class="text-2xl mb-2">📄</p>
        <p class="text-gray-500 text-sm">Sin actas registradas para este alumno.</p>
        <a href="/preceptor/actas/nueva" class="mt-2 inline-block text-sm text-indigo-600 hover:underline">Crear acta</a>
      </div>
    {:else}
      <div class="space-y-2">
        {#each legajo.actas as acta}
          <a href="/preceptor/actas/{acta.id}" class="card block hover:border-indigo-300 transition-colors space-y-1">
            <div class="flex items-start justify-between gap-2">
              <p class="text-sm font-semibold text-gray-800 flex-1">{acta.titulo}</p>
              <span class="text-xs px-2 py-0.5 rounded-full flex-shrink-0
                           {acta.estado === 'abierta' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}">
                {acta.estado}
              </span>
            </div>
            <p class="text-xs text-gray-500">📅 {acta.fecha}</p>
            <p class="text-xs text-gray-600 line-clamp-2">{acta.resumen}</p>
          </a>
        {/each}
      </div>
    {/if}
  {/if}

  <!-- Acciones rápidas -->
  <div class="pt-2 border-t border-gray-100">
    <p class="text-xs text-gray-400 mb-2">Acciones rápidas</p>
    <div class="flex flex-wrap gap-2">
      <a
        href="/observaciones/nueva?alumnoId={legajo.alumnoMoodleId}&alumnoNombre={encodeURIComponent(legajo.alumnoNombre)}"
        class="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
      >✏️ Observación</a>
      <a
        href="/preceptor/faltas/nueva?alumnoId={legajo.alumnoMoodleId}&alumnoNombre={encodeURIComponent(legajo.alumnoNombre)}"
        class="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
      >📅 Falta</a>
      <a
        href="/preceptor/amonestaciones/nueva?alumnoMoodleId={legajo.alumnoMoodleId}&alumnoNombre={encodeURIComponent(legajo.alumnoNombre)}"
        class="text-xs px-3 py-1.5 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors"
      >⚠️ Amonestación</a>
      <a
        href="/preceptor/actas/nueva"
        class="text-xs px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
      >📄 Acta</a>
    </div>
  </div>
</div>

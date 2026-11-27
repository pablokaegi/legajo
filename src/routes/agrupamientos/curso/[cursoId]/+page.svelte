<script lang="ts">
  let { data } = $props();

  const MODO_LBL: Record<string, string> = {
    afinidad: '🤝 Afinidad', heterogeneo: '⚖️ Heterogéneo', rendimiento: '📚 Rendimiento',
    aleatorio: '🎲 Aleatorio', manual: '✋ Manual', ubicacion: '🪑 Ubicación', tutoria: '🧑‍🏫 Tutoría'
  };
  const TENDENCIA: Record<string, { lbl: string; cls: string }> = {
    sostenida: { lbl: '⚠️ Atención sostenida', cls: 'text-red-700' },
    empeora: { lbl: '↘ Perdió vínculos', cls: 'text-amber-700' },
    mejora: { lbl: '↗ Mejora', cls: 'text-green-700' }
  };
  let sostenidos = $derived(data.alumnos.filter((a) => a.tendencia === 'sostenida').length);
</script>

<svelte:head><title>Evolución — {data.cursoNombre}</title></svelte:head>

<div class="space-y-4">
  <div class="flex items-center gap-2">
    <a href="/agrupamientos" class="text-indigo-600 text-sm hover:underline">← Agrupamientos</a>
    <h2 class="text-lg font-bold text-gray-900">Evolución del curso</h2>
  </div>

  <div class="card">
    <p class="text-sm font-semibold text-gray-800">🎓 {data.cursoNombre}</p>
    <p class="text-xs text-gray-500">
      {data.columnas.length} votación(es). Una sola foto puede engañar; lo que más importa es la baja aceptación
      que se repite en el tiempo. — Parker & Asher (1987).
    </p>
  </div>

  {#if sostenidos > 0}
    <div class="bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg px-3 py-2">
      {sostenidos} alumno(s) aparecen para acompañar en al menos 2 de las últimas 3 votaciones: conviene
      priorizarlos (ubicación, roles visibles, conversación con el equipo de orientación).
    </div>
  {/if}

  <!-- Resumen por votación -->
  <div class="card overflow-x-auto">
    <table class="w-full text-sm">
      <thead>
        <tr class="text-xs text-gray-500 border-b border-gray-200">
          <th class="text-left font-medium py-1.5">Votación</th>
          <th class="text-center font-medium py-1.5">Particip.</th>
          <th class="text-center font-medium py-1.5">Recíprocas</th>
          <th class="text-center font-medium py-1.5">Sin elecciones</th>
          <th class="text-center font-medium py-1.5">A acompañar</th>
        </tr>
      </thead>
      <tbody>
        {#each data.columnas as c}
          <tr class="border-b border-gray-100">
            <td class="py-1.5">
              <a href="/agrupamientos/{c.id}/estadisticas" class="text-indigo-700 hover:underline">{c.titulo}</a>
              <span class="block text-xs text-gray-400">
                {c.fecha}{c.modo !== 'nominacion' ? ' · formato anterior' : ''}{c.clima === 'requiere_atencion' ? ' · ⚠️ clima' : ''}
              </span>
            </td>
            <td class="text-center text-gray-600">{c.participacion}%</td>
            <td class="text-center text-gray-600">{c.reciprocidad}%</td>
            <td class="text-center {c.sinElecciones ? 'text-amber-700' : 'text-gray-400'}">{c.sinElecciones}</td>
            <td class="text-center {c.acompanar ? 'text-amber-700' : 'text-gray-400'}">{c.acompanar}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <!-- Alumno por alumno -->
  <div class="card space-y-2">
    <p class="text-sm font-semibold text-gray-800">Alumno por alumno</p>
    <p class="text-xs text-gray-500">
      Cada celda: elecciones recibidas / compañeros que podían elegirlo. En ámbar, las votaciones en que
      convenía acompañarlo.
    </p>
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-xs text-gray-500 border-b border-gray-200">
            <th class="text-left font-medium py-1.5">Alumno</th>
            {#each data.columnas as c, i}
              <th class="text-center font-medium py-1.5" title={c.titulo}>#{i + 1}</th>
            {/each}
            <th class="text-left font-medium py-1.5">Tendencia</th>
          </tr>
        </thead>
        <tbody>
          {#each data.alumnos as a}
            <tr class="border-b border-gray-100">
              <td class="py-1.5 text-gray-800 whitespace-nowrap">{a.nombre}</td>
              {#each a.fila as celda}
                <td class="text-center text-xs {celda?.acompanar ? 'bg-amber-100 text-amber-900 font-semibold' : 'text-gray-600'}">
                  {celda ? `${celda.recibidas}/${celda.exposicion}` : '—'}
                </td>
              {/each}
              <td class="text-xs whitespace-nowrap {a.tendencia ? TENDENCIA[a.tendencia].cls : ''}">
                {a.tendencia ? TENDENCIA[a.tendencia].lbl : ''}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Qué agrupaciones funcionaron -->
  {#if data.evaluaciones.length > 0}
    <div class="card space-y-1.5">
      <p class="text-sm font-semibold text-gray-800">Qué te funcionó en este curso</p>
      <p class="text-xs text-gray-500">Según cómo evaluaste las agrupaciones guardadas.</p>
      {#each data.evaluaciones as e}
        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-800">{MODO_LBL[e.modo] ?? e.modo}</span>
          <span class="text-xs text-gray-600">
            👍 {e.funciono} · 😐 {e.regular} · 👎 {e.no_funciono}{e.sinEvaluar ? ` · ${e.sinEvaluar} sin evaluar` : ''}
          </span>
        </div>
      {/each}
    </div>
  {/if}
</div>

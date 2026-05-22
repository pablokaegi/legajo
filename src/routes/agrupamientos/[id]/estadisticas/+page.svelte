<script lang="ts">
  let { data } = $props();
  let sesion = $derived(data.sesion);
  let stats = $derived(data.stats);
  let analisis = $derived(data.analisis);

  const PUNTAJE_COLOR: Record<number, string> = {
    1: 'bg-red-500', 2: 'bg-orange-500', 3: 'bg-yellow-500', 4: 'bg-teal-500', 5: 'bg-green-600'
  };
  let maxDist = $derived(stats ? Math.max(1, ...Object.values(stats.distribucion)) : 1);
</script>

<svelte:head><title>Estadísticas — {sesion.titulo}</title></svelte:head>

<div class="space-y-4">
  <div class="flex items-center gap-2">
    <a href="/agrupamientos/{sesion.id}" class="text-indigo-600 text-sm hover:underline">← Panel</a>
    <h2 class="text-lg font-bold text-gray-900">Estadísticas</h2>
  </div>

  <div class="card">
    <p class="text-sm font-semibold text-gray-800">{sesion.titulo}</p>
    <p class="text-xs text-gray-500">🎓 {sesion.cursoNombre}</p>
  </div>

  {#if !stats}
    <div class="card text-center py-10">
      <p class="text-3xl mb-2">📭</p>
      <p class="text-gray-500 text-sm">Todavía no hay votos para analizar.</p>
    </div>
  {:else}
    <!-- Resumen -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {#each [['Votaron', stats.totalVotantes], ['Participación', stats.participacion + '%'], ['Calificaciones', stats.totalRatings], ['Bloqueos', stats.totalBloqueos]] as [lbl, val]}
        <div class="card text-center">
          <p class="text-xl font-bold text-indigo-700">{val}</p>
          <p class="text-xs text-gray-500">{lbl}</p>
        </div>
      {/each}
    </div>

    <!-- Distribución -->
    <div class="card space-y-2">
      <p class="text-sm font-semibold text-gray-800">Distribución de calificaciones</p>
      {#each [5, 4, 3, 2, 1] as p}
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-500 w-3">{p}</span>
          <div class="flex-1 h-4 bg-gray-100 rounded overflow-hidden">
            <div class="h-full {PUNTAJE_COLOR[p]}" style="width: {(stats.distribucion[p] / maxDist) * 100}%"></div>
          </div>
          <span class="text-xs text-gray-500 w-8 text-right">{stats.distribucion[p]}</span>
        </div>
      {/each}
    </div>

    <!-- Mejor valorados -->
    <div class="card space-y-1.5">
      <p class="text-sm font-semibold text-gray-800">🏆 Mejor valorados por el grupo</p>
      {#each stats.populares.slice(0, 8) as a}
        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-800 truncate">{a.nombre}</span>
          <span class="text-xs text-gray-500 flex-shrink-0 ml-2">⭐ {a.promedio} · {a.totalVotos} votos</span>
        </div>
      {/each}
    </div>

    <!-- Más bloqueados + bloqueos mutuos -->
    <div class="grid sm:grid-cols-2 gap-2">
      <div class="card space-y-1.5">
        <p class="text-sm font-semibold text-gray-800">🚫 Pedidos de no quedar juntos</p>
        {#if stats.masBloqueados.length === 0}
          <p class="text-sm text-gray-500">Nadie recibió pedidos.</p>
        {:else}
          {#each stats.masBloqueados as b}
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-800 truncate">{b.nombre}</span>
              <span class="text-xs text-gray-500 flex-shrink-0 ml-2">{b.cantidad}</span>
            </div>
          {/each}
        {/if}
      </div>
      <div class="card space-y-1.5">
        <p class="text-sm font-semibold text-gray-800">💥 Incompatibilidades mutuas</p>
        {#if stats.bloqueosMutuos.length === 0}
          <p class="text-sm text-gray-500">No hay conflictos mutuos.</p>
        {:else}
          {#each stats.bloqueosMutuos as bm}
            <p class="text-sm text-gray-800">⚠️ {bm.a.nombre} ↔ {bm.b.nombre}</p>
          {/each}
        {/if}
      </div>
    </div>

    <!-- Mejores afinidades -->
    <div class="card space-y-1.5">
      <p class="text-sm font-semibold text-gray-800">💞 Mejores afinidades mutuas</p>
      {#if stats.mejoresAfinidades.length === 0}
        <p class="text-sm text-gray-500">No hay afinidades mutuas.</p>
      {:else}
        {#each stats.mejoresAfinidades.slice(0, 10) as af}
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-800 truncate">{af.a.nombre} ↔ {af.b.nombre}</span>
            <span class="text-xs text-indigo-600 flex-shrink-0 ml-2">⭐ {af.promedio}</span>
          </div>
        {/each}
      {/if}
    </div>

    <!-- Análisis psicopedagógico -->
    {#if analisis}
      <div class="rounded-xl px-4 py-3 text-sm
                  {analisis.climaGrupal === 'requiere_atencion'
                    ? 'bg-amber-50 border border-amber-200 text-amber-800'
                    : 'bg-green-50 border border-green-200 text-green-700'}">
        <strong>
          {analisis.climaGrupal === 'requiere_atencion'
            ? 'El grupo necesita atención en la integración'
            : 'El grupo presenta una dinámica equilibrada'}
        </strong>
        <span class="block text-xs mt-0.5">
          {analisis.porcentajeReciprocidad}% de relaciones recíprocas · {analisis.clusters.length} grupo(s) de afinidad
        </span>
      </div>

      <!-- Recomendaciones pedagógicas -->
      <div class="card space-y-2">
        <p class="text-sm font-semibold text-gray-800">📋 Recomendaciones pedagógicas</p>
        <p class="text-xs text-gray-500">
          Sugerencias para trabajar la integración y aprovechar fortalezas, basadas en
          investigación educativa.
        </p>
        {#each analisis.recomendaciones as r}
          <div class="border-l-2 border-indigo-300 pl-3 py-1">
            <p class="text-sm text-gray-700">{r.texto}</p>
            <p class="text-xs text-gray-400 mt-0.5">📚 {r.fundamento}</p>
          </div>
        {/each}
      </div>

      <!-- Alumnos para acompañar -->
      <div class="card space-y-2">
        <p class="text-sm font-semibold text-gray-800">🤝 Alumnos para acompañar en la integración</p>
        {#if analisis.paraAcompanar.length === 0}
          <p class="text-sm text-gray-500">Todos los alumnos están bien integrados según esta votación.</p>
        {:else}
          <p class="text-xs text-gray-500">
            No son etiquetas: es una foto del momento. La idea es darles más oportunidades
            de vincularse y mostrar sus fortalezas.
          </p>
          {#each analisis.paraAcompanar as a}
            <div class="rounded-lg border border-gray-200 p-3 space-y-1.5">
              <p class="text-sm font-semibold text-gray-800">{a.nombre}</p>
              <ul class="space-y-0.5">
                {#each a.observaciones as o}
                  <li class="text-xs text-gray-500">• {o}</li>
                {/each}
              </ul>
              <div class="bg-indigo-50 rounded-lg p-2 space-y-0.5">
                <p class="text-xs font-medium text-indigo-700">Qué se puede hacer:</p>
                {#each a.sugerencias as s}
                  <p class="text-xs text-indigo-800">→ {s}</p>
                {/each}
              </div>
            </div>
          {/each}
        {/if}
      </div>

      <!-- Referentes -->
      {#if analisis.referentes.length > 0}
        <div class="card space-y-1.5">
          <p class="text-sm font-semibold text-gray-800">⭐ Mejor reconocimiento del grupo</p>
          <p class="text-xs text-gray-500">Pueden ser un buen apoyo para acompañar a sus compañeros.</p>
          {#each analisis.referentes as r}
            <div class="text-sm">
              <span class="font-medium text-gray-800">{r.nombre}</span>
              <span class="text-xs text-gray-500">— {r.cualidades.join(' · ')}</span>
            </div>
          {/each}
        </div>
      {/if}

      <!-- Clusters -->
      {#if analisis.clusters.length > 0}
        <div class="card space-y-1.5">
          <p class="text-sm font-semibold text-gray-800">👥 Grupos de afinidad detectados</p>
          {#each analisis.clusters as c, i}
            <p class="text-sm text-gray-800">
              <span class="text-xs text-gray-400">G{i + 1} (cohesión {c.cohesion}):</span>
              {c.miembros.map((m) => m.nombre).join(', ')}
            </p>
          {/each}
        </div>
      {/if}
    {/if}

    <!-- Perfil de conducta del curso (datos de legajo) -->
    {#if data.conducta.length > 0}
      <div class="card space-y-2">
        <p class="text-sm font-semibold text-gray-800">👤 Perfil de conducta del curso</p>
        <p class="text-xs text-gray-500">
          Datos de legajo (observaciones, faltas, amonestaciones). Sirven, junto con la
          votación y las notas, para armar grupos más equilibrados.
        </p>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-xs text-gray-500 border-b border-gray-200">
                <th class="text-left font-medium py-1.5">Alumno</th>
                <th class="text-center font-medium py-1.5">Actitud</th>
                <th class="text-center font-medium py-1.5">Particip.</th>
                <th class="text-center font-medium py-1.5">Tareas</th>
                <th class="text-center font-medium py-1.5">Faltas</th>
                <th class="text-center font-medium py-1.5">Amonest.</th>
              </tr>
            </thead>
            <tbody>
              {#each data.conducta as c}
                <tr class="border-b border-gray-100">
                  <td class="py-1.5 text-gray-800">{c.nombre}</td>
                  <td class="py-1.5 text-center text-gray-600">{c.actitud ?? '—'}</td>
                  <td class="py-1.5 text-center text-gray-600">{c.participacion ?? '—'}</td>
                  <td class="py-1.5 text-center text-gray-600">{c.tareasOk != null ? c.tareasOk + '%' : '—'}</td>
                  <td class="py-1.5 text-center {c.faltas ? 'text-amber-600' : 'text-gray-400'}">{c.faltas}</td>
                  <td class="py-1.5 text-center {c.amonestaciones ? 'text-red-600' : 'text-gray-400'}">{c.amonestaciones}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}
  {/if}
</div>

<script lang="ts">
  let { data } = $props();
  let sesion = $derived(data.sesion);
  let stats = $derived(data.stats);
  let analisis = $derived(data.analisis);

  let nom = $derived(stats?.modo === 'nominacion');
  let maxDist = $derived(stats ? Math.max(1, ...stats.distribucion.map((d) => d.cantidad)) : 1);
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
    {#if analisis && analisis.advertencias.length > 0}
      <div class="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 space-y-1">
        {#each analisis.advertencias as adv}
          <p class="text-xs text-amber-800">⚠️ {adv}</p>
        {/each}
      </div>
    {/if}

    <!-- Resumen -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {#each [['Votaron', `${stats.totalVotantes} de ${stats.totalCurso}`], ['Participación', stats.participacion + '%'], [nom ? 'Elecciones' : 'Puntajes 4-5', stats.totalElecciones], ['Pedidos de no quedar juntos', stats.totalBloqueos]] as [lbl, val]}
        <div class="card text-center">
          <p class="text-xl font-bold text-indigo-700">{val}</p>
          <p class="text-xs text-gray-500">{lbl}</p>
        </div>
      {/each}
    </div>

    <!-- Distribución -->
    <div class="card space-y-2">
      <p class="text-sm font-semibold text-gray-800">
        {nom ? 'Cuántas elecciones recibió cada alumno' : 'Distribución de calificaciones'}
      </p>
      {#each stats.distribucion as d, i}
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-500 w-24 flex-shrink-0">{d.etiqueta}</span>
          <div class="flex-1 h-4 bg-gray-100 rounded overflow-hidden">
            <div class="h-full {nom && i === 0 ? 'bg-amber-500' : 'bg-indigo-500'}" style="width: {(d.cantidad / maxDist) * 100}%"></div>
          </div>
          <span class="text-xs text-gray-500 w-8 text-right">{d.cantidad}</span>
        </div>
      {/each}
    </div>

    <!-- Más elegidos -->
    <div class="card space-y-1.5">
      <p class="text-sm font-semibold text-gray-800">🏆 Más elegidos por el grupo</p>
      {#each stats.masElegidos.slice(0, 8) as a}
        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-800 truncate">{a.nombre}</span>
          <span class="text-xs text-gray-500 flex-shrink-0 ml-2">{a.recibidas} de {a.exposicion} posibles</span>
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

    <!-- Elecciones recíprocas -->
    <div class="card space-y-1.5">
      <p class="text-sm font-semibold text-gray-800">💞 Elecciones recíprocas ({stats.mutuas.length})</p>
      {#if stats.mutuas.length === 0}
        <p class="text-sm text-gray-500">No hay elecciones recíprocas.</p>
      {:else}
        <div class="flex flex-wrap gap-1.5">
          {#each stats.mutuas as par}
            <span class="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-800">{par.a.nombre} ↔ {par.b.nombre}</span>
          {/each}
        </div>
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
          {analisis.porcentajeReciprocidad}% de las elecciones fueron devueltas · {analisis.clusters.length} subgrupo(s) de vínculos recíprocos
        </span>
      </div>

      <!-- Sintonía docente -->
      {#if data.sintonia}
        {@const s = data.sintonia}
        <div class="card space-y-2">
          <p class="text-sm font-semibold text-gray-800">🔮 Tu predicción vs. la votación</p>
          {#each [{ titulo: 'Menos elegidos', comp: s.menos }, { titulo: 'Más elegidos', comp: s.mas }] as { titulo, comp }}
            <div class="space-y-1">
              <p class="text-xs font-medium text-gray-700">
                {titulo}{comp.deteccion != null ? ` — anticipaste ${comp.deteccion}%` : ''}
              </p>
              {#if comp.aciertos.length}
                <p class="text-xs text-green-700">✓ Acertaste: {comp.aciertos.map((a) => a.nombre).join(', ')}</p>
              {/if}
              {#if comp.noDetectados.length}
                <p class="text-xs text-amber-700 font-medium">
                  👀 No estaban en tu radar: {comp.noDetectados.map((a) => a.nombre).join(', ')}
                </p>
              {/if}
              {#if comp.sorpresas.length}
                <p class="text-xs text-gray-500">
                  ↔ Los marcaste vos pero la votación no: {comp.sorpresas.map((a) => a.nombre).join(', ')}
                </p>
              {/if}
            </div>
          {/each}
          <p class="text-[11px] text-gray-400">
            Lo más útil son los que no estaban en el radar: suelen ser alumnos tranquilos cuyo aislamiento no se ve
            en clase. — Farmer, Lines & Hamm (2011); Neal et al. (2011).
          </p>
        </div>
      {/if}

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
          <p class="text-sm font-semibold text-gray-800">👥 Subgrupos de vínculos recíprocos</p>
          <p class="text-xs text-gray-500">
            Alumnos conectados por elecciones devueltas. La densidad indica qué parte de los pares del subgrupo se eligieron mutuamente.
          </p>
          {#each analisis.clusters as c, i}
            <p class="text-sm text-gray-800">
              <span class="text-xs text-gray-400">S{i + 1} ({c.miembros.length} · densidad {c.densidad}%):</span>
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

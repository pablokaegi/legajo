<script lang="ts">
  let { data } = $props();

  let sesion = $derived(data.sesion);
  let analisis = $derived(data.analisis);

  let seccion = $state<'afinidad' | 'equilibrados' | 'analisis'>('afinidad');

  function iniciales(nombre: string): string {
    return nombre
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  function colorRiesgo(nivel: number): string {
    if (nivel >= 5) return 'bg-red-100 text-red-700 border-red-200';
    if (nivel >= 3) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  }

  const NIVEL_COLOR: Record<string, string> = {
    alto: 'bg-green-100 text-green-700',
    medio: 'bg-blue-100 text-blue-700',
    bajo: 'bg-gray-100 text-gray-600'
  };
</script>

<svelte:head><title>Resultados — {sesion.titulo}</title></svelte:head>

<div class="space-y-4">
  <div class="flex items-center gap-2">
    <a href="/institucional/agrupamientos/{sesion.id}" class="text-indigo-600 text-sm hover:underline">← Volver</a>
    <h2 class="text-lg font-bold text-gray-900">Resultados</h2>
  </div>

  <div class="card">
    <p class="text-sm font-semibold text-gray-800">{sesion.titulo}</p>
    <p class="text-xs text-gray-500">🎓 {sesion.cursoNombre} · 📅 {sesion.fecha} · 🗳️ {data.totalVotos} votos</p>
  </div>

  {#if data.totalVotos < 2}
    <div class="card text-center py-10">
      <p class="text-3xl mb-2">📭</p>
      <p class="text-gray-500 text-sm">
        Necesitás al menos 2 votos cargados para generar resultados.
      </p>
      <a href="/institucional/agrupamientos/{sesion.id}" class="mt-3 inline-block text-sm text-indigo-600 hover:underline">
        Cargar votos
      </a>
    </div>
  {:else}
    <!-- Navegación de secciones -->
    <div class="bg-white border border-gray-200 rounded-xl overflow-x-auto">
      <nav class="flex min-w-max">
        {#each [['afinidad', '🤝 Por afinidad'], ['equilibrados', '⚖️ Equilibrados'], ['analisis', '🧠 Análisis']] as [val, lbl]}
          <button
            onclick={() => (seccion = val as typeof seccion)}
            class="px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors
                   {seccion === val
                     ? 'border-indigo-600 text-indigo-700 bg-indigo-50'
                     : 'border-transparent text-gray-600 hover:text-indigo-600 hover:bg-gray-50'}"
          >{lbl}</button>
        {/each}
      </nav>
    </div>

    <!-- ── Grupos por afinidad ──────────────────────────────────────────── -->
    {#if seccion === 'afinidad'}
      <p class="text-xs text-gray-500">
        Grupos formados priorizando las afinidades mutuas y evitando bloqueos.
        El número indica el promedio de afinidad interna.
      </p>
      {#if data.emparejamientos.length === 0}
        <div class="card text-center py-8"><p class="text-gray-500 text-sm">No se pudieron formar grupos.</p></div>
      {:else}
        <div class="grid gap-2 sm:grid-cols-2">
          {#each data.emparejamientos as grupo, i}
            <div class="card space-y-2">
              <div class="flex items-center justify-between">
                <p class="text-sm font-semibold text-gray-800">Grupo {i + 1}</p>
                <span class="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                  afinidad {grupo.afinidadPromedio}
                </span>
              </div>
              <div class="space-y-1">
                {#each grupo.miembros as m}
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {iniciales(m.nombre)}
                    </div>
                    <span class="text-sm text-gray-800">{m.nombre}</span>
                  </div>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    {/if}

    <!-- ── Grupos equilibrados ──────────────────────────────────────────── -->
    {#if seccion === 'equilibrados'}
      <p class="text-xs text-gray-500">
        Grupos heterogéneos que mezclan alumnos de distinta popularidad para
        favorecer la integración. La etiqueta indica el nivel de elección de cada alumno.
      </p>
      {#if data.gruposEquilibrados.length === 0}
        <div class="card text-center py-8"><p class="text-gray-500 text-sm">No se pudieron formar grupos.</p></div>
      {:else}
        <div class="grid gap-2 sm:grid-cols-2">
          {#each data.gruposEquilibrados as grupo, i}
            <div class="card space-y-2">
              <p class="text-sm font-semibold text-gray-800">Grupo {i + 1}</p>
              <div class="space-y-1">
                {#each grupo.miembros as m}
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {iniciales(m.nombre)}
                    </div>
                    <span class="text-sm text-gray-800 flex-1">{m.nombre}</span>
                    <span class="text-xs px-2 py-0.5 rounded-full {NIVEL_COLOR[m.nivel]}">{m.nivel}</span>
                  </div>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    {/if}

    <!-- ── Análisis psicopedagógico ─────────────────────────────────────── -->
    {#if seccion === 'analisis'}
      {#if !analisis}
        <div class="card text-center py-8"><p class="text-gray-500 text-sm">Sin datos para analizar.</p></div>
      {:else}
        <!-- Alerta -->
        <div
          class="rounded-xl px-4 py-3 text-sm
                 {analisis.nivelAlerta === 'ALTO'
                   ? 'bg-red-50 border border-red-200 text-red-700'
                   : 'bg-green-50 border border-green-200 text-green-700'}"
        >
          <strong>Nivel de alerta: {analisis.nivelAlerta}</strong>
          <span class="text-xs block mt-0.5">
            {analisis.totalParticipantes} participantes ·
            {analisis.porcentajeReciprocidad}% de relaciones recíprocas ·
            {analisis.clusters.length} grupo(s) social(es)
          </span>
        </div>

        <!-- Recomendaciones -->
        <div class="card space-y-2">
          <p class="text-sm font-semibold text-gray-800">📋 Recomendaciones</p>
          <ul class="space-y-1.5">
            {#each analisis.recomendaciones as rec}
              <li class="text-sm text-gray-700 flex gap-2">
                <span class="text-indigo-500">•</span><span>{rec}</span>
              </li>
            {/each}
          </ul>
        </div>

        <!-- Alumnos en riesgo -->
        <div class="card space-y-2">
          <p class="text-sm font-semibold text-gray-800">
            ⚠️ Alumnos en riesgo de aislamiento ({analisis.riesgo.length})
          </p>
          {#if analisis.riesgo.length === 0}
            <p class="text-sm text-gray-500">No se detectaron alumnos en riesgo.</p>
          {:else}
            <div class="space-y-2">
              {#each analisis.riesgo as r}
                <div class="rounded-lg border p-2.5 {colorRiesgo(r.nivelRiesgo)}">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-semibold">{r.nombre}</span>
                    <span class="text-xs">riesgo {r.nivelRiesgo}/5</span>
                  </div>
                  <ul class="mt-1 space-y-0.5">
                    {#each r.factores as f}
                      <li class="text-xs">• {f}</li>
                    {/each}
                  </ul>
                </div>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Líderes -->
        <div class="card space-y-2">
          <p class="text-sm font-semibold text-gray-800">⭐ Líderes potenciales ({analisis.lideres.length})</p>
          {#if analisis.lideres.length === 0}
            <p class="text-sm text-gray-500">No se detectaron líderes destacados.</p>
          {:else}
            <div class="space-y-2">
              {#each analisis.lideres as l}
                <div class="rounded-lg bg-amber-50 border border-amber-200 p-2.5">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-semibold text-amber-800">{l.nombre}</span>
                    <span class="text-xs text-amber-600">{l.puntajeLiderazgo} pts</span>
                  </div>
                  <p class="text-xs text-amber-700 mt-0.5">{l.cualidades.join(' · ')}</p>
                </div>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Clusters sociales -->
        <div class="card space-y-2">
          <p class="text-sm font-semibold text-gray-800">👥 Grupos sociales detectados ({analisis.clusters.length})</p>
          {#if analisis.clusters.length === 0}
            <p class="text-sm text-gray-500">No se detectaron grupos cohesionados.</p>
          {:else}
            <div class="space-y-2">
              {#each analisis.clusters as c, i}
                <div class="rounded-lg bg-gray-50 border border-gray-200 p-2.5">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs font-medium text-gray-600">Grupo {i + 1} · cohesión {c.cohesion}</span>
                  </div>
                  <p class="text-sm text-gray-800">{c.miembros.map((m) => m.nombre).join(', ')}</p>
                </div>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Popularidad -->
        <div class="card space-y-2">
          <p class="text-sm font-semibold text-gray-800">📊 Popularidad por alumno</p>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-xs text-gray-500 border-b border-gray-200">
                  <th class="text-left font-medium py-1.5">Alumno</th>
                  <th class="text-center font-medium py-1.5">Prom.</th>
                  <th class="text-center font-medium py-1.5">Votos</th>
                  <th class="text-center font-medium py-1.5">Desv.</th>
                </tr>
              </thead>
              <tbody>
                {#each analisis.popularidad as m}
                  <tr class="border-b border-gray-100">
                    <td class="py-1.5 text-gray-800">{m.nombre}</td>
                    <td class="py-1.5 text-center font-semibold text-indigo-700">{m.promedio}</td>
                    <td class="py-1.5 text-center text-gray-600">{m.totalVotos}</td>
                    <td class="py-1.5 text-center text-gray-500">{m.desviacion}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      {/if}
    {/if}
  {/if}
</div>

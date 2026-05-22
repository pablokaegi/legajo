<script lang="ts">
  let { data } = $props();
  let sesion = $derived(data.sesion);
  let stats = $derived(data.stats);
  let analisis = $derived(data.analisis);

  function colorRiesgo(n: number): string {
    if (n >= 5) return 'bg-red-100 text-red-700 border-red-200';
    if (n >= 3) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  }
  const PUNTAJE_COLOR: Record<number, string> = {
    1: 'bg-red-500', 2: 'bg-orange-500', 3: 'bg-yellow-500', 4: 'bg-teal-500', 5: 'bg-green-600'
  };
  let maxDist = $derived(stats ? Math.max(1, ...Object.values(stats.distribucion)) : 1);
</script>

<svelte:head><title>Estadísticas — {sesion.titulo}</title></svelte:head>

<div class="space-y-4">
  <div class="flex items-center gap-2">
    <a href="/institucional/agrupamientos/{sesion.id}" class="text-indigo-600 text-sm hover:underline">← Panel</a>
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

    <!-- Mejor / peor valorados -->
    <div class="grid sm:grid-cols-2 gap-2">
      <div class="card space-y-1.5">
        <p class="text-sm font-semibold text-gray-800">🏆 Mejor valorados</p>
        {#each stats.populares.slice(0, 8) as a}
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-800 truncate">{a.nombre}</span>
            <span class="text-xs text-gray-500 flex-shrink-0 ml-2">⭐ {a.promedio} · {a.totalVotos} votos</span>
          </div>
        {/each}
      </div>
      <div class="card space-y-1.5">
        <p class="text-sm font-semibold text-gray-800">⚠️ Menos valorados</p>
        {#each stats.populares.slice(-5).reverse() as a}
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-800 truncate">{a.nombre}</span>
            <span class="text-xs text-gray-500 flex-shrink-0 ml-2">⭐ {a.promedio} · {a.totalVotos} votos</span>
          </div>
        {/each}
      </div>
    </div>

    <!-- Más bloqueados + bloqueos mutuos -->
    <div class="grid sm:grid-cols-2 gap-2">
      <div class="card space-y-1.5">
        <p class="text-sm font-semibold text-gray-800">🚫 Más bloqueados</p>
        {#if stats.masBloqueados.length === 0}
          <p class="text-sm text-gray-500">Nadie fue bloqueado.</p>
        {:else}
          {#each stats.masBloqueados as b}
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-800 truncate">{b.nombre}</span>
              <span class="text-xs text-red-500 flex-shrink-0 ml-2">{b.cantidad} bloqueo(s)</span>
            </div>
          {/each}
        {/if}
      </div>
      <div class="card space-y-1.5">
        <p class="text-sm font-semibold text-gray-800">💥 Bloqueos mutuos</p>
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
                  {analisis.nivelAlerta === 'ALTO'
                    ? 'bg-red-50 border border-red-200 text-red-700'
                    : 'bg-green-50 border border-green-200 text-green-700'}">
        <strong>Análisis psicopedagógico — alerta: {analisis.nivelAlerta}</strong>
        <span class="block text-xs mt-0.5">
          {analisis.porcentajeReciprocidad}% de relaciones recíprocas · {analisis.clusters.length} grupo(s) social(es)
        </span>
      </div>

      <div class="card space-y-2">
        <p class="text-sm font-semibold text-gray-800">📋 Recomendaciones</p>
        <ul class="space-y-1.5">
          {#each analisis.recomendaciones as r}
            <li class="text-sm text-gray-700 flex gap-2"><span class="text-indigo-500">•</span><span>{r}</span></li>
          {/each}
        </ul>
      </div>

      <div class="card space-y-2">
        <p class="text-sm font-semibold text-gray-800">⚠️ Alumnos en riesgo de aislamiento ({analisis.riesgo.length})</p>
        {#if analisis.riesgo.length === 0}
          <p class="text-sm text-gray-500">Sin alumnos en riesgo.</p>
        {:else}
          {#each analisis.riesgo as r}
            <div class="rounded-lg border p-2.5 {colorRiesgo(r.nivelRiesgo)}">
              <div class="flex items-center justify-between">
                <span class="text-sm font-semibold">{r.nombre}</span>
                <span class="text-xs">riesgo {r.nivelRiesgo}/5</span>
              </div>
              <ul class="mt-1 space-y-0.5">
                {#each r.factores as f}<li class="text-xs">• {f}</li>{/each}
              </ul>
            </div>
          {/each}
        {/if}
      </div>

      {#if analisis.lideres.length > 0}
        <div class="card space-y-1.5">
          <p class="text-sm font-semibold text-gray-800">⭐ Líderes potenciales</p>
          {#each analisis.lideres as l}
            <div class="text-sm">
              <span class="font-medium text-gray-800">{l.nombre}</span>
              <span class="text-xs text-gray-500">— {l.cualidades.join(' · ')}</span>
            </div>
          {/each}
        </div>
      {/if}

      {#if analisis.clusters.length > 0}
        <div class="card space-y-1.5">
          <p class="text-sm font-semibold text-gray-800">👥 Grupos sociales detectados</p>
          {#each analisis.clusters as c, i}
            <p class="text-sm text-gray-800">
              <span class="text-xs text-gray-400">G{i + 1} (cohesión {c.cohesion}):</span>
              {c.miembros.map((m) => m.nombre).join(', ')}
            </p>
          {/each}
        </div>
      {/if}
    {/if}
  {/if}
</div>

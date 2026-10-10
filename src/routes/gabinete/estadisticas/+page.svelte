<script lang="ts">
  import { goto } from '$app/navigation';
  import GraficoBarras from '$lib/components/GraficoBarras.svelte';
  import GraficoColumnas from '$lib/components/GraficoColumnas.svelte';

  let { data } = $props();
  let e = $derived(data.e);
  let desde = $state(data.e.desde);
  let hasta = $state(data.e.hasta);
  $effect(() => { desde = data.e.desde; hasta = data.e.hasta; });

  const aplicar = () => goto(`?desde=${desde}&hasta=${hasta}`, { noScroll: true, keepFocus: true });
  const q = $derived(`desde=${e.desde}&hasta=${e.hasta}`);
  const fmt = (f: string) => new Date(f + 'T12:00:00').toLocaleDateString('es-AR');
  let maxCat = $derived(Math.max(1, ...e.porCategoria.flatMap((g) => g.barras.map((b) => b.valor))));
</script>

<svelte:head><title>Estadísticas — Gabinete</title></svelte:head>

<div class="space-y-4">
  <!-- Filtros: una sola fila arriba de los gráficos -->
  <div class="card flex flex-wrap items-end gap-2">
    <div>
      <label class="form-label" for="desde">Desde</label>
      <input id="desde" type="date" bind:value={desde} class="form-input text-sm" />
    </div>
    <div>
      <label class="form-label" for="hasta">Hasta</label>
      <input id="hasta" type="date" bind:value={hasta} class="form-input text-sm" />
    </div>
    <button onclick={aplicar} class="btn-primary text-sm">Aplicar</button>
    <div class="ml-auto flex flex-wrap gap-3 text-xs">
      <a href="/gabinete/informe?{q}" class="text-indigo-700 hover:underline">📄 Informe institucional</a>
      <a href="/gabinete/estadisticas/csv?{q}" class="text-indigo-700 hover:underline" data-sveltekit-reload>⬇️ CSV</a>
    </div>
  </div>
  <p class="text-xs text-gray-500">Período: {fmt(e.desde)} al {fmt(e.hasta)} · casos abiertos en el período.</p>

  <!-- Números destacados -->
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
    {#each [
      ['Casos nuevos', e.casosNuevos, ''],
      ['Intervenciones', e.totalIntervenciones, ''],
      ['Activos hoy', e.activosHoy, ''],
      ['Días hasta la 1.ª intervención', e.medianaDiasPrimeraIntervencion ?? '—', 'mediana']
    ] as [lbl, val, sub]}
      <div class="card text-center">
        <p class="text-2xl font-bold text-gray-900 tabular-nums">{val}</p>
        <p class="text-xs text-gray-500">{lbl}{sub ? ` (${sub})` : ''}</p>
      </div>
    {/each}
  </div>
  {#if e.urgentes > 0}
    <p class="text-xs bg-red-50 border border-red-200 text-red-800 rounded-lg px-3 py-2">
      ⚠️ {e.urgentes} caso(s) del período con categoría urgente (protocolo).
    </p>
  {/if}

  <!-- Motivos -->
  <div class="card space-y-3">
    <div>
      <p class="text-sm font-semibold text-gray-800">Motivos de los casos</p>
      <p class="text-xs text-gray-500">Un caso puede tener más de un motivo.</p>
    </div>
    <GraficoBarras barras={e.porGrupo} unidad="casos" color="#4f46e5" />
    <div class="grid sm:grid-cols-2 gap-x-6 gap-y-3 pt-2 border-t border-gray-100">
      {#each e.porCategoria.filter((g) => g.barras.length > 0) as g}
        <div class="space-y-1">
          <p class="text-xs font-medium text-gray-700 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full inline-block" style="background:{g.color}"></span>{g.grupo}
          </p>
          <GraficoBarras barras={g.barras} unidad="casos" max={maxCat} color="#818cf8" />
        </div>
      {/each}
    </div>
  </div>

  <!-- Cursos -->
  <div class="card space-y-2">
    <p class="text-sm font-semibold text-gray-800">Cursos con más casos</p>
    <GraficoBarras barras={e.porCurso.slice(0, 12)} unidad="casos" />
    {#if e.porCurso.length > 12}<p class="text-xs text-gray-400">y {e.porCurso.length - 12} curso(s) más (ver CSV).</p>{/if}
  </div>

  <!-- Intervenciones -->
  <div class="card space-y-3">
    <p class="text-sm font-semibold text-gray-800">Intervenciones por mes</p>
    <GraficoColumnas puntos={e.intervencionesPorMes} unidad="intervenciones" />
    <p class="text-sm font-semibold text-gray-800 pt-2">Tipo de intervención</p>
    <GraficoBarras barras={e.intervencionesPorTipo} unidad="registros" />
  </div>

  <!-- Nivel, estado, origen -->
  <div class="grid sm:grid-cols-3 gap-2">
    {#each [['Nivel de apoyo', e.porNivel], ['Estado actual', e.porEstado], ['Cómo llegaron', e.porOrigen]] as [titulo, barras]}
      <div class="card space-y-2">
        <p class="text-sm font-semibold text-gray-800">{titulo}</p>
        <GraficoBarras barras={barras as typeof e.porNivel} unidad="casos" />
      </div>
    {/each}
  </div>
</div>

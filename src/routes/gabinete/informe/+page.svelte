<script lang="ts">
  import EncabezadoInforme from '$lib/components/EncabezadoInforme.svelte';
  import GraficoBarras from '$lib/components/GraficoBarras.svelte';
  import GraficoColumnas from '$lib/components/GraficoColumnas.svelte';

  let { data } = $props();
  let e = $derived(data.e);
  const fmt = (f: string) => new Date(f + 'T12:00:00').toLocaleDateString('es-AR');
  let comentario = $state('');
</script>

<svelte:head><title>Informe institucional — Gabinete</title></svelte:head>

<div class="space-y-4">
  <div class="flex flex-wrap gap-3 items-center print:hidden">
    <a href="/gabinete/estadisticas?desde={e.desde}&hasta={e.hasta}" class="text-indigo-600 text-sm hover:underline">← Estadísticas</a>
    <button onclick={() => window.print()} class="btn-primary text-sm ml-auto">🖨️ Imprimir / Guardar PDF</button>
  </div>
  <p class="text-xs text-gray-500 print:hidden">
    En el diálogo de impresión elegí "Guardar como PDF". Este informe tiene solo datos agregados: no incluye nombres de alumnos.
  </p>

  <article class="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 space-y-5 print:border-0 print:p-0">
    <EncabezadoInforme
      titulo="Informe del Gabinete Psicopedagógico"
      subtitulo="Período: {fmt(e.desde)} al {fmt(e.hasta)}" />

    <section class="space-y-2">
      <h2 class="text-sm font-bold text-gray-900">1. Resumen</h2>
      <table class="w-full text-sm">
        <tbody>
          {#each [
            ['Casos abiertos en el período', e.casosNuevos],
            ['Casos cerrados en el período', e.casosCerrados],
            ['Casos activos a la fecha', e.activosHoy],
            ['Derivaciones de docentes y preceptoría', e.derivacionesDocentes],
            ['Intervenciones registradas', e.totalIntervenciones],
            ['Días hasta la primera intervención (mediana)', e.medianaDiasPrimeraIntervencion ?? '—'],
            ['Casos con situaciones de protocolo', e.urgentes]
          ] as [k, v]}
            <tr class="border-b border-gray-100"><td class="py-1 text-gray-700">{k}</td><td class="py-1 text-right tabular-nums font-medium">{v}</td></tr>
          {/each}
        </tbody>
      </table>
    </section>

    <section class="space-y-2 break-inside-avoid">
      <h2 class="text-sm font-bold text-gray-900">2. Motivos de intervención</h2>
      <GraficoBarras barras={e.porGrupo} unidad="casos" color="#4f46e5" />
      <div class="grid grid-cols-2 gap-x-6 gap-y-2 pt-2">
        {#each e.porCategoria.filter((g) => g.barras.length > 0) as g}
          <div>
            <p class="text-xs font-medium text-gray-700">{g.grupo}</p>
            <GraficoBarras barras={g.barras} unidad="casos" color="#818cf8" />
          </div>
        {/each}
      </div>
    </section>

    <section class="space-y-2 break-inside-avoid">
      <h2 class="text-sm font-bold text-gray-900">3. Cursos</h2>
      <GraficoBarras barras={e.porCurso} unidad="casos" />
    </section>

    <section class="space-y-2 break-inside-avoid">
      <h2 class="text-sm font-bold text-gray-900">4. Intervenciones</h2>
      <GraficoColumnas puntos={e.intervencionesPorMes} unidad="intervenciones" />
      <GraficoBarras barras={e.intervencionesPorTipo} unidad="registros" />
    </section>

    <section class="space-y-2 break-inside-avoid">
      <h2 class="text-sm font-bold text-gray-900">5. Niveles de apoyo y estado</h2>
      <div class="grid grid-cols-2 gap-4">
        <GraficoBarras barras={e.porNivel} unidad="casos" />
        <GraficoBarras barras={e.porEstado} unidad="casos" />
      </div>
      <p class="text-[11px] text-gray-500">
        Nivel 1: apoyo universal · Nivel 2: apoyo focalizado · Nivel 3: apoyo intensivo e individual
        (modelo de apoyos escalonados, Fuchs & Fuchs, 2006).
      </p>
    </section>

    <section class="space-y-2 break-inside-avoid">
      <h2 class="text-sm font-bold text-gray-900">6. Observaciones y propuestas del gabinete</h2>
      <textarea bind:value={comentario} rows="4" class="form-input text-sm print:hidden"
        placeholder="Lectura del período, necesidades detectadas, propuestas para el equipo directivo…"></textarea>
      <p class="hidden print:block text-sm text-gray-800 whitespace-pre-line min-h-16">{comentario}</p>
    </section>

    <div class="grid grid-cols-2 gap-10 pt-12 text-center text-xs text-gray-600">
      <div class="border-t border-gray-400 pt-1">Gabinete psicopedagógico<br />{data.emisor}</div>
      <div class="border-t border-gray-400 pt-1">Dirección</div>
    </div>
  </article>
</div>

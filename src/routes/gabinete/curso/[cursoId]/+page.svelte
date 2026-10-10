<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';

  let { data, form } = $props();

  let nivelFiltro = $state<0 | 1 | 2 | 3>(0);
  let cargandoNotas = $state(false);
  let filas = $derived(nivelFiltro ? data.filas.filter((f) => f.nivel === nivelFiltro) : data.filas);
  let porNivel = $derived({
    3: data.filas.filter((f) => f.nivel === 3).length,
    2: data.filas.filter((f) => f.nivel === 2).length,
    1: data.filas.filter((f) => f.nivel === 1).length
  });

  const COLOR: Record<string, string> = {
    alerta: 'bg-red-100 text-red-800',
    atencion: 'bg-amber-100 text-amber-800',
    ok: 'bg-green-50 text-green-700',
    sin_datos: 'bg-gray-50 text-gray-400'
  };
  const ICONO: Record<string, string> = { alerta: '●', atencion: '◐', ok: '○', sin_datos: '–' };
  const NIVEL_CLS: Record<number, string> = {
    3: 'bg-red-600 text-white', 2: 'bg-amber-500 text-white', 1: 'bg-green-600 text-white'
  };
  const AREAS = [
    ['asistencia', 'Asistencia'], ['conducta', 'Conducta'], ['rendimiento', 'Rendimiento'], ['vinculos', 'Vínculos']
  ] as const;

  async function consultarNotas() {
    cargandoNotas = true;
    await goto('?notas=1', { invalidateAll: true, noScroll: true });
    cargandoNotas = false;
  }
</script>

<svelte:head><title>Alerta temprana — {data.cursoNombre}</title></svelte:head>

<div class="space-y-4">
  <a href="/gabinete" class="text-indigo-600 text-sm hover:underline">← Tablero</a>

  {#if form?.error}
    <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">{form.error}</div>
  {/if}

  <div class="card space-y-1">
    <p class="text-sm font-semibold text-gray-800">🚦 {data.cursoNombre}</p>
    <p class="text-xs text-gray-500">
      Cada área muestra qué se observó. Una sola señal es esperable; varias juntas indican que conviene
      intervenir. Los niveles siguen el modelo de apoyos escalonados (MTSS): 1 universal · 2 focalizado · 3 intensivo.
    </p>
    <div class="flex flex-wrap gap-2 pt-1">
      <a href="/aula/{data.cursoId}" class="text-xs text-indigo-700 hover:underline">🪑 Plano del aula</a>
      <a href="/agrupamientos/curso/{data.cursoId}" class="text-xs text-indigo-700 hover:underline">📈 Evolución de vínculos</a>
    </div>
  </div>

  <div class="flex flex-wrap items-center gap-2">
    {#each [[0, 'Todos'], [3, `Nivel 3 (${porNivel[3]})`], [2, `Nivel 2 (${porNivel[2]})`], [1, `Nivel 1 (${porNivel[1]})`]] as [n, lbl]}
      <button onclick={() => (nivelFiltro = n as 0 | 1 | 2 | 3)}
        class="text-xs px-3 py-1.5 rounded-full {nivelFiltro === n ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}">
        {lbl}
      </button>
    {/each}
    {#if !data.conNotas}
      <button onclick={consultarNotas} disabled={cargandoNotas} class="text-xs text-indigo-700 hover:underline ml-auto">
        {cargandoNotas ? 'Consultando Moodle…' : '📚 Sumar notas de Moodle (tarda unos segundos)'}
      </button>
    {/if}
  </div>

  {#if !data.hayVotacion}
    <p class="text-xs text-gray-500">
      Este curso todavía no tiene una votación de agrupamientos: el área Vínculos queda sin datos.
    </p>
  {/if}

  <div class="space-y-2">
    {#each filas as f (f.id)}
      <div class="card space-y-2">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 min-w-0">
            <span class="text-[11px] font-bold px-2 py-0.5 rounded-full {NIVEL_CLS[f.nivel]}">N{f.nivel}</span>
            <a href="/gabinete/alumno/{f.id}" class="text-sm font-semibold text-gray-900 truncate hover:text-indigo-700">{f.nombre}</a>
          </div>
          {#if f.casoId}
            <a href="/gabinete/casos/{f.casoId}" class="text-xs text-indigo-700 hover:underline flex-shrink-0">📂 Ver caso</a>
          {:else if f.nivel >= 2}
            <form method="POST" action="?/abrirCaso" use:enhance>
              <input type="hidden" name="alumnoId" value={f.id} />
              <button type="submit" class="text-xs px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
                + Abrir caso
              </button>
            </form>
          {/if}
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {#each AREAS as [clave, titulo]}
            {@const ind = f[clave]}
            <div class="rounded-lg px-2 py-1.5 {COLOR[ind.nivel]}" title={ind.detalle}>
              <p class="text-[11px] font-semibold">{ICONO[ind.nivel]} {titulo}</p>
              <p class="text-[11px] leading-snug">{ind.detalle}</p>
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>

  <details class="card text-xs text-gray-600">
    <summary class="cursor-pointer text-sm font-semibold text-gray-800">¿Cómo se calcula?</summary>
    <ul class="mt-2 space-y-1">
      <li>• <strong>Asistencia:</strong> {data.umbrales.ausenciasAtencion}+ ausencias en 30 días = atención (≈10 % de los días, umbral de
        ausentismo crónico — Balfanz & Byrnes, 2012); {data.umbrales.ausenciasAlerta}+ = alerta.</li>
      <li>• <strong>Conducta:</strong> 1 amonestación en 60 días o actitud observada baja = atención; una grave o 3+ = alerta.</li>
      <li>• <strong>Rendimiento:</strong> nota de Moodle &lt; {data.umbrales.notaAtencion} = atención, &lt; {data.umbrales.notaAlerta} = alerta; también
        tareas completas &lt; 50 % o participación baja en las observaciones.</li>
      <li>• <strong>Vínculos:</strong> sin elecciones en la última votación, o poco elegido en 2 de las últimas 3 = alerta.</li>
      <li>• <strong>Nivel:</strong> alerta suma 2 y atención 1; 2+ puntos = nivel 2, 4+ = nivel 3. El riesgo se acumula entre áreas
        (Allensworth & Easton, 2007).</li>
    </ul>
    <p class="mt-2">Es una herramienta de detección, no un diagnóstico: siempre confirmar con el equipo docente y el alumno.</p>
  </details>
</div>

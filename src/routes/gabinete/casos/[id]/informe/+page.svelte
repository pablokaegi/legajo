<script lang="ts">
  import EncabezadoInforme from '$lib/components/EncabezadoInforme.svelte';
  import { CATEGORIA_POR_ID } from '$lib/gabinete/categorias';

  let { data } = $props();
  let c = $derived(data.caso);
  let familia = $derived(data.para === 'familia');
  let tipoNombre = $derived(new Map(data.tipos.map((t) => [t.id as string, t.nombre])));
  let estadoNombre = $derived(new Map(data.estados.map((e) => [e.id as string, e.nombre])));
  const fmt = (f: unknown) => {
    if (!f) return '—';
    const d = typeof f === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(f) ? new Date(f + 'T12:00:00') : new Date(f as string);
    return d.toLocaleDateString('es-AR');
  };
  const NIVEL: Record<string, string> = { alerta: 'Alerta', atencion: 'Atención', ok: 'Sin señales', sin_datos: 'Sin datos' };
  let mensaje = $state('');
  // Las categorías de protocolo nunca van al informe para la familia.
  let categoriasVisibles = $derived(
    familia ? data.categorias.filter((id) => !CATEGORIA_POR_ID.get(id)?.urgente) : data.categorias
  );
  let ocultasFamilia = $derived(data.categorias.length - categoriasVisibles.length);
  let ultimosAcuerdos = $derived(data.intervenciones.find((i) => i.acuerdos)?.acuerdos ?? null);
</script>

<svelte:head><title>Informe — {c.alumnoNombre}</title></svelte:head>

<div class="space-y-4">
  <div class="flex flex-wrap items-center gap-3 print:hidden">
    <a href="/gabinete/casos/{c.id}" class="text-indigo-600 text-sm hover:underline">← Caso</a>
    <div class="flex gap-1">
      <a href="?para=direccion" class="text-xs px-3 py-1.5 rounded-full {familia ? 'bg-gray-100 text-gray-700' : 'bg-indigo-600 text-white'}">Para dirección</a>
      <a href="?para=familia" class="text-xs px-3 py-1.5 rounded-full {familia ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}">Para la familia</a>
    </div>
    <button onclick={() => window.print()} class="btn-primary text-sm ml-auto">🖨️ Imprimir / Guardar PDF</button>
  </div>
  {#if familia}
    <p class="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 print:hidden">
      Versión para la familia: incluye solo las {data.compartidasTotal} intervención(es) marcadas con 👪 en el caso.
      Releé el informe antes de entregarlo.
      {#if ocultasFamilia > 0}
        <strong>No se incluyen {ocultasFamilia} categoría(s) de protocolo:</strong> esas situaciones se comunican por el circuito institucional.
      {/if}
    </p>
  {/if}

  <article class="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 space-y-5 print:border-0 print:p-0">
    <EncabezadoInforme
      titulo={familia ? 'Informe de acompañamiento' : 'Informe de seguimiento — Gabinete psicopedagógico'}
      subtitulo={familia ? '' : 'Documento reservado'} />

    <table class="w-full text-sm">
      <tbody>
        <tr><td class="py-0.5 text-gray-500 w-40">Alumno/a</td><td class="font-medium">{c.alumnoNombre}</td></tr>
        <tr><td class="py-0.5 text-gray-500">Curso</td><td>{c.cursoNombre ?? '—'}</td></tr>
        <tr><td class="py-0.5 text-gray-500">Acompaña</td><td>Gabinete psicopedagógico{data.responsable ? ` — ${data.responsable}` : ''}</td></tr>
        <tr><td class="py-0.5 text-gray-500">Seguimiento desde</td><td>{fmt(c.createdAt)}</td></tr>
        {#if !familia}
          <tr><td class="py-0.5 text-gray-500">Estado / nivel</td><td>{estadoNombre.get(c.estado)} · nivel {c.nivel} de apoyo</td></tr>
          <tr><td class="py-0.5 text-gray-500">Derivado por</td><td>{c.derivadoPor}</td></tr>
        {/if}
        {#if c.estado !== 'cerrado'}
          <tr><td class="py-0.5 text-gray-500">Próximo encuentro / revisión</td><td>{fmt(c.proximaRevision)}</td></tr>
        {/if}
      </tbody>
    </table>

    <section class="space-y-1">
      <h2 class="text-sm font-bold text-gray-900">{familia ? 'Aspectos en los que estamos acompañando' : 'Motivo de intervención'}</h2>
      {#if categoriasVisibles.length}
        <ul class="text-sm text-gray-800 list-disc pl-5">
          {#each categoriasVisibles as id}<li>{CATEGORIA_POR_ID.get(id)?.nombre}</li>{/each}
        </ul>
      {/if}
      {#if !familia && c.motivo}
        <p class="text-sm text-gray-800 whitespace-pre-line">{c.motivo}</p>
      {/if}
    </section>

    {#if c.fortalezas}
      <section class="space-y-1">
        <h2 class="text-sm font-bold text-gray-900">Fortalezas</h2>
        <p class="text-sm text-gray-800 whitespace-pre-line">{c.fortalezas}</p>
      </section>
    {/if}

    {#if !familia && data.indicadores}
      {@const ind = data.indicadores}
      <section class="space-y-1 break-inside-avoid">
        <h2 class="text-sm font-bold text-gray-900">Indicadores actuales (alerta temprana)</h2>
        <table class="w-full text-sm">
          <tbody>
            {#each [['Asistencia', ind.asistencia], ['Conducta', ind.conducta], ['Rendimiento', ind.rendimiento], ['Vínculos', ind.vinculos]] as [area, i]}
              {@const x = i as typeof ind.asistencia}
              <tr class="border-b border-gray-100 align-top">
                <td class="py-1 text-gray-700 w-28">{area}</td>
                <td class="py-1 w-24 font-medium">{NIVEL[x.nivel]}</td>
                <td class="py-1 text-gray-700">{x.detalle}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </section>
    {/if}

    {#if !familia && data.vinculos.length}
      <section class="space-y-1 break-inside-avoid">
        <h2 class="text-sm font-bold text-gray-900">Trabajo en grupo y vínculos</h2>
        {#each data.vinculos as v}
          <p class="text-sm text-gray-800">
            {fmt(v.fecha)} · {v.nombreAgrupacion}{v.rol ? ` · rol: ${v.rol}` : ''}
            {#if v.notaPedagogica.tipo === 'acompanar'} — {v.notaPedagogica.observaciones.join(' ')}{/if}
          </p>
        {/each}
      </section>
    {/if}

    <section class="space-y-2">
      <h2 class="text-sm font-bold text-gray-900">{familia ? 'Lo que venimos haciendo' : 'Intervenciones'}</h2>
      {#each data.intervenciones as i}
        <div class="border-l-2 border-gray-300 pl-3 break-inside-avoid">
          <p class="text-xs text-gray-500">{fmt(i.fecha)} · {tipoNombre.get(i.tipo) ?? i.tipo}{familia ? '' : ` · ${i.autor}`}</p>
          <p class="text-sm text-gray-800 whitespace-pre-line">{i.descripcion}</p>
          {#if i.acuerdos}<p class="text-sm text-gray-800 whitespace-pre-line"><strong>Acuerdos:</strong> {i.acuerdos}</p>{/if}
        </div>
      {:else}
        <p class="text-sm text-gray-500">{familia ? 'Todavía no hay registros compartidos con la familia.' : 'Sin intervenciones registradas.'}</p>
      {/each}
    </section>

    {#if familia}
      {#if ultimosAcuerdos}
        <section class="space-y-1">
          <h2 class="text-sm font-bold text-gray-900">Próximos pasos acordados</h2>
          <p class="text-sm text-gray-800 whitespace-pre-line">{ultimosAcuerdos}</p>
        </section>
      {/if}
      <section class="space-y-1 break-inside-avoid">
        <h2 class="text-sm font-bold text-gray-900">Mensaje del gabinete</h2>
        <textarea bind:value={mensaje} rows="4" class="form-input text-sm print:hidden"
          placeholder="Un mensaje cercano para la familia: cómo pueden acompañar desde casa, cómo contactarnos…"></textarea>
        <p class="hidden print:block text-sm text-gray-800 whitespace-pre-line min-h-12">{mensaje}</p>
      </section>
    {/if}

    <div class="grid grid-cols-2 gap-10 pt-12 text-center text-xs text-gray-600">
      <div class="border-t border-gray-400 pt-1">Gabinete psicopedagógico<br />{data.emisor}</div>
      <div class="border-t border-gray-400 pt-1">{familia ? 'Familia (firma y aclaración)' : 'Dirección'}</div>
    </div>
    {#if !familia}
      <p class="text-[10px] text-gray-400">
        Documento reservado: contiene información sensible de un/a menor (Ley 26.061; Ley 25.326 de protección de datos personales).
        No difundir.
      </p>
    {/if}
  </article>
</div>

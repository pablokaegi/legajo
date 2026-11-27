<script lang="ts">
  import { enhance } from '$app/forms';
  import {
    APOYOS_ORAL, NOMBRES_APOYO_ORAL, ESTADOS_ORAL, NIVELES_ORAL, VERSION_RUBRICA_ORAL,
    notaOral, type ApoyoOral, type EstadoOral, type RúbricaOral
  } from '$lib/aula/oral.js';
  import type { ActionData, PageData } from './$types';
  import type { SubmitFunction } from '@sveltejs/kit';

  let { data, form }: { data: PageData; form: ActionData } = $props();
  let seleccionado = $state<number | null>(null);
  let ocupado = $state(false);
  let revisando = $state(false);
  let aviso = $state('');
  let estado = $state<EstadoOral>('evaluado');
  let rubrica = $state<RúbricaOral>({ caudales: null, unidades: null, justificacion: null });
  let devolucion = $state('');
  let apoyo = $state<ApoyoOral | ''>('');
  let revisarRubrica = $state(false);

  const alumno = $derived(data.alumnos.find((fila) => fila.id === seleccionado) ?? data.alumnos[0]);
  const nota = $derived(estado === 'evaluado' ? notaOral(rubrica) : null);
  const progreso = $derived(data.alumnos.filter(({ oral }) => oral?.nota != null || oral?.estado === 'ausente').length);
  const enviados = $derived(data.alumnos.filter(({ oral }) => oral?.publicacion === 'verificado').length);
  const lote = $derived(data.alumnos.flatMap(({ id, nombre, oral }) =>
    oral?.nota != null && oral.publicacion !== 'verificado' ? [{ id, nombre, oral }] : []
  ));
  const sucio = $derived(!!alumno && (estado !== (alumno.oral?.estado ?? 'evaluado') ||
    rubrica.caudales !== (alumno.oral?.caudales ?? null) || rubrica.unidades !== (alumno.oral?.unidades ?? null) ||
    rubrica.justificacion !== (alumno.oral?.justificacion ?? null) || devolucion !== (alumno.oral?.devolucion ?? '') ||
    apoyo !== (alumno.oral?.apoyo ?? '') || revisarRubrica));

  function cargar(oral: PageData['alumnos'][number]['oral']) {
    estado = oral?.estado ?? 'evaluado';
    rubrica = { caudales: oral?.caudales ?? null, unidades: oral?.unidades ?? null, justificacion: oral?.justificacion ?? null };
    devolucion = oral?.devolucion ?? '';
    apoyo = oral?.apoyo ?? '';
    revisarRubrica = false;
  }

  $effect(() => { cargar(alumno?.oral ?? null); });

  function elegir(id: number) {
    if (alumno?.id === id) return;
    if (sucio) {
      aviso = 'Guardá o descartá los cambios de esta evaluación antes de pasar a otro estudiante.';
      return;
    }
    aviso = '';
    seleccionado = id;
  }

  function etiqueta(oral: PageData['alumnos'][number]['oral']) {
    if (!oral) return 'Pendiente';
    if (oral.publicacion === 'verificado') return 'Verificada en Moodle';
    if (oral.publicacion === 'conflicto') return 'Revisar en Moodle';
    if (oral.publicacion === 'error') return 'Reintentar verificación';
    if (oral.publicacion) return 'En cola';
    if (oral.estado !== 'evaluado') return ESTADOS_ORAL[oral.estado];
    return oral.nota == null ? 'Borrador' : 'Lista para publicar';
  }

  const guardar: SubmitFunction = ({ submitter }) => {
    ocupado = true;
    aviso = '';
    const id = alumno?.id;
    const avanzar = submitter instanceof HTMLButtonElement && submitter.value === 'siguiente';
    return async ({ result, update }) => {
      try {
        await update({ reset: false });
        if (result.type === 'success') {
          aviso = 'Registro guardado en Legajo.';
          if (avanzar) {
            const siguiente = data.alumnos[data.alumnos.findIndex(({ id: filaId }) => filaId === id) + 1];
            if (siguiente) seleccionado = siguiente.id;
          }
        }
      } finally { ocupado = false; }
    };
  };

  const publicar: SubmitFunction = () => {
    ocupado = true;
    aviso = '';
    return async ({ result, update }) => {
      try {
        await update();
        if (result.type === 'success') revisando = false;
      } finally { ocupado = false; }
    };
  };
</script>

<svelte:head><title>Aula en Legajo · Oral de Ciencias</title></svelte:head>

<div class="aula-oral">
  <header>
    <div class="contexto">Aula en Legajo · Piloto con datos ficticios</div>
    <h1>Oral de Ciencias</h1>
    <p class="bajada">Registrá la rúbrica en clase. Confirmá las notas para enviarlas a Moodle de prueba.</p>
  </header>

  <details class="card preparacion">
    <summary>Preparar la actividad <span>{data.actividad.titulo}</span></summary>
    <div class="consigna">
      <p><strong>Objetivo.</strong> {data.actividad.objetivo}</p>
      <p><strong>Consigna.</strong> {data.actividad.consigna}</p>
      <p><strong>Escala.</strong> Los tres criterios tienen el mismo peso. Evaluá lo que demuestra al hablar, escribir o usar su comunicador. Una rúbrica completa se convierte a una nota de 0 a 10.</p>
    </div>
  </details>

  <div class="resumen" aria-label="Avance de la clase">
    <span><strong>{progreso}/{data.alumnos.length}</strong> estudiantes registrados</span>
    <span><strong>{enviados}</strong> notas verificadas en Moodle</span>
  </div>

  {#if form?.error}<p role="alert" class="mensaje error">{form.error}</p>{/if}
  {#if form?.envio}
    <p role="status" class="mensaje">{form.envio.verificados} notas verificadas en Moodle. {form.envio.restantes} requieren revisión o reintento.</p>
  {/if}
  {#if aviso}<p role="status" class="mensaje">{aviso}</p>{/if}

  {#if alumno}
    <div class="estacion">
      <aside class="card padron" aria-labelledby="titulo-padron">
        <h2 id="titulo-padron">Estudiantes</h2>
        <ul>
          {#each data.alumnos as fila (fila.id)}
            <li><button type="button" class:seleccionado={alumno.id === fila.id} aria-pressed={alumno.id === fila.id} disabled={ocupado} onclick={() => elegir(fila.id)}>
              <span>{fila.nombre}</span><small>{etiqueta(fila.oral)}</small>
            </button></li>
          {/each}
        </ul>
      </aside>

      <form class="card evaluacion" action="?/guardar" method="POST" use:enhance={guardar}>
        <div class="cabecera-evaluacion">
          <div><p class="contexto">Rúbrica individual</p><h2>{alumno.nombre}</h2></div>
          {#if nota !== null}<output class="nota">{nota.toLocaleString('es-AR', { maximumFractionDigits: 2 })} / 10</output>{/if}
        </div>
        {#if alumno.oral?.detalle}<p class="mensaje error">{alumno.oral.detalle}</p>{/if}
        <input type="hidden" name="alumnoId" value={alumno.id}>
        <input type="hidden" name="revision" value={alumno.oral?.revision ?? 0}>

        <fieldset disabled={ocupado}>
          <legend>Estado del registro</legend>
          <div class="opciones">
            {#each Object.entries(ESTADOS_ORAL) as [clave, nombre] (clave)}
              <label><input type="radio" name="estado" value={clave} checked={estado === clave} onchange={() => estado = clave as EstadoOral}><span>{nombre}</span></label>
            {/each}
          </div>
        </fieldset>

        {#if estado === 'evaluado'}
          {#if alumno.oral && alumno.oral.versionRubrica < VERSION_RUBRICA_ORAL && [alumno.oral.caudales, alumno.oral.unidades, alumno.oral.justificacion].some((nivel) => nivel !== null)}
            <div class="mensaje historica">
              <p>Los puntos guardados corresponden a la rúbrica anterior. Para cambiar un puntaje, volvé a observar la respuesta con los criterios de abajo.</p>
              <label><input type="checkbox" name="revisarRubrica" value="si" bind:checked={revisarRubrica} disabled={ocupado}> Revisé los criterios puntuados con esta rúbrica.</label>
            </div>
          {/if}
          {#each data.actividad.criterios as criterio (criterio.id)}
            <fieldset class="criterio" disabled={ocupado}>
              <legend>{criterio.nombre}</legend>
              <div class="opciones descriptores">
                {#each NIVELES_ORAL as nivel (nivel)}
                  <label><input type="radio" name={criterio.id} value={nivel} checked={rubrica[criterio.id] === nivel} onchange={() => rubrica[criterio.id] = nivel}><span><strong>{nivel} {nivel === 1 ? 'punto' : 'puntos'}</strong> {criterio.niveles[nivel]}</span></label>
                {/each}
              </div>
              {#if rubrica[criterio.id] !== null}
                <button class="quitar" type="button" onclick={() => rubrica[criterio.id] = null}>Dejar sin observar</button>
              {:else}
                <small>Sin observar</small>
              {/if}
            </fieldset>
          {/each}
          <label class="devolucion">Apoyo utilizado <small>Opcional. Se guarda en Legajo. La nota depende de los tres criterios.</small>
            <select name="apoyo" bind:value={apoyo} disabled={ocupado}>
              <option value="">Sin registrar</option>
              {#each APOYOS_ORAL as codigo (codigo)}<option value={codigo}>{NOMBRES_APOYO_ORAL[codigo]}</option>{/each}
            </select>
          </label>
          <input type="hidden" name="apoyoAnterior" value={alumno.oral?.apoyo ?? ''}>
          <label class="devolucion">Devolución para el estudiante <small>Opcional. Se comparte en Moodle al publicar.</small>
            <textarea name="devolucion" rows="2" maxlength="500" placeholder="Una próxima acción concreta" bind:value={devolucion} disabled={ocupado}></textarea>
          </label>
        {/if}

        <div class="acciones">
          <button class="principal" type="submit" value="siguiente" disabled={ocupado}>Guardar y seguir</button>
          <button class="secundario" type="submit" disabled={ocupado}>Guardar</button>
          {#if sucio}<button type="button" class="texto" disabled={ocupado} onclick={() => { cargar(alumno.oral); aviso = ''; }}>Descartar cambios</button>{/if}
        </div>
      </form>
    </div>
  {:else}
    <p class="mensaje">El curso de prueba todavía no tiene estudiantes activos.</p>
  {/if}

  <section class="card publicar" aria-labelledby="titulo-publicar">
    <h2 id="titulo-publicar">Publicar en Moodle de prueba</h2>
    <p>Destino: <strong>{data.tarea.nombre}</strong>. Solo se incluyen rúbricas completas.</p>
    {#if lote.length > 0}
      {#if revisando}
        <ul class="lote">
          {#each lote as fila (fila.id)}
            <li><strong>{fila.nombre}</strong> <span>{fila.oral.nota?.toLocaleString('es-AR', { maximumFractionDigits: 2 })} / 10</span>
              {#if fila.oral.devolucion}<p>{fila.oral.devolucion}</p>{/if}
              {#if fila.oral.detalle}<p class="texto-error">{fila.oral.detalle}</p>{/if}
            </li>
          {/each}
        </ul>
        <form action="?/publicar" method="POST" use:enhance={publicar} class="acciones">
          <input type="hidden" name="seleccion" value={JSON.stringify(lote.map(({ id, oral }) => ({ alumnoId: id, revision: oral.revision })))}>
          <button class="principal" type="submit" name="confirmar" value="si" disabled={ocupado || sucio}>Confirmar envío a Moodle</button>
          <button class="secundario" type="button" disabled={ocupado} onclick={() => revisando = false}>Volver</button>
        </form>
      {:else}
        <button class="principal" type="button" disabled={ocupado || sucio} onclick={() => revisando = true}>Revisar {lote.length} {lote.length === 1 ? 'nota' : 'notas'}</button>
      {/if}
    {:else}
      <p>Por ahora no hay notas pendientes de publicación.</p>
    {/if}
  </section>
</div>

<style>
  .aula-oral { --morado: #523557; --ciruela: #744775; --papel: #faf4fa; --borde: #d9c6dc; --texto: #302035; width: 100%; max-width: 76rem; margin: 0 auto; display: grid; grid-template-columns: minmax(0, 1fr); gap: 1rem; color: var(--texto); }
  h1 { margin: .15rem 0; font-size: clamp(2rem, 6vw, 3.35rem); line-height: 1.07; font-weight: 780; letter-spacing: -.045em; }
  h2 { font-size: clamp(1.2rem, 3vw, 1.55rem); line-height: 1.18; font-weight: 730; margin: 0; }
  p { margin: 0; }
  .contexto, small { font-size: .84rem; color: #624b64; }
  .contexto { font-weight: 700; }
  .bajada { margin-top: .55rem; color: #58445a; }
  .card { border: 1px solid var(--borde); }
  .preparacion { padding: 0 .9rem; }
  .preparacion summary { cursor: pointer; padding: .85rem .1rem; min-height: 49px; font-weight: 700; }
  .preparacion summary span { margin-left: .6rem; font-weight: 500; }
  .consigna, .resumen { color: #58445a; }
  .consigna { display: grid; gap: .45rem; padding: 0 .1rem .9rem; }
  .resumen { display: flex; flex-wrap: wrap; gap: .55rem 1.2rem; }
  .resumen strong { color: var(--morado); }
  .estacion { display: grid; grid-template-columns: minmax(12rem, .85fr) minmax(0, 2.15fr); align-items: start; gap: 1rem; }
  .padron, .evaluacion, .publicar { min-width: 0; padding: clamp(.8rem, 2vw, 1.35rem); }
  .padron ul { display: grid; gap: .45rem; max-height: 34rem; overflow: auto; list-style: none; padding: .7rem .25rem .25rem; margin: 0; }
  .padron button { display: grid; text-align: left; width: 100%; min-height: 54px; padding: .55rem .7rem; border: 1px solid var(--borde); border-radius: .5rem; background: white; cursor: pointer; }
  .padron button span { font-weight: 680; }
  .padron button.seleccionado { border-color: var(--ciruela); background: #efdfef; }
  .evaluacion, .publicar { display: grid; gap: 1rem; }
  .cabecera-evaluacion { display: flex; gap: .6rem; justify-content: space-between; align-items: center; }
  .nota { flex-shrink: 0; background: var(--papel); border: 1px solid var(--borde); border-radius: .45rem; padding: .55rem .75rem; font-size: 1.2rem; font-weight: 700; }
  fieldset { border: none; padding: .15rem 0 0; margin: 0; min-width: 0; }
  legend { font-size: 1rem; font-weight: 720; padding: 0; }
  .publicar p { color: #58445a; }
  .opciones { display: grid; grid-template-columns: repeat(3, 1fr); gap: .45rem; margin-top: .4rem; }
  .opciones label { position: relative; display: flex; }
  .opciones input { position: absolute; opacity: 0; }
  .opciones span { display: flex; flex: 1; align-items: center; justify-content: center; min-height: 49px; border: 1px solid var(--borde); border-radius: .45rem; padding: .3rem; background: white; text-align: center; cursor: pointer; font-size: .88rem; font-weight: 650; }
  .opciones input:checked + span, .principal { background: var(--morado); color: white; border-color: var(--morado); }
  .descriptores span { display: block; text-align: left; padding: .55rem; font-weight: 400; line-height: 1.35; }
  .descriptores strong { display: block; margin-bottom: .2rem; }
  .opciones input:focus-visible + span, button:focus-visible, summary:focus-visible, select:focus-visible, textarea:focus-visible { outline: 3px solid var(--ciruela); outline-offset: 2px; }
  .quitar { min-height: 44px; padding: .35rem 0; color: var(--morado); text-decoration: underline; font-size: .85rem; cursor: pointer; }
  .historica label { display: flex; align-items: center; gap: .5rem; min-height: 44px; }
  .devolucion { display: grid; gap: .25rem; font-weight: 700; }
  .devolucion small { font-weight: 400; }
  textarea, select { width: 100%; border: 1px solid var(--borde); border-radius: .45rem; padding: .6rem; background: white; font-weight: 400; }
  select { min-height: 48px; }
  .acciones { display: flex; flex-wrap: wrap; gap: .55rem; }
  .principal, .secundario, .texto { min-height: 49px; padding: .5rem .85rem; border: 1px solid; border-radius: .45rem; font-weight: 690; cursor: pointer; align-self: start; justify-self: start; }
  .secundario { color: var(--morado); border-color: var(--borde); background: white; }
  .texto { color: var(--morado); border-color: transparent; text-decoration: underline; }
  :disabled { opacity: .55; cursor: wait; }
  .mensaje { background: var(--papel); border: 1px solid var(--borde); border-radius: .45rem; padding: .65rem .8rem; }
  .error { color: #7b2346; }
  .texto-error { color: #7b2346 !important; }
  .lote { list-style: none; padding: 0; border-top: 1px solid var(--borde); }
  .lote li { padding: .5rem 0; border-bottom: 1px solid var(--borde); }
  .lote li span { margin-left: .55rem; }

  @media (max-width: 770px) {
    .estacion { grid-template-columns: minmax(0, 1fr); }
    .padron ul { display: flex; overflow-x: auto; }
    .padron li { flex: 0 0 8.4rem; }
    .padron button { min-height: 65px; }
  }
  @media (max-width: 510px) {
    .descriptores { grid-template-columns: 1fr; }
    .descriptores strong { display: inline; margin-right: .3rem; }
  }
</style>

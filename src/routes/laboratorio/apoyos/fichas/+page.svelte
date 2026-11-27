<script lang="ts">
  import { onMount } from 'svelte';
  import { DEMO_KEY, demoInicial, demoSchema } from '$lib/laboratorio/apoyos.js';
  import EvidenciasCiencias from './EvidenciasCiencias.svelte';
  import type { PageProps } from './$types';

  let { data, form }: PageProps = $props();
  type Apoyo = ReturnType<typeof demoInicial>['apoyo'];
  const vacia: Apoyo = { barrera: '', ajuste: '', responsable: '', revision: '', ofrecido: 'pendiente', observacion: '', decision: 'pendiente' };
  const etiquetas = {
    barrera: 'Barrera observada', ajuste: 'Apoyo acordado', responsable: 'Responsable', revision: 'Fecha de revisión',
    ofrecido: '¿Se ofreció el apoyo?', observacion: 'Observación', decision: 'Próxima decisión'
  };
  const campos = Object.keys(etiquetas) as (keyof Apoyo)[];
  let anterior = $state<Apoyo | null>(null);
  let editor = $state<HTMLFormElement>();
  let importado = $state<number | null>(null);
  const respuesta = $derived(form?.alumnoId === data.alumno?.id ? form : null);
  const valores = $derived({ ...vacia, ...data.ficha, ...respuesta?.borrador });
  const conflicto = $derived(Boolean(respuesta?.conflicto && data.ficha));
  const version = $derived(conflicto ? data.ficha!.version : (respuesta?.version ?? data.ficha?.version ?? 0));

  onMount(() => {
    try {
      const previo = localStorage.getItem(DEMO_KEY);
      if (!previo) return;
      const dato = demoSchema.safeParse(JSON.parse(previo));
      const ejemplo = demoInicial().apoyo;
      if (dato.success && campos.some((campo) => dato.data.apoyo[campo] !== ejemplo[campo])) anterior = dato.data.apoyo;
    } catch { /* El borrador de una tablet anterior es opcional. */ }
  });

  function importar() {
    if (!anterior || !data.alumno || !editor) return;
    for (const campo of campos) {
      const control = editor.elements.namedItem(campo);
      if (control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement || control instanceof HTMLSelectElement) {
        control.value = anterior[campo];
      }
    }
    importado = data.alumno.id;
  }
</script>

<svelte:head><title>Ficha de apoyos · Legajo</title></svelte:head>
<div class="space-y-4">
  <header class="space-y-1">
    <a href="/laboratorio/apoyos" class="text-sm text-indigo-700 underline">Volver al laboratorio de apoyos</a>
    <h1 class="text-2xl font-bold text-gray-900">Ficha de apoyos</h1>
    <p class="text-sm text-gray-700">Acuerdos de Ciencias entre el docente y el gabinete. La ficha queda en Legajo.</p>
  </header>
  {#if data.alumno}
    <form method="GET" class="card flex flex-wrap items-end gap-3">
      <label class="min-w-44 flex-1"><span class="form-label">Estudiante</span>
        <select class="form-input" name="alumnoId" value={data.alumno.id}>
          {#each data.alumnos as alumno (alumno.id)}<option value={alumno.id}>{alumno.nombre}</option>{/each}
        </select>
      </label>
      <button type="submit" class="btn-secondary min-h-11">Abrir ficha</button>
    </form>

    {#key data.alumno.id}
      {#if data.gabinete}
        {#if data.evidencias}
          <EvidenciasCiencias evidencias={data.evidencias} alumno={data.alumno.nombre} ficha={data.ficha} />
        {:else}
          <p role="status" class="card text-amber-900">Las evidencias de Ciencias están pendientes de lectura. Podés consultar el acuerdo y guardar tu revisión en Legajo.</p>
        {/if}
      {/if}
      <form method="POST" action={'?/guardar&alumnoId=' + data.alumno.id} bind:this={editor} class="card space-y-4" autocomplete="off">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">{data.alumno.nombre}</h2>
          <p class="text-sm text-gray-600">{data.ficha ? 'Versión guardada en Legajo: ' + data.ficha.version : 'Ficha nueva'}</p>
        </div>
        {#if form?.error}<p role="alert" class="rounded border border-amber-300 bg-amber-50 p-3">{form.error}</p>{/if}
        {#if respuesta?.guardada}<p role="status" class="rounded bg-green-50 p-3 text-green-900">Ficha guardada en Legajo.</p>{/if}
        {#if conflicto && data.ficha}
          <details open class="rounded border p-3">
            <summary class="cursor-pointer font-semibold">Compará la ficha guardada con tus cambios</summary>
            <dl class="mt-2 space-y-2 text-sm">
              {#each campos as campo (campo)}
                <div><dt class="font-semibold">{etiquetas[campo]}</dt><dd class="whitespace-pre-wrap">{data.ficha[campo] || 'Sin registrar'}</dd></div>
              {/each}
            </dl>
          </details>
          <label class="flex items-center gap-2"><input type="checkbox" required /> Revisé la versión guardada y confirmé qué datos quiero conservar.</label>
        {/if}
        <input type="hidden" name="alumnoId" value={data.alumno.id}>
        <input type="hidden" name="version" value={version}>
        {#if anterior && !data.ficha && !respuesta?.borrador}
          <button type="button" class="btn-secondary min-h-11" onclick={importar}>Usar borrador anterior de esta tablet para {data.alumno.nombre}</button>
          {#if importado === data.alumno.id}<p class="text-sm" role="status">Borrador copiado. Revisá los campos antes de guardarlo.</p>{/if}
        {/if}
        <label class="block"><span class="form-label">{etiquetas.barrera}</span>
          <textarea name="barrera" class="form-input" required rows="2" maxlength="500" value={valores.barrera}></textarea>
        </label>
        <label class="block"><span class="form-label">{etiquetas.ajuste}</span>
          <textarea name="ajuste" class="form-input" required rows="2" maxlength="500" value={valores.ajuste}></textarea>
        </label>
        <div class="grid gap-3 sm:grid-cols-2">
          <label><span class="form-label">{etiquetas.responsable}</span>
            <input name="responsable" class="form-input" required maxlength="120" value={valores.responsable}>
          </label>
          <label><span class="form-label">{etiquetas.revision}</span>
            <input type="date" name="revision" class="form-input" required min="1000-01-01" max="9999-12-31" value={valores.revision}>
          </label>
        </div>
        <label class="block"><span class="form-label">{etiquetas.ofrecido}</span>
          <select name="ofrecido" class="form-input" value={valores.ofrecido}>
            <option value="pendiente">Pendiente</option><option value="si">Sí</option><option value="no">No</option>
          </select>
        </label>
        {#if data.gabinete}
          <h3 id="decision-apoyo" class="scroll-mt-20 text-lg font-semibold text-gray-900">Revisión del apoyo</h3>
          <p class="text-sm text-gray-700">Considerá los objetivos del cuestionario y lo que observaron al ofrecer el apoyo. Podés anotar el motivo de tu decisión en la ficha compartida con el docente.</p>
        {/if}
        <label class="block"><span class="form-label">Observación pedagógica (opcional)</span>
          <textarea name="observacion" class="form-input" rows="2" maxlength="500" value={valores.observacion}></textarea>
        </label>
        <label class="block"><span class="form-label">{etiquetas.decision}</span>
          <select name="decision" class="form-input" value={valores.decision}>
            <option value="pendiente">Pendiente de revisión</option><option value="mantener">Mantener el apoyo</option>
            <option value="ajustar">Ajustar el apoyo</option><option value="cerrar">Cerrar el acuerdo</option>
          </select>
        </label>
        <button type="submit" class="btn-primary min-h-11">Guardar ficha en Legajo</button>
      </form>
    {/key}
  {:else}
    <p class="card">El curso de prueba todavía no tiene estudiantes activos.</p>
  {/if}
</div>

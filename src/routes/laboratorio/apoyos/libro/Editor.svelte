<script lang="ts">
  import { onMount, tick, untrack } from 'svelte';
  import { enhance } from '$app/forms';
  import { DEMO_KEY } from '$lib/laboratorio/apoyos';
  import { esquemaLibro, type ActividadLibro } from '$lib/laboratorio/libro';
  import type { SubmitFunction } from '@sveltejs/kit';

  let { inicial, revision }: { inicial: ActividadLibro; revision: number } = $props();
  let actividad = $state(untrack(() => esquemaLibro.parse(inicial)));
  let borradorLocal = $state<ActividadLibro | null>(null);
  let publicando = $state(false);
  let confirmado = $state(false);
  let aviso = $state('');

  onMount(() => {
    try {
      const guardado = localStorage.getItem(DEMO_KEY);
      if (!guardado) return;
      const resultado = esquemaLibro.safeParse(JSON.parse(guardado)?.actividad);
      if (resultado.success) borradorLocal = resultado.data;
    } catch { /* La actividad del servidor se puede editar aunque el navegador no ofrezca almacenamiento. */ }
  });

  async function agregar() {
    if (actividad.pasos.length >= 8) return;
    const id = crypto.randomUUID();
    actividad.pasos.push({ id, titulo: '', consigna: '', audio: '' });
    confirmado = false;
    await tick();
    document.getElementById('titulo-' + id)?.focus();
  }

  function mover(i: number, destino: number) {
    if (destino < 0 || destino >= actividad.pasos.length) return;
    const [paso] = actividad.pasos.splice(i, 1);
    actividad.pasos.splice(destino, 0, paso);
    confirmado = false;
    aviso = 'Orden actualizado.';
  }

  const enviar: SubmitFunction = () => {
    publicando = true;
    return async ({ update }) => {
      try { await update({ reset: false }); }
      finally { publicando = false; confirmado = false; }
    };
  };
</script>

<form class="space-y-4" method="POST" action="?/publicar" use:enhance={enviar} oninput={() => { aviso = ''; }}>
  <input type="hidden" name="revision" value={revision} />
  {#if borradorLocal}
    <button type="button" class="btn-secondary" disabled={publicando} onclick={() => {
      actividad = structuredClone($state.snapshot(borradorLocal!)); confirmado = false;
      aviso = 'Actividad del borrador cargada. Revisá los pasos antes de publicar.';
    }}>Usar la actividad que guardé en este navegador</button>
  {/if}
  {#if aviso}<p class="text-sm" role="status">{aviso}</p>{/if}
  <fieldset disabled={publicando} class="card space-y-3">
    <legend class="sr-only">Datos del Libro</legend>
    <label class="form-label">Título del Libro<input name="titulo" class="form-input" bind:value={actividad.titulo} maxlength="120" required /></label>
    <label class="form-label">Objetivo de aprendizaje<textarea name="objetivo" class="form-input" bind:value={actividad.objetivo} rows="2" maxlength="500" required></textarea></label>
  </fieldset>
  {#each actividad.pasos as paso, i (paso.id)}
    <fieldset class="card space-y-3" disabled={publicando}>
      <legend class="px-1 text-lg font-semibold">Paso {i + 1}</legend>
      <input type="hidden" name="pasoId" value={paso.id} />
      <label class="form-label">Título del capítulo<input id={'titulo-' + paso.id} class="form-input" name="pasoTitulo" bind:value={paso.titulo} maxlength="120" required /></label>
      <label class="form-label">Consigna escrita<textarea class="form-input" name="pasoConsigna" bind:value={paso.consigna} rows="3" maxlength="1400" required></textarea></label>
      <label class="form-label">Guion de audio opcional
        <span class="block text-sm font-normal text-gray-600">El estudiante podrá escucharlo o leer su transcripción. Dejá el campo vacío para usar sólo la consigna.</span>
        <textarea class="form-input" name="pasoAudio" bind:value={paso.audio} rows="2" maxlength="1400"></textarea>
      </label>
      <button class="text-sm font-medium underline text-indigo-800" type="button"
        disabled={!paso.consigna.trim() || paso.audio === paso.consigna}
        onclick={() => { paso.audio = paso.consigna; confirmado = false; aviso = 'La narración usará el texto de la consigna.'; }}>
        Usar la consigna como guion
      </button>
      <div class="flex flex-wrap gap-2">
        <button type="button" class="btn-secondary" aria-label={'Subir el paso ' + (i + 1)} disabled={i === 0} onclick={() => mover(i, i - 1)}>Subir</button>
        <button type="button" class="btn-secondary" aria-label={'Bajar el paso ' + (i + 1)} disabled={i === actividad.pasos.length - 1} onclick={() => mover(i, i + 1)}>Bajar</button>
        <button type="button" class="btn-secondary" aria-label={'Quitar el paso ' + (i + 1)} disabled={actividad.pasos.length === 1} onclick={() => { actividad.pasos.splice(i, 1); confirmado = false; }}>Quitar</button>
      </div>
    </fieldset>
  {/each}
  <button class="btn-secondary" type="button" onclick={agregar} disabled={publicando || actividad.pasos.length >= 8}>Agregar paso</button>
  <div class="card space-y-3">
    <label class="flex items-center gap-2"><input type="checkbox" name="confirmar" value="si" required bind:checked={confirmado} disabled={publicando} /> Confirmo que estos capítulos se pueden compartir con el curso de Ciencias.</label>
    <button class="btn-primary" type="submit" disabled={publicando}>{publicando ? 'Publicando…' : 'Publicar en Moodle'}</button>
  </div>
</form>

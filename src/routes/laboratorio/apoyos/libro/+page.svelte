<script lang="ts">
  import Editor from './Editor.svelte';
  import type { PageProps } from './$types';

  let { data, form }: PageProps = $props();
  const fuente = $derived(form?.borrador ?? data);
</script>

<svelte:head><title>Actividad de Ciencias por pasos · Legajo</title></svelte:head>
<div class="space-y-4">
  <a class="text-sm underline text-indigo-800" href="/laboratorio/apoyos">Volver al Laboratorio de apoyos</a>
  <header>
    <h1 class="text-2xl font-semibold">Actividad de Ciencias por pasos</h1>
    <p class="mt-2 text-sm text-gray-700">Cada paso será un capítulo del Libro de Moodle. Podés incluir una narración en español junto a la consigna escrita.</p>
    {#if data.url}<a class="mt-2 inline-block font-medium underline text-indigo-800" href={data.url} target="_blank" rel="noreferrer">Abrir el Libro publicado en Moodle</a>{/if}
  </header>
  {#if form?.resultado}
    <p class="card bg-green-50 text-green-900" role="status">{form.resultado.cambio ? 'Libro publicado en Moodle.' : 'El Libro ya tiene este contenido.'} Versión {form.resultado.revision}.</p>
  {/if}
  {#if form?.error}<p role="alert" class="card bg-amber-50 text-amber-900">{form.error}</p>{/if}
  {#key fuente.revision}
    <Editor inicial={fuente.actividad} revision={fuente.revision} />
  {/key}
</div>

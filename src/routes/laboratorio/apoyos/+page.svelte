<script lang="ts">
  import DemoApoyos from '$lib/laboratorio/DemoApoyos.svelte';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
  let mostrarEjemplo = $state(false);
</script>

<svelte:head><title>Laboratorio de apoyos · Legajo</title></svelte:head>

{#if data.fichas}
  <div class="mx-auto max-w-3xl space-y-5">
    <header>
      <p class="text-sm font-medium text-indigo-700">Ciencias · Curso de prueba</p>
      <h1 class="mt-1 text-3xl font-bold text-gray-900">Laboratorio de apoyos</h1>
    </header>
    <div class="grid gap-3 sm:grid-cols-2">
      <a class="card block hover:border-indigo-400" href="/laboratorio/apoyos/fichas">
        <strong class="block text-lg text-indigo-800">Fichas de apoyos</strong>
        <span class="mt-1 block text-sm text-gray-700">Registrá el apoyo acordado con cada estudiante y su próxima revisión.</span>
      </a>
      {#if data.libro}
        <a class="card block hover:border-indigo-400" href="/laboratorio/apoyos/libro">
          <strong class="block text-lg text-indigo-800">Libro de Ciencias</strong>
          <span class="mt-1 block text-sm text-gray-700">Editá los pasos y publicalos en el campus con la lectura que elijas.</span>
        </a>
      {/if}
    </div>
    <button class="min-h-11 text-sm text-indigo-800 underline" type="button" aria-expanded={mostrarEjemplo}
      onclick={() => mostrarEjemplo = !mostrarEjemplo}>{mostrarEjemplo ? 'Cerrar ejemplo local' : 'Ver ejemplo guardado en este navegador'}</button>
  </div>
{/if}
{#if !data.fichas || mostrarEjemplo}<DemoApoyos />{/if}

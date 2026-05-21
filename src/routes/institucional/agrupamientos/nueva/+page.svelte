<script lang="ts">
  import { enhance } from '$app/forms';

  let { data, form } = $props();

  let cursoSeleccionado = $state<{ id: number; nombre: string } | null>(null);
  let titulo = $state('');
  let fecha = $state(new Date().toISOString().split('T')[0]);
  let notas = $state('');
  let guardando = $state(false);
  let paso = $state(1);

  function seleccionarCurso(id: number, nombre: string) {
    cursoSeleccionado = { id, nombre };
    if (!titulo) titulo = `Sociograma — ${nombre}`;
    paso = 2;
  }
</script>

<svelte:head><title>Nueva sesión de agrupamiento — Legajo</title></svelte:head>

<div class="space-y-4">
  <div class="flex items-center gap-2">
    <a href="/institucional/agrupamientos" class="text-indigo-600 text-sm hover:underline">← Agrupamientos</a>
    <h2 class="text-lg font-bold text-gray-900">Nueva sesión</h2>
  </div>

  {#if form?.error}
    <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">{form.error}</div>
  {/if}

  <!-- Paso 1: seleccionar curso -->
  {#if paso === 1}
    <p class="text-sm font-medium text-gray-700">Seleccioná el curso</p>
    {#if data.cursos.length === 0}
      <div class="card text-center py-8"><p class="text-gray-500 text-sm">No hay cursos disponibles</p></div>
    {:else}
      <div class="space-y-2">
        {#each data.cursos as curso}
          <button
            onclick={() => seleccionarCurso(curso.id, curso.displayname || curso.fullname)}
            class="card w-full text-left hover:border-indigo-300 transition-colors"
          >
            <p class="font-medium text-gray-900">{curso.displayname || curso.fullname}</p>
            <p class="text-xs text-gray-400">{curso.shortname}</p>
          </button>
        {/each}
      </div>
    {/if}
  {/if}

  <!-- Paso 2: datos de la sesión -->
  {#if paso === 2}
    <div class="bg-indigo-50 rounded-lg px-3 py-2 text-sm">
      <strong class="text-indigo-700">{cursoSeleccionado?.nombre}</strong>
      <button onclick={() => (paso = 1)} class="ml-2 text-xs text-gray-400 hover:text-gray-700">(cambiar)</button>
    </div>

    <form
      method="POST"
      use:enhance={() => {
        guardando = true;
        return async ({ update }) => {
          await update();
          guardando = false;
        };
      }}
      class="space-y-4"
    >
      <input type="hidden" name="cursoMoodleId" value={cursoSeleccionado?.id} />
      <input type="hidden" name="cursoNombre" value={cursoSeleccionado?.nombre} />

      <div>
        <label class="form-label" for="titulo">Título</label>
        <input id="titulo" type="text" name="titulo" bind:value={titulo} maxlength="200" class="form-input" required />
      </div>

      <div>
        <label class="form-label" for="fecha">Fecha</label>
        <input id="fecha" type="date" name="fecha" bind:value={fecha} class="form-input" required />
      </div>

      <div>
        <label class="form-label" for="notas">Notas <span class="text-gray-400 font-normal">(opcional)</span></label>
        <textarea
          id="notas"
          name="notas"
          bind:value={notas}
          rows="3"
          maxlength="2000"
          class="form-input resize-none"
          placeholder="Contexto o consigna de la votación..."
        ></textarea>
      </div>

      <button type="submit" class="btn-primary w-full" disabled={guardando}>
        {guardando ? 'Creando...' : 'Crear sesión'}
      </button>
    </form>
  {/if}
</div>

<script lang="ts">
  import { enhance } from '$app/forms';
  let { form } = $props();

  let guardando = $state(false);
  let fecha = $state(new Date().toISOString().split('T')[0]);
  let tareas = $state<{ descripcion: string; dueDate: string }[]>([]);

  function agregarTarea() {
    tareas = [...tareas, { descripcion: '', dueDate: '' }];
  }
  function quitarTarea(i: number) {
    tareas = tareas.filter((_, idx) => idx !== i);
  }
</script>

<svelte:head><title>Nueva acta — Legajo</title></svelte:head>

<div class="space-y-4">
  <div class="flex items-center gap-2">
    <a href="/preceptor/actas" class="text-indigo-600 text-sm hover:underline">← Actas</a>
    <h2 class="text-lg font-bold text-gray-900">Nueva acta</h2>
  </div>

  {#if form?.error}
    <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">{form.error}</div>
  {/if}

  <form method="POST"
    use:enhance={() => { guardando = true; return async ({ update }) => { await update(); guardando = false; }; }}
    class="space-y-4"
  >
    <input type="hidden" name="tareas" value={JSON.stringify(tareas)} />
    <input type="hidden" name="asistentes" value="[]" />

    <div>
      <label class="form-label">Fecha *</label>
      <input type="date" name="fecha" bind:value={fecha} required class="form-input" />
    </div>

    <div>
      <label class="form-label">Título *</label>
      <input type="text" name="titulo" required maxlength="300" class="form-input" placeholder="Ej: Reunión de seguimiento — 3°A" />
    </div>

    <div>
      <label class="form-label">Resumen / Descripción *</label>
      <textarea name="resumen" rows="5" required maxlength="10000" class="form-input resize-none" placeholder="Describí los temas tratados..."></textarea>
    </div>

    <div>
      <label class="form-label">Acuerdos <span class="text-gray-400 font-normal">(opcional)</span></label>
      <textarea name="acuerdos" rows="3" maxlength="10000" class="form-input resize-none" placeholder="Acuerdos tomados en la reunión..."></textarea>
    </div>

    <!-- Tareas -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <label class="form-label mb-0">Tareas / compromisos</label>
        <button type="button" onclick={agregarTarea} class="text-sm text-indigo-600 hover:underline">+ Agregar tarea</button>
      </div>
      {#each tareas as tarea, i}
        <div class="card border-indigo-200 space-y-2">
          <input
            type="text"
            bind:value={tarea.descripcion}
            placeholder="Describí la tarea..."
            class="form-input text-sm"
            maxlength="2000"
          />
          <div class="flex gap-2 items-center">
            <input type="date" bind:value={tarea.dueDate} class="form-input text-sm flex-1" />
            <button type="button" onclick={() => quitarTarea(i)} class="text-xs text-red-400 hover:text-red-600">✕ quitar</button>
          </div>
        </div>
      {/each}
    </div>

    <button type="submit" class="btn-primary w-full" disabled={guardando}>
      {guardando ? 'Guardando...' : 'Crear acta'}
    </button>
  </form>
</div>

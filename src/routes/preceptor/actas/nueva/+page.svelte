<script lang="ts">
  import { enhance } from '$app/forms';
  import type { MoodleUser } from '$lib/server/moodle/types';

  let { data, form } = $props();

  let guardando  = $state(false);
  let fecha      = $state(new Date().toISOString().split('T')[0]);
  let tareas     = $state<{ descripcion: string; dueDate: string }[]>([]);

  // Alumnos vinculados (opcional)
  let mostrarAlumnos   = $state(false);
  let cursoElegido     = $state<{ id: number; nombre: string } | null>(null);
  let alumnosCurso     = $state<{ id: number; fullname: string }[]>([]);
  let alumnosVinculados = $state<Map<number, string>>(new Map());
  let cargandoAlumnos  = $state(false);
  let busquedaAlumno   = $state('');

  async function cargarAlumnosCurso(id: number, nombre: string) {
    cursoElegido = { id, nombre };
    cargandoAlumnos = true;
    alumnosCurso = [];
    busquedaAlumno = '';
    try {
      const res  = await fetch(`/api/moodle/cursos/${id}/alumnos`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Error');
      alumnosCurso = json;
    } catch (e) {
      alert('Error al cargar alumnos: ' + (e instanceof Error ? e.message : e));
    } finally {
      cargandoAlumnos = false;
    }
  }

  function toggleAlumno(a: { id: number; fullname: string }) {
    const m = new Map(alumnosVinculados);
    m.has(a.id) ? m.delete(a.id) : m.set(a.id, a.fullname);
    alumnosVinculados = m;
  }

  let alumnosFiltrados = $derived(
    busquedaAlumno.trim()
      ? alumnosCurso.filter(a => a.fullname.toLowerCase().includes(busquedaAlumno.toLowerCase()))
      : alumnosCurso
  );

  let alumnosPayload = $derived(
    [...alumnosVinculados.entries()].map(([id, nombre]) => ({
      alumnoMoodleId: id,
      alumnoNombre: nombre
    }))
  );

  function agregarTarea() { tareas = [...tareas, { descripcion: '', dueDate: '' }]; }
  function quitarTarea(i: number) { tareas = tareas.filter((_, idx) => idx !== i); }
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

  <form
    method="POST"
    use:enhance={() => { guardando = true; return async ({ update }) => { await update(); guardando = false; }; }}
    class="space-y-4"
  >
    <input type="hidden" name="tareas"    value={JSON.stringify(tareas)} />
    <input type="hidden" name="asistentes" value="[]" />
    <input type="hidden" name="alumnos"   value={JSON.stringify(alumnosPayload)} />

    <div>
      <label class="form-label">Fecha *</label>
      <input type="date" name="fecha" bind:value={fecha} required class="form-input" />
    </div>

    <div>
      <label class="form-label">Título *</label>
      <input type="text" name="titulo" required maxlength="300" class="form-input"
        placeholder="Ej: Reunión de seguimiento — 3°A" />
    </div>

    <div>
      <label class="form-label">Resumen / Descripción *</label>
      <textarea name="resumen" rows="5" required maxlength="10000"
        class="form-input resize-none" placeholder="Describí los temas tratados..."></textarea>
    </div>

    <div>
      <label class="form-label">Acuerdos <span class="text-gray-400 font-normal">(opcional)</span></label>
      <textarea name="acuerdos" rows="3" maxlength="10000"
        class="form-input resize-none" placeholder="Acuerdos tomados en la reunión..."></textarea>
    </div>

    <!-- Tareas -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <span class="form-label mb-0">Tareas / compromisos</span>
        <button type="button" onclick={agregarTarea}
          class="text-sm text-indigo-600 hover:underline">+ Agregar tarea</button>
      </div>
      {#each tareas as tarea, i}
        <div class="card border-indigo-200 space-y-2">
          <input type="text" bind:value={tarea.descripcion}
            placeholder="Describí la tarea..." class="form-input text-sm" maxlength="2000" />
          <div class="flex gap-2 items-center">
            <input type="date" bind:value={tarea.dueDate} class="form-input text-sm flex-1" />
            <button type="button" onclick={() => quitarTarea(i)}
              class="text-xs text-red-400 hover:text-red-600">✕ quitar</button>
          </div>
        </div>
      {/each}
    </div>

    <!-- Alumnos vinculados (opcional) -->
    <div class="border border-gray-200 rounded-xl overflow-hidden">
      <button type="button"
        onclick={() => { mostrarAlumnos = !mostrarAlumnos; }}
        class="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors">
        <span>👥 Alumnos vinculados al acta
          {#if alumnosVinculados.size > 0}
            <span class="ml-1 text-xs bg-indigo-600 text-white px-1.5 py-0.5 rounded-full">{alumnosVinculados.size}</span>
          {/if}
        </span>
        <span class="text-gray-400">{mostrarAlumnos ? '▲' : '▼'}</span>
      </button>

      {#if mostrarAlumnos}
        <div class="p-4 space-y-3">
          <p class="text-xs text-gray-500">Opcional. Asociá alumnos de Moodle a esta acta.</p>

          {#if !cursoElegido}
            <!-- Seleccionar curso -->
            {#if data.cursos.length === 0}
              <p class="text-xs text-gray-400">No hay cursos disponibles.</p>
            {:else}
              <div class="space-y-1.5 max-h-48 overflow-y-auto">
                {#each data.cursos as curso}
                  <button type="button"
                    onclick={() => cargarAlumnosCurso(curso.id, curso.displayname || curso.fullname)}
                    disabled={cargandoAlumnos}
                    class="w-full text-left px-3 py-2 rounded-lg border border-gray-200 text-sm hover:border-indigo-300 transition-colors {cargandoAlumnos ? 'opacity-50' : ''}">
                    <span class="font-medium text-gray-800">{curso.displayname || curso.fullname}</span>
                    <span class="ml-2 text-xs text-gray-400">{curso.shortname}</span>
                  </button>
                {/each}
              </div>
              {#if cargandoAlumnos}
                <p class="text-xs text-gray-500 animate-pulse text-center">Cargando...</p>
              {/if}
            {/if}
          {:else}
            <!-- Alumnos del curso elegido -->
            <div class="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span class="font-medium">{cursoElegido.nombre}</span>
              <button type="button" onclick={() => { cursoElegido = null; alumnosCurso = []; }}
                class="text-gray-400 hover:text-gray-600">cambiar curso</button>
            </div>
            <input type="text" bind:value={busquedaAlumno}
              placeholder="Buscar alumno..." class="form-input text-sm w-full" />
            <div class="space-y-1.5 max-h-48 overflow-y-auto">
              {#each alumnosFiltrados as alumno}
                <button type="button" onclick={() => toggleAlumno(alumno)}
                  class="w-full text-left px-3 py-2 rounded-lg border text-sm flex items-center gap-2 transition-colors
                         {alumnosVinculados.has(alumno.id) ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-indigo-200'}">
                  <span class="w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center text-xs
                               {alumnosVinculados.has(alumno.id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300'}">
                    {#if alumnosVinculados.has(alumno.id)}✓{/if}
                  </span>
                  {alumno.fullname}
                </button>
              {/each}
            </div>
            {#if alumnosVinculados.size > 0}
              <p class="text-xs text-indigo-600 font-medium">{alumnosVinculados.size} alumno/s vinculado/s</p>
            {/if}
          {/if}
        </div>
      {/if}
    </div>

    <button type="submit" class="btn-primary w-full" disabled={guardando}>
      {guardando ? 'Guardando...' : 'Crear acta'}
    </button>
  </form>
</div>

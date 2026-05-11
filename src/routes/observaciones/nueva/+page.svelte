<script lang="ts">
  import { enhance } from '$app/forms';
  import type { MoodleUser } from '$lib/server/moodle/types';

  let { data, form } = $props();

  // ─── Estado del wizard ────────────────────────────────────────────────────
  let paso = $state(data.preselect.cursoId && data.preselect.alumnoId ? 3 : 1);

  let cursoSeleccionado = $state<{ id: number; nombre: string } | null>(
    data.preselect.cursoId
      ? {
          id: data.preselect.cursoId,
          nombre: data.cursos.find(c => c.id === data.preselect.cursoId)?.fullname ?? ''
        }
      : null
  );

  let alumnoSeleccionado = $state<{ id: number; nombre: string } | null>(
    data.preselect.alumnoId
      ? { id: data.preselect.alumnoId, nombre: data.preselect.alumnoNombre ?? '' }
      : null
  );

  let alumnos = $state<MoodleUser[]>([]);
  let cargandoAlumnos = $state(false);
  let errorAlumnos = $state<string | null>(null);
  let busquedaAlumno = $state('');

  // Campos del formulario
  let actitud = $state(3);
  let tareaCompleta = $state(true);
  let participacion = $state(3);
  let observacionTexto = $state('');
  let fecha = $state(new Date().toISOString().split('T')[0]);
  let guardando = $state(false);

  // ─── Cargar alumnos al seleccionar curso ──────────────────────────────────
  async function seleccionarCurso(id: number, nombre: string) {
    cursoSeleccionado = { id, nombre };
    cargandoAlumnos = true;
    errorAlumnos = null;
    alumnos = [];
    busquedaAlumno = '';

    try {
      const res = await fetch(`/api/moodle/cursos/${id}/alumnos`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Error al cargar alumnos');
      alumnos = json;
      paso = 2;
    } catch (err) {
      errorAlumnos = err instanceof Error ? err.message : 'Error desconocido';
    } finally {
      cargandoAlumnos = false;
    }
  }

  function seleccionarAlumno(id: number, nombre: string) {
    alumnoSeleccionado = { id, nombre };
    paso = 3;
  }

  let alumnosFiltrados = $derived(
    busquedaAlumno.trim()
      ? alumnos.filter(a => a.fullname.toLowerCase().includes(busquedaAlumno.toLowerCase()))
      : alumnos
  );

  const ESCALA = [1, 2, 3, 4, 5];
  const ESCALA_LABELS = ['Muy bajo', 'Bajo', 'Regular', 'Bueno', 'Excelente'];
</script>

<svelte:head>
  <title>Nueva observación — Legajo</title>
</svelte:head>

<div class="space-y-4">
  <!-- Encabezado con progreso -->
  <div>
    <div class="flex items-center gap-2 mb-1">
      {#if paso > 1}
        <button onclick={() => { paso = paso - 1; }} class="text-indigo-600 text-sm">← Volver</button>
      {/if}
      <h1 class="text-xl font-bold text-gray-900">Nueva observación</h1>
    </div>
    <!-- Indicador de pasos -->
    <div class="flex gap-1 mt-2">
      {#each [1,2,3] as p}
        <div class="h-1 flex-1 rounded-full {p <= paso ? 'bg-indigo-500' : 'bg-gray-200'} transition-colors"></div>
      {/each}
    </div>
    <p class="text-xs text-gray-400 mt-1">Paso {paso} de 3</p>
  </div>

  <!-- PASO 1: Seleccionar curso -->
  {#if paso === 1}
    <p class="text-sm font-medium text-gray-700">Seleccioná el curso</p>
    {#if data.cursos.length === 0}
      <div class="card text-center py-8">
        <p class="text-gray-500 text-sm">No hay cursos disponibles</p>
      </div>
    {:else}
      <div class="space-y-2">
        {#each data.cursos as curso}
          <button
            onclick={() => seleccionarCurso(curso.id, curso.fullname)}
            class="card w-full text-left hover:border-indigo-300 transition-colors
                   {cargandoAlumnos ? 'opacity-50 cursor-wait' : ''}"
            disabled={cargandoAlumnos}
          >
            <p class="font-medium text-gray-900">{curso.displayname || curso.fullname}</p>
            <p class="text-xs text-gray-400">{curso.shortname}</p>
          </button>
        {/each}
      </div>
      {#if cargandoAlumnos}
        <p class="text-center text-sm text-gray-500 animate-pulse">Cargando alumnos...</p>
      {/if}
      {#if errorAlumnos}
        <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
          {errorAlumnos}
        </div>
      {/if}
    {/if}
  {/if}

  <!-- PASO 2: Seleccionar alumno -->
  {#if paso === 2}
    <div>
      <p class="text-sm text-gray-500 mb-3">Curso: <strong>{cursoSeleccionado?.nombre}</strong></p>
      <input
        type="search"
        bind:value={busquedaAlumno}
        placeholder="Buscar alumno..."
        class="form-input mb-3"
      />
      {#if alumnosFiltrados.length === 0}
        <div class="card text-center py-8">
          <p class="text-gray-500 text-sm">No se encontraron alumnos</p>
        </div>
      {:else}
        <div class="space-y-2">
          {#each alumnosFiltrados as alumno}
            <button
              onclick={() => seleccionarAlumno(alumno.id, alumno.fullname)}
              class="card w-full text-left flex items-center gap-3 hover:border-indigo-300 transition-colors"
            >
              <div class="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <span class="text-indigo-600 font-semibold text-sm">
                  {alumno.firstname[0]}{alumno.lastname[0]}
                </span>
              </div>
              <span class="font-medium text-gray-900">{alumno.fullname}</span>
            </button>
          {/each}
        </div>
      {/if}
    </div>
  {/if}

  <!-- PASO 3: Formulario de observación -->
  {#if paso === 3}
    <div class="text-sm text-gray-500 bg-indigo-50 rounded-lg px-3 py-2">
      <strong class="text-indigo-700">{alumnoSeleccionado?.nombre}</strong>
      <span class="mx-1">·</span>
      {cursoSeleccionado?.nombre}
    </div>

    {#if form?.error}
      <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
        {form.error}
      </div>
    {/if}

    <form
      method="POST"
      use:enhance={() => {
        guardando = true;
        return async ({ update }) => {
          await update();
          guardando = false;
        };
      }}
      class="space-y-5"
    >
      <!-- Campos hidden con datos del alumno y curso -->
      <input type="hidden" name="alumnoMoodleId" value={alumnoSeleccionado?.id} />
      <input type="hidden" name="alumnoNombre" value={alumnoSeleccionado?.nombre} />
      <input type="hidden" name="cursoMoodleId" value={cursoSeleccionado?.id} />
      <input type="hidden" name="cursoNombre" value={cursoSeleccionado?.nombre} />

      <!-- Actitud -->
      <div>
        <label class="form-label">Actitud</label>
        <div class="flex gap-2 mt-1">
          {#each ESCALA as val}
            <button
              type="button"
              onclick={() => { actitud = val; }}
              class="flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors
                     {actitud === val
                       ? 'bg-indigo-600 border-indigo-600 text-white'
                       : 'bg-white border-gray-300 text-gray-700 hover:border-indigo-300'}"
            >
              {val}
            </button>
          {/each}
        </div>
        <p class="text-xs text-gray-400 mt-1">{ESCALA_LABELS[actitud - 1]}</p>
        <input type="hidden" name="actitud" value={actitud} />
      </div>

      <!-- Tarea completa -->
      <div>
        <label class="form-label">Tarea</label>
        <div class="flex gap-2 mt-1">
          <button
            type="button"
            onclick={() => { tareaCompleta = true; }}
            class="flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors
                   {tareaCompleta ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-gray-300 text-gray-700 hover:border-green-300'}"
          >
            ✓ Completa
          </button>
          <button
            type="button"
            onclick={() => { tareaCompleta = false; }}
            class="flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors
                   {!tareaCompleta ? 'bg-red-500 border-red-500 text-white' : 'bg-white border-gray-300 text-gray-700 hover:border-red-300'}"
          >
            ✗ Incompleta
          </button>
        </div>
        <input type="hidden" name="tareaCompleta" value={tareaCompleta} />
      </div>

      <!-- Participación -->
      <div>
        <label class="form-label">Participación</label>
        <div class="flex gap-2 mt-1">
          {#each ESCALA as val}
            <button
              type="button"
              onclick={() => { participacion = val; }}
              class="flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors
                     {participacion === val
                       ? 'bg-indigo-600 border-indigo-600 text-white'
                       : 'bg-white border-gray-300 text-gray-700 hover:border-indigo-300'}"
            >
              {val}
            </button>
          {/each}
        </div>
        <p class="text-xs text-gray-400 mt-1">{ESCALA_LABELS[participacion - 1]}</p>
        <input type="hidden" name="participacion" value={participacion} />
      </div>

      <!-- Observación libre -->
      <div>
        <label for="obs" class="form-label">Observación <span class="text-gray-400 font-normal">(opcional)</span></label>
        <textarea
          id="obs"
          name="observacionTexto"
          bind:value={observacionTexto}
          rows="3"
          maxlength="500"
          placeholder="Anotá algo brevemente..."
          class="form-input resize-none"
        ></textarea>
        <p class="text-xs text-gray-400 text-right">{observacionTexto.length}/500</p>
      </div>

      <!-- Fecha -->
      <div>
        <label for="fecha" class="form-label">Fecha</label>
        <input
          id="fecha"
          type="date"
          name="fecha"
          bind:value={fecha}
          class="form-input"
        />
      </div>

      <button type="submit" class="btn-primary" disabled={guardando}>
        {guardando ? 'Guardando...' : 'Guardar observación'}
      </button>
    </form>
  {/if}
</div>

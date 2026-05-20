<script lang="ts">
  import { enhance } from '$app/forms';
  import type { MoodleUser } from '$lib/server/moodle/types';

  let { data, form } = $props();

  // Preselect individual (ícono ✏️ de un alumno) → ir directo al paso 3
  const preselectSingle = !!(data.preselect.cursoId && data.preselect.alumnoId);
  // Preselect bulk (barra de acciones del curso) → ir directo al paso 3 con varios alumnos
  const preselectBulk   = !!(data.preselect.cursoId && data.preselect.alumnos?.length);

  let paso = $state((preselectSingle || preselectBulk) ? 3 : 1);

  let cursoSeleccionado = $state<{ id: number; nombre: string } | null>(
    data.preselect.cursoId
      ? {
          id: data.preselect.cursoId,
          nombre: data.preselect.cursoNombre ??
            data.cursos.find((c: { id: number; fullname: string }) => c.id === data.preselect.cursoId)?.fullname ?? ''
        }
      : null
  );

  // Multi-select de alumnos
  let alumnos = $state<MoodleUser[]>([]);
  let seleccionados = $state<Set<number>>(
    preselectSingle
      ? new Set([data.preselect.alumnoId!])
      : preselectBulk
        ? new Set(data.preselect.alumnos!.map((a: { id: number }) => a.id))
        : new Set()
  );
  let alumnosNombres = $state<Map<number, string>>(
    preselectSingle
      ? new Map([[data.preselect.alumnoId!, data.preselect.alumnoNombre ?? '']])
      : preselectBulk
        ? new Map(data.preselect.alumnos!.map((a: { id: number; fullname: string }) => [a.id, a.fullname]))
        : new Map()
  );

  let cargandoAlumnos = $state(false);
  let errorAlumnos = $state<string | null>(null);
  let busquedaAlumno = $state('');

  // Campos del formulario
  let usarEvaluacion = $state(false);   // OFF por defecto
  let actitud = $state(3);
  let tareaCompleta = $state(true);
  let participacion = $state(3);
  let observacionTexto = $state('');
  let fecha = $state(new Date().toISOString().split('T')[0]);
  let guardando = $state(false);

  // ─── Cargar alumnos al seleccionar curso ────────────────────────────────────
  async function seleccionarCurso(id: number, nombre: string) {
    cursoSeleccionado = { id, nombre };
    cargandoAlumnos = true;
    errorAlumnos = null;
    alumnos = [];
    seleccionados = new Set();
    busquedaAlumno = '';

    try {
      const res = await fetch(`/api/moodle/cursos/${id}/alumnos`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Error al cargar alumnos');
      alumnos = json;
      alumnosNombres = new Map(json.map((a: MoodleUser) => [a.id, a.fullname]));
      paso = 2;
    } catch (err) {
      errorAlumnos = err instanceof Error ? err.message : 'Error desconocido';
    } finally {
      cargandoAlumnos = false;
    }
  }

  function toggleAlumno(id: number) {
    const s = new Set(seleccionados);
    s.has(id) ? s.delete(id) : s.add(id);
    seleccionados = s;
  }

  function seleccionarTodos() {
    seleccionados = new Set(alumnosFiltrados.map(a => a.id));
  }

  function deseleccionarTodos() {
    seleccionados = new Set();
  }

  let alumnosFiltrados = $derived(
    busquedaAlumno.trim()
      ? alumnos.filter(a => a.fullname.toLowerCase().includes(busquedaAlumno.toLowerCase()))
      : alumnos
  );

  let alumnosPayload = $derived(
    [...seleccionados].map(id => ({
      alumnoMoodleId: id,
      alumnoNombre: alumnosNombres.get(id) ?? ''
    }))
  );

  let nombresSeleccionados = $derived(
    [...seleccionados].map(id => alumnosNombres.get(id) ?? '').filter(Boolean)
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
      {#if paso > 1 && !preselectSingle}
        <button onclick={() => { paso = paso - 1; }} class="text-indigo-600 text-sm">← Volver</button>
      {/if}
      <h1 class="text-xl font-bold text-gray-900">Nueva observación</h1>
    </div>
    <div class="flex gap-1 mt-2">
      {#each [1, 2, 3] as p}
        <div class="h-1 flex-1 rounded-full {p <= paso ? 'bg-indigo-500' : 'bg-gray-200'} transition-colors"></div>
      {/each}
    </div>
    <p class="text-xs text-gray-400 mt-1">
      Paso {paso} de 3{paso === 2 && seleccionados.size > 0 ? ` — ${seleccionados.size} seleccionado/s` : ''}
    </p>
  </div>

  <!-- ── PASO 1: Seleccionar curso ─────────────────────────────────────────── -->
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

  <!-- ── PASO 2: Seleccionar alumno/s (multi) ──────────────────────────────── -->
  {#if paso === 2}
    <div class="bg-indigo-50 rounded-lg px-3 py-2 text-sm">
      <strong class="text-indigo-700">{cursoSeleccionado?.nombre}</strong>
      <button onclick={() => { paso = 1; }} class="ml-2 text-xs text-gray-400 hover:text-gray-700">(cambiar)</button>
    </div>

    <div class="flex gap-2">
      <input
        type="search"
        bind:value={busquedaAlumno}
        placeholder="Buscar alumno..."
        class="form-input flex-1"
      />
      <button onclick={seleccionarTodos} class="text-xs text-indigo-600 hover:underline whitespace-nowrap">Todos</button>
      <button onclick={deseleccionarTodos} class="text-xs text-gray-400 hover:underline whitespace-nowrap">Ninguno</button>
    </div>

    {#if seleccionados.size > 0}
      <div class="bg-indigo-600 text-white text-sm rounded-lg px-3 py-2 flex items-center justify-between">
        <span>{seleccionados.size} alumno/s seleccionado/s</span>
        <button
          onclick={() => { paso = 3; }}
          class="bg-white text-indigo-600 text-xs font-semibold px-3 py-1 rounded-lg"
        >
          Continuar →
        </button>
      </div>
    {/if}

    <div class="space-y-2">
      {#each alumnosFiltrados as alumno}
        <button
          onclick={() => toggleAlumno(alumno.id)}
          class="card w-full text-left flex items-center gap-3 transition-colors
                 {seleccionados.has(alumno.id) ? 'border-indigo-400 bg-indigo-50' : 'hover:border-indigo-200'}"
        >
          <div class="w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center
                      {seleccionados.has(alumno.id) ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'}">
            {#if seleccionados.has(alumno.id)}
              <span class="text-white text-xs font-bold">✓</span>
            {/if}
          </div>
          <div class="flex-1">
            <p class="font-medium text-gray-900 text-sm">{alumno.fullname}</p>
          </div>
        </button>
      {/each}
    </div>
  {/if}

  <!-- ── PASO 3: Formulario ────────────────────────────────────────────────── -->
  {#if paso === 3}
    <div class="bg-indigo-50 rounded-lg px-3 py-2 text-sm space-y-1">
      <p><strong class="text-indigo-700">{cursoSeleccionado?.nombre}</strong></p>
      {#if nombresSeleccionados.length <= 3}
        <p class="text-gray-600">{nombresSeleccionados.join(', ')}</p>
      {:else}
        <p class="text-gray-600">{nombresSeleccionados.slice(0, 3).join(', ')} y {nombresSeleccionados.length - 3} más</p>
      {/if}
      {#if !preselectSingle && !preselectBulk}
        <button onclick={() => { paso = 2; }} class="text-xs text-gray-400 hover:underline">← cambiar selección</button>
      {/if}
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
      <input type="hidden" name="cursoMoodleId" value={cursoSeleccionado?.id} />
      <input type="hidden" name="cursoNombre" value={cursoSeleccionado?.nombre} />
      <input type="hidden" name="alumnos" value={JSON.stringify(alumnosPayload)} />
      <input type="hidden" name="usarEvaluacion" value={usarEvaluacion ? '1' : '0'} />

      <!-- Toggle evaluación -->
      <div class="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
        <div>
          <p class="text-sm font-medium text-gray-800">Incluir evaluación</p>
          <p class="text-xs text-gray-400">Actitud, tarea y participación</p>
        </div>
        <button
          type="button"
          onclick={() => { usarEvaluacion = !usarEvaluacion; }}
          class="relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200
                 {usarEvaluacion ? 'bg-indigo-600' : 'bg-gray-300'}"
          role="switch"
          aria-checked={usarEvaluacion}
          aria-label="Activar evaluación"
        >
          <span
            class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200
                   {usarEvaluacion ? 'translate-x-6' : 'translate-x-1'}"
          ></span>
        </button>
      </div>

      {#if usarEvaluacion}
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
              >{val}</button>
            {/each}
          </div>
          <p class="text-xs text-gray-400 mt-1">{ESCALA_LABELS[actitud - 1]}</p>
          <input type="hidden" name="actitud" value={actitud} />
        </div>

        <!-- Tarea -->
        <div>
          <label class="form-label">Tarea</label>
          <div class="flex gap-2 mt-1">
            <button
              type="button"
              onclick={() => { tareaCompleta = true; }}
              class="flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors
                     {tareaCompleta ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-gray-300 text-gray-700 hover:border-green-300'}"
            >✓ Completa</button>
            <button
              type="button"
              onclick={() => { tareaCompleta = false; }}
              class="flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors
                     {!tareaCompleta ? 'bg-red-500 border-red-500 text-white' : 'bg-white border-gray-300 text-gray-700 hover:border-red-300'}"
            >✗ Incompleta</button>
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
              >{val}</button>
            {/each}
          </div>
          <p class="text-xs text-gray-400 mt-1">{ESCALA_LABELS[participacion - 1]}</p>
          <input type="hidden" name="participacion" value={participacion} />
        </div>
      {/if}

      <!-- Observación libre -->
      <div>
        <label for="obs" class="form-label">
          Observación <span class="text-gray-400 font-normal">(opcional)</span>
        </label>
        <textarea
          id="obs"
          name="observacionTexto"
          bind:value={observacionTexto}
          rows="3"
          maxlength="500"
          placeholder="Ej: No trajo el permiso firmado para el viaje de estudios..."
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
          max={new Date().toISOString().split('T')[0]}
          class="form-input"
        />
      </div>

      <button
        type="submit"
        class="btn-primary w-full"
        disabled={guardando || seleccionados.size === 0}
      >
        {#if guardando}
          Guardando...
        {:else if seleccionados.size === 1}
          Guardar observación
        {:else}
          Guardar observación para {seleccionados.size} alumnos
        {/if}
      </button>
    </form>
  {/if}
</div>

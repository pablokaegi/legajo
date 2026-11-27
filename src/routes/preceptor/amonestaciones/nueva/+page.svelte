<script lang="ts">
  import { enhance } from '$app/forms';
  import type { MoodleUser } from '$lib/server/moodle/types';

  let { data, form } = $props();

  // Preselect when navigating from cursos/[id]
  const preselectActivo =
    !!data.preselect?.alumnoMoodleId && !!data.preselect?.alumnoNombre;

  let cursoSeleccionado = $state<{ id: number; nombre: string } | null>(
    preselectActivo && data.preselect?.cursoMoodleId
      ? { id: data.preselect!.cursoMoodleId!, nombre: data.preselect!.cursoNombre! }
      : null
  );
  let alumnoSeleccionado = $state<{ id: number; fullname: string } | null>(
    preselectActivo
      ? { id: data.preselect!.alumnoMoodleId!, fullname: data.preselect!.alumnoNombre! }
      : null
  );

  let alumnos  = $state<{ id: number; fullname: string }[]>([]);
  let cargando = $state(false);
  let busqueda = $state('');
  let guardando = $state(false);
  let fecha    = $state(new Date().toISOString().split('T')[0]);
  let gravedad = $state('leve');
  let paso     = $state(preselectActivo ? 3 : 1);

  async function seleccionarCurso(id: number, nombre: string) {
    cursoSeleccionado = { id, nombre };
    cargando = true;
    alumnos = [];
    alumnoSeleccionado = null;
    busqueda = '';
    try {
      const res  = await fetch(`/api/moodle/cursos/${id}/alumnos`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Error');
      alumnos = json;
      paso = 2;
    } catch (e) {
      alert('Error al cargar alumnos: ' + (e instanceof Error ? e.message : e));
    } finally {
      cargando = false;
    }
  }

  function elegirAlumno(a: { id: number; fullname: string }) {
    alumnoSeleccionado = a;
    paso = 3;
  }

  let alumnosFiltrados = $derived(
    busqueda.trim()
      ? alumnos.filter(a => a.fullname.toLowerCase().includes(busqueda.toLowerCase()))
      : alumnos
  );
</script>

<svelte:head><title>Nueva amonestación — Legajo</title></svelte:head>

<div class="space-y-4">
  <div class="flex items-center gap-2">
    <a href="/preceptor/amonestaciones" class="text-indigo-600 text-sm hover:underline">← Amonestaciones</a>
    <h2 class="text-lg font-bold text-gray-900">Nueva amonestación</h2>
  </div>

  {#if form?.error}
    <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">{form.error}</div>
  {/if}

  <!-- Paso 1: seleccionar curso -->
  {#if paso === 1}
    <p class="text-sm font-medium text-gray-700">Paso 1 — Seleccioná el curso</p>
    {#if data.cursos.length === 0}
      <div class="card text-center py-8">
        <p class="text-gray-500 text-sm">No hay cursos disponibles</p>
      </div>
    {:else}
      <div class="space-y-2">
        {#each data.cursos as curso}
          <button
            onclick={() => seleccionarCurso(curso.id, curso.displayname || curso.fullname)}
            disabled={cargando}
            class="card w-full text-left hover:border-indigo-300 transition-colors {cargando ? 'opacity-50' : ''}"
          >
            <p class="font-medium text-gray-900 text-sm">{curso.displayname || curso.fullname}</p>
            <p class="text-xs text-gray-400">{curso.shortname}</p>
          </button>
        {/each}
      </div>
      {#if cargando}
        <p class="text-center text-sm text-gray-500 animate-pulse">Cargando alumnos...</p>
      {/if}
    {/if}
  {/if}

  <!-- Paso 2: seleccionar alumno -->
  {#if paso === 2}
    <div class="bg-indigo-50 rounded-lg px-3 py-2 text-sm">
      <strong class="text-indigo-700">{cursoSeleccionado?.nombre}</strong>
      <button onclick={() => { paso = 1; alumnoSeleccionado = null; }}
        class="ml-2 text-xs text-gray-400 hover:text-gray-700">(cambiar curso)</button>
    </div>

    <p class="text-sm font-medium text-gray-700">Paso 2 — Seleccioná el alumno</p>

    <input type="text" bind:value={busqueda}
      placeholder="Buscar alumno..."
      class="form-input w-full text-sm" />

    <div class="space-y-2 max-h-96 overflow-y-auto">
      {#each alumnosFiltrados as alumno}
        <button
          onclick={() => elegirAlumno(alumno)}
          class="card w-full text-left hover:border-indigo-300 transition-colors"
        >
          <p class="font-medium text-gray-900 text-sm">{alumno.fullname}</p>
        </button>
      {/each}
      {#if alumnosFiltrados.length === 0}
        <p class="text-sm text-gray-400 text-center py-4">Sin coincidencias</p>
      {/if}
    </div>
  {/if}

  <!-- Paso 3: datos de la amonestación -->
  {#if paso === 3}
    <div class="bg-indigo-50 rounded-lg px-3 py-2 text-sm space-y-0.5">
      {#if cursoSeleccionado}
        <p class="text-xs text-gray-500">{cursoSeleccionado.nombre}</p>
      {/if}
      <p class="font-semibold text-indigo-700">👤 {alumnoSeleccionado?.fullname}</p>
      {#if !preselectActivo}
        <button onclick={() => { paso = 2; }}
          class="text-xs text-gray-400 hover:underline">← cambiar alumno</button>
      {/if}
    </div>

    <form
      method="POST"
      use:enhance={() => {
        guardando = true;
        return async ({ update }) => { await update(); guardando = false; };
      }}
      class="space-y-4"
    >
      <input type="hidden" name="alumnoMoodleId" value={alumnoSeleccionado?.id} />
      <input type="hidden" name="alumnoNombre"   value={alumnoSeleccionado?.fullname} />
      <input type="hidden" name="cursoMoodleId"  value={cursoSeleccionado?.id ?? ''} />
      <input type="hidden" name="cursoNombre"    value={cursoSeleccionado?.nombre ?? ''} />

      <div>
        <label class="form-label">Fecha *</label>
        <input type="date" name="fecha" bind:value={fecha}
          max={new Date().toISOString().split('T')[0]} required class="form-input" />
      </div>

      <div>
        <label class="form-label">Gravedad *</label>
        <div class="flex gap-2 mt-1">
          {#each [['leve', '🟡 Leve'], ['mediana', '🟠 Mediana'], ['grave', '🔴 Grave']] as [val, lbl]}
            <button type="button" onclick={() => { gravedad = val; }}
              class="flex-1 py-2 rounded-lg border text-sm font-medium transition-colors
                     {gravedad === val ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-300 text-gray-700 hover:border-indigo-300'}">
              {lbl}
            </button>
          {/each}
        </div>
        <input type="hidden" name="gravedad" value={gravedad} />
      </div>

      <div>
        <label class="form-label">Motivo *</label>
        <textarea name="motivo" rows="4" required maxlength="3000"
          class="form-input resize-none"
          placeholder="Describí el motivo de la amonestación..."></textarea>
      </div>

      <div>
        <label class="form-label">Acciones sugeridas <span class="text-gray-400 font-normal">(opcional)</span></label>
        <textarea name="accionesSugeridas" rows="3" maxlength="2000"
          class="form-input resize-none"
          placeholder="Medidas o acuerdos sugeridos..."></textarea>
      </div>

      <button type="submit" class="btn-primary w-full" disabled={guardando}>
        {guardando ? 'Guardando...' : 'Registrar amonestación'}
      </button>
    </form>
  {/if}
</div>

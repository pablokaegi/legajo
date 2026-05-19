<script lang="ts">
  import { enhance } from '$app/forms';
  import type { MoodleUser } from '$lib/server/moodle/types';

  let { data, form } = $props();

  // If preselect data is present (navigating from cursos/[id] bulk bar), skip to paso 3
  const preselectActivo = !!data.preselect && data.preselect.alumnos.length > 0;

  let cursoSeleccionado = $state<{ id: number; nombre: string } | null>(
    preselectActivo
      ? { id: data.preselect!.cursoId, nombre: data.preselect!.cursoNombre }
      : null
  );

  let alumnos = $state<{ id: number; fullname: string }[]>(
    preselectActivo ? data.preselect!.alumnos : []
  );

  let seleccionados = $state<Set<number>>(
    preselectActivo
      ? new Set(data.preselect!.alumnos.map(a => a.id))
      : new Set()
  );

  let alumnosNombres = $state<Map<number, string>>(
    preselectActivo
      ? new Map(data.preselect!.alumnos.map(a => [a.id, a.fullname]))
      : new Map()
  );

  let cargando = $state(false);
  let busqueda = $state('');
  let guardando = $state(false);
  let fecha = $state(new Date().toISOString().split('T')[0]);
  let tipo = $state('ausente');
  let descripcion = $state('');
  let visibilidad = $state('publica');
  let paso = $state(preselectActivo ? 3 : 1);

  async function seleccionarCurso(id: number, nombre: string) {
    cursoSeleccionado = { id, nombre };
    cargando = true;
    alumnos = [];
    seleccionados = new Set();
    try {
      const res = await fetch(`/api/moodle/cursos/${id}/alumnos`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Error');
      alumnos = json;
      alumnosNombres = new Map(json.map((a: MoodleUser) => [a.id, a.fullname]));
      paso = 2;
    } catch (e) {
      alert('Error al cargar alumnos: ' + (e instanceof Error ? e.message : e));
    } finally {
      cargando = false;
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
    busqueda.trim()
      ? alumnos.filter(a => a.fullname.toLowerCase().includes(busqueda.toLowerCase()))
      : alumnos
  );

  let alumnosPayload = $derived(
    [...seleccionados].map(id => ({
      alumnoMoodleId: id,
      alumnoNombre: alumnosNombres.get(id) ?? ''
    }))
  );
</script>

<svelte:head>
  <title>Nueva falta — Legajo</title>
</svelte:head>

<div class="space-y-4">
  <div class="flex items-center gap-2">
    <a href="/preceptor/faltas" class="text-indigo-600 text-sm hover:underline">← Faltas</a>
    <h2 class="text-lg font-bold text-gray-900">Nueva falta</h2>
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
            disabled={cargando}
            class="card w-full text-left hover:border-indigo-300 transition-colors {cargando ? 'opacity-50' : ''}"
          >
            <p class="font-medium text-gray-900">{curso.displayname || curso.fullname}</p>
            <p class="text-xs text-gray-400">{curso.shortname}</p>
          </button>
        {/each}
      </div>
      {#if cargando}<p class="text-center text-sm text-gray-500 animate-pulse">Cargando alumnos...</p>{/if}
    {/if}
  {/if}

  <!-- Paso 2: seleccionar alumnos -->
  {#if paso === 2}
    <div class="bg-indigo-50 rounded-lg px-3 py-2 text-sm">
      <strong class="text-indigo-700">{cursoSeleccionado?.nombre}</strong>
      <button onclick={() => { paso = 1; }} class="ml-2 text-xs text-gray-400 hover:text-gray-700">(cambiar)</button>
    </div>

    <div class="flex gap-2">
      <input type="search" bind:value={busqueda} placeholder="Buscar alumno..." class="form-input flex-1" />
      <button onclick={seleccionarTodos} class="text-xs text-indigo-600 hover:underline whitespace-nowrap">Todos</button>
      <button onclick={deseleccionarTodos} class="text-xs text-gray-400 hover:underline whitespace-nowrap">Ninguno</button>
    </div>

    {#if seleccionados.size > 0}
      <div class="bg-indigo-600 text-white text-sm rounded-lg px-3 py-2 flex items-center justify-between">
        <span>{seleccionados.size} alumno/s seleccionado/s</span>
        <button onclick={() => { paso = 3; }} class="bg-white text-indigo-600 text-xs font-semibold px-3 py-1 rounded-lg">
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

  <!-- Paso 3: datos de la falta -->
  {#if paso === 3}
    <div class="bg-indigo-50 rounded-lg px-3 py-2 text-sm space-y-1">
      <p><strong class="text-indigo-700">{cursoSeleccionado?.nombre}</strong></p>
      <p class="text-gray-600">{seleccionados.size} alumno/s seleccionado/s</p>
      {#if !preselectActivo}
        <button onclick={() => { paso = 2; }} class="text-xs text-gray-400 hover:underline">← cambiar selección</button>
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
      <input type="hidden" name="cursoMoodleId" value={cursoSeleccionado?.id} />
      <input type="hidden" name="cursoNombre" value={cursoSeleccionado?.nombre} />
      <input type="hidden" name="alumnos" value={JSON.stringify(alumnosPayload)} />

      <div>
        <label class="form-label">Fecha</label>
        <input type="date" name="fecha" bind:value={fecha} max={new Date().toISOString().split('T')[0]} class="form-input" required />
      </div>

      <div>
        <label class="form-label">Tipo</label>
        <select name="tipo" bind:value={tipo} class="form-input" required>
          <option value="ausente">Ausente</option>
          <option value="retraso">Retraso</option>
          <option value="salida_anticipada">Salida anticipada</option>
          <option value="otra">Otra</option>
        </select>
      </div>

      <div>
        <label class="form-label">Descripción <span class="text-gray-400 font-normal">(opcional)</span></label>
        <textarea name="descripcion" bind:value={descripcion} rows="3" maxlength="2000" class="form-input resize-none" placeholder="Detalle adicional..."></textarea>
      </div>

      <div>
        <label class="form-label">Visibilidad</label>
        <div class="flex gap-2 mt-1">
          {#each [['publica', '🌐 Pública'], ['interna', '🔒 Interna']] as [val, lbl]}
            <button
              type="button"
              onclick={() => { visibilidad = val; }}
              class="flex-1 py-2 rounded-lg border text-sm font-medium transition-colors
                     {visibilidad === val ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-300 text-gray-700 hover:border-indigo-300'}"
            >{lbl}</button>
          {/each}
        </div>
        <input type="hidden" name="visibilidad" value={visibilidad} />
      </div>

      <button type="submit" class="btn-primary w-full" disabled={guardando || seleccionados.size === 0}>
        {guardando ? 'Guardando...' : `Registrar falta para ${seleccionados.size} alumno/s`}
      </button>
    </form>
  {/if}
</div>

<script lang="ts">
  import { enhance } from '$app/forms';
  import type { MoodleUser } from '$lib/server/moodle/types';

  let { data, form } = $props();

  // Preselect single: comes from legajo/cursos with alumnoId + alumnoNombre
  const preselectSingle = !!(data.preselect?.alumnoId && data.preselect?.alumnoNombre);
  // Preselect bulk: comes from cursos/[id] bulk action bar with alumnos array
  const preselectBulk   = !!(data.preselect?.cursoId && data.preselect?.alumnos?.length);

  let paso = $state((preselectSingle || preselectBulk) ? 3 : 1);

  let cursoSeleccionado = $state<{ id: number; nombre: string } | null>(
    (preselectSingle && data.preselect?.cursoId) || preselectBulk
      ? {
          id:     data.preselect!.cursoId!,
          nombre: data.preselect!.cursoNombre ??
            data.cursos.find((c: { id: number; fullname: string }) => c.id === data.preselect!.cursoId)?.fullname ?? ''
        }
      : null
  );

  // Multi-select de alumnos
  let alumnos = $state<{ id: number; fullname: string }[]>([]);
  let seleccionados = $state<Set<number>>(
    preselectSingle
      ? new Set([data.preselect!.alumnoId!])
      : preselectBulk
        ? new Set(data.preselect!.alumnos!.map((a: { id: number }) => a.id))
        : new Set()
  );
  let alumnosNombres = $state<Map<number, string>>(
    preselectSingle
      ? new Map([[data.preselect!.alumnoId!, data.preselect!.alumnoNombre ?? '']])
      : preselectBulk
        ? new Map(data.preselect!.alumnos!.map((a: { id: number; fullname: string }) => [a.id, a.fullname]))
        : new Map()
  );

  let cargando  = $state(false);
  let busqueda  = $state('');
  let guardando = $state(false);

  // Campos del formulario
  let fechaReincorporacion = $state(new Date().toISOString().split('T')[0]);
  let observaciones        = $state('');
  let documentoUrl         = $state('');
  let linkedFaltaId        = $state('');

  async function seleccionarCurso(id: number, nombre: string) {
    cursoSeleccionado = { id, nombre };
    cargando   = true;
    alumnos    = [];
    seleccionados  = new Set();
    busqueda   = '';
    try {
      const res  = await fetch(`/api/moodle/cursos/${id}/alumnos`);
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

  function seleccionarTodos()    { seleccionados = new Set(alumnosFiltrados.map(a => a.id)); }
  function deseleccionarTodos()  { seleccionados = new Set(); }

  let alumnosFiltrados = $derived(
    busqueda.trim()
      ? alumnos.filter(a => a.fullname.toLowerCase().includes(busqueda.toLowerCase()))
      : alumnos
  );

  let alumnosPayload = $derived(
    [...seleccionados].map(id => ({
      alumnoMoodleId: id,
      alumnoNombre:   alumnosNombres.get(id) ?? ''
    }))
  );

  let nombresSeleccionados = $derived(
    [...seleccionados].map(id => alumnosNombres.get(id) ?? '').filter(Boolean)
  );
</script>

<svelte:head><title>Nueva reincorporación — Legajo</title></svelte:head>

<div class="space-y-4">
  <div class="flex items-center gap-2">
    {#if paso > 1 && !preselectSingle && !preselectBulk}
      <button onclick={() => { paso = paso - 1; }} class="text-indigo-600 text-sm">←</button>
    {/if}
    <a href="/preceptor/reincorporaciones" class="text-indigo-600 text-sm hover:underline">← Reincorporaciones</a>
    <h2 class="text-lg font-bold text-gray-900">Nueva reincorporación</h2>
  </div>

  {#if form?.error}
    <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">{form.error}</div>
  {/if}

  <!-- ── PASO 1: Seleccionar curso ───────────────────────────────────────────── -->
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
            onclick={() => seleccionarCurso(curso.id, curso.displayname || curso.fullname)}
            disabled={cargando}
            class="card w-full text-left hover:border-indigo-300 transition-colors {cargando ? 'opacity-50' : ''}"
          >
            <p class="font-medium text-gray-900">{curso.displayname || curso.fullname}</p>
            <p class="text-xs text-gray-400">{curso.shortname}</p>
          </button>
        {/each}
      </div>
      {#if cargando}
        <p class="text-center text-sm text-gray-500 animate-pulse">Cargando alumnos...</p>
      {/if}
    {/if}
  {/if}

  <!-- ── PASO 2: Seleccionar alumno/s ───────────────────────────────────────── -->
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
          <p class="font-medium text-gray-900 text-sm flex-1">{alumno.fullname}</p>
        </button>
      {/each}
      {#if alumnosFiltrados.length === 0}
        <p class="text-sm text-gray-400 text-center py-4">Sin coincidencias</p>
      {/if}
    </div>
  {/if}

  <!-- ── PASO 3: Datos de la reincorporación ─────────────────────────────────── -->
  {#if paso === 3}
    <div class="bg-indigo-50 rounded-lg px-3 py-2 text-sm space-y-1">
      {#if cursoSeleccionado}
        <p><strong class="text-indigo-700">{cursoSeleccionado.nombre}</strong></p>
      {/if}
      {#if nombresSeleccionados.length <= 3}
        <p class="text-gray-600">{nombresSeleccionados.join(', ')}</p>
      {:else}
        <p class="text-gray-600">{nombresSeleccionados.slice(0, 3).join(', ')} y {nombresSeleccionados.length - 3} más</p>
      {/if}
      {#if !preselectSingle && !preselectBulk}
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
      <input type="hidden" name="alumnos" value={JSON.stringify(alumnosPayload)} />

      <div>
        <label class="form-label">Fecha de reincorporación *</label>
        <input
          type="date"
          name="fechaReincorporacion"
          bind:value={fechaReincorporacion}
          max={new Date().toISOString().split('T')[0]}
          required
          class="form-input"
        />
      </div>

      <div>
        <label class="form-label">Observaciones <span class="text-gray-400 font-normal">(opcional)</span></label>
        <textarea
          name="observaciones"
          bind:value={observaciones}
          rows="3"
          maxlength="3000"
          placeholder="Motivo de la ausencia, acuerdo, etc."
          class="form-input resize-none"
        ></textarea>
      </div>

      <div>
        <label class="form-label">URL de documento <span class="text-gray-400 font-normal">(opcional)</span></label>
        <input
          type="url"
          name="documentoUrl"
          bind:value={documentoUrl}
          class="form-input"
          placeholder="https://..."
        />
      </div>

      <div>
        <label class="form-label">ID de falta relacionada <span class="text-gray-400 font-normal">(opcional)</span></label>
        <input
          type="number"
          name="linkedFaltaId"
          bind:value={linkedFaltaId}
          class="form-input"
          placeholder="ID de la falta que cierra"
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
          Registrar reincorporación
        {:else}
          Registrar reincorporación para {seleccionados.size} alumnos
        {/if}
      </button>
    </form>
  {/if}
</div>

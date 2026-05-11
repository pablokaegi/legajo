<script lang="ts">
  import { page } from '$app/stores';

  let { data } = $props();

  let busqueda = $state('');

  let alumnosFiltrados = $derived(
    busqueda.trim().length === 0
      ? data.alumnos
      : data.alumnos.filter(a =>
          a.fullname.toLowerCase().includes(busqueda.toLowerCase())
        )
  );
</script>

<svelte:head>
  <title>Alumnos del curso — Legajo</title>
</svelte:head>

<div class="space-y-4">
  <div class="flex items-center gap-2">
    <a href="/cursos" class="text-indigo-600 text-sm hover:underline">← Cursos</a>
  </div>

  <h1 class="text-xl font-bold text-gray-900">Alumnos</h1>

  {#if data.error}
    <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
      {data.error}
    </div>
  {:else if data.alumnos.length === 0}
    <div class="card text-center py-10">
      <p class="text-gray-500">No hay alumnos en este curso</p>
    </div>
  {:else}
    <!-- Búsqueda -->
    <input
      type="search"
      bind:value={busqueda}
      placeholder="Buscar alumno..."
      class="form-input"
    />

    <p class="text-sm text-gray-500">{alumnosFiltrados.length} alumno/s</p>

    <div class="space-y-2">
      {#each alumnosFiltrados as alumno}
        <div class="card flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <span class="text-indigo-600 font-semibold text-sm">
              {alumno.firstname[0]}{alumno.lastname[0]}
            </span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-gray-900 truncate">{alumno.fullname}</p>
            {#if alumno.email}
              <p class="text-xs text-gray-400 truncate">{alumno.email}</p>
            {/if}
          </div>
          <div class="flex gap-2 flex-shrink-0">
            <a
              href="/cursos/{data.cursoId}/alumnos/{alumno.id}/notas?nombre={encodeURIComponent(alumno.fullname)}"
              class="text-sm text-indigo-600 hover:underline"
              title="Ver notas"
            >📊</a>
            <a
              href="/observaciones/nueva?cursoId={data.cursoId}&alumnoId={alumno.id}&alumnoNombre={encodeURIComponent(alumno.fullname)}"
              class="text-sm text-indigo-600 hover:underline"
              title="Registrar observación"
            >✏️</a>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

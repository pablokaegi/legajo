<script lang="ts">
  let { data } = $props();
  const { acta } = data;

  const ESTADO_TAREA: Record<string, string> = {
    pendiente: '⏳ Pendiente',
    en_progreso: '🔄 En progreso',
    completada: '✅ Completada'
  };
</script>

<svelte:head><title>{acta.titulo} — Legajo</title></svelte:head>

<div class="space-y-4">
  <div class="flex items-center gap-2">
    <a href="/preceptor/actas" class="text-indigo-600 text-sm hover:underline">← Actas</a>
  </div>

  <!-- Encabezado del acta -->
  <div class="card space-y-2">
    <div class="flex items-start justify-between gap-2">
      <h2 class="text-lg font-bold text-gray-900 flex-1">{acta.titulo}</h2>
      <span class="text-xs px-2 py-1 rounded-full flex-shrink-0
                   {acta.estado === 'abierta' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}">
        {acta.estado}
      </span>
    </div>
    <p class="text-xs text-gray-500">📅 {acta.fecha}</p>
  </div>

  <!-- Resumen -->
  <div class="card space-y-2">
    <h3 class="text-sm font-semibold text-gray-700">Resumen</h3>
    <p class="text-sm text-gray-800 whitespace-pre-wrap">{acta.resumen}</p>
  </div>

  <!-- Acuerdos -->
  {#if acta.acuerdos}
    <div class="card space-y-2">
      <h3 class="text-sm font-semibold text-gray-700">Acuerdos</h3>
      <p class="text-sm text-gray-800 whitespace-pre-wrap">{acta.acuerdos}</p>
    </div>
  {/if}

  <!-- Alumnos involucrados -->
  {#if acta.alumnos.length > 0}
    <div class="card space-y-2">
      <h3 class="text-sm font-semibold text-gray-700">Alumnos involucrados</h3>
      <ul class="space-y-1">
        {#each acta.alumnos as alumno}
          <li class="text-sm text-gray-700">• {alumno.alumnoNombre}</li>
        {/each}
      </ul>
    </div>
  {/if}

  <!-- Asistentes -->
  {#if acta.asistentes.length > 0}
    <div class="card space-y-2">
      <h3 class="text-sm font-semibold text-gray-700">Asistentes</h3>
      <ul class="space-y-1">
        {#each acta.asistentes as asistente}
          <li class="text-sm text-gray-700">👤 ID {asistente.usuarioId}{asistente.rol ? ` — ${asistente.rol}` : ''}</li>
        {/each}
      </ul>
    </div>
  {/if}

  <!-- Tareas -->
  {#if acta.tareas.length > 0}
    <div class="card space-y-3">
      <h3 class="text-sm font-semibold text-gray-700">Tareas / compromisos</h3>
      <div class="space-y-2">
        {#each acta.tareas as tarea}
          <div class="flex items-start gap-2 p-2 rounded-lg bg-gray-50">
            <span class="text-xs flex-shrink-0 mt-0.5">{ESTADO_TAREA[tarea.estado] ?? tarea.estado}</span>
            <div class="flex-1">
              <p class="text-sm text-gray-800">{tarea.descripcion}</p>
              {#if tarea.dueDate}<p class="text-xs text-gray-400 mt-0.5">Vence: {tarea.dueDate}</p>{/if}
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Historial de versiones -->
  {#if acta.versiones.length > 0}
    <div class="card space-y-2">
      <h3 class="text-sm font-semibold text-gray-700">Historial de ediciones ({acta.versiones.length})</h3>
      <ul class="space-y-1">
        {#each acta.versiones as v}
          <li class="text-xs text-gray-500">🕑 {new Date(v.createdAt).toLocaleString('es-AR')} — editado por ID {v.editadoPor}</li>
        {/each}
      </ul>
    </div>
  {/if}

  <a href="/api/actas/{acta.id}" target="_blank" class="text-xs text-gray-400 hover:underline">Ver JSON del acta</a>
</div>

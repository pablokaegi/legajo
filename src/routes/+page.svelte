<script lang="ts">
  let { data } = $props();
</script>

<svelte:head>
  <title>Inicio — Legajo</title>
</svelte:head>

<div class="space-y-5">
  <!-- Bienvenida -->
  <div>
    <h1 class="text-xl font-bold text-gray-900">
      Hola, {data.usuario?.nombre?.split(' ')[0]} 👋
    </h1>
    <p class="text-gray-500 text-sm">Panel de registro docente</p>
  </div>

  <!-- Estado de Moodle -->
  <div class="card">
    <div class="flex items-center justify-between mb-2">
      <h2 class="font-semibold text-gray-700 text-sm">Estado de conexión</h2>
      {#if data.moodleStatus.ok}
        <span class="badge-ok">● Conectado</span>
      {:else}
        <span class="badge-error">● Error</span>
      {/if}
    </div>
    <p class="text-sm text-gray-600">{data.moodleStatus.mensaje}</p>
    {#if data.moodleStatus.sitename}
      <p class="text-xs text-gray-400 mt-1">Sitio: {data.moodleStatus.sitename}</p>
    {/if}
  </div>

  <!-- Accesos rápidos -->
  <div class="grid grid-cols-2 gap-3">
    <a href="/observaciones/nueva" class="card flex flex-col items-center py-5 gap-2 hover:border-indigo-300 transition-colors text-center">
      <span class="text-3xl">✏️</span>
      <span class="font-medium text-gray-800 text-sm">Nueva observación</span>
    </a>
    <a href="/cursos" class="card flex flex-col items-center py-5 gap-2 hover:border-indigo-300 transition-colors text-center">
      <span class="text-3xl">📚</span>
      <span class="font-medium text-gray-800 text-sm">Ver cursos</span>
      {#if data.totalCursos > 0}
        <span class="text-xs text-gray-400">{data.totalCursos} disponibles</span>
      {/if}
    </a>
    <a href="/observaciones/historial" class="card flex flex-col items-center py-5 gap-2 hover:border-indigo-300 transition-colors text-center">
      <span class="text-3xl">📋</span>
      <span class="font-medium text-gray-800 text-sm">Historial</span>
    </a>
    <a href="/admin/status" class="card flex flex-col items-center py-5 gap-2 hover:border-indigo-300 transition-colors text-center">
      <span class="text-3xl">🔧</span>
      <span class="font-medium text-gray-800 text-sm">Estado Moodle</span>
    </a>
  </div>

  <!-- Últimos logs -->
  {#if data.logs.length > 0}
    <div>
      <h2 class="font-semibold text-gray-700 text-sm mb-2">Últimas actividades</h2>
      <div class="space-y-1.5">
        {#each data.logs as log}
          <div class="flex items-start gap-2 text-xs text-gray-500 bg-white rounded-lg px-3 py-2 border border-gray-100">
            <span class={log.status === 'ok' ? 'text-green-500' : 'text-red-500'}>●</span>
            <div class="flex-1 min-w-0">
              <span class="font-medium text-gray-700">{log.tipo}</span>
              <span class="mx-1">—</span>
              <span class="truncate">{log.mensaje}</span>
            </div>
            <span class="text-gray-300 whitespace-nowrap">
              {new Date(log.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

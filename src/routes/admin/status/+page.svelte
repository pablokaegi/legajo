<script lang="ts">
  import { onMount } from 'svelte';

  type StatusData = {
    ok: boolean;
    sitename?: string;
    siteurl?: string;
    moodleVersion?: string;
    connectedAs?: { userid: number; username: string; fullname: string };
    funcionesHabilitadas?: string[];
    legajoFunctions?: Record<string, boolean>;
    error?: string;
  };

  let status = $state<StatusData | null>(null);
  let loading = $state(true);

  onMount(async () => {
    try {
      const res = await fetch('/api/moodle/status');
      status = await res.json();
    } catch (err) {
      status = { ok: false, error: 'No se pudo conectar con el servidor' };
    } finally {
      loading = false;
    }
  });

  const REQUIRED_FUNCTIONS = [
    'core_webservice_get_site_info',
    'core_course_get_courses',
    'core_enrol_get_enrolled_users',
    'core_user_get_users'
  ];
</script>

<svelte:head>
  <title>Estado Moodle — Legajo</title>
</svelte:head>

<div class="space-y-4">
  <h1 class="text-xl font-bold text-gray-900">Estado de Moodle</h1>

  {#if loading}
    <div class="card text-center py-10">
      <p class="text-gray-500 animate-pulse">Verificando conexión...</p>
    </div>
  {:else if !status}
    <div class="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3">
      No se pudo obtener el estado
    </div>
  {:else}
    <!-- Estado general -->
    <div class="card">
      <div class="flex items-center justify-between mb-3">
        <h2 class="font-semibold text-gray-800">Conexión</h2>
        {#if status.ok}
          <span class="badge-ok">● Activo</span>
        {:else}
          <span class="badge-error">● Error</span>
        {/if}
      </div>

      {#if status.ok}
        <dl class="space-y-1.5 text-sm">
          <div class="flex justify-between">
            <dt class="text-gray-500">Sitio</dt>
            <dd class="font-medium text-gray-800">{status.sitename}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-gray-500">Versión</dt>
            <dd class="font-medium text-gray-800">{status.moodleVersion}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-gray-500">Conectado como</dt>
            <dd class="font-medium text-gray-800">{status.connectedAs?.fullname}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-gray-500">URL</dt>
            <dd class="text-indigo-600 truncate max-w-48">
              <a href={status.siteurl} target="_blank" rel="noopener">{status.siteurl}</a>
            </dd>
          </div>
        </dl>
      {:else}
        <p class="text-red-600 text-sm">{status.error}</p>
      {/if}
    </div>

    <!-- Funciones requeridas por Legajo -->
    {#if status.legajoFunctions}
      <div class="card">
        <h2 class="font-semibold text-gray-800 mb-3">Funciones requeridas</h2>
        <div class="space-y-2">
          {#each REQUIRED_FUNCTIONS as fn}
            <div class="flex items-center justify-between text-sm">
              <code class="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-700 flex-1 mr-2 truncate">{fn}</code>
              {#if status.legajoFunctions[fn]}
                <span class="badge-ok flex-shrink-0">✓</span>
              {:else}
                <span class="badge-error flex-shrink-0">✗ Falta</span>
              {/if}
            </div>
          {/each}
        </div>
        {#if !REQUIRED_FUNCTIONS.every(f => status!.legajoFunctions![f])}
          <p class="text-xs text-yellow-700 bg-yellow-50 rounded px-2 py-1.5 mt-3">
            ⚠️ Habilitá las funciones faltantes en Moodle: Administración del sitio → Plugins → Web services → Servicios externos → Legajo API → Funciones
          </p>
        {/if}
      </div>
    {/if}

    <!-- Todas las funciones habilitadas -->
    {#if status.funcionesHabilitadas && status.funcionesHabilitadas.length > 0}
      <div class="card">
        <h2 class="font-semibold text-gray-800 mb-3">
          Todas las funciones habilitadas
          <span class="text-sm font-normal text-gray-400">({status.funcionesHabilitadas.length})</span>
        </h2>
        <div class="max-h-48 overflow-y-auto space-y-1">
          {#each status.funcionesHabilitadas as fn}
            <code class="block text-xs bg-gray-50 px-2 py-0.5 rounded text-gray-600">{fn}</code>
          {/each}
        </div>
      </div>
    {/if}
  {/if}
</div>

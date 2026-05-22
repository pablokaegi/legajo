<script lang="ts">
  let { data } = $props();

  const ROL_LABEL: Record<string, string> = {
    admin: 'Administrador',
    directivo: 'Director/a',
    preceptor: 'Preceptor/a',
    docente: 'Docente',
    padre: 'Familia'
  };

  const accesos = [
    { href: '/admin/status',     icon: '🔌', titulo: 'Conexión a Moodle', desc: 'Estado del web service y funciones habilitadas.' },
    { href: '/admin/logs',       icon: '📜', titulo: 'Logs del sistema',   desc: 'Sincronización con Moodle y auditoría de acciones.' },
    { href: '/admin/conectados', icon: '👥', titulo: 'Últimos conectados', desc: 'Sesiones recientes de los usuarios.' }
  ];
</script>

<svelte:head><title>Configuración — Legajo</title></svelte:head>

<div class="space-y-4">
  <!-- Métricas -->
  <div class="grid grid-cols-3 gap-2">
    <div class="card text-center">
      <p class="text-2xl font-bold text-indigo-700">{data.totalUsuarios}</p>
      <p class="text-xs text-gray-500">Usuarios</p>
    </div>
    <div class="card text-center">
      <p class="text-2xl font-bold text-green-600">{data.usuariosActivos}</p>
      <p class="text-xs text-gray-500">Activos</p>
    </div>
    <div class="card text-center">
      <p class="text-2xl font-bold text-blue-600">{data.sesionesActivas}</p>
      <p class="text-xs text-gray-500">Sesiones activas</p>
    </div>
  </div>

  <!-- Distribución de roles -->
  <div class="card space-y-2">
    <p class="text-sm font-semibold text-gray-800">Roles asignados</p>
    {#if Object.keys(data.porRol).length === 0}
      <p class="text-sm text-gray-500">No hay roles asignados todavía.</p>
    {:else}
      <div class="space-y-1">
        {#each Object.entries(data.porRol) as [rol, cant]}
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-700">{ROL_LABEL[rol] ?? rol}</span>
            <span class="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{cant}</span>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Accesos -->
  <div class="space-y-2">
    {#each accesos as a}
      <a href={a.href} class="card block hover:border-indigo-300 transition-colors flex items-center gap-3">
        <span class="text-2xl flex-shrink-0">{a.icon}</span>
        <div class="min-w-0">
          <p class="text-sm font-semibold text-gray-800">{a.titulo}</p>
          <p class="text-xs text-gray-500">{a.desc}</p>
        </div>
      </a>
    {/each}
  </div>
</div>

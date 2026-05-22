<script lang="ts">
  import { page } from '$app/state';
  let { children } = $props();

  const tabs = [
    { href: '/admin',            label: 'Resumen',    icon: '📊', exact: true },
    { href: '/admin/status',     label: 'Moodle',     icon: '🔌' },
    { href: '/admin/logs',       label: 'Logs',       icon: '📜' },
    { href: '/admin/conectados', label: 'Conectados', icon: '👥' }
  ];

  function isActive(t: { href: string; exact?: boolean }): boolean {
    return t.exact ? page.url.pathname === t.href : page.url.pathname.startsWith(t.href);
  }
</script>

<div class="space-y-4">
  <div>
    <h1 class="text-xl font-bold text-gray-900">⚙️ Configuración</h1>
    <p class="text-xs text-gray-400">Administración del sistema — solo administradores</p>
  </div>

  <div class="bg-white border border-gray-200 rounded-xl overflow-x-auto">
    <nav class="flex min-w-max">
      {#each tabs as tab}
        <a
          href={tab.href}
          class="flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors
                 {isActive(tab)
                   ? 'border-indigo-600 text-indigo-700 bg-indigo-50'
                   : 'border-transparent text-gray-600 hover:text-indigo-600 hover:bg-gray-50'}"
        >
          <span>{tab.icon}</span>
          {tab.label}
        </a>
      {/each}
    </nav>
  </div>

  {@render children()}
</div>

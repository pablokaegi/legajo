<script lang="ts">
  import { page } from '$app/state';
  let { children } = $props();

  const tabs = [
    { href: '/gabinete', label: 'Tablero', icon: '🧭', exact: true },
    { href: '/gabinete/casos', label: 'Casos', icon: '📂' },
    { href: '/gabinete/guia', label: 'Guía de apoyos', icon: '📚' }
  ];
  function activo(t: { href: string; exact?: boolean }) {
    return t.exact ? page.url.pathname === t.href : page.url.pathname.startsWith(t.href);
  }
</script>

<div class="space-y-4">
  <div>
    <h1 class="text-xl font-bold text-gray-900">🧠 Gabinete psicopedagógico</h1>
    <p class="text-xs text-gray-400">Información reservada — solo gabinete y administración</p>
  </div>

  <div class="bg-white border border-gray-200 rounded-xl overflow-x-auto print:hidden">
    <nav class="flex min-w-max">
      {#each tabs as t}
        <a href={t.href}
          class="flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors
                 {activo(t) ? 'border-indigo-600 text-indigo-700 bg-indigo-50'
                            : 'border-transparent text-gray-600 hover:text-indigo-600 hover:bg-gray-50'}">
          <span>{t.icon}</span>{t.label}
        </a>
      {/each}
    </nav>
  </div>

  {@render children()}
</div>

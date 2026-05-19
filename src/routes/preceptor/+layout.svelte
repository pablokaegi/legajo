<script lang="ts">
  import { page } from '$app/stores';
  let { children } = $props();

  const tabs = [
    { href: '/preceptor', label: 'Inicio', icon: '🏠', exact: true },
    { href: '/preceptor/faltas', label: 'Faltas', icon: '📅' },
    { href: '/preceptor/amonestaciones', label: 'Amonestaciones', icon: '⚠️' },
    { href: '/preceptor/reincorporaciones', label: 'Reincorporaciones', icon: '✅' },
    { href: '/preceptor/actas', label: 'Actas', icon: '📄' }
  ];

  function isActive(href: string, exact = false): boolean {
    if (exact) return $page.url.pathname === href;
    return $page.url.pathname.startsWith(href);
  }
</script>

<div class="space-y-4">
  <!-- Barra de pestañas del preceptor -->
  <div class="bg-white border border-gray-200 rounded-xl overflow-x-auto">
    <nav class="flex min-w-max">
      {#each tabs as tab}
        <a
          href={tab.href}
          class="flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors
                 {isActive(tab.href, tab.exact)
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

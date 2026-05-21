<script lang="ts">
  import { page } from '$app/state';
  let { children } = $props();

  const tabs = [
    { href: '/institucional/efemerides',    label: 'Efemérides',    icon: '📅' },
    { href: '/institucional/salidas',       label: 'Salidas',       icon: '🚌' },
    { href: '/institucional/agrupamientos', label: 'Agrupamientos', icon: '🧩' }
  ];

  function isActive(href: string): boolean {
    return page.url.pathname.startsWith(href);
  }
</script>

<div class="space-y-4">
  <div class="bg-white border border-gray-200 rounded-xl overflow-x-auto">
    <nav class="flex min-w-max">
      {#each tabs as tab}
        <a
          href={tab.href}
          class="flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors
                 {isActive(tab.href)
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

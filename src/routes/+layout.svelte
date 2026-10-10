<script lang="ts">
  import '../app.css';
  import { page } from '$app/state';

  let { data, children } = $props();

  const ROL_PRECEPTOR = ['admin', 'preceptor', 'directivo'];
  const ROL_STAFF = ['admin', 'docente', 'preceptor', 'directivo', 'gabinete'];
  const ROL_GABINETE = ['admin', 'gabinete'];

  const roles = $derived<string[]>(data.usuario?.roles ?? []);
  const tiene = (lista: string[]) => roles.some((r) => lista.includes(r));
  // Una cuenta solo de familia no ve los módulos internos; el personal los ve
  // todos y los que su rol no habilita aparecen opacados.
  const soloFamilia = $derived(roles.length > 0 && roles.every((r) => r === 'padre'));

  const navItems = $derived(
    [
      { href: '/', label: 'Inicio', icon: '🏠', ok: true },
      { href: '/cursos', label: 'Cursos', icon: '📚', ok: true },
      { href: '/observaciones/nueva', label: 'Nueva', icon: '✏️', ok: true },
      { href: '/observaciones/historial', label: 'Historial', icon: '📋', ok: true },
      { href: '/agrupamientos', label: 'Agrupamientos', icon: '🧩', ok: tiene(ROL_STAFF) },
      { href: '/gabinete', label: 'Gabinete', icon: '🧠', ok: tiene(ROL_GABINETE) },
      { href: '/preceptor', label: 'Preceptor', icon: '📌', ok: tiene(ROL_PRECEPTOR) },
      { href: '/institucional', label: 'Institucional', icon: '🏫', ok: tiene(ROL_PRECEPTOR) },
      { href: '/admin', label: 'Config', icon: '⚙️', ok: tiene(['admin']) }
    ].filter((i) => i.ok || !soloFamilia)
  );

  function isActive(href: string): boolean {
    if (href === '/') return page.url.pathname === '/';
    return page.url.pathname.startsWith(href);
  }
</script>

<svelte:head>
  <title>Legajo</title>
</svelte:head>

{#if data.usuario && !page.url.pathname.startsWith('/autorizar/') && !page.url.pathname.startsWith('/votar/')}
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Header -->
    <header class="print:hidden bg-indigo-600 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-md">
      <a href="/" class="flex items-center gap-2">
        <img src="/logo-pds.png" alt="PDS" class="h-8 w-auto" onerror={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
        <span class="font-bold text-lg tracking-tight hidden sm:inline">Legajo</span>
      </a>
      <div class="flex items-center gap-3">
        <span class="text-sm opacity-90 hidden sm:block">{data.usuario.nombre}</span>
        <form method="POST" action="/auth?/logout">
          <button
            type="submit"
            class="text-sm bg-indigo-700 hover:bg-indigo-800 px-3 py-1 rounded-lg transition-colors"
          >
            Salir
          </button>
        </form>
      </div>
    </header>

    <!-- Contenido principal -->
    <main class="flex-1 pb-20 sm:pb-6 max-w-2xl w-full mx-auto px-4 py-5">
      {@render children()}
    </main>

    <!-- Navegación inferior (móvil) -->
    <nav class="print:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex sm:hidden z-10">
      {#each navItems as item}
        {#if item.ok}
          <a
            href={item.href}
            class="flex-1 flex flex-col items-center py-2 text-xs transition-colors
                   {isActive(item.href)
                     ? 'text-indigo-600 font-semibold'
                     : 'text-gray-500 hover:text-indigo-500'}"
          >
            <span class="text-xl leading-none mb-0.5">{item.icon}</span>
            {item.label}
          </a>
        {:else}
          <span aria-disabled="true" title="No habilitado para tu rol"
            class="flex-1 flex flex-col items-center py-2 text-xs text-gray-400 opacity-40 grayscale cursor-not-allowed select-none">
            <span class="text-xl leading-none mb-0.5">{item.icon}</span>
            {item.label}
          </span>
        {/if}
      {/each}
    </nav>

    <!-- Navegación lateral (desktop) -->
    <nav class="print:hidden hidden sm:flex fixed left-0 top-14 bottom-0 w-48 bg-white border-r border-gray-200 flex-col pt-4 px-2 gap-1">
      {#each navItems as item}
        {#if item.ok}
          <a
            href={item.href}
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                   {isActive(item.href)
                     ? 'bg-indigo-50 text-indigo-700 font-medium'
                     : 'text-gray-600 hover:bg-gray-50'}"
          >
            <span>{item.icon}</span>
            {item.label}
          </a>
        {:else}
          <span aria-disabled="true" title="No habilitado para tu rol"
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 opacity-50 cursor-not-allowed select-none">
            <span class="grayscale">{item.icon}</span>
            {item.label}
            <span class="ml-auto text-[10px]">🔒</span>
          </span>
        {/if}
      {/each}
    </nav>
  </div>
{:else}
  <!-- Páginas sin sesión (solo /auth) -->
  <div class="min-h-screen bg-gray-50">
    {@render children()}
  </div>
{/if}

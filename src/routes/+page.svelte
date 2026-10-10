<script lang="ts">
  let { data } = $props();

  const roles = $derived<string[]>(data.usuario?.roles ?? []);
  const tiene = (lista: string[]) => roles.some((r) => lista.includes(r));
  const STAFF = ['admin', 'docente', 'preceptor', 'directivo', 'gabinete'];
  const soloFamilia = $derived(roles.length > 0 && roles.every((r) => r === 'padre'));

  // Lo que el rol no habilita se muestra opacado (no se oculta), salvo a familias.
  const accesos = $derived(
    [
      { href: '/observaciones/nueva', img: '/imagenes/PNG/480px/001-studying.png', titulo: 'Nueva observación', ok: true, extra: null as string | null },
      { href: '/cursos', img: '/imagenes/PNG/480px/019-books.png', titulo: 'Ver cursos', ok: true,
        extra: data.totalCursos > 0 ? `${data.totalCursos} disponibles` : null },
      { href: '/observaciones/historial', img: '/imagenes/PNG/480px/015-notebook.png', titulo: 'Historial', ok: true, extra: null },
      { href: '/agrupamientos', img: '/imagenes/PNG/480px/014-online%20education.png', titulo: 'Agrupamientos', ok: tiene(STAFF), extra: null },
      { href: '/derivar', img: '/imagenes/PNG/480px/002-studying.png', titulo: 'Derivar al gabinete', ok: tiene(STAFF), extra: null },
      { href: '/gabinete', img: '/imagenes/PNG/480px/004-education.png', titulo: 'Gabinete psicopedagógico', ok: tiene(['admin', 'gabinete']), extra: null }
    ].filter((a) => a.ok || !soloFamilia)
  );
</script>

<svelte:head>
  <title>Inicio — Legajo</title>
</svelte:head>

<div class="space-y-4">
  <!-- Hero de bienvenida -->
  <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-5 text-white shadow-lg">
    <div class="relative z-10 pr-24">
      <p class="text-sm text-indigo-100">Hola,</p>
      <h1 class="text-2xl font-bold">{data.usuario?.nombre?.split(' ')[0] ?? ''} 👋</h1>
      <p class="text-sm text-indigo-100 mt-1">Bienvenido/a a Legajo Digital — Puertas del Sol</p>
    </div>
    <img
      src="/imagenes/PNG/480px/004-education.png"
      alt=""
      class="absolute -right-2 -bottom-2 w-28 h-28 object-contain drop-shadow-lg pointer-events-none"
    />
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
    {#each accesos as a}
      {#if a.ok}
        <a
          href={a.href}
          class="card flex flex-col items-center py-4 gap-2 hover:border-indigo-300 hover:shadow-md transition-all text-center"
        >
          <img src={a.img} alt="" class="w-16 h-16 object-contain" />
          <span class="font-medium text-gray-800 text-sm">{a.titulo}</span>
          {#if a.extra}
            <span class="text-xs text-gray-400">{a.extra}</span>
          {/if}
        </a>
      {:else}
        <div aria-disabled="true" title="No habilitado para tu rol"
          class="card flex flex-col items-center py-4 gap-2 text-center opacity-45 grayscale cursor-not-allowed select-none">
          <img src={a.img} alt="" class="w-16 h-16 object-contain" />
          <span class="font-medium text-gray-500 text-sm">{a.titulo}</span>
          <span class="text-xs text-gray-400">🔒 No habilitado para tu rol</span>
        </div>
      {/if}
    {/each}
  </div>
</div>

<script lang="ts">
  let { data } = $props();

  const roles = $derived<string[]>(data.usuario?.roles ?? []);
  const tiene = (lista: string[]) => roles.some((r) => lista.includes(r));
  const STAFF = ['admin', 'docente', 'preceptor', 'directivo', 'gabinete'];
  const soloFamilia = $derived(roles.length > 0 && roles.every((r) => r === 'padre'));

  // Lo que el rol no habilita se muestra opacado (no se oculta), salvo a familias.
  const accesos = $derived(
    [
      { href: '/observaciones/nueva', titulo: 'Nueva observación', ok: true, extra: null as string | null },
      { href: '/cursos', titulo: 'Ver cursos', ok: true,
        extra: data.totalCursos > 0 ? `${data.totalCursos} disponibles` : null },
      { href: '/observaciones/historial', titulo: 'Historial', ok: true, extra: null },
      { href: '/agrupamientos', titulo: 'Agrupamientos', ok: tiene(STAFF), extra: null },
      { href: '/pizarra', titulo: 'Modo pizarra', ok: tiene(STAFF), extra: null },
      { href: '/derivar', titulo: 'Derivar al gabinete', ok: tiene(STAFF), extra: null },
      { href: '/gabinete', titulo: 'Gabinete psicopedagógico', ok: tiene(['admin', 'gabinete']), extra: null }
    ].filter((a) => a.ok || !soloFamilia)
  );
</script>

<svelte:head>
  <title>Inicio — {data.institucion.app}</title>
</svelte:head>

<div class="space-y-4">
  <!-- Hero de bienvenida -->
  <div class="bienvenida-alere rounded-2xl px-6 py-7 text-white shadow-sm">
    <h1 class="font-serif text-3xl">Hola{#if data.usuario?.nombre}, {data.usuario.nombre.split(' ')[0]}{/if}</h1>
    <p class="mt-1 text-sm text-indigo-100">Legajo Digital · {data.institucion.corto}</p>
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
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
    {#if data.aulaOralDisponible}
      <a href="/aula/oral" class="card flex items-center justify-between gap-3 border-l-4 border-l-indigo-600 hover:border-indigo-400 sm:col-span-2">
        <span><strong class="block">Aula en Legajo</strong><span class="text-sm text-gray-600">Oral de Ciencias · Moodle de prueba</span></span>
        <span class="text-xl text-indigo-600" aria-hidden="true">→</span>
      </a>
    {/if}
    {#if data.apoyosDisponibles}
      <a href="/laboratorio/apoyos" class="card flex items-center justify-between gap-3 border-l-4 border-l-indigo-600 hover:border-indigo-400 sm:col-span-2">
        <span><strong class="block">Laboratorio de apoyos</strong><span class="text-sm text-gray-600">Acompañamiento por estudiante y actividades de Ciencias</span></span>
        <span class="text-xl text-indigo-600" aria-hidden="true">→</span>
      </a>
    {/if}
    {#each accesos as a}
      {#if a.ok}
        <a
          href={a.href}
          class="card flex min-h-16 items-center justify-between gap-3 hover:border-indigo-400 hover:bg-indigo-50"
        >
          <span class="font-semibold text-indigo-900">{a.titulo}
            {#if a.extra}<small class="block font-normal text-gray-600">{a.extra}</small>{/if}
          </span>
          <span class="text-lg text-indigo-600" aria-hidden="true">→</span>
        </a>
      {:else}
        <div aria-disabled="true" title="No habilitado para tu rol"
          class="card flex min-h-16 flex-col justify-center bg-gray-50">
          <span class="font-medium text-gray-600">{a.titulo}</span>
          <span class="text-xs text-gray-600">No habilitado para tu rol</span>
        </div>
      {/if}
    {/each}
  </div>
</div>

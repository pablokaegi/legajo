<script lang="ts">
  let { data } = $props();

  let estadoNombre = $derived(new Map(data.estados.map((e) => [e.id as string, e.nombre])));
  const hoy = new Date().toISOString().slice(0, 10);
  const fmt = (f: string | null) => (f ? new Date(f + 'T12:00:00').toLocaleDateString('es-AR') : '—');
  const NIVEL_CLS: Record<number, string> = {
    3: 'bg-red-600 text-white', 2: 'bg-amber-500 text-white', 1: 'bg-green-600 text-white'
  };
  const href = (estado: string, nivel: number) =>
    `?estado=${estado}${nivel ? `&nivel=${nivel}` : ''}`;
</script>

<svelte:head><title>Casos — Gabinete</title></svelte:head>

<div class="space-y-3">
  <div class="flex flex-wrap gap-1.5">
    {#each [['abiertos', 'Abiertos'], ...data.estados.map((e) => [e.id, e.nombre]), ['todos', 'Todos']] as [id, nombre]}
      <a href={href(id, data.nivel)}
        class="text-xs px-3 py-1.5 rounded-full {data.estado === id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}">
        {nombre}
      </a>
    {/each}
  </div>
  <div class="flex flex-wrap gap-1.5">
    {#each [0, 3, 2, 1] as n}
      <a href={href(data.estado, n)}
        class="text-xs px-3 py-1 rounded-full {data.nivel === n ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700'}">
        {n ? `Nivel ${n}` : 'Todos los niveles'}
      </a>
    {/each}
  </div>

  {#each data.casos as c}
    <a href="/gabinete/casos/{c.id}" class="card block hover:border-indigo-300 space-y-1">
      <div class="flex items-center justify-between gap-2">
        <p class="text-sm font-semibold text-gray-900 truncate">
          <span class="text-[11px] font-bold px-2 py-0.5 rounded-full {NIVEL_CLS[c.nivel] ?? ''}">N{c.nivel}</span>
          {c.alumnoNombre}
        </p>
        <span class="text-xs text-gray-500 flex-shrink-0">{estadoNombre.get(c.estado) ?? c.estado}</span>
      </div>
      <p class="text-xs text-gray-500">
        {c.cursoNombre ?? 'sin curso'} · {c.responsable ? `responsable: ${c.responsable}` : 'sin responsable'}
        {#if c.estado !== 'cerrado'}
          · <span class={c.proximaRevision && c.proximaRevision < hoy ? 'text-red-600 font-medium' : ''}>revisión {fmt(c.proximaRevision)}</span>
        {/if}
      </p>
    </a>
  {:else}
    <div class="card text-center py-8 text-sm text-gray-500">No hay casos con ese filtro.</div>
  {/each}
</div>

<script lang="ts">
  import { CATEGORIAS, CATEGORIA_POR_ID, AVISO_URGENTE } from '$lib/gabinete/categorias';

  interface Props {
    /** ids seleccionados (bindable) */
    seleccionadas?: string[];
    name?: string;
  }
  let { seleccionadas = $bindable([]), name = 'categoria' }: Props = $props();

  let urgentes = $derived(seleccionadas.filter((id) => CATEGORIA_POR_ID.get(id)?.urgente));

  function alternar(id: string) {
    seleccionadas = seleccionadas.includes(id)
      ? seleccionadas.filter((x) => x !== id)
      : [...seleccionadas, id];
  }
  const cuantasEn = (ids: { id: string }[]) => ids.filter((c) => seleccionadas.includes(c.id)).length;
</script>

<div class="space-y-2">
  {#each seleccionadas as id}<input type="hidden" {name} value={id} />{/each}

  {#if seleccionadas.length > 0}
    <div class="flex flex-wrap gap-1.5">
      {#each seleccionadas as id}
        {@const c = CATEGORIA_POR_ID.get(id)}
        {#if c}
          <button type="button" onclick={() => alternar(id)}
            class="text-xs px-2 py-1 rounded-full text-white" style="background:{c.color}">
            {c.urgente ? '⚠️ ' : ''}{c.nombre} ✕
          </button>
        {/if}
      {/each}
    </div>
  {/if}

  <div class="border border-gray-200 rounded-lg divide-y divide-gray-100">
    {#each CATEGORIAS as g}
      <details open={cuantasEn(g.items) > 0}>
        <summary class="px-3 py-2 text-sm text-gray-800 cursor-pointer flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full inline-block" style="background:{g.color}"></span>
          {g.grupo}
          {#if cuantasEn(g.items)}<span class="text-xs text-gray-500">({cuantasEn(g.items)})</span>{/if}
        </summary>
        <div class="px-3 pb-2 grid sm:grid-cols-2 gap-1">
          {#each g.items as c}
            <label class="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={seleccionadas.includes(c.id)} onchange={() => alternar(c.id)} />
              {c.nombre}{#if c.urgente}<span class="text-[10px] px-1.5 rounded bg-red-100 text-red-700">urgente</span>{/if}
            </label>
          {/each}
        </div>
      </details>
    {/each}
  </div>

  {#if urgentes.length > 0}
    <div class="bg-red-50 border border-red-300 text-red-800 text-xs rounded-lg px-3 py-2">
      ⚠️ <strong>{urgentes.map((id) => CATEGORIA_POR_ID.get(id)?.nombre).join(', ')}:</strong> {AVISO_URGENTE}
    </div>
  {/if}
</div>

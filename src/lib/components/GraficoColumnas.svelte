<script lang="ts">
  // Columnas para evolución en el tiempo (un valor por mes). Un solo tono,
  // línea de base, etiqueta de valor solo en el máximo y en el último mes;
  // el resto en el tooltip de cada columna.
  interface Punto {
    clave: string;
    etiqueta: string;
    valor: number;
  }
  interface Props {
    puntos: Punto[];
    color?: string;
    unidad?: string;
  }
  let { puntos, color = '#6366f1', unidad = '' }: Props = $props();

  let tope = $derived(Math.max(1, ...puntos.map((p) => p.valor)));
  let iMax = $derived(puntos.findIndex((p) => p.valor === tope));
</script>

{#if puntos.length === 0}
  <p class="text-sm text-gray-500">Sin datos en el período.</p>
{:else}
  <div>
    <div class="flex items-end gap-[2px] h-36 border-b border-gray-300">
      {#each puntos as p, i (p.clave)}
        <div class="flex-1 h-full flex flex-col justify-end items-center group"
          title="{p.etiqueta}: {p.valor}{unidad ? ' ' + unidad : ''}">
          {#if (i === iMax || i === puntos.length - 1) && p.valor > 0}
            <span class="text-[10px] text-gray-600 tabular-nums mb-0.5">{p.valor}</span>
          {/if}
          <div class="w-full max-w-10 rounded-t group-hover:opacity-80"
            style="height:{(p.valor / tope) * 85}%; min-height:{p.valor > 0 ? 2 : 0}px; background:{color}; -webkit-print-color-adjust:exact; print-color-adjust:exact;">
          </div>
        </div>
      {/each}
    </div>
    <div class="flex gap-[2px] mt-1">
      {#each puntos as p (p.clave)}
        <span class="flex-1 text-center text-[10px] text-gray-500 truncate">{p.etiqueta}</span>
      {/each}
    </div>
  </div>
{/if}

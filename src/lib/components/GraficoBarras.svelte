<script lang="ts">
  // Barras horizontales para magnitudes y rankings. Un solo tono (magnitud,
  // no identidad); el valor va en texto apagado a la derecha, así la lista
  // funciona también como tabla. Tooltip por fila.
  interface Barra {
    clave: string;
    etiqueta: string;
    valor: number;
    detalle?: string;
  }
  interface Props {
    barras: Barra[];
    color?: string;
    unidad?: string;
    max?: number;
    vacio?: string;
  }
  let { barras, color = '#6366f1', unidad = '', max, vacio = 'Sin datos en el período.' }: Props = $props();

  let tope = $derived(max ?? Math.max(1, ...barras.map((b) => b.valor)));
</script>

{#if barras.length === 0}
  <p class="text-sm text-gray-500">{vacio}</p>
{:else}
  <div class="space-y-0.5">
    {#each barras as b (b.clave)}
      <div class="grid grid-cols-[minmax(0,10rem)_1fr_2.5rem] sm:grid-cols-[minmax(0,14rem)_1fr_3rem] items-center gap-2 rounded px-1 py-1 hover:bg-gray-50"
        title="{b.etiqueta}: {b.valor}{unidad ? ' ' + unidad : ''}{b.detalle ? ' — ' + b.detalle : ''}">
        <div class="min-w-0">
          <p class="text-xs text-gray-800 truncate">{b.etiqueta}</p>
          {#if b.detalle}<p class="text-[10px] text-gray-400 truncate">{b.detalle}</p>{/if}
        </div>
        <div class="h-3 bg-gray-100 rounded-r">
          <div class="h-full rounded-r"
            style="width:{b.valor > 0 ? Math.max(1.5, (b.valor / tope) * 100) : 0}%; background:{color}; -webkit-print-color-adjust:exact; print-color-adjust:exact;">
          </div>
        </div>
        <span class="text-xs text-gray-500 text-right tabular-nums">{b.valor}</span>
      </div>
    {/each}
  </div>
{/if}

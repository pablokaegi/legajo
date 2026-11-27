<script lang="ts">
  // Grupos en grande: una agrupación guardada (con sus roles) o grupos al azar
  // armados en el momento. Solo nombres y roles: nada del análisis.
  import { goto } from '$app/navigation';

  interface Miembro { id: number; nombre: string; rol?: string | null }
  interface Agrupacion { id: number; nombre: string; modo: string; sesion: string; grupos: Miembro[][] }
  interface Props {
    agrupaciones: Agrupacion[];
    azar: Miembro[][] | null;
    azarTamano: number | null;
  }
  let { agrupaciones, azar, azarTamano }: Props = $props();

  let elegida = $state<number | null>(null);
  let actual = $derived<Miembro[][] | null>(
    azar ?? (elegida != null ? agrupaciones.find((a) => a.id === elegida)?.grupos ?? null : null)
  );
  let titulo = $derived(
    azar ? `Grupos al azar de ${azarTamano}` : agrupaciones.find((a) => a.id === elegida)?.nombre ?? ''
  );

  function alAzar(n: number) {
    elegida = null;
    goto(`?tab=grupos&azar=${n}&semilla=${Math.floor(Math.random() * 1e9)}`, { noScroll: true, invalidateAll: true });
  }
  function usar(id: number) {
    elegida = id;
    if (azar) goto('?tab=grupos', { noScroll: true, invalidateAll: true });
  }
  const COLORES = ['#4f46e5', '#0d9488', '#d97706', '#db2777', '#2563eb', '#16a34a', '#9333ea', '#dc2626'];
</script>

{#if !actual}
  <div class="max-w-5xl mx-auto space-y-5 py-2">
    <div class="space-y-2">
      <p class="text-2xl font-bold text-gray-900">Grupos al azar</p>
      <div class="flex flex-wrap gap-3">
        {#each [2, 3, 4, 5, 6] as n}
          <button onclick={() => alAzar(n)} class="px-6 py-4 rounded-2xl bg-indigo-600 text-white text-2xl font-bold">De {n}</button>
        {/each}
      </div>
    </div>
    <div class="space-y-2">
      <p class="text-2xl font-bold text-gray-900">Agrupaciones guardadas</p>
      {#each agrupaciones as a}
        <button onclick={() => usar(a.id)}
          class="w-full text-left px-5 py-4 rounded-2xl bg-white border-2 border-gray-200 active:bg-indigo-50">
          <span class="text-2xl font-semibold text-gray-900">{a.nombre}</span>
          <span class="block text-lg text-gray-500">{a.sesion} · {a.grupos.length} grupos</span>
        </button>
      {:else}
        <p class="text-xl text-gray-400">Todavía no hay agrupaciones guardadas de este curso (se arman en Agrupamientos).</p>
      {/each}
    </div>
  </div>
{:else}
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-3">
      <p class="text-3xl font-bold text-gray-900">{titulo}</p>
      {#if azar && azarTamano}
        <button onclick={() => alAzar(azarTamano!)} class="px-5 py-3 rounded-xl bg-indigo-100 text-indigo-800 text-xl">🎲 Mezclar de nuevo</button>
      {/if}
      <button onclick={() => { elegida = null; if (azar) goto('?tab=grupos', { noScroll: true, invalidateAll: true }); }}
        class="ml-auto px-5 py-3 rounded-xl bg-gray-100 text-gray-700 text-xl">← Otras opciones</button>
    </div>
    <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {#each actual as grupo, i}
        <div class="rounded-2xl bg-white border-4 p-4 space-y-2" style="border-color:{COLORES[i % COLORES.length]}">
          <p class="text-2xl font-extrabold" style="color:{COLORES[i % COLORES.length]}">Grupo {i + 1}</p>
          {#each grupo as m}
            <div>
              <p class="text-2xl text-gray-900 leading-tight">{m.nombre}</p>
              {#if m.rol}<p class="text-lg text-amber-700">{m.rol}</p>{/if}
            </div>
          {/each}
        </div>
      {/each}
    </div>
  </div>
{/if}

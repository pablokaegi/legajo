<script lang="ts">
  // Plano del aula vigente en grande (útil también para suplentes: quién es quién).
  interface Asiento { id: number; nombre: string }
  interface Props {
    plano: { nombre: string; columnas: number; bancos: (Asiento | null)[][] } | null;
    cursoId: number;
  }
  let { plano, cursoId }: Props = $props();
</script>

{#if !plano}
  <div class="text-center py-10 space-y-2">
    <p class="text-2xl text-gray-500">Este curso todavía no tiene un plano del aula guardado.</p>
    <p class="text-lg text-gray-400">Se arma desde la app en “Plano del aula” (/aula/{cursoId}).</p>
  </div>
{:else}
  <div class="space-y-3">
    <div class="bg-gray-800 text-white text-xl text-center rounded-xl py-2">🧑‍🏫 Frente del aula</div>
    <div class="grid gap-x-10 gap-y-4" style="grid-template-columns: repeat({plano.columnas}, minmax(0, 1fr));">
      {#each plano.bancos as banco, b}
        <div class="rounded-xl border-2 border-amber-300 bg-amber-50 p-2 space-y-1">
          <p class="text-sm text-amber-800 font-medium">Banco {b + 1}</p>
          <div class="grid gap-1" style="grid-template-columns: repeat({banco.length}, minmax(0, 1fr));">
            {#each banco as s}
              <p class="rounded-lg bg-white px-2 py-2 text-xl leading-tight {s ? 'text-gray-900' : 'text-gray-300'}">
                {s ? s.nombre : 'libre'}
              </p>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}

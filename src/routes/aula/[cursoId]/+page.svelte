<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import type { AlumnoRef } from '$lib/server/agrupamientos/tipos';

  let { data, form } = $props();

  type Asiento = AlumnoRef | null;
  type Sel = { banco: number; asiento: number } | { libre: number } | null;

  const copia = () => (data.actual?.bancos ?? []).map((b) => [...b]);
  let bancos = $state<Asiento[][]>(copia());
  let columnas = $state(data.actual?.columnas ?? 3);
  let editando = $state(data.esPropuesta);
  let sel = $state<Sel>(null);
  let nombre = $state(data.actual?.nombre ?? '');
  let cambios = $state(data.esPropuesta);

  // Cada vez que cambia el plano que viene del servidor, se reinicia el editor.
  $effect(() => {
    bancos = copia();
    columnas = data.actual?.columnas ?? 3;
    nombre = data.actual?.nombre ?? '';
    editando = data.esPropuesta;
    cambios = data.esPropuesta;
    sel = null;
  });

  let ubicados = $derived(new Set(bancos.flat().filter((s): s is AlumnoRef => s != null).map((s) => s.id)));
  let sinUbicar = $derived(data.roster.filter((a) => !ubicados.has(a.id)));

  function tocarAsiento(b: number, a: number) {
    if (!editando) return;
    if (sel == null) {
      sel = { banco: b, asiento: a };
      return;
    }
    if ('libre' in sel) {
      const alumno = data.roster.find((x) => x.id === (sel as { libre: number }).libre) ?? null;
      bancos[b][a] = alumno; // si había alguien, vuelve a "sin ubicar"
    } else {
      const { banco, asiento } = sel;
      [bancos[b][a], bancos[banco][asiento]] = [bancos[banco][asiento], bancos[b][a]];
    }
    bancos = bancos.map((x) => [...x]);
    sel = null;
    cambios = true;
  }
  function tocarLibre(id: number) {
    if (!editando) return;
    sel = sel && 'libre' in sel && sel.libre === id ? null : { libre: id };
  }
  function quitar(b: number, a: number) {
    bancos[b][a] = null;
    bancos = bancos.map((x) => [...x]);
    cambios = true;
  }
  function agregarBanco() {
    bancos = [...bancos, [null, null]];
    cambios = true;
  }
  function quitarBancosVacios() {
    bancos = bancos.filter((b) => b.some((s) => s != null));
    cambios = true;
  }
  const esSel = (b: number, a: number) => sel != null && !('libre' in sel) && sel.banco === b && sel.asiento === a;

  function proponer(tipo: string) {
    goto(`?propuesta=${tipo}&columnas=${columnas}`, { invalidateAll: true, noScroll: true });
  }
  const ORIGEN: Record<string, string> = {
    inclusiva: 'Ubicación inclusiva', aleatorio: 'Al azar', alfabetico: 'Alfabético', manual: 'Manual'
  };
  const fecha = (d: unknown) => (d ? new Date(d as string).toLocaleDateString('es-AR') : '');
</script>

<svelte:head><title>Aula — {data.cursoNombre}</title></svelte:head>

<div class="space-y-4">
  <div class="print:hidden">
    <h1 class="text-lg font-bold text-gray-900">🪑 Plano del aula</h1>
    <p class="text-xs text-gray-500">🎓 {data.cursoNombre}</p>
  </div>

  {#if form?.error}
    <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2 print:hidden">{form.error}</div>
  {/if}
  {#if form?.ok}
    <div class="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-3 py-2 print:hidden">{form.ok}</div>
  {/if}

  <!-- Propuestas -->
  <div class="card space-y-2 print:hidden">
    <p class="text-sm font-semibold text-gray-800">Armar una propuesta</p>
    <div class="flex flex-wrap gap-2">
      <button onclick={() => proponer('inclusiva')} class="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 text-white">✨ Inclusiva (según la votación)</button>
      <button onclick={() => proponer('aleatorio')} class="text-xs px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-indigo-100">🎲 Al azar</button>
      <button onclick={() => proponer('alfabetico')} class="text-xs px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-indigo-100">🔤 Alfabético</button>
    </div>
    <p class="text-[11px] text-gray-400">
      La inclusiva sienta a quien conviene acompañar junto a un compañero bien aceptado que no lo rechaza
      (van den Berg & Stoltz, 2018). Después podés ajustar a mano.
    </p>
  </div>

  {#if !data.actual}
    <div class="card text-center py-10 text-sm text-gray-500">
      Este curso todavía no tiene un plano. Armá una propuesta arriba.
    </div>
  {:else}
    {#if data.esPropuesta}
      <div class="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg px-3 py-2 print:hidden">
        Propuesta <strong>sin guardar</strong> ({ORIGEN[data.actual.origen]}). {data.actual.nota ?? ''}
      </div>
    {/if}

    <!-- Controles -->
    <div class="flex flex-wrap items-center gap-3 print:hidden">
      <div class="flex items-center gap-1.5">
        <span class="text-xs text-gray-500">Columnas:</span>
        {#each [2, 3, 4] as n}
          <button onclick={() => { columnas = n; cambios = true; }}
            class="w-7 h-7 rounded-lg text-xs font-semibold {columnas === n ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}">{n}</button>
        {/each}
      </div>
      {#if editando}
        <button onclick={agregarBanco} class="text-xs text-indigo-600 hover:underline">+ Banco</button>
        <button onclick={quitarBancosVacios} class="text-xs text-gray-500 hover:underline">Quitar bancos vacíos</button>
      {:else}
        <button onclick={() => (editando = true)} class="text-xs text-indigo-600 hover:underline">✏️ Editar</button>
      {/if}
      <button onclick={() => window.print()} class="text-xs text-gray-600 hover:underline ml-auto">🖨️ Imprimir</button>
    </div>
    {#if editando}
      <p class="text-xs text-indigo-700 print:hidden">
        Tocá un asiento y después otro para intercambiarlos. Para ubicar a alguien de "sin ubicar", tocalo y después tocá el asiento.
      </p>
    {/if}

    <!-- Plano -->
    <div class="card space-y-3 print:shadow-none print:border-0">
      <p class="hidden print:block text-base font-bold">Plano del aula — {data.cursoNombre}</p>
      <div class="bg-gray-700 text-white text-xs text-center rounded py-1.5">🧑‍🏫 Pizarrón / frente del aula</div>
      <div class="grid gap-x-8 gap-y-3" style="grid-template-columns: repeat({columnas}, minmax(0, 1fr));">
        {#each bancos as banco, b}
          <div class="rounded-lg border border-amber-300 bg-amber-50/60 p-1.5 space-y-1">
            <p class="text-[10px] text-amber-800 font-medium">Banco {b + 1}</p>
            <div class="grid gap-1" style="grid-template-columns: repeat({banco.length}, minmax(0, 1fr));">
              {#each banco as asiento, a}
                <div class="relative">
                  <button type="button" onclick={() => tocarAsiento(b, a)}
                    class="w-full text-left rounded px-1.5 py-1 pr-3 text-[11px] leading-tight min-h-[2.25rem] border transition-colors
                           {esSel(b, a) ? 'border-indigo-600 ring-2 ring-indigo-300 bg-white'
                             : asiento ? 'border-white bg-white' : 'border-dashed border-gray-300 bg-transparent text-gray-400'}
                           {editando ? 'cursor-pointer' : 'cursor-default'}">
                    {asiento ? asiento.nombre : 'libre'}
                  </button>
                  {#if editando && asiento}
                    <button type="button" onclick={() => quitar(b, a)} aria-label="Quitar del banco"
                      class="absolute top-0 right-0.5 text-xs text-gray-300 hover:text-red-500 print:hidden">×</button>
                  {/if}
                </div>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Sin ubicar -->
    {#if sinUbicar.length > 0}
      <div class="card space-y-2 print:hidden">
        <p class="text-sm font-semibold text-gray-800">Sin ubicar ({sinUbicar.length})</p>
        <div class="flex flex-wrap gap-1.5">
          {#each sinUbicar as a}
            <button onclick={() => tocarLibre(a.id)}
              class="text-xs px-2.5 py-1.5 rounded-lg {sel && 'libre' in sel && sel.libre === a.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}">
              {a.nombre}
            </button>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Guardar -->
    {#if cambios}
      <form method="POST" action="?/guardar" class="card flex flex-wrap items-end gap-2 print:hidden"
        use:enhance={() => async ({ update, result }) => {
          await update({ reset: false });
          if (result.type === 'success') goto('?', { invalidateAll: true, noScroll: true });
        }}>
        <div class="flex-1 min-w-48">
          <label class="form-label" for="nom">Nombre del plano</label>
          <input id="nom" name="nombre" bind:value={nombre} maxlength="200" class="form-input text-sm"
            placeholder="Ej.: Plano 2.º trimestre" />
        </div>
        <input type="hidden" name="columnas" value={columnas} />
        <input type="hidden" name="origen" value={data.actual.id == null ? data.actual.origen : 'manual'} />
        <input type="hidden" name="sesionId" value={data.actual.sesionId ?? ''} />
        <input type="hidden" name="bancosJson" value={JSON.stringify(bancos)} />
        <button type="submit" class="btn-primary text-sm">💾 Guardar como vigente</button>
      </form>
    {/if}
  {/if}

  <!-- Historial -->
  {#if data.planos.length > 0}
    <div class="card space-y-1.5 print:hidden">
      <p class="text-sm font-semibold text-gray-800">Historial de planos</p>
      {#each data.planos as p}
        <div class="flex items-center gap-2 text-sm">
          <a href="?plano={p.id}" class="flex-1 truncate text-gray-800 hover:text-indigo-700">
            {p.vigente ? '⭐ ' : ''}{p.nombre}
            <span class="text-xs text-gray-400">· {ORIGEN[p.origen] ?? p.origen} · {fecha(p.createdAt)}</span>
          </a>
          {#if !p.vigente}
            <form method="POST" action="?/vigente" use:enhance>
              <input type="hidden" name="planoId" value={p.id} />
              <button class="text-xs text-indigo-600 hover:underline">Usar</button>
            </form>
          {/if}
          {#if p.puedeBorrar}
            <form method="POST" action="?/eliminar"
              use:enhance={({ cancel }) => { if (!confirm('¿Borrar este plano?')) cancel(); }}>
              <input type="hidden" name="planoId" value={p.id} />
              <button class="text-xs text-gray-400 hover:text-red-500">✕</button>
            </form>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

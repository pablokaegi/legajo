<script lang="ts">
  import { enhance } from '$app/forms';
  import { INSTITUCION } from '$lib/institucional.js';
  import type { AlumnoRef } from '$lib/server/agrupamientos/tipos';

  interface Props {
    titulo: string;
    cursoNombre: string;
    roster: AlumnoRef[];
    yaVotaron: number[];
    asignaciones: Record<number, AlumnoRef[]>;
    cerrada: boolean;
    action: string;
    form: { error?: string; ok?: boolean } | null;
  }

  let { titulo, cursoNombre, roster, yaVotaron, asignaciones, cerrada, action, form }: Props = $props();

  let votante = $state<number | null>(null);
  let ratings = $state<Record<number, number>>({});
  let bloqueado = $state<number | null>(null);
  let enviando = $state(false);
  let busqueda = $state('');

  let votaronSet = $derived(new Set(yaVotaron));
  let pendientes = $derived(roster.filter((a) => !votaronSet.has(a.id)));
  let listaFiltrada = $derived(
    busqueda.trim()
      ? roster.filter((a) => a.nombre.toLowerCase().includes(busqueda.toLowerCase()))
      : roster
  );

  let companeros = $derived(votante != null ? (asignaciones[votante] ?? []) : []);
  let nombreVotante = $derived(roster.find((a) => a.id === votante)?.nombre ?? '');
  let cantCalificadas = $derived(companeros.filter((c) => ratings[c.id]).length);
  let todosCalificados = $derived(companeros.length > 0 && cantCalificadas === companeros.length);
  let todosMinimos = $derived(todosCalificados && companeros.every((c) => ratings[c.id] === 1));
  let payload = $derived(
    companeros
      .map((c) => ({ id: c.id, nombre: c.nombre, puntaje: ratings[c.id] ?? 0 }))
      .filter((c) => c.puntaje >= 1)
  );

  function abrir(id: number) {
    if (cerrada || votaronSet.has(id)) return;
    votante = id;
    ratings = {};
    bloqueado = null;
  }
  function cerrar() {
    votante = null;
    ratings = {};
    bloqueado = null;
  }
  function setRating(id: number, p: number) {
    ratings = { ...ratings, [id]: p };
  }
  function toggleBloqueo(id: number) {
    bloqueado = bloqueado === id ? null : id;
  }
  function iniciales(n: string) {
    return n.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  }

  const ESCALA = [
    { p: 1, lbl: 'Muy poca', color: 'bg-red-500' },
    { p: 2, lbl: 'Poca', color: 'bg-orange-500' },
    { p: 3, lbl: 'Neutral', color: 'bg-yellow-500' },
    { p: 4, lbl: 'Buena', color: 'bg-teal-500' },
    { p: 5, lbl: 'Excelente', color: 'bg-green-600' }
  ];
</script>

<div class="w-full max-w-lg mx-auto space-y-4">
  <!-- Cabecera -->
  <div class="bg-indigo-700 text-white rounded-xl px-5 py-4 flex items-center gap-3">
    <img src={INSTITUCION.logo} alt="" class="h-10 w-10 object-contain bg-white rounded-lg p-1 flex-shrink-0"
      onerror={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
    <div class="min-w-0">
      <p class="font-bold text-sm truncate">{titulo}</p>
      <p class="text-xs text-indigo-200 truncate">🎓 {cursoNombre}</p>
    </div>
  </div>

  {#if cerrada}
    <div class="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm text-center">
      🔒 La votación está cerrada.
    </div>
  {/if}

  {#if form?.error}
    <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{form.error}</div>
  {/if}

  {#if votante == null}
    <!-- Selección de alumno -->
    <div class="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      <div>
        <p class="text-sm font-semibold text-gray-800">¿Quién está votando?</p>
        <p class="text-xs text-gray-500">
          Tocá tu nombre. Votaron {yaVotaron.length} de {roster.length}.
        </p>
      </div>

      <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div class="h-full bg-indigo-600 transition-all"
          style="width: {roster.length ? (yaVotaron.length / roster.length) * 100 : 0}%"></div>
      </div>

      <input type="search" bind:value={busqueda} placeholder="Buscar tu nombre..."
        class="form-input text-sm w-full" />

      <div class="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
        {#each listaFiltrada as alumno}
          {@const voto = votaronSet.has(alumno.id)}
          <button onclick={() => abrir(alumno.id)} disabled={voto || cerrada}
            class="w-full text-left flex items-center gap-3 p-3 rounded-lg border transition-colors
                   {voto ? 'bg-green-50 border-green-200 cursor-default'
                         : 'bg-white border-gray-200 hover:border-indigo-300 active:bg-indigo-50'}">
            <div class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold
                        {voto ? 'bg-green-200 text-green-800' : 'bg-indigo-100 text-indigo-700'}">
              {iniciales(alumno.nombre)}
            </div>
            <span class="flex-1 text-sm font-medium text-gray-900">{alumno.nombre}</span>
            {#if voto}
              <span class="text-xs text-green-600 font-medium">✓ Votó</span>
            {/if}
          </button>
        {/each}
      </div>

      {#if pendientes.length === 0}
        <div class="bg-green-50 border border-green-200 rounded-lg p-3 text-center text-sm text-green-700">
          🎉 ¡Todos los alumnos votaron!
        </div>
      {/if}
    </div>

  {:else}
    <!-- Formulario de votación -->
    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div class="bg-indigo-50 px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-9 h-9 rounded-full bg-indigo-200 text-indigo-800 flex items-center justify-center text-xs font-bold">
            {iniciales(nombreVotante)}
          </div>
          <div>
            <p class="text-xs text-indigo-500">Votando</p>
            <p class="text-sm font-semibold text-indigo-900">{nombreVotante}</p>
          </div>
        </div>
        <button onclick={cerrar} class="text-xs text-gray-500 hover:text-gray-800">✕ Cancelar</button>
      </div>

      <div class="p-4 space-y-3">
        <p class="text-xs text-gray-600">
          Calificá del 1 al 5 cuánto te gustaría trabajar con cada compañero.
          Podés marcar 🚫 en <strong>uno solo</strong> si preferís no quedar con esa persona.
        </p>

        {#each companeros as comp}
          <div class="rounded-lg border p-3 space-y-2
                      {bloqueado === comp.id ? 'border-red-300 bg-red-50' : 'border-gray-200'}">
            <div class="flex items-center justify-between gap-2">
              <span class="text-sm font-medium text-gray-900">{comp.nombre}</span>
              <button type="button" onclick={() => toggleBloqueo(comp.id)}
                class="text-xs px-2 py-1 rounded-lg transition-colors flex-shrink-0
                       {bloqueado === comp.id ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-red-100'}">
                🚫 {bloqueado === comp.id ? 'Bloqueado' : 'Bloquear'}
              </button>
            </div>
            <div class="grid grid-cols-5 gap-1.5">
              {#each ESCALA as e}
                <button type="button" onclick={() => setRating(comp.id, e.p)}
                  class="py-2 rounded-lg text-white text-sm font-bold transition-all
                         {ratings[comp.id] === e.p ? e.color + ' ring-2 ring-offset-1 ring-gray-400 scale-105'
                                                   : e.color + ' opacity-30 hover:opacity-60'}">
                  {e.p}
                </button>
              {/each}
            </div>
          </div>
        {/each}

        <form method="POST" {action}
          use:enhance={() => {
            enviando = true;
            return async ({ update, result }) => {
              await update({ reset: false });
              enviando = false;
              if (result.type === 'success') cerrar();
            };
          }}>
          <input type="hidden" name="votanteMoodleId" value={votante} />
          <input type="hidden" name="votanteNombre" value={nombreVotante} />
          <input type="hidden" name="calificaciones" value={JSON.stringify(payload)} />
          <input type="hidden" name="bloqueadoMoodleId" value={bloqueado ?? ''} />
          <input type="hidden" name="bloqueadoNombre"
            value={bloqueado ? (companeros.find((c) => c.id === bloqueado)?.nombre ?? '') : ''} />

          {#if todosMinimos}
            <p class="text-xs text-red-600 mb-2">No podés calificar a todos con 1.</p>
          {/if}

          <button type="submit" disabled={enviando || !todosCalificados || todosMinimos}
            class="btn-primary w-full {(!todosCalificados || todosMinimos) ? 'opacity-50' : ''}">
            {enviando ? 'Enviando...'
              : todosCalificados ? '✓ Enviar mi votación'
              : `Falta calificar (${cantCalificadas}/${companeros.length})`}
          </button>
        </form>
      </div>
    </div>
  {/if}
</div>

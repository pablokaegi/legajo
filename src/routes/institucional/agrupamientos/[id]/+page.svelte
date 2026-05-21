<script lang="ts">
  import { enhance } from '$app/forms';
  import type { VotoParsed } from '$lib/server/agrupamientos/tipos';

  let { data, form } = $props();

  let sesion = $derived(data.sesion);
  let roster = $derived(data.roster);
  let votos = $derived(data.votos);
  let cerrada = $derived(sesion.estado === 'cerrada');

  let votoPorVotante = $derived(new Map<number, VotoParsed>(votos.map((v) => [v.votanteMoodleId, v])));
  let nombrePorId = $derived(new Map<number, string>(roster.map((a) => [a.id, a.nombre])));

  let votoActivo = $state<number | null>(null);
  let ratings = $state<Record<number, number>>({});
  let bloqueado = $state<number | null>(null);
  let busqueda = $state('');
  let guardando = $state(false);
  let editandoSesion = $state(false);
  let confirmarEliminar = $state(false);

  function abrirVoto(votanteId: number) {
    if (cerrada) return;
    if (votoActivo === votanteId) {
      votoActivo = null;
      return;
    }
    votoActivo = votanteId;
    busqueda = '';
    const existente = votoPorVotante.get(votanteId);
    const r: Record<number, number> = {};
    if (existente) {
      for (const c of existente.calificaciones) r[c.id] = c.puntaje;
      bloqueado = existente.bloqueadoMoodleId;
    } else {
      bloqueado = null;
    }
    ratings = r;
  }

  function setRating(alumnoId: number, p: number) {
    const r = { ...ratings };
    if (r[alumnoId] === p) delete r[alumnoId];
    else r[alumnoId] = p;
    ratings = r;
  }

  function toggleBloqueo(alumnoId: number) {
    bloqueado = bloqueado === alumnoId ? null : alumnoId;
  }

  let calificacionesPayload = $derived(
    Object.entries(ratings).map(([id, p]) => ({
      id: Number(id),
      nombre: nombrePorId.get(Number(id)) ?? '',
      puntaje: p
    }))
  );

  let cantRatings = $derived(Object.keys(ratings).length);

  function companeros(votanteId: number) {
    const q = busqueda.trim().toLowerCase();
    return roster
      .filter((a) => a.id !== votanteId)
      .filter((a) => !q || a.nombre.toLowerCase().includes(q));
  }

  function iniciales(nombre: string): string {
    return nombre
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
</script>

<svelte:head><title>{sesion.titulo} — Agrupamientos</title></svelte:head>

<div class="space-y-4">
  <a href="/institucional/agrupamientos" class="text-indigo-600 text-sm hover:underline">← Agrupamientos</a>

  {#if form?.error}
    <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">{form.error}</div>
  {/if}

  <!-- Encabezado de la sesión -->
  <div class="card space-y-2">
    {#if editandoSesion}
      <form
        method="POST"
        action="?/editarSesion"
        use:enhance={() => {
          return async ({ update, result }) => {
            await update({ reset: false });
            if (result.type === 'success') editandoSesion = false;
          };
        }}
        class="space-y-3"
      >
        <div>
          <label class="form-label" for="ed-titulo">Título</label>
          <input id="ed-titulo" type="text" name="titulo" value={sesion.titulo} maxlength="200" class="form-input" required />
        </div>
        <div>
          <label class="form-label" for="ed-fecha">Fecha</label>
          <input id="ed-fecha" type="date" name="fecha" value={sesion.fecha} class="form-input" required />
        </div>
        <div>
          <label class="form-label" for="ed-notas">Notas</label>
          <textarea id="ed-notas" name="notas" rows="2" maxlength="2000" class="form-input resize-none">{sesion.notas ?? ''}</textarea>
        </div>
        <div class="flex gap-2">
          <button type="submit" class="btn-primary text-sm flex-1">Guardar</button>
          <button type="button" onclick={() => (editandoSesion = false)} class="text-sm text-gray-500 px-3">Cancelar</button>
        </div>
      </form>
    {:else}
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0">
          <h2 class="text-lg font-bold text-gray-900">{sesion.titulo}</h2>
          <p class="text-xs text-gray-500">🎓 {sesion.cursoNombre} · 📅 {sesion.fecha}</p>
        </div>
        <span
          class="text-xs px-2 py-0.5 rounded-full flex-shrink-0
                 {cerrada ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}"
        >{sesion.estado}</span>
      </div>
      {#if sesion.notas}
        <p class="text-sm text-gray-600 whitespace-pre-line">{sesion.notas}</p>
      {/if}
      <div class="flex flex-wrap gap-2 pt-1">
        {#if !cerrada}
          <button onclick={() => (editandoSesion = true)} class="text-xs text-indigo-600 hover:underline">✏️ Editar</button>
        {/if}
        <form method="POST" action="?/cambiarEstado" use:enhance>
          <input type="hidden" name="estado" value={cerrada ? 'abierta' : 'cerrada'} />
          <button type="submit" class="text-xs text-gray-600 hover:underline">
            {cerrada ? '🔓 Reabrir' : '🔒 Cerrar sesión'}
          </button>
        </form>
        <button onclick={() => (confirmarEliminar = !confirmarEliminar)} class="text-xs text-red-500 hover:underline">
          🗑 Eliminar
        </button>
      </div>
      {#if confirmarEliminar}
        <div class="bg-red-50 border border-red-200 rounded-lg p-3 text-sm space-y-2">
          <p class="text-red-700">¿Eliminar esta sesión y todos sus votos? No se puede deshacer.</p>
          <div class="flex gap-2">
            <form method="POST" action="?/eliminarSesion" use:enhance>
              <button type="submit" class="bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg">
                Sí, eliminar
              </button>
            </form>
            <button onclick={() => (confirmarEliminar = false)} class="text-xs text-gray-500 px-2">Cancelar</button>
          </div>
        </div>
      {/if}
    {/if}
  </div>

  <!-- Progreso + resultados -->
  <div class="card flex items-center justify-between gap-3">
    <div>
      <p class="text-sm font-semibold text-gray-800">
        {votos.length} de {roster.length} votos cargados
      </p>
      <p class="text-xs text-gray-500">Cargá las preferencias de cada alumno</p>
    </div>
    <a
      href="/institucional/agrupamientos/{sesion.id}/resultados"
      class="btn-primary text-sm whitespace-nowrap {votos.length < 2 ? 'opacity-50 pointer-events-none' : ''}"
    >
      Ver resultados →
    </a>
  </div>

  {#if roster.length === 0}
    <div class="card text-center py-8">
      <p class="text-2xl mb-2">⚠️</p>
      <p class="text-gray-500 text-sm">
        No se pudo cargar la lista de alumnos del curso desde Moodle.
      </p>
    </div>
  {:else}
    <!-- Listado de alumnos -->
    <div class="space-y-2">
      {#each roster as alumno}
        {@const voto = votoPorVotante.get(alumno.id)}
        {@const abierto = votoActivo === alumno.id}
        <div class="card {abierto ? 'border-indigo-400' : ''} space-y-0 p-0 overflow-hidden">
          <button
            onclick={() => abrirVoto(alumno.id)}
            disabled={cerrada}
            class="w-full text-left flex items-center gap-3 p-3 transition-colors
                   {cerrada ? 'cursor-default' : 'hover:bg-gray-50'}"
          >
            <div
              class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold
                     {voto ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}"
            >
              {iniciales(alumno.nombre)}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{alumno.nombre}</p>
              {#if voto}
                <p class="text-xs text-green-600">
                  ✅ {voto.calificaciones.length} calificación/es
                  {#if voto.bloqueadoNombre}· 🚫 bloqueó a {voto.bloqueadoNombre}{/if}
                </p>
              {:else}
                <p class="text-xs text-gray-400">⏳ Sin cargar</p>
              {/if}
            </div>
            {#if !cerrada}
              <span class="text-xs text-indigo-600 flex-shrink-0">{abierto ? '▲' : voto ? 'Editar' : 'Cargar'}</span>
            {/if}
          </button>

          <!-- Panel de carga de voto -->
          {#if abierto}
            <div class="border-t border-gray-200 bg-gray-50 p-3 space-y-3">
              <p class="text-xs text-gray-600">
                Calificá del 1 (poco) al 5 (mucho) a los compañeros con quienes
                <strong>{alumno.nombre}</strong> prefiere trabajar. Dejá en blanco los que no calificó.
              </p>

              <input
                type="search"
                bind:value={busqueda}
                placeholder="Buscar compañero..."
                class="form-input text-sm w-full"
              />

              <div class="space-y-1 max-h-80 overflow-y-auto pr-1">
                {#each companeros(alumno.id) as comp}
                  <div
                    class="flex items-center gap-2 py-1.5 px-2 rounded-lg
                           {bloqueado === comp.id ? 'bg-red-50' : ratings[comp.id] ? 'bg-indigo-50' : 'bg-white'}"
                  >
                    <span class="flex-1 text-sm text-gray-800 truncate">{comp.nombre}</span>
                    <div class="flex gap-0.5 flex-shrink-0">
                      {#each [1, 2, 3, 4, 5] as p}
                        <button
                          type="button"
                          onclick={() => setRating(comp.id, p)}
                          class="w-6 h-6 rounded text-xs font-semibold transition-colors
                                 {ratings[comp.id] === p
                                   ? 'bg-indigo-600 text-white'
                                   : 'bg-gray-200 text-gray-500 hover:bg-indigo-200'}"
                        >{p}</button>
                      {/each}
                    </div>
                    <button
                      type="button"
                      onclick={() => toggleBloqueo(comp.id)}
                      title="Bloquear"
                      class="w-6 h-6 rounded text-xs flex-shrink-0 transition-colors
                             {bloqueado === comp.id
                               ? 'bg-red-600 text-white'
                               : 'bg-gray-200 text-gray-400 hover:bg-red-200'}"
                    >🚫</button>
                  </div>
                {/each}
              </div>

              <form
                method="POST"
                action="?/guardarVoto"
                use:enhance={() => {
                  guardando = true;
                  return async ({ update, result }) => {
                    await update({ reset: false });
                    guardando = false;
                    if (result.type === 'success') votoActivo = null;
                  };
                }}
                class="space-y-2"
              >
                <input type="hidden" name="votanteMoodleId" value={alumno.id} />
                <input type="hidden" name="votanteNombre" value={alumno.nombre} />
                <input type="hidden" name="calificaciones" value={JSON.stringify(calificacionesPayload)} />
                <input type="hidden" name="bloqueadoMoodleId" value={bloqueado ?? ''} />
                <input
                  type="hidden"
                  name="bloqueadoNombre"
                  value={bloqueado ? (nombrePorId.get(bloqueado) ?? '') : ''}
                />

                <div class="flex items-center justify-between gap-2">
                  <span class="text-xs text-gray-500">
                    {cantRatings} calificación/es{bloqueado ? ' · 1 bloqueo' : ''}
                  </span>
                  <div class="flex gap-2">
                    {#if voto}
                      <button
                        type="submit"
                        formaction="?/eliminarVoto"
                        formnovalidate
                        class="text-xs text-red-500 hover:underline px-2"
                      >Borrar voto</button>
                      <input type="hidden" name="votoId" value={voto.id} />
                    {/if}
                    <button
                      type="submit"
                      class="btn-primary text-sm"
                      disabled={guardando || cantRatings === 0}
                    >
                      {guardando ? 'Guardando...' : 'Guardar voto'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

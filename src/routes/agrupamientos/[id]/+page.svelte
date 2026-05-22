<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/state';

  let { data, form } = $props();

  let sesion = $derived(data.sesion);
  let roster = $derived(data.roster);
  let votos = $derived(data.votos);
  let cerrada = $derived(sesion.estado === 'cerrada');

  let editando = $state(false);
  let confirmarEliminar = $state(false);
  let linkCopiado = $state(false);

  let votanteSet = $derived(new Set(votos.map((v) => v.votanteMoodleId)));
  let pendientes = $derived(roster.filter((a) => !votanteSet.has(a.id)));
  let progreso = $derived(roster.length ? Math.round((votos.length / roster.length) * 100) : 0);

  let linkPublico = $derived(sesion.votoToken ? `${page.url.origin}/votar/${sesion.votoToken}` : '');

  function copiarLink() {
    if (!linkPublico) return;
    navigator.clipboard.writeText(linkPublico);
    linkCopiado = true;
    setTimeout(() => (linkCopiado = false), 2000);
  }

  function iniciales(n: string) {
    return n.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  }
</script>

<svelte:head><title>{sesion.titulo} — Agrupamientos</title></svelte:head>

<div class="space-y-4">
  <a href="/agrupamientos" class="text-indigo-600 text-sm hover:underline">← Agrupamientos</a>

  {#if form?.error}
    <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">{form.error}</div>
  {/if}
  {#if form?.generados !== undefined}
    <div class="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-3 py-2">
      Se generaron {form.generados} voto(s) aleatorio(s).
    </div>
  {/if}

  <!-- Encabezado -->
  <div class="card space-y-2">
    {#if editando}
      <form method="POST" action="?/editarSesion"
        use:enhance={() => async ({ update, result }) => {
          await update({ reset: false });
          if (result.type === 'success') editando = false;
        }}
        class="space-y-3">
        <div>
          <label class="form-label" for="t">Título</label>
          <input id="t" type="text" name="titulo" value={sesion.titulo} maxlength="200" class="form-input" required />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="form-label" for="f">Fecha</label>
            <input id="f" type="date" name="fecha" value={sesion.fecha} class="form-input" required />
          </div>
          <div>
            <label class="form-label" for="c">Compañeros a evaluar</label>
            <input id="c" type="number" name="cantidadEvaluar" value={sesion.cantidadEvaluar}
              min="1" max="10" class="form-input" required />
          </div>
        </div>
        <div>
          <label class="form-label" for="n">Notas</label>
          <textarea id="n" name="notas" rows="2" maxlength="2000" class="form-input resize-none">{sesion.notas ?? ''}</textarea>
        </div>
        <div class="flex gap-2">
          <button type="submit" class="btn-primary text-sm flex-1">Guardar</button>
          <button type="button" onclick={() => (editando = false)} class="text-sm text-gray-500 px-3">Cancelar</button>
        </div>
      </form>
    {:else}
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0">
          <h2 class="text-lg font-bold text-gray-900">{sesion.titulo}</h2>
          <p class="text-xs text-gray-500">🎓 {sesion.cursoNombre} · 📅 {sesion.fecha}</p>
          <p class="text-xs text-gray-500">Cada alumno evalúa a {sesion.cantidadEvaluar} compañeros</p>
        </div>
        <span class="text-xs px-2 py-0.5 rounded-full flex-shrink-0
                     {cerrada ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}">
          {sesion.estado}
        </span>
      </div>
      {#if sesion.notas}<p class="text-sm text-gray-600 whitespace-pre-line">{sesion.notas}</p>{/if}
      <div class="flex flex-wrap gap-3 pt-1">
        <button onclick={() => (editando = true)} class="text-xs text-indigo-600 hover:underline">✏️ Editar</button>
        <form method="POST" action="?/cambiarEstado" use:enhance>
          <input type="hidden" name="estado" value={cerrada ? 'abierta' : 'cerrada'} />
          <button type="submit" class="text-xs text-gray-600 hover:underline">
            {cerrada ? '🔓 Reabrir votación' : '🔒 Cerrar votación'}
          </button>
        </form>
        <button onclick={() => (confirmarEliminar = !confirmarEliminar)} class="text-xs text-red-500 hover:underline">
          🗑 Eliminar sesión
        </button>
      </div>
      {#if confirmarEliminar}
        <div class="bg-red-50 border border-red-200 rounded-lg p-3 text-sm space-y-2">
          <p class="text-red-700">¿Eliminar la sesión y todos sus votos? No se puede deshacer.</p>
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

  <!-- Progreso de votación -->
  <div class="card space-y-2">
    <div class="flex items-center justify-between">
      <p class="text-sm font-semibold text-gray-800">Votación</p>
      <span class="text-sm text-gray-500">{votos.length} de {roster.length}</span>
    </div>
    <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
      <div class="h-full bg-indigo-600 transition-all" style="width: {progreso}%"></div>
    </div>
    <a href="/agrupamientos/{sesion.id}/votar"
      class="btn-primary w-full text-sm text-center block {cerrada ? 'opacity-50 pointer-events-none' : ''}">
      🗳️ Abrir votación
    </a>
    <p class="text-xs text-gray-500">
      Abrí esto en la compu/tablet del aula y los alumnos pasan de a uno a votar.
    </p>
  </div>

  <!-- Link público opcional -->
  <div class="card space-y-2">
    <p class="text-sm font-semibold text-gray-800">📱 Link para votar desde el celular <span class="text-gray-400 font-normal">(opcional)</span></p>
    {#if linkPublico}
      <div class="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 break-all">
        {linkPublico}
      </div>
      <div class="flex gap-2">
        <button onclick={copiarLink} class="btn-primary text-sm flex-1">
          {linkCopiado ? '✓ ¡Copiado!' : '🔗 Copiar link'}
        </button>
        <form method="POST" action="?/quitarToken" use:enhance>
          <button type="submit" class="text-sm text-red-500 px-3 py-2 hover:underline">Desactivar</button>
        </form>
      </div>
      <p class="text-xs text-gray-500">
        Cualquiera con el link puede entrar y votar eligiendo su nombre. Compartilo solo con el curso.
      </p>
    {:else}
      <form method="POST" action="?/generarToken" use:enhance>
        <button type="submit" class="text-sm text-indigo-600 hover:underline">+ Generar link público</button>
      </form>
    {/if}
  </div>

  <!-- Resultados -->
  <div class="grid grid-cols-2 gap-2">
    <a href="/agrupamientos/{sesion.id}/resultados"
      class="card text-center hover:border-indigo-300 transition-colors {votos.length < 2 ? 'opacity-50 pointer-events-none' : ''}">
      <p class="text-2xl">🧩</p>
      <p class="text-sm font-semibold text-gray-800">Armar grupos</p>
    </a>
    <a href="/agrupamientos/{sesion.id}/estadisticas"
      class="card text-center hover:border-indigo-300 transition-colors {votos.length < 1 ? 'opacity-50 pointer-events-none' : ''}">
      <p class="text-2xl">📊</p>
      <p class="text-sm font-semibold text-gray-800">Estadísticas</p>
    </a>
  </div>

  <!-- Listado de votos -->
  <div class="card space-y-2">
    <div class="flex items-center justify-between">
      <p class="text-sm font-semibold text-gray-800">Votos cargados</p>
      {#if votos.length > 0}
        <form method="POST" action="?/vaciarVotos" use:enhance>
          <button type="submit" class="text-xs text-red-500 hover:underline">Vaciar todos</button>
        </form>
      {/if}
    </div>

    {#if votos.length === 0}
      <p class="text-sm text-gray-500">Todavía no votó nadie.</p>
      <form method="POST" action="?/generarAleatorio" use:enhance>
        <button type="submit" class="text-xs text-indigo-600 hover:underline">
          ⚡ Generar votación aleatoria (para probar / modo rápido)
        </button>
      </form>
    {:else}
      <div class="space-y-1">
        {#each votos as v}
          <div class="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-gray-50">
            <div class="w-7 h-7 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
              {iniciales(v.votanteNombre)}
            </div>
            <span class="flex-1 text-sm text-gray-800 truncate">{v.votanteNombre}</span>
            {#if v.bloqueadoNombre}
              <span class="text-xs text-red-500">🚫 {v.bloqueadoNombre}</span>
            {/if}
            <form method="POST" action="?/eliminarVoto" use:enhance>
              <input type="hidden" name="votoId" value={v.id} />
              <button type="submit" class="text-xs text-gray-400 hover:text-red-500" title="Borrar este voto">✕</button>
            </form>
          </div>
        {/each}
      </div>
      {#if pendientes.length > 0}
        <p class="text-xs text-gray-500 pt-1">Faltan {pendientes.length}: {pendientes.map((a) => a.nombre).join(', ')}</p>
      {/if}
    {/if}
  </div>
</div>

<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import type { AlumnoRef } from '$lib/server/agrupamientos/tipos';

  let { data, form } = $props();

  let sesion = $derived(data.sesion);
  type Modo = 'afinidad' | 'heterogeneo' | 'rendimiento' | 'aleatorio' | 'manual';
  let modo = $state<Modo>('afinidad');
  let nombreGuardar = $state('');
  let mostrarGuardar = $state(false);

  let conductaPorId = $derived(new Map(data.conducta.map((c) => [c.id, c])));

  // ── Aleatorio (cliente) ───────────────────────────────────────────────────
  let aleatorioGrupos = $state<AlumnoRef[][]>([]);
  function mezclarAleatorio() {
    const arr = [...data.roster];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    const grupos: AlumnoRef[][] = [];
    for (let i = 0; i < arr.length; i += data.tamano) grupos.push(arr.slice(i, i + data.tamano));
    aleatorioGrupos = grupos;
  }

  // ── Manual (cliente) ──────────────────────────────────────────────────────
  let manualGrupos = $state<AlumnoRef[][]>([]);
  let grupoActivo = $state(0);
  function initManual() {
    const n = Math.max(1, Math.ceil(data.roster.length / data.tamano));
    manualGrupos = Array.from({ length: n }, () => []);
    grupoActivo = 0;
  }
  let asignadosManual = $derived(new Set(manualGrupos.flat().map((a) => a.id)));
  let sinAsignar = $derived(data.roster.filter((a) => !asignadosManual.has(a.id)));
  function asignar(al: AlumnoRef) {
    const g = [...manualGrupos];
    g[grupoActivo] = [...g[grupoActivo], al];
    manualGrupos = g;
  }
  function quitar(gi: number, al: AlumnoRef) {
    const g = [...manualGrupos];
    g[gi] = g[gi].filter((x) => x.id !== al.id);
    manualGrupos = g;
  }
  function agregarGrupo() {
    manualGrupos = [...manualGrupos, []];
    grupoActivo = manualGrupos.length - 1;
  }

  $effect(() => {
    if (modo === 'aleatorio' && aleatorioGrupos.length === 0 && data.roster.length > 0) mezclarAleatorio();
    if (modo === 'manual' && manualGrupos.length === 0 && data.roster.length > 0) initManual();
  });

  function cambiarTamano(n: number) {
    const params = new URLSearchParams();
    params.set('tamano', String(n));
    if (data.rendimiento) params.set('rendimiento', '1');
    goto(`?${params}`, { invalidateAll: true, noScroll: true });
  }
  function calcularRendimiento() {
    goto(`?tamano=${data.tamano}&rendimiento=1`, { invalidateAll: true, noScroll: true });
  }

  // Grupos de la pestaña activa, normalizados
  let gruposActuales = $derived.by<AlumnoRef[][]>(() => {
    if (modo === 'afinidad') return data.afinidad.map((g) => g.miembros);
    if (modo === 'heterogeneo')
      return data.heterogeneo.map((g) => g.miembros.map((m) => ({ id: m.id, nombre: m.nombre })));
    if (modo === 'rendimiento')
      return (data.rendimiento?.grupos ?? []).map((g) => g.map((m) => ({ id: m.id, nombre: m.nombre })));
    if (modo === 'aleatorio') return aleatorioGrupos;
    return manualGrupos;
  });

  function iniciales(n: string) {
    return n.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  }
  function conductaResumen(id: number): string {
    const c = conductaPorId.get(id);
    if (!c) return '';
    const partes: string[] = [];
    if (c.faltas) partes.push(`${c.faltas} faltas`);
    if (c.amonestaciones) partes.push(`${c.amonestaciones} amonest.`);
    if (c.participacion != null) partes.push(`particip. ${c.participacion}`);
    return partes.join(' · ');
  }

  const NIVEL_COLOR: Record<string, string> = {
    alto: 'bg-green-100 text-green-700',
    medio: 'bg-blue-100 text-blue-700',
    bajo: 'bg-gray-100 text-gray-600'
  };
  const MODOS: { id: Modo; lbl: string; desc: string }[] = [
    { id: 'afinidad', lbl: '🤝 Afinidad', desc: 'Junta a los que se eligieron entre sí y evita los bloqueos.' },
    { id: 'heterogeneo', lbl: '⚖️ Heterogéneo', desc: 'Mezcla parejo: populares y menos elegidos repartidos en cada grupo.' },
    { id: 'rendimiento', lbl: '📚 Rendimiento', desc: 'Usa las notas de Moodle: arma grupos mixtos con distintos niveles académicos.' },
    { id: 'aleatorio', lbl: '🎲 Aleatorio', desc: 'Grupos al azar, sin tener en cuenta la votación.' },
    { id: 'manual', lbl: '✋ Manual', desc: 'Armás los grupos vos: elegí un grupo y tocá a los alumnos para asignarlos.' }
  ];
</script>

<svelte:head><title>Grupos — {sesion.titulo}</title></svelte:head>

<div class="space-y-4">
  <div class="flex items-center gap-2">
    <a href="/institucional/agrupamientos/{sesion.id}" class="text-indigo-600 text-sm hover:underline">← Panel</a>
    <h2 class="text-lg font-bold text-gray-900">Armar grupos</h2>
  </div>

  {#if form?.error}
    <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">{form.error}</div>
  {/if}
  {#if form?.ok}
    <div class="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-3 py-2">Guardado.</div>
  {/if}

  <div class="card">
    <p class="text-sm font-semibold text-gray-800">{sesion.titulo}</p>
    <p class="text-xs text-gray-500">🎓 {sesion.cursoNombre} · 🗳️ {data.totalVotos} votos</p>
  </div>

  <!-- Selector de modo -->
  <div class="bg-white border border-gray-200 rounded-xl overflow-x-auto">
    <nav class="flex min-w-max">
      {#each MODOS as m}
        <button onclick={() => (modo = m.id)}
          class="px-3 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors
                 {modo === m.id
                   ? 'border-indigo-600 text-indigo-700 bg-indigo-50'
                   : 'border-transparent text-gray-600 hover:bg-gray-50'}">
          {m.lbl}
        </button>
      {/each}
    </nav>
  </div>

  <p class="text-xs text-gray-500">{MODOS.find((m) => m.id === modo)?.desc}</p>

  <!-- Controles -->
  <div class="flex items-center gap-3 flex-wrap">
    {#if modo !== 'afinidad'}
      <div class="flex items-center gap-1.5">
        <span class="text-xs text-gray-500">Tamaño:</span>
        {#each [2, 3, 4, 5] as n}
          <button onclick={() => cambiarTamano(n)}
            class="w-7 h-7 rounded-lg text-xs font-semibold transition-colors
                   {data.tamano === n ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-indigo-100'}">
            {n}
          </button>
        {/each}
      </div>
    {/if}
    {#if modo === 'aleatorio'}
      <button onclick={mezclarAleatorio} class="text-xs text-indigo-600 hover:underline">🎲 Volver a mezclar</button>
    {/if}
    {#if modo === 'manual'}
      <button onclick={initManual} class="text-xs text-gray-500 hover:underline">↺ Reiniciar</button>
      <button onclick={agregarGrupo} class="text-xs text-indigo-600 hover:underline">+ Grupo</button>
    {/if}
    {#if gruposActuales.length > 0}
      <button onclick={() => (mostrarGuardar = !mostrarGuardar)} class="text-xs text-indigo-600 hover:underline ml-auto">
        💾 Guardar esta agrupación
      </button>
    {/if}
  </div>

  {#if mostrarGuardar && gruposActuales.length > 0}
    <form method="POST" action="?/guardar"
      use:enhance={() => async ({ update, result }) => {
        await update({ reset: false });
        if (result.type === 'success') { mostrarGuardar = false; nombreGuardar = ''; }
      }}
      class="card flex gap-2 items-end">
      <div class="flex-1">
        <label class="form-label" for="ng">Nombre de la agrupación</label>
        <input id="ng" type="text" name="nombre" bind:value={nombreGuardar}
          placeholder="Ej: Grupos TP de octubre" class="form-input text-sm" required />
      </div>
      <input type="hidden" name="modo" value={modo} />
      <input type="hidden" name="gruposJson"
        value={JSON.stringify(gruposActuales.map((g) => g.map((m) => ({ id: m.id, nombre: m.nombre }))))} />
      <button type="submit" class="btn-primary text-sm">Guardar</button>
    </form>
  {/if}

  <!-- Modo rendimiento sin calcular -->
  {#if modo === 'rendimiento' && !data.rendimiento}
    <div class="card text-center py-8 space-y-3">
      <p class="text-3xl">📚</p>
      <p class="text-sm text-gray-600">
        Este modo consulta las notas de cada alumno en Moodle y arma grupos mixtos
        (fuertes y débiles repartidos). Puede tardar unos segundos.
      </p>
      <button onclick={calcularRendimiento} class="btn-primary text-sm">Calcular con notas de Moodle</button>
    </div>
  {/if}

  <!-- Modo manual: alumnos sin asignar -->
  {#if modo === 'manual'}
    <div class="card space-y-2">
      <p class="text-sm font-semibold text-gray-800">Sin asignar ({sinAsignar.length})</p>
      <p class="text-xs text-gray-500">Grupo activo: <strong>Grupo {grupoActivo + 1}</strong>. Tocá un alumno para asignarlo ahí.</p>
      <div class="flex flex-wrap gap-1.5">
        {#each sinAsignar as al}
          <button onclick={() => asignar(al)}
            class="text-xs px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-indigo-100 transition-colors">
            {al.nombre}
          </button>
        {/each}
        {#if sinAsignar.length === 0}
          <span class="text-xs text-green-600">Todos asignados ✓</span>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Grupos -->
  {#if gruposActuales.length === 0}
    {#if modo !== 'rendimiento'}
      <div class="card text-center py-8"><p class="text-gray-500 text-sm">No hay grupos para mostrar.</p></div>
    {/if}
  {:else}
    {#if modo === 'rendimiento' && data.rendimiento && data.rendimiento.sinNota > 0}
      <p class="text-xs text-amber-600">
        ⚠️ {data.rendimiento.sinNota} alumno(s) sin nota en Moodle: se ubicaron igual, pero conviene revisarlos.
      </p>
    {/if}
    <div class="grid gap-2 sm:grid-cols-2">
      {#each gruposActuales as grupo, i}
        <div class="card space-y-2 {modo === 'manual' && grupoActivo === i ? 'border-indigo-400 ring-1 ring-indigo-200' : ''}">
          <div class="flex items-center justify-between">
            <button onclick={() => modo === 'manual' && (grupoActivo = i)}
              class="text-sm font-semibold text-gray-800 {modo === 'manual' ? 'hover:text-indigo-600' : 'cursor-default'}">
              Grupo {i + 1}
            </button>
            {#if modo === 'afinidad' && data.afinidad[i]}
              <span class="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">afinidad {data.afinidad[i].afinidadPromedio}</span>
            {/if}
          </div>
          <div class="space-y-1">
            {#each grupo as m, j}
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {iniciales(m.nombre)}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-gray-800 truncate">{m.nombre}</p>
                  {#if modo === 'rendimiento'}
                    {@const nota = data.rendimiento?.grupos[i]?.[j]?.nota}
                    <p class="text-xs text-gray-400">
                      {nota != null ? `nota ${Math.round(nota)}` : 'sin nota'}{conductaResumen(m.id) ? ' · ' + conductaResumen(m.id) : ''}
                    </p>
                  {/if}
                </div>
                {#if modo === 'heterogeneo' && data.heterogeneo[i]?.miembros[j]}
                  <span class="text-xs px-2 py-0.5 rounded-full {NIVEL_COLOR[data.heterogeneo[i].miembros[j].nivel]}">
                    {data.heterogeneo[i].miembros[j].nivel}
                  </span>
                {/if}
                {#if modo === 'manual'}
                  <button onclick={() => quitar(i, m)} class="text-xs text-gray-400 hover:text-red-500">✕</button>
                {/if}
              </div>
            {/each}
            {#if grupo.length === 0}
              <p class="text-xs text-gray-400 italic">Vacío</p>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Agrupaciones guardadas -->
  {#if data.guardados.length > 0}
    <div class="card space-y-2">
      <p class="text-sm font-semibold text-gray-800">Agrupaciones guardadas</p>
      {#each data.guardados as g}
        <div class="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-gray-50">
          <span class="flex-1 text-sm text-gray-800">
            {g.nombre}<span class="text-xs text-gray-400"> · {g.modo} · {g.grupos.length} grupos</span>
          </span>
          <form method="POST" action="?/eliminar" use:enhance>
            <input type="hidden" name="grupoId" value={g.id} />
            <button type="submit" class="text-xs text-gray-400 hover:text-red-500">✕</button>
          </form>
        </div>
      {/each}
    </div>
  {/if}
</div>

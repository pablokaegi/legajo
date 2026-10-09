<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import type { AlumnoRef } from '$lib/server/agrupamientos/tipos';

  let { data, form } = $props();

  let sesion = $derived(data.sesion);
  type Modo = 'afinidad' | 'heterogeneo' | 'rendimiento' | 'aleatorio' | 'manual' | 'ubicacion' | 'tutoria';
  let modo = $state<Modo>('afinidad');
  let nombreGuardar = $state('');
  let mostrarGuardar = $state(false);
  let verRoles = $state(false);
  let columnas = $state(3);

  let rolInfo = $derived(new Map(data.rolesInfo.map((r) => [r.id as string, r])));
  /** Rol (vista previa) de un alumno en la pestaña activa. */
  function rolDe(id: number): string | null {
    const r = data.roles[modo]?.[id];
    if (!r) return null;
    return rolInfo.get(r)?.nombre ?? 'Apoyo';
  }
  let admiteRoles = $derived(modo !== 'ubicacion' && modo !== 'tutoria');
  let usaNotas = $derived(modo === 'rendimiento' || modo === 'tutoria');
  let evaluando = $state<number | null>(null);
  const EVAL_LBL: Record<string, string> = {
    funciono: '👍 Funcionó', regular: '😐 Regular', no_funciono: '👎 No funcionó'
  };

  let conductaPorId = $derived(new Map(data.conducta.map((c) => [c.id, c])));

  // ── Navegación (todos los modos se calculan en el servidor) ───────────────
  function navegar(cambios: { tamano?: number; rendimiento?: boolean; semilla?: number }) {
    const params = new URLSearchParams();
    params.set('tamano', String(cambios.tamano ?? data.tamano));
    if (cambios.rendimiento ?? !!data.rendimiento) params.set('rendimiento', '1');
    params.set('semilla', String(cambios.semilla ?? data.semilla));
    goto(`?${params}`, { invalidateAll: true, noScroll: true, keepFocus: true });
  }
  // El aleatorio lo arma el servidor (respeta los pedidos de no quedar juntos).
  function mezclarAleatorio() {
    navegar({ semilla: Math.floor(Math.random() * 1e9) });
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
    if (modo === 'manual' && manualGrupos.length === 0 && data.roster.length > 0) initManual();
  });

  function cambiarTamano(n: number) {
    navegar({ tamano: n });
  }
  function calcularRendimiento() {
    navegar({ rendimiento: true });
  }

  // Grupos de la pestaña activa, normalizados
  let gruposActuales = $derived.by<AlumnoRef[][]>(() => {
    if (modo === 'afinidad') return data.afinidad.map((g) => g.miembros);
    if (modo === 'heterogeneo')
      return data.heterogeneo.map((g) => g.miembros.map((m) => ({ id: m.id, nombre: m.nombre })));
    if (modo === 'rendimiento')
      return (data.rendimiento?.grupos ?? []).map((g) => g.map((m) => ({ id: m.id, nombre: m.nombre })));
    if (modo === 'aleatorio') return data.aleatorio;
    if (modo === 'ubicacion') return data.ubicacion.map((b) => b.asientos);
    if (modo === 'tutoria') return data.tutoria ?? [];
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
    { id: 'afinidad', lbl: '🤝 Afinidad', desc: 'Grupos parejos donde cada uno queda con alguien que eligió o que lo eligió (prioriza las elecciones recíprocas). Nunca junta bloqueos.' },
    { id: 'heterogeneo', lbl: '⚖️ Heterogéneo', desc: 'Mezcla parejo a los más y menos elegidos, cuidando que cada uno tenga al menos un vínculo en su grupo.' },
    { id: 'rendimiento', lbl: '📚 Rendimiento', desc: 'Usa las notas de Moodle: grupos mixtos con distintos niveles académicos, sin juntar bloqueos.' },
    { id: 'aleatorio', lbl: '🎲 Aleatorio', desc: 'Grupos al azar (igual respeta los pedidos de no quedar juntos).' },
    { id: 'manual', lbl: '✋ Manual', desc: 'Armás los grupos vos: elegí un grupo y tocá a los alumnos para asignarlos.' },
    { id: 'tutoria', lbl: '🧑‍🏫 Tutoría', desc: 'Parejas de tutoría entre pares con las notas de Moodle: se ordena el curso, se parte al medio y se junta al 1.º de cada mitad, al 2.º, etc. (brecha moderada, como en PALS). Conviene alternar los papeles en parte de la actividad.' },
    { id: 'ubicacion', lbl: '🪑 Ubicación', desc: 'Plano de bancos de a dos: quienes conviene acompañar quedan junto a un compañero bien aceptado que no los rechaza (y, si se puede, que eligieron). Esos bancos se intercalan para que no se note.' }
  ];
</script>

<svelte:head><title>Grupos — {sesion.titulo}</title></svelte:head>

<div class="space-y-4">
  <div class="flex items-center gap-2">
    <a href="/agrupamientos/{sesion.id}" class="text-indigo-600 text-sm hover:underline">← Panel</a>
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
    <p class="text-xs text-gray-500">
      🎓 {sesion.cursoNombre} · 🗳️ {data.totalVotos} votos{data.bloqueos ? ` · 🚫 ${data.bloqueos} pedidos de no quedar juntos (respetados)` : ''}
    </p>
  </div>
  {#if data.modo !== 'nominacion'}
    <p class="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
      Sesión con el formato anterior: los vínculos son parciales y los grupos por afinidad, orientativos.
    </p>
  {/if}

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
    {#if modo === 'ubicacion'}
      <div class="flex items-center gap-1.5">
        <span class="text-xs text-gray-500">Columnas de bancos:</span>
        {#each [2, 3, 4] as n}
          <button onclick={() => (columnas = n)}
            class="w-7 h-7 rounded-lg text-xs font-semibold transition-colors
                   {columnas === n ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-indigo-100'}">
            {n}
          </button>
        {/each}
      </div>
    {:else if modo !== 'tutoria'}
      <div class="flex items-center gap-1.5">
        <span class="text-xs text-gray-500">Tamaño:</span>
        {#each [2, 3, 4, 5, 6] as n}
          <button onclick={() => cambiarTamano(n)}
            class="w-7 h-7 rounded-lg text-xs font-semibold transition-colors
                   {data.tamano === n ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-indigo-100'}">
            {n}
          </button>
        {/each}
      </div>
      <label class="flex items-center gap-1.5 text-xs text-gray-600">
        <input type="checkbox" bind:checked={verRoles} /> 🎭 Roles rotativos
      </label>
    {/if}
    {#if modo === 'aleatorio'}
      <button onclick={mezclarAleatorio} class="text-xs text-indigo-600 hover:underline">🎲 Volver a mezclar</button>
    {/if}
    {#if modo === 'manual'}
      <button onclick={initManual} class="text-xs text-gray-500 hover:underline">↺ Reiniciar</button>
      <button onclick={agregarGrupo} class="text-xs text-indigo-600 hover:underline">+ Grupo</button>
    {/if}
    {#if gruposActuales.length > 0 && data.puedeGestionar}
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
        value={JSON.stringify(gruposActuales.map((g) => g.map((m) => ({ id: m.id, nombre: m.nombre, rol: (m as { rol?: string }).rol }))))} />
      <input type="hidden" name="conRoles" value={verRoles && admiteRoles ? '1' : '0'} />
      <input type="hidden" name="columnas" value={columnas} />
      <button type="submit" class="btn-primary text-sm">Guardar{verRoles && admiteRoles ? ' con roles' : ''}</button>
    </form>
  {/if}

  {#if verRoles && admiteRoles}
    <div class="card space-y-1.5">
      <p class="text-sm font-semibold text-gray-800">🎭 Roles rotativos</p>
      <p class="text-xs text-gray-500">
        Los roles más visibles (Coordinación y Relatoría) van primero a quienes conviene acompañar, para que el
        grupo vea lo que pueden aportar; y rotan respecto de las agrupaciones guardadas antes en este curso.
        Antes de empezar, contale al grupo qué habilidades hacen falta para la tarea: nadie las tiene todas y
        todos tienen alguna. — Cohen & Lotan, Instrucción Compleja.
      </p>
      {#each data.rolesInfo as r}
        <p class="text-xs text-gray-700"><strong>{r.nombre}:</strong> {r.descripcion}</p>
      {/each}
      {#if modo === 'manual'}
        <p class="text-xs text-indigo-700">En el modo manual los roles se asignan al guardar.</p>
      {/if}
    </div>
  {/if}

  <!-- Modos con notas sin calcular -->
  {#if usaNotas && !data.rendimiento}
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
    {#if !usaNotas}
      <div class="card text-center py-8"><p class="text-gray-500 text-sm">No hay grupos para mostrar.</p></div>
    {/if}
  {:else if modo === 'ubicacion'}
    <!-- Plano del aula -->
    <div class="card space-y-3">
      <div class="bg-gray-700 text-white text-xs text-center rounded py-1.5">🧑‍🏫 Pizarrón</div>
      <div class="grid gap-2" style="grid-template-columns: repeat({columnas}, minmax(0, 1fr));">
        {#each data.ubicacion as banco, i}
          <div class="rounded-lg border p-2 space-y-1 {banco.motivo ? 'border-indigo-200 bg-indigo-50/40' : 'border-gray-200 bg-white'}"
            title={banco.motivo ?? ''}>
            <p class="text-[10px] text-gray-400">Banco {i + 1}</p>
            {#each banco.asientos as m}
              <p class="text-xs text-gray-800 truncate">{m.nombre}</p>
            {/each}
          </div>
        {/each}
      </div>
      {#if data.ubicacion.some((b) => b.motivo)}
        <details class="text-xs text-gray-600">
          <summary class="cursor-pointer text-indigo-700">Por qué se armaron así algunos bancos (solo para vos)</summary>
          <ul class="mt-1 space-y-0.5">
            {#each data.ubicacion.filter((b) => b.motivo) as b}
              <li>• {b.asientos.map((m) => m.nombre).join(' + ')} — {b.motivo}</li>
            {/each}
          </ul>
        </details>
      {/if}
      <p class="text-[11px] text-gray-400">
        Sentar a un alumno poco aceptado junto a un compañero bien aceptado que no lo rechaza mejora cómo lo ve el
        resto del curso. — van den Berg & Stoltz (2018); van den Berg, Segers & Cillessen (2012).
      </p>
    </div>
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
              <span class="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                💞 {data.afinidad[i].mutuas} recíproca{data.afinidad[i].mutuas === 1 ? '' : 's'} · {data.afinidad[i].vinculos} elecciones
              </span>
            {/if}
          </div>
          {#if modo === 'afinidad' && data.afinidad[i]?.sinVinculo.length}
            <p class="text-xs text-amber-600">
              ⚠️ Sin vínculo en este grupo: {data.afinidad[i].sinVinculo.map((m) => m.nombre).join(', ')}
            </p>
          {/if}
          <div class="space-y-1">
            {#each grupo as m, j}
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {iniciales(m.nombre)}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-gray-800 truncate">{m.nombre}</p>
                  {#if modo === 'tutoria'}
                    {@const t = data.tutoria?.[i]?.[j]}
                    <p class="text-xs text-gray-400">{t?.nota != null ? `nota ${Math.round(t.nota)}` : 'sin nota'}</p>
                  {/if}
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
                {#if modo === 'tutoria' && data.tutoria?.[i]?.[j]}
                  <span class="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex-shrink-0">
                    {rolInfo.get(data.tutoria[i][j].rol)?.nombre}
                  </span>
                {/if}
                {#if verRoles && admiteRoles && rolDe(m.id)}
                  <span class="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex-shrink-0">{rolDe(m.id)}</span>
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
        <div class="rounded-lg bg-gray-50">
          <div class="flex items-center gap-2 py-1.5 px-2">
            <details class="flex-1 text-sm text-gray-800">
              <summary class="cursor-pointer">
                {g.nombre}<span class="text-xs text-gray-400"> · {g.modo} · {g.grupos.length} {g.modo === 'ubicacion' ? 'bancos' : 'grupos'}</span>
              </summary>
              <div class="mt-1.5 grid gap-1.5 sm:grid-cols-2">
                {#each g.grupos as gr, i}
                  <div class="bg-white border border-gray-200 rounded p-1.5">
                    <p class="text-[10px] text-gray-400">{g.modo === 'ubicacion' ? 'Banco' : 'Grupo'} {i + 1}</p>
                    {#each gr as m}
                      {@const rol = (m as { rol?: string }).rol}
                      <p class="text-xs text-gray-700">
                        {m.nombre}{#if rol}<span class="text-amber-700"> · {rolInfo.get(rol)?.nombre ?? rol}</span>{/if}
                      </p>
                    {/each}
                  </div>
                {/each}
              </div>
            </details>
            {#if data.puedeGestionar}
              <form method="POST" action="?/eliminar"
                use:enhance={({ cancel }) => { if (!confirm('¿Borrar esta agrupación guardada?')) cancel(); }}>
                <input type="hidden" name="grupoId" value={g.id} />
                <button type="submit" class="text-xs text-gray-400 hover:text-red-500">✕</button>
              </form>
            {/if}
          </div>
          <!-- Evaluación local: ¿cómo funcionó? -->
          <div class="px-2 pb-1.5 flex items-center gap-2 flex-wrap">
            {#if g.evaluacion}
              <span class="text-xs px-2 py-0.5 rounded-full bg-white border border-gray-200">{EVAL_LBL[g.evaluacion] ?? g.evaluacion}</span>
              {#if g.evaluacionNota}<span class="text-xs text-gray-500 italic">“{g.evaluacionNota}”</span>{/if}
            {/if}
            {#if data.puedeGestionar}
              {#if evaluando === g.id}
                <form method="POST" action="?/evaluar" class="flex flex-wrap items-center gap-1.5 w-full"
                  use:enhance={() => async ({ update, result }) => {
                    await update({ reset: false });
                    if (result.type === 'success') evaluando = null;
                  }}>
                  <input type="hidden" name="grupoId" value={g.id} />
                  <input name="nota" maxlength="1000" placeholder="¿Qué pasó? (opcional)"
                    class="form-input text-xs flex-1 min-w-40" value={g.evaluacionNota ?? ''} />
                  {#each Object.entries(EVAL_LBL) as [k, lbl]}
                    <button type="submit" name="evaluacion" value={k}
                      class="text-xs px-2 py-1 rounded-lg bg-gray-100 hover:bg-indigo-100">{lbl}</button>
                  {/each}
                  <button type="button" onclick={() => (evaluando = null)} class="text-xs text-gray-400">Cancelar</button>
                </form>
              {:else}
                <button onclick={() => (evaluando = g.id)} class="text-xs text-indigo-600 hover:underline">
                  {g.evaluacion ? 'Cambiar evaluación' : '¿Cómo funcionó?'}
                </button>
              {/if}
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<script lang="ts">
  import { INSTITUCION } from '$lib/institucional.js';
  import { enhance } from '$app/forms';
  import type { MoodleUser } from '$lib/server/moodle/types';

  let { data, form } = $props();
  const { salida, autorizaciones } = data;
  let editando = $state(false);

  const ESTADO_COLOR: Record<string, string> = {
    borrador:  'bg-gray-100 text-gray-600',
    aprobado:  'bg-blue-100 text-blue-700',
    realizado: 'bg-green-100 text-green-700',
    cancelado: 'bg-red-100 text-red-600'
  };
  const ESTADOS = ['borrador', 'aprobado', 'realizado', 'cancelado'];

  // ── Sección "Agregar alumnos" ───────────────────────────────────────────────
  let mostrarAgregar = $state(false);
  let cursosDisp = $state<{ id: number; nombre: string }[]>([]);
  let cursoElegido = $state<{ id: number; nombre: string } | null>(null);
  let alumnosCurso = $state<{ id: number; fullname: string }[]>([]);
  let seleccionados = $state<Set<number>>(new Set());
  let alumnosNombres = $state<Map<number, string>>(new Map());
  let cargandoCursos = $state(false);
  let cargandoAlumnos = $state(false);
  let busqueda = $state('');
  let guardandoAlumnos = $state(false);

  async function cargarCursos() {
    if (cursosDisp.length > 0) { mostrarAgregar = !mostrarAgregar; return; }
    cargandoCursos = true;
    mostrarAgregar = true;
    try {
      const res  = await fetch('/api/moodle/cursos');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Error');
      cursosDisp = json.map((c: { id: number; fullname: string; displayname?: string }) => ({
        id: c.id, nombre: c.displayname || c.fullname
      }));
    } catch (e) {
      alert('Error al cargar cursos: ' + (e instanceof Error ? e.message : e));
      mostrarAgregar = false;
    } finally {
      cargandoCursos = false;
    }
  }

  async function seleccionarCurso(id: number, nombre: string) {
    cursoElegido     = { id, nombre };
    cargandoAlumnos  = true;
    alumnosCurso     = [];
    seleccionados    = new Set();
    busqueda         = '';
    try {
      const res  = await fetch(`/api/moodle/cursos/${id}/alumnos`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Error');
      alumnosCurso   = json;
      alumnosNombres = new Map(json.map((a: MoodleUser) => [a.id, a.fullname]));
    } catch (e) {
      alert('Error al cargar alumnos: ' + (e instanceof Error ? e.message : e));
    } finally {
      cargandoAlumnos = false;
    }
  }

  function toggleAlumno(id: number) {
    const s = new Set(seleccionados);
    s.has(id) ? s.delete(id) : s.add(id);
    seleccionados = s;
  }

  function seleccionarTodos() { seleccionados = new Set(alumnosFiltrados.map(a => a.id)); }
  function deseleccionarTodos() { seleccionados = new Set(); }

  let alumnosFiltrados = $derived(
    busqueda.trim()
      ? alumnosCurso.filter(a => a.fullname.toLowerCase().includes(busqueda.toLowerCase()))
      : alumnosCurso
  );

  // Alumnos que ya tienen autorización generada
  const idsCargados = $derived(new Set(autorizaciones.map((a: { alumnoMoodleId: number }) => a.alumnoMoodleId)));

  // Payload para el form
  let alumnosPayload = $derived(
    [...seleccionados].map(id => ({
      alumnoMoodleId: id,
      alumnoNombre:   alumnosNombres.get(id) ?? ''
    }))
  );

  // ── Link público por alumno ─────────────────────────────────────────────────
  function linkDeAlumno(token: string) {
    if (typeof window !== 'undefined') return `${window.location.origin}/autorizar/${token}`;
    return `/autorizar/${token}`;
  }

  // Tracking de copiados para feedback visual
  let copiados = $state<Set<string>>(new Set());

  function copiarLink(token: string) {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(linkDeAlumno(token));
      const s = new Set(copiados);
      s.add(token);
      copiados = s;
      setTimeout(() => {
        const s2 = new Set(copiados);
        s2.delete(token);
        copiados = s2;
      }, 2000);
    }
  }

  const pendientes = $derived(autorizaciones.filter((a: { documentoPath: string | null }) => !a.documentoPath).length);
  const recibidas  = $derived(autorizaciones.filter((a: { documentoPath: string | null }) =>  a.documentoPath).length);
</script>

<svelte:head><title>{salida.titulo} — Legajo</title></svelte:head>

<!-- VISTA IMPRESIÓN -->
{#if data.imprimir}
  <div class="print-only max-w-2xl mx-auto p-6 text-sm text-gray-900">
    <div class="flex items-center gap-4 border-b-2 border-gray-800 pb-4 mb-6">
      <img src={INSTITUCION.logo} alt="Logo" class="h-16 w-16 object-contain"
        onerror={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
      <div class="flex-1">
        <p class="font-bold text-base">{INSTITUCION.nombre}</p>
        <p class="text-xs">{INSTITUCION.nivel}</p>
        <p class="text-xs">{INSTITUCION.direccion}</p>
        <p class="text-xs">Tel.: {INSTITUCION.telefono} | {INSTITUCION.email}</p>
      </div>
    </div>
    <h1 class="text-center text-base font-bold uppercase mb-1">AUTORIZACIÓN DE SALIDA DIDÁCTICA</h1>
    <p class="text-center text-xs text-gray-500 mb-6">Formulario de autorización – Complete y devuelva firmado</p>
    <div class="border border-gray-300 rounded p-4 mb-5 space-y-2">
      <p><strong>Actividad:</strong> {salida.titulo}</p>
      <p><strong>Destino:</strong> {salida.destino}</p>
      <p><strong>Fecha:</strong> {salida.fecha}</p>
      <p><strong>Curso / Grupo:</strong> {salida.cursoNombre}</p>
      <p><strong>Docente responsable:</strong> {salida.responsableNombre}</p>
      {#if salida.cantidadAlumnos}<p><strong>Cantidad de alumnos:</strong> {salida.cantidadAlumnos}</p>{/if}
      {#if salida.costoEstimado}<p><strong>Costo estimado por alumno:</strong> {salida.costoEstimado}</p>{/if}
      {#if salida.descripcion}<p class="mt-2 text-xs text-gray-700 whitespace-pre-wrap">{salida.descripcion}</p>{/if}
    </div>
    <div class="border border-gray-300 rounded p-4 mb-5">
      <p class="font-semibold mb-4">Autorización del padre / madre / tutor</p>
      <p class="mb-6 text-xs">Yo, _________________________________ (nombre y apellido), DNI ___________________,
      en carácter de padre / madre / tutor del/la alumno/a
      _________________________________, autorizo su participación en la salida didáctica descripta arriba.</p>
      <div class="flex gap-8 mt-6">
        <div class="flex-1">
          <div class="border-b border-gray-400 mb-1 h-8"></div>
          <p class="text-xs text-center">Firma y aclaración</p>
        </div>
        <div class="w-36">
          <div class="border-b border-gray-400 mb-1 h-8"></div>
          <p class="text-xs text-center">Fecha</p>
        </div>
      </div>
    </div>
    <p class="text-xs text-gray-400 text-center">{INSTITUCION.nombre} · {INSTITUCION.direccion}</p>
    <div class="no-print mt-6 text-center">
      <button onclick={() => window.print()} class="btn-primary text-sm">🖨 Imprimir</button>
      <a href="/institucional/salidas/{salida.id}" class="ml-3 text-sm text-indigo-600 hover:underline">← Volver</a>
    </div>
  </div>

<!-- VISTA NORMAL -->
{:else}
  <div class="space-y-4">
    <div>
      <a href="/institucional/salidas" class="text-indigo-600 text-sm hover:underline">← Salidas</a>
      <div class="flex items-start justify-between mt-1 gap-2">
        <h2 class="text-lg font-bold text-gray-900 flex-1">{salida.titulo}</h2>
        <span class="text-xs px-2 py-0.5 rounded-full flex-shrink-0 {ESTADO_COLOR[salida.estado] ?? 'bg-gray-100 text-gray-600'}">{salida.estado}</span>
      </div>
    </div>

    {#if form?.error}
      <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{form.error}</div>
    {/if}

    {#if !editando}
      <!-- Datos de la salida -->
      <div class="card space-y-3">
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">Fecha</span>
          <span class="font-medium">{salida.fecha}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">Destino</span>
          <span class="font-medium">{salida.destino}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">Curso / Grupo</span>
          <span class="font-medium">{salida.cursoNombre}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">Docente responsable</span>
          <span class="font-medium">{salida.responsableNombre}</span>
        </div>
        {#if salida.cantidadAlumnos}
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Cantidad de alumnos</span>
            <span class="font-medium">{salida.cantidadAlumnos}</span>
          </div>
        {/if}
        {#if salida.costoEstimado}
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Costo estimado</span>
            <span class="font-medium">{salida.costoEstimado}</span>
          </div>
        {/if}
        {#if salida.descripcion}
          <div class="text-sm">
            <span class="text-gray-500 block mb-1">Descripción</span>
            <p class="text-gray-700 whitespace-pre-wrap text-xs">{salida.descripcion}</p>
          </div>
        {/if}
        {#if salida.notas}
          <div class="text-sm">
            <span class="text-gray-500 block mb-1">Notas internas</span>
            <p class="text-gray-600 italic text-xs whitespace-pre-wrap">{salida.notas}</p>
          </div>
        {/if}
      </div>

      <!-- ── SECCIÓN AUTORIZACIONES POR ALUMNO ─────────────────────────────── -->
      <div class="border border-gray-200 rounded-xl overflow-hidden">

        <!-- Header con contador -->
        <div class="bg-gray-50 px-4 py-3 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-sm font-semibold text-gray-700">👥 Autorizaciones</span>
            {#if autorizaciones.length > 0}
              <span class="text-xs bg-green-600 text-white px-1.5 py-0.5 rounded-full">{recibidas}/{autorizaciones.length}</span>
            {/if}
          </div>
          <button
            type="button"
            onclick={cargarCursos}
            class="text-xs text-indigo-600 hover:underline font-medium"
          >
            {cargandoCursos ? 'Cargando...' : '+ Agregar alumnos'}
          </button>
        </div>

        <!-- Lista de alumnos con estado -->
        {#if autorizaciones.length === 0}
          <div class="px-4 py-5 text-center text-sm text-gray-400">
            No hay alumnos agregados todavía.<br>
            <span class="text-xs">Usá "+ Agregar alumnos" para seleccionar desde Moodle.</span>
          </div>
        {:else}
          <!-- Resumen rápido -->
          {#if pendientes > 0}
            <div class="mx-4 mt-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700">
              ⏳ {pendientes} alumno{pendientes !== 1 ? 's' : ''} pendiente{pendientes !== 1 ? 's' : ''} de enviar autorización
            </div>
          {:else}
            <div class="mx-4 mt-3 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-700">
              ✅ Todos los alumnos presentaron su autorización
            </div>
          {/if}

          <div class="divide-y divide-gray-100 mt-2">
            {#each autorizaciones as aut}
              <div class="px-4 py-3 space-y-2">
                <!-- Fila principal: avatar + nombre + estado -->
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold
                              {aut.documentoPath ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}">
                    {aut.alumnoNombre.split(' ').map((w: string) => w[0]).slice(0, 2).join('')}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">{aut.alumnoNombre}</p>
                    {#if aut.documentoPath}
                      <p class="text-xs text-green-600 font-medium">
                        ✅ Autorización recibida
                        {aut.documentoSubidoAt ? '· ' + new Date(aut.documentoSubidoAt).toLocaleDateString('es-AR') : ''}
                      </p>
                    {:else}
                      <p class="text-xs text-amber-600">⏳ Pendiente de autorización</p>
                    {/if}
                  </div>
                  {#if aut.documentoPath}
                    <a
                      href="/autorizar/{aut.uploadToken}/archivo"
                      target="_blank"
                      class="text-xs text-indigo-600 hover:underline flex-shrink-0"
                    >Ver doc</a>
                  {/if}
                </div>

                <!-- Botón copiar link — bien visible -->
                <button
                  type="button"
                  onclick={() => copiarLink(aut.uploadToken)}
                  class="w-full flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors
                         {copiados.has(aut.uploadToken)
                           ? 'border-green-300 bg-green-50 text-green-700'
                           : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700'}"
                >
                  <span class="text-sm">{copiados.has(aut.uploadToken) ? '✅' : '🔗'}</span>
                  <span class="flex-1 text-left truncate font-mono text-xs opacity-70">
                    {linkDeAlumno(aut.uploadToken)}
                  </span>
                  <span class="font-semibold flex-shrink-0">
                    {copiados.has(aut.uploadToken) ? '¡Copiado!' : 'Copiar link'}
                  </span>
                </button>
              </div>
            {/each}
          </div>
        {/if}

        <!-- Panel "Agregar alumnos desde Moodle" -->
        {#if mostrarAgregar}
          <div class="border-t border-gray-200 p-4 space-y-3 bg-indigo-50">
            {#if !cursoElegido}
              <p class="text-xs font-semibold text-indigo-700">Seleccioná el curso de Moodle</p>
              {#if cargandoCursos}
                <p class="text-xs text-gray-500 animate-pulse text-center">Cargando cursos...</p>
              {:else}
                <div class="space-y-1.5 max-h-48 overflow-y-auto">
                  {#each cursosDisp as curso}
                    <button
                      type="button"
                      onclick={() => seleccionarCurso(curso.id, curso.nombre)}
                      disabled={cargandoAlumnos}
                      class="w-full text-left px-3 py-2 rounded-lg border border-white bg-white text-sm hover:border-indigo-300 transition-colors"
                    >{curso.nombre}</button>
                  {/each}
                </div>
              {/if}
            {:else}
              <div class="flex items-center justify-between text-xs mb-1">
                <span class="font-semibold text-indigo-700">{cursoElegido.nombre}</span>
                <button type="button" onclick={() => { cursoElegido = null; alumnosCurso = []; }}
                  class="text-gray-400 hover:text-gray-700">cambiar curso</button>
              </div>

              {#if cargandoAlumnos}
                <p class="text-xs text-gray-500 animate-pulse text-center">Cargando alumnos...</p>
              {:else}
                <div class="flex gap-2 items-center">
                  <input type="search" bind:value={busqueda} placeholder="Buscar..."
                    class="form-input text-xs flex-1" />
                  <button type="button" onclick={seleccionarTodos}
                    class="text-xs text-indigo-600 hover:underline whitespace-nowrap">Todos</button>
                  <button type="button" onclick={deseleccionarTodos}
                    class="text-xs text-gray-400 hover:underline whitespace-nowrap">Ninguno</button>
                </div>

                <div class="space-y-1 max-h-48 overflow-y-auto">
                  {#each alumnosFiltrados as alumno}
                    <button
                      type="button"
                      onclick={() => toggleAlumno(alumno.id)}
                      class="w-full text-left px-3 py-2 rounded-lg border text-sm flex items-center gap-2 transition-colors
                             {idsCargados.has(alumno.id)
                               ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                               : seleccionados.has(alumno.id)
                                 ? 'border-indigo-400 bg-indigo-50'
                                 : 'border-white bg-white hover:border-indigo-200'}"
                      disabled={idsCargados.has(alumno.id)}
                    >
                      <span class="w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center text-xs
                                   {idsCargados.has(alumno.id)
                                     ? 'border-gray-300 bg-gray-100'
                                     : seleccionados.has(alumno.id)
                                       ? 'bg-indigo-600 border-indigo-600 text-white'
                                       : 'border-gray-300'}">
                        {#if idsCargados.has(alumno.id)}✓{:else if seleccionados.has(alumno.id)}✓{/if}
                      </span>
                      <span class="flex-1 truncate">{alumno.fullname}</span>
                      {#if idsCargados.has(alumno.id)}
                        <span class="text-xs text-gray-400">ya agregado</span>
                      {/if}
                    </button>
                  {/each}
                </div>

                {#if seleccionados.size > 0}
                  <form method="POST" action="?/agregarAlumnos"
                    use:enhance={() => {
                      guardandoAlumnos = true;
                      return async ({ update }) => { await update(); guardandoAlumnos = false; };
                    }}>
                    <input type="hidden" name="alumnos" value={JSON.stringify(alumnosPayload)} />
                    <button type="submit" class="btn-primary w-full text-sm" disabled={guardandoAlumnos}>
                      {guardandoAlumnos ? 'Agregando...' : `Agregar ${seleccionados.size} alumno${seleccionados.size !== 1 ? 's' : ''}`}
                    </button>
                  </form>
                {/if}
              {/if}
            {/if}

            <button type="button" onclick={() => { mostrarAgregar = false; cursoElegido = null; alumnosCurso = []; }}
              class="text-xs text-gray-400 hover:text-gray-600 w-full text-center">Cancelar</button>
          </div>
        {/if}

      </div>

      <!-- Acciones generales -->
      <div class="flex gap-2 flex-wrap">
        <a href="/institucional/salidas/{salida.id}?imprimir"
          class="btn-secondary text-sm flex-1 text-center">🖨 Ver autorización</a>
        <button onclick={() => editando = true}
          class="btn-secondary text-sm flex-1">✏️ Editar</button>
      </div>

    {:else}
      <!-- Formulario edición -->
      <form method="POST" action="?/editar" class="space-y-4">
        <div>
          <label class="form-label">Título *</label>
          <input type="text" name="titulo" required maxlength="200" value={salida.titulo} class="form-input" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="form-label">Fecha *</label>
            <input type="date" name="fecha" required value={salida.fecha} class="form-input" />
          </div>
          <div>
            <label class="form-label">Cantidad de alumnos</label>
            <input type="number" name="cantidadAlumnos" min="1" max="500"
              value={salida.cantidadAlumnos ?? ''} class="form-input" />
          </div>
        </div>
        <div>
          <label class="form-label">Destino *</label>
          <input type="text" name="destino" required maxlength="300" value={salida.destino} class="form-input" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="form-label">Docente responsable *</label>
            <input type="text" name="responsableNombre" required maxlength="200"
              value={salida.responsableNombre} class="form-input" />
          </div>
          <div>
            <label class="form-label">Curso / grupo *</label>
            <input type="text" name="cursoNombre" required maxlength="200"
              value={salida.cursoNombre} class="form-input" />
          </div>
        </div>
        <div>
          <label class="form-label">Descripción / objetivos</label>
          <textarea name="descripcion" rows="3" maxlength="3000"
            class="form-input resize-none">{salida.descripcion ?? ''}</textarea>
        </div>
        <div>
          <label class="form-label">Costo estimado por alumno</label>
          <input type="text" name="costoEstimado" maxlength="50"
            value={salida.costoEstimado ?? ''} class="form-input" />
        </div>
        <div>
          <label class="form-label">Estado</label>
          <select name="estado" class="form-input">
            {#each ESTADOS as est}
              <option value={est} selected={salida.estado === est}>{est}</option>
            {/each}
          </select>
        </div>
        <div>
          <label class="form-label">Notas internas</label>
          <textarea name="notas" rows="2" maxlength="2000"
            class="form-input resize-none">{salida.notas ?? ''}</textarea>
        </div>
        <div class="flex gap-3">
          <button type="submit" class="btn-primary flex-1">Guardar cambios</button>
          <button type="button" onclick={() => editando = false} class="btn-secondary flex-1">Cancelar</button>
        </div>
      </form>
    {/if}
  </div>
{/if}

<style>
  @media print {
    .no-print { display: none !important; }
  }
</style>

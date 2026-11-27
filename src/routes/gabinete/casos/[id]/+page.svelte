<script lang="ts">
  import { enhance } from '$app/forms';
  import SelectorCategorias from '$lib/components/SelectorCategorias.svelte';
  import { CATEGORIA_POR_ID, AVISO_URGENTE } from '$lib/gabinete/categorias';

  let { data, form } = $props();

  let c = $derived(data.caso);
  let editando = $state(false);
  let categorias = $state<string[]>([...data.categorias]);
  $effect(() => { categorias = [...data.categorias]; });
  let urgente = $derived(data.categorias.some((id) => CATEGORIA_POR_ID.get(id)?.urgente));
  let tipoNombre = $derived(new Map(data.tipos.map((t) => [t.id as string, t.nombre])));
  let estadoNombre = $derived(new Map(data.estados.map((e) => [e.id as string, e.nombre])));
  let guia = $derived(data.guia[c.nivel as 1 | 2 | 3]);
  const fmt = (f: string | null) => (f ? new Date(f + 'T12:00:00').toLocaleDateString('es-AR') : '—');
  const NIVEL_CLS: Record<number, string> = {
    3: 'bg-red-600 text-white', 2: 'bg-amber-500 text-white', 1: 'bg-green-600 text-white'
  };
  const ORIGEN: Record<string, string> = {
    derivacion: 'Derivación', alerta: 'Alerta temprana', gabinete: 'Abierto por el gabinete'
  };
</script>

<svelte:head><title>{c.alumnoNombre} — Caso</title></svelte:head>

<div class="space-y-4">
  <a href="/gabinete/casos" class="text-indigo-600 text-sm hover:underline">← Casos</a>

  {#if form?.error}
    <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">{form.error}</div>
  {/if}
  {#if form?.ok}
    <div class="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-3 py-2">{form.ok}</div>
  {/if}

  <!-- Encabezado -->
  <div class="card space-y-2">
    <div class="flex items-start justify-between gap-2">
      <div class="min-w-0">
        <p class="text-lg font-bold text-gray-900">
          <span class="text-xs font-bold px-2 py-0.5 rounded-full align-middle {NIVEL_CLS[c.nivel]}">N{c.nivel}</span>
          <a href="/gabinete/alumno/{c.alumnoMoodleId}" class="hover:text-indigo-700">{c.alumnoNombre}</a>
        </p>
        <p class="text-xs text-gray-500">
          {c.cursoNombre ?? 'sin curso'} · {ORIGEN[c.origen] ?? c.origen} por {data.derivadoPorNombre}
          · {new Date(c.createdAt).toLocaleDateString('es-AR')}
        </p>
      </div>
      <span class="text-xs px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 flex-shrink-0">{estadoNombre.get(c.estado)}</span>
    </div>
    {#if c.estado !== 'cerrado'}
      <p class="text-xs {c.proximaRevision && c.proximaRevision < data.hoy ? 'text-red-600 font-medium' : 'text-gray-500'}">
        Próxima revisión: {fmt(c.proximaRevision)}
      </p>
    {/if}

    {#if data.categorias.length > 0}
      <div class="flex flex-wrap gap-1.5">
        {#each data.categorias as id}
          {@const cat = CATEGORIA_POR_ID.get(id)}
          {#if cat}<span class="text-xs px-2 py-0.5 rounded-full text-white" style="background:{cat.color}">{cat.urgente ? '⚠️ ' : ''}{cat.nombre}</span>{/if}
        {/each}
      </div>
    {/if}
    {#if urgente && c.estado !== 'cerrado'}
      <p class="text-xs bg-red-50 border border-red-300 text-red-800 rounded-lg px-3 py-2">⚠️ {AVISO_URGENTE}</p>
    {/if}
    <div class="flex flex-wrap gap-3 text-xs print:hidden">
      <a href="/gabinete/casos/{c.id}/informe?para=direccion" class="text-indigo-700 hover:underline">📄 Informe para dirección</a>
      <a href="/gabinete/casos/{c.id}/informe?para=familia" class="text-indigo-700 hover:underline">👪 Informe para la familia</a>
    </div>

    {#if !editando}
      <div>
        <p class="text-xs font-medium text-gray-700">Motivo</p>
        <p class="text-sm text-gray-800 whitespace-pre-line">{c.motivo}</p>
      </div>
      {#if c.fortalezas}
        <div>
          <p class="text-xs font-medium text-gray-700">Fortalezas</p>
          <p class="text-sm text-gray-800 whitespace-pre-line">{c.fortalezas}</p>
        </div>
      {/if}
      <button onclick={() => (editando = true)} class="text-xs text-indigo-600 hover:underline">✏️ Editar caso</button>
    {:else}
      <form method="POST" action="?/actualizar" class="space-y-3 border-t border-gray-100 pt-3"
        use:enhance={() => async ({ update, result }) => {
          await update({ reset: false });
          if (result.type === 'success') editando = false;
        }}>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div>
            <label class="form-label" for="estado">Estado</label>
            <select id="estado" name="estado" class="form-input text-sm">
              {#each data.estados as e}<option value={e.id} selected={e.id === c.estado}>{e.nombre}</option>{/each}
            </select>
          </div>
          <div>
            <label class="form-label" for="nivel">Nivel de apoyo</label>
            <select id="nivel" name="nivel" class="form-input text-sm">
              {#each [1, 2, 3] as n}<option value={n} selected={n === c.nivel}>Nivel {n}</option>{/each}
            </select>
          </div>
          <div>
            <label class="form-label" for="resp">Responsable</label>
            <select id="resp" name="responsableId" class="form-input text-sm">
              <option value="">Sin asignar</option>
              {#each data.equipo as p}<option value={p.id} selected={p.id === c.responsableId}>{p.nombre}</option>{/each}
            </select>
          </div>
          <div>
            <label class="form-label" for="rev">Próxima revisión</label>
            <input id="rev" name="proximaRevision" type="date" value={c.proximaRevision ?? ''} class="form-input text-sm" />
          </div>
        </div>
        <div>
          <p class="form-label">Categorías</p>
          <SelectorCategorias bind:seleccionadas={categorias} />
        </div>
        <div>
          <label class="form-label" for="motivo">Motivo / detalle</label>
          <textarea id="motivo" name="motivo" rows="4" maxlength="5000" class="form-input text-sm" required>{c.motivo}</textarea>
        </div>
        <div>
          <label class="form-label" for="fort">Fortalezas del alumno <span class="text-gray-400 font-normal">(en qué se apoya)</span></label>
          <textarea id="fort" name="fortalezas" rows="2" maxlength="3000" class="form-input text-sm">{c.fortalezas ?? ''}</textarea>
        </div>
        <div class="flex gap-2">
          <button type="submit" class="btn-primary text-sm flex-1">Guardar</button>
          <button type="button" onclick={() => (editando = false)} class="text-sm text-gray-500 px-3">Cancelar</button>
        </div>
      </form>
    {/if}
  </div>

  <!-- Guía según nivel -->
  {#if c.estado !== 'cerrado' && guia}
    <details class="card" open={c.estado === 'derivado' || c.estado === 'evaluacion'}>
      <summary class="text-sm font-semibold text-gray-800 cursor-pointer">📚 {guia.titulo}</summary>
      <div class="mt-2 space-y-2">
        {#each guia.sugerencias as s}
          <div class="border-l-2 border-indigo-300 pl-3">
            <p class="text-sm text-gray-700">{s.texto}</p>
            <p class="text-xs text-gray-400">{s.fundamento}</p>
          </div>
        {/each}
      </div>
    </details>
  {/if}

  <!-- Nuevo registro -->
  {#if c.estado !== 'cerrado'}
    <form method="POST" action="?/intervencion" class="card space-y-2" use:enhance>
      <p class="text-sm font-semibold text-gray-800">+ Registrar intervención</p>
      <div class="grid sm:grid-cols-2 gap-2">
        <div>
          <label class="form-label" for="tipo">Tipo</label>
          <select id="tipo" name="tipo" class="form-input text-sm">
            {#each data.tipos.filter((t) => t.id !== 'derivacion') as t}<option value={t.id}>{t.nombre}</option>{/each}
          </select>
        </div>
        <div>
          <label class="form-label" for="fecha">Fecha</label>
          <input id="fecha" name="fecha" type="date" value={data.hoy} class="form-input text-sm" required />
        </div>
      </div>
      <div>
        <label class="form-label" for="desc">Qué se hizo / qué se observó</label>
        <textarea id="desc" name="descripcion" rows="3" maxlength="5000" class="form-input text-sm" required></textarea>
      </div>
      <div>
        <label class="form-label" for="acu">Acuerdos y próximos pasos <span class="text-gray-400 font-normal">(opcional)</span></label>
        <textarea id="acu" name="acuerdos" rows="2" maxlength="3000" class="form-input text-sm"></textarea>
      </div>
      <label class="flex items-start gap-2 text-sm text-gray-700">
        <input type="checkbox" name="visibleFamilia" value="1" class="mt-0.5" />
        <span>👪 Incluir en el informe para la familia
          <span class="block text-xs text-gray-500">Revisá que no mencione a otros alumnos ni datos internos.</span></span>
      </label>
      <div class="flex items-end gap-2">
        <div class="flex-1">
          <label class="form-label" for="prox">Próxima revisión <span class="text-gray-400 font-normal">(vacío = según nivel)</span></label>
          <input id="prox" name="proximaRevision" type="date" class="form-input text-sm" />
        </div>
        <button type="submit" class="btn-primary text-sm">Guardar registro</button>
      </div>
    </form>
  {/if}

  <!-- Historial -->
  <div class="card space-y-2">
    <p class="text-sm font-semibold text-gray-800">Historial ({data.intervenciones.length})</p>
    {#each data.intervenciones as r}
      <div class="border-l-2 border-gray-200 pl-3 py-1 space-y-0.5">
        <p class="text-xs text-gray-500">
          {fmt(r.i.fecha)} · <strong class="text-gray-700">{tipoNombre.get(r.i.tipo) ?? r.i.tipo}</strong> · {r.autor}
          {#if r.i.visibleFamilia}<span class="ml-1 px-1.5 rounded bg-teal-50 text-teal-700">👪 compartido</span>{/if}
        </p>
        <p class="text-sm text-gray-800 whitespace-pre-line">{r.i.descripcion}</p>
        {#if r.i.acuerdos}
          <p class="text-xs text-indigo-800 bg-indigo-50 rounded px-2 py-1 whitespace-pre-line">Acuerdos: {r.i.acuerdos}</p>
        {/if}
      </div>
    {:else}
      <p class="text-sm text-gray-500">Todavía no hay registros.</p>
    {/each}
  </div>
</div>

<script lang="ts">
  let { data, form } = $props();
  const { ev } = data;
  let editando = $state(false);

  const ESTADO_COLOR: Record<string, string> = {
    planificado: 'bg-blue-100 text-blue-700',
    realizado:   'bg-green-100 text-green-700',
    cancelado:   'bg-gray-100 text-gray-500'
  };

  function parseCursos(json: string | null): string[] {
    if (!json) return [];
    try {
      const arr = JSON.parse(json);
      if (Array.isArray(arr)) return arr.map((c: any) => c.cursoNombre ?? c);
    } catch {}
    return [json];
  }

  const cursos = parseCursos(ev.cursosResponsables);
  const cursosTexto = cursos.join('\n');
</script>

<svelte:head><title>{ev.titulo} — Legajo</title></svelte:head>

<div class="space-y-4">
  <div>
    <a href="/institucional/efemerides" class="text-indigo-600 text-sm hover:underline">← Efemérides</a>
    <div class="flex items-center justify-between mt-1">
      <h2 class="text-lg font-bold text-gray-900">{ev.titulo}</h2>
      <span class="text-xs px-2 py-0.5 rounded-full {ESTADO_COLOR[ev.estado] ?? 'bg-gray-100 text-gray-600'}">{ev.estado}</span>
    </div>
  </div>

  {#if form?.error}
    <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{form.error}</div>
  {/if}

  {#if !editando}
    <!-- Vista -->
    <div class="card space-y-3">
      <div class="flex justify-between text-sm">
        <span class="text-gray-500">Fecha</span>
        <span class="font-medium">{ev.fecha}</span>
      </div>
      {#if ev.docenteResponsable}
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">Docente responsable</span>
          <span class="font-medium">{ev.docenteResponsable}</span>
        </div>
      {/if}
      {#if cursos.length > 0}
        <div class="text-sm">
          <span class="text-gray-500">Cursos responsables</span>
          <div class="flex flex-wrap gap-1 mt-1">
            {#each cursos as c}
              <span class="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">{c}</span>
            {/each}
          </div>
        </div>
      {/if}
      {#if ev.descripcion}
        <div class="text-sm">
          <span class="text-gray-500 block mb-1">Descripción</span>
          <p class="text-gray-700 whitespace-pre-wrap">{ev.descripcion}</p>
        </div>
      {/if}
      {#if ev.notas}
        <div class="text-sm">
          <span class="text-gray-500 block mb-1">Notas internas</span>
          <p class="text-gray-600 italic whitespace-pre-wrap">{ev.notas}</p>
        </div>
      {/if}
    </div>

    <div class="flex gap-2">
      <button onclick={() => editando = true} class="btn-secondary text-sm flex-1">✏️ Editar</button>
      <form method="POST" action="?/eliminar" onsubmit={(e) => { if (!confirm('¿Eliminar esta efeméride?')) e.preventDefault(); }}>
        <button type="submit" class="text-sm text-red-500 hover:text-red-700 px-3 py-2">🗑 Eliminar</button>
      </form>
    </div>
  {:else}
    <!-- Formulario edición -->
    <form method="POST" action="?/editar" class="space-y-4">
      <div>
        <label class="form-label">Título *</label>
        <input type="text" name="titulo" required maxlength="200" value={ev.titulo} class="form-input" />
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="form-label">Fecha *</label>
          <input type="date" name="fecha" required value={ev.fecha} class="form-input" />
        </div>
        <div>
          <label class="form-label">Estado</label>
          <select name="estado" class="form-input">
            {#each ['planificado','realizado','cancelado'] as est}
              <option value={est} selected={ev.estado === est}>{est}</option>
            {/each}
          </select>
        </div>
      </div>
      <div>
        <label class="form-label">Descripción</label>
        <textarea name="descripcion" rows="3" class="form-input resize-none">{ev.descripcion ?? ''}</textarea>
      </div>
      <div>
        <label class="form-label">Docente responsable</label>
        <input type="text" name="docenteResponsable" maxlength="200" value={ev.docenteResponsable ?? ''} class="form-input" />
      </div>
      <div>
        <label class="form-label">Cursos responsables (uno por línea)</label>
        <textarea name="cursosResponsables" rows="3" class="form-input resize-none font-mono text-sm">{cursosTexto}</textarea>
      </div>
      <div>
        <label class="form-label">Notas</label>
        <textarea name="notas" rows="2" class="form-input resize-none">{ev.notas ?? ''}</textarea>
      </div>
      <div class="flex gap-3">
        <button type="submit" class="btn-primary flex-1">Guardar cambios</button>
        <button type="button" onclick={() => editando = false} class="btn-secondary flex-1">Cancelar</button>
      </div>
    </form>
  {/if}
</div>

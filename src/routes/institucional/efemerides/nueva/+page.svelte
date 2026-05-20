<script lang="ts">
  let { form } = $props();
</script>

<svelte:head><title>Nueva Efeméride — Legajo</title></svelte:head>

<div class="space-y-4">
  <div>
    <a href="/institucional/efemerides" class="text-indigo-600 text-sm hover:underline">← Efemérides</a>
    <h2 class="text-lg font-bold text-gray-900 mt-1">Nueva Efeméride / Acto</h2>
  </div>

  {#if form?.error}
    <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{form.error}</div>
  {/if}

  <form method="POST" class="space-y-4">
    <div>
      <label class="form-label">Título del acto / efeméride *</label>
      <input type="text" name="titulo" required maxlength="200"
        placeholder="Ej: Acto 25 de Mayo" class="form-input" />
    </div>

    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="form-label">Fecha *</label>
        <input type="date" name="fecha" required class="form-input" />
      </div>
      <div>
        <label class="form-label">Estado</label>
        <select name="estado" class="form-input">
          <option value="planificado">Planificado</option>
          <option value="realizado">Realizado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>
    </div>

    <div>
      <label class="form-label">Descripción</label>
      <textarea name="descripcion" rows="3" maxlength="2000"
        placeholder="Detalles del acto, programa, etc."
        class="form-input resize-none"></textarea>
    </div>

    <div>
      <label class="form-label">Docente responsable</label>
      <input type="text" name="docenteResponsable" maxlength="200"
        placeholder="Nombre del docente a cargo"
        class="form-input" />
    </div>

    <div>
      <label class="form-label">Cursos / grupos responsables</label>
      <textarea name="cursosResponsables" rows="3"
        placeholder="Un curso por línea, ej:&#10;5° A&#10;6° B"
        class="form-input resize-none font-mono text-sm"></textarea>
      <p class="text-xs text-gray-400 mt-1">Un curso por línea</p>
    </div>

    <div>
      <label class="form-label">Notas internas</label>
      <textarea name="notas" rows="2" maxlength="2000"
        class="form-input resize-none"></textarea>
    </div>

    <div class="flex gap-3 pt-2">
      <button type="submit" class="btn-primary flex-1">Guardar efeméride</button>
      <a href="/institucional/efemerides" class="btn-secondary flex-1 text-center">Cancelar</a>
    </div>
  </form>
</div>

<script lang="ts">
  let { form } = $props();
</script>

<svelte:head><title>Nueva Salida — Legajo</title></svelte:head>

<div class="space-y-4">
  <div>
    <a href="/institucional/salidas" class="text-indigo-600 text-sm hover:underline">← Salidas</a>
    <h2 class="text-lg font-bold text-gray-900 mt-1">Nueva Salida Didáctica</h2>
  </div>

  {#if form?.error}
    <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{form.error}</div>
  {/if}

  <form method="POST" class="space-y-4">
    <div>
      <label class="form-label">Título / nombre de la salida *</label>
      <input type="text" name="titulo" required maxlength="200"
        placeholder="Ej: Visita al Museo Provincial" class="form-input" />
    </div>

    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="form-label">Fecha *</label>
        <input type="date" name="fecha" required class="form-input" />
      </div>
      <div>
        <label class="form-label">Cantidad de alumnos</label>
        <input type="number" name="cantidadAlumnos" min="1" max="500" class="form-input" />
      </div>
    </div>

    <div>
      <label class="form-label">Destino *</label>
      <input type="text" name="destino" required maxlength="300"
        placeholder="Lugar de destino" class="form-input" />
    </div>

    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="form-label">Docente responsable *</label>
        <input type="text" name="responsableNombre" required maxlength="200" class="form-input" />
      </div>
      <div>
        <label class="form-label">Curso / grupo *</label>
        <input type="text" name="cursoNombre" required maxlength="200"
          placeholder="Ej: 5° A" class="form-input" />
      </div>
    </div>

    <div>
      <label class="form-label">Descripción / objetivos</label>
      <textarea name="descripcion" rows="3" maxlength="3000"
        placeholder="Descripción de la actividad, objetivos pedagógicos, itinerario..."
        class="form-input resize-none"></textarea>
    </div>

    <div>
      <label class="form-label">Costo estimado por alumno</label>
      <input type="text" name="costoEstimado" maxlength="50"
        placeholder="Ej: $5.000" class="form-input" />
    </div>

    <div>
      <label class="form-label">Notas internas</label>
      <textarea name="notas" rows="2" maxlength="2000" class="form-input resize-none"></textarea>
    </div>

    <div class="flex gap-3 pt-2">
      <button type="submit" class="btn-primary flex-1">Crear salida</button>
      <a href="/institucional/salidas" class="btn-secondary flex-1 text-center">Cancelar</a>
    </div>
  </form>
</div>

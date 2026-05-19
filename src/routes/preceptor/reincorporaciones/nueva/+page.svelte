<script lang="ts">
  import { enhance } from '$app/forms';
  let { data, form } = $props();
  let guardando = $state(false);
</script>

<svelte:head><title>Nueva reincorporación — Legajo</title></svelte:head>

<div class="space-y-4">
  <div class="flex items-center gap-2">
    <a href="/preceptor/reincorporaciones" class="text-indigo-600 text-sm hover:underline">← Reincorporaciones</a>
    <h2 class="text-lg font-bold text-gray-900">Nueva reincorporación</h2>
  </div>

  {#if form?.error}
    <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">{form.error}</div>
  {/if}

  <form method="POST" use:enhance={() => { guardando = true; return async ({ update }) => { await update(); guardando = false; }; }} class="space-y-4">
    <div>
      <label class="form-label">ID Moodle del alumno *</label>
      <input type="number" name="alumnoMoodleId" value={data.preselect.alumnoMoodleId ?? ''} required class="form-input" />
    </div>
    <div>
      <label class="form-label">Nombre del alumno *</label>
      <input type="text" name="alumnoNombre" value={data.preselect.alumnoNombre ?? ''} required maxlength="200" class="form-input" />
    </div>
    <div>
      <label class="form-label">Fecha de reincorporación *</label>
      <input type="date" name="fechaReincorporacion" required class="form-input" />
    </div>
    <div>
      <label class="form-label">Observaciones <span class="text-gray-400 font-normal">(opcional)</span></label>
      <textarea name="observaciones" rows="3" maxlength="3000" class="form-input resize-none"></textarea>
    </div>
    <div>
      <label class="form-label">URL de documento <span class="text-gray-400 font-normal">(opcional)</span></label>
      <input type="url" name="documentoUrl" class="form-input" placeholder="https://..." />
    </div>
    <div>
      <label class="form-label">ID de falta relacionada <span class="text-gray-400 font-normal">(opcional)</span></label>
      <input type="number" name="linkedFaltaId" class="form-input" placeholder="ID de la falta que cierra" />
    </div>
    <button type="submit" class="btn-primary w-full" disabled={guardando}>
      {guardando ? 'Guardando...' : 'Registrar reincorporación'}
    </button>
  </form>
</div>

<script lang="ts">
  import { enhance } from '$app/forms';
  let { data, form } = $props();

  let fecha = $state(new Date().toISOString().split('T')[0]);
  let gravedad = $state('leve');
  let guardando = $state(false);
</script>

<svelte:head><title>Nueva amonestación — Legajo</title></svelte:head>

<div class="space-y-4">
  <div class="flex items-center gap-2">
    <a href="/preceptor/amonestaciones" class="text-indigo-600 text-sm hover:underline">← Amonestaciones</a>
    <h2 class="text-lg font-bold text-gray-900">Nueva amonestación</h2>
  </div>

  {#if form?.error}
    <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">{form.error}</div>
  {/if}

  <form method="POST" use:enhance={() => { guardando = true; return async ({ update }) => { await update(); guardando = false; }; }} class="space-y-4">
    <input type="hidden" name="cursoMoodleId" value={data.preselect.cursoMoodleId ?? ''} />
    <input type="hidden" name="cursoNombre" value={data.preselect.cursoNombre ?? ''} />

    <div>
      <label class="form-label">Alumno *</label>
      <input type="number" name="alumnoMoodleId" value={data.preselect.alumnoMoodleId ?? ''} required class="form-input" placeholder="ID Moodle del alumno" />
    </div>

    <div>
      <label class="form-label">Nombre del alumno *</label>
      <input type="text" name="alumnoNombre" value={data.preselect.alumnoNombre ?? ''} required maxlength="200" class="form-input" />
    </div>

    <div>
      <label class="form-label">Fecha *</label>
      <input type="date" name="fecha" bind:value={fecha} max={new Date().toISOString().split('T')[0]} required class="form-input" />
    </div>

    <div>
      <label class="form-label">Gravedad *</label>
      <div class="flex gap-2 mt-1">
        {#each [['leve', '🟡 Leve'], ['mediana', '🟠 Mediana'], ['grave', '🔴 Grave']] as [val, lbl]}
          <button type="button" onclick={() => { gravedad = val; }}
            class="flex-1 py-2 rounded-lg border text-sm font-medium transition-colors
                   {gravedad === val ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-300 text-gray-700 hover:border-indigo-300'}">
            {lbl}
          </button>
        {/each}
      </div>
      <input type="hidden" name="gravedad" value={gravedad} />
    </div>

    <div>
      <label class="form-label">Motivo *</label>
      <textarea name="motivo" rows="4" required maxlength="3000" class="form-input resize-none" placeholder="Describí el motivo de la amonestación..."></textarea>
    </div>

    <div>
      <label class="form-label">Acciones sugeridas <span class="text-gray-400 font-normal">(opcional)</span></label>
      <textarea name="accionesSugeridas" rows="3" maxlength="2000" class="form-input resize-none" placeholder="Medidas o acuerdos sugeridos..."></textarea>
    </div>

    <button type="submit" class="btn-primary w-full" disabled={guardando}>
      {guardando ? 'Guardando...' : 'Registrar amonestación'}
    </button>
  </form>
</div>

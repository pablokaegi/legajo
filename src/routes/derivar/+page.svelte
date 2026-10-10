<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';

  let { data, form } = $props();
  let enviando = $state(false);

  function elegirCurso(e: Event) {
    const id = (e.currentTarget as HTMLSelectElement).value;
    goto(id ? `?curso=${id}` : '?', { noScroll: true });
  }
</script>

<svelte:head><title>Derivar al gabinete — Legajo</title></svelte:head>

<div class="space-y-4 max-w-xl">
  <div>
    <h1 class="text-lg font-bold text-gray-900">🧠 Derivar al gabinete psicopedagógico</h1>
    <p class="text-xs text-gray-500">
      Lo recibe solo el gabinete. Describí lo que observaste con hechos concretos (qué, cuándo, dónde), sin
      etiquetas; y contá también qué le sale bien: es el punto de apoyo para ayudarlo.
    </p>
  </div>

  {#if form?.error}
    <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">{form.error}</div>
  {/if}

  {#if form?.ok}
    <div class="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-3 py-3 space-y-2">
      <p>{form.ok}</p>
      <a href="/derivar" class="text-xs underline">Hacer otra derivación</a>
    </div>
  {:else}
    <form method="POST" class="card space-y-3"
      use:enhance={() => {
        enviando = true;
        return async ({ update }) => { await update(); enviando = false; };
      }}>
      <div>
        <label class="form-label" for="curso">Curso</label>
        <select id="curso" name="cursoId" class="form-input" onchange={elegirCurso} required>
          <option value="">Elegí el curso…</option>
          {#each data.cursos as c}<option value={c.id} selected={c.id === data.cursoId}>{c.nombre}</option>{/each}
        </select>
      </div>

      {#if data.cursoId}
        <div>
          <label class="form-label" for="alumno">Alumno</label>
          <select id="alumno" name="alumnoId" class="form-input" required>
            <option value="">Elegí el alumno…</option>
            {#each data.alumnos as a}<option value={a.id} selected={a.id === data.alumnoId}>{a.nombre}</option>{/each}
          </select>
        </div>
        <div>
          <label class="form-label" for="obs">¿Qué observaste?</label>
          <textarea id="obs" name="queObservo" rows="4" maxlength="3000" class="form-input" required
            placeholder="Ej.: en las últimas semanas trabaja solo, no entrega las actividades y en los recreos está aislado."></textarea>
        </div>
        <div>
          <label class="form-label" for="desde">¿Desde cuándo? <span class="text-gray-400 font-normal">(opcional)</span></label>
          <input id="desde" name="desdeCuando" maxlength="300" class="form-input" placeholder="Ej.: desde las vacaciones de invierno" />
        </div>
        <div>
          <label class="form-label" for="hizo">¿Qué intentaste en el aula? <span class="text-gray-400 font-normal">(opcional)</span></label>
          <textarea id="hizo" name="queSeHizo" rows="2" maxlength="2000" class="form-input"></textarea>
        </div>
        <div>
          <label class="form-label" for="fort">¿Qué le sale bien? <span class="text-gray-400 font-normal">(fortalezas)</span></label>
          <textarea id="fort" name="fortalezas" rows="2" maxlength="2000" class="form-input"></textarea>
        </div>
        <button type="submit" class="btn-primary w-full" disabled={enviando}>
          {enviando ? 'Enviando…' : 'Enviar al gabinete'}
        </button>
      {/if}
    </form>
  {/if}
</div>

<script lang="ts">
  import { enhance } from '$app/forms';

  let { data, form } = $props();

  let l = $derived(data.legajo);
  let abierto = $derived(data.casos.find((c) => c.estado !== 'cerrado'));
  let estadoNombre = $derived(new Map(data.estados.map((e) => [e.id as string, e.nombre])));
  const fecha = (f: unknown) => {
    if (!f) return '—';
    const d = typeof f === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(f) ? new Date(f + 'T12:00:00') : new Date(f as string);
    return isNaN(d.getTime()) ? String(f) : d.toLocaleDateString('es-AR');
  };
  let ausencias = $derived(l.faltas.filter((f) => f.tipo === 'ausente').length);
  let retrasos = $derived(l.faltas.filter((f) => f.tipo === 'retraso').length);
  const GRAV: Record<string, string> = { leve: 'text-amber-700', mediana: 'text-orange-700', grave: 'text-red-700' };
</script>

<svelte:head><title>{l.alumnoNombre} — Gabinete</title></svelte:head>

<div class="space-y-4">
  <a href="/gabinete" class="text-indigo-600 text-sm hover:underline">← Tablero</a>

  {#if form?.error}
    <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">{form.error}</div>
  {/if}

  <div class="card space-y-1">
    <p class="text-lg font-bold text-gray-900">{l.alumnoNombre}</p>
    <div class="flex flex-wrap gap-3 text-xs text-gray-600">
      <span>📝 {l.observaciones.length} observaciones</span>
      <span>🕒 {ausencias} ausencias · {retrasos} llegadas tarde</span>
      <span>⚠️ {l.amonestaciones.length} amonestaciones</span>
      <span>📋 {l.actas.length} actas</span>
    </div>
    {#if data.banco}
      <p class="text-xs text-gray-600">
        🪑 {data.banco.cursoNombre}: banco {data.banco.banco}{data.banco.companeros.length
          ? ` con ${data.banco.companeros.map((c) => c.nombre).join(' y ')}` : ''}
        · <a href="/aula/{data.banco.cursoMoodleId}" class="text-indigo-700 hover:underline">ver plano</a>
      </p>
    {/if}
  </div>

  <!-- Casos -->
  <div class="card space-y-2">
    <p class="text-sm font-semibold text-gray-800">📂 Casos</p>
    {#each data.casos as c}
      <a href="/gabinete/casos/{c.id}" class="flex items-center justify-between rounded-lg border border-gray-200 p-2 hover:border-indigo-300">
        <span class="text-sm text-gray-800">Nivel {c.nivel} · {estadoNombre.get(c.estado) ?? c.estado}</span>
        <span class="text-xs text-gray-500">{fecha(c.createdAt)}</span>
      </a>
    {:else}
      <p class="text-sm text-gray-500">Sin casos registrados.</p>
    {/each}
    {#if !abierto}
      <details>
        <summary class="text-xs text-indigo-700 cursor-pointer">+ Abrir un caso</summary>
        <form method="POST" action="?/abrirCaso" use:enhance class="mt-2 space-y-2">
          <textarea name="motivo" rows="3" maxlength="5000" class="form-input text-sm" required
            placeholder="Qué se observó, desde cuándo, en qué contextos…"></textarea>
          <div class="flex items-center gap-2">
            <select name="nivel" class="form-input text-sm w-auto">
              <option value="2" selected>Nivel 2 — focalizado</option>
              <option value="3">Nivel 3 — intensivo</option>
              <option value="1">Nivel 1 — universal</option>
            </select>
            <button type="submit" class="btn-primary text-sm">Abrir caso</button>
          </div>
        </form>
      </details>
    {/if}
  </div>

  <!-- Vínculos (agrupamientos) -->
  {#if data.agrupamientos.length > 0}
    <div class="card space-y-2">
      <p class="text-sm font-semibold text-gray-800">🧩 Vínculos y trabajo en grupo</p>
      {#each data.agrupamientos as ag}
        <div class="text-xs text-gray-700 border-l-2 border-gray-200 pl-2">
          <p><strong>{ag.nombreAgrupacion}</strong> · {ag.cursoNombre} · {fecha(ag.fecha)}{ag.rol ? ` · rol: ${ag.rol}` : ''}</p>
          <p>Con: {ag.companeros.map((c) => c.nombre).join(', ') || '—'}</p>
          {#if ag.notaPedagogica.tipo === 'acompanar'}
            <p class="text-amber-700">Para acompañar: {ag.notaPedagogica.observaciones.join(' ')}</p>
          {:else if ag.notaPedagogica.tipo === 'referente'}
            <p class="text-green-700">Referente: {ag.notaPedagogica.cualidades.join(' · ')}</p>
          {/if}
        </div>
      {/each}
    </div>
  {/if}

  <!-- Amonestaciones -->
  {#if l.amonestaciones.length > 0}
    <div class="card space-y-1.5">
      <p class="text-sm font-semibold text-gray-800">⚠️ Amonestaciones recientes</p>
      {#each l.amonestaciones.slice(0, 5) as a}
        <p class="text-xs text-gray-700"><span class={GRAV[a.gravedad] ?? ''}>{a.gravedad}</span> · {fecha(a.fecha)} — {a.motivo}</p>
      {/each}
    </div>
  {/if}

  <!-- Observaciones -->
  {#if l.observaciones.length > 0}
    <div class="card space-y-1.5">
      <p class="text-sm font-semibold text-gray-800">📝 Observaciones docentes recientes</p>
      {#each l.observaciones.slice(0, 8) as o}
        <p class="text-xs text-gray-700">
          {fecha(o.fecha)} · {o.cursoNombre}
          {#if o.actitud != null} · actitud {o.actitud}/5{/if}
          {#if o.participacion != null} · participación {o.participacion}/5{/if}
          {#if o.observacionTexto} — {o.observacionTexto}{/if}
        </p>
      {/each}
    </div>
  {/if}
</div>

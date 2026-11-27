<script lang="ts">
  // Agenda de la clase: objetivos y pasos visibles para todos, tildados a medida
  // que se avanza (anticipar la estructura de la clase ayuda a la autorregulación).
  // Se guarda solo en este equipo, por curso y por día.
  import { onMount } from 'svelte';

  interface Props { cursoId: number }
  let { cursoId }: Props = $props();

  const clave = `pizarra:agenda:${cursoId}:${new Date().toISOString().slice(0, 10)}`;
  let items = $state<{ texto: string; hecho: boolean }[]>([]);
  let nuevo = $state('');

  onMount(() => {
    try {
      const v = JSON.parse(localStorage.getItem(clave) ?? '[]');
      if (Array.isArray(v)) items = v.filter((x) => typeof x?.texto === 'string');
    } catch { /* vacío */ }
  });
  const guardar = () => { try { localStorage.setItem(clave, JSON.stringify(items)); } catch { /* sin almacenamiento */ } };

  function agregar(e: SubmitEvent) {
    e.preventDefault();
    const t = nuevo.trim();
    if (!t) return;
    items = [...items, { texto: t.slice(0, 120), hecho: false }];
    nuevo = '';
    guardar();
  }
  function alternar(i: number) { items[i].hecho = !items[i].hecho; items = [...items]; guardar(); }
  function quitar(i: number) { items = items.filter((_, j) => j !== i); guardar(); }
</script>

<div class="max-w-4xl mx-auto space-y-4 py-2">
  <p class="text-3xl font-bold text-gray-900">📋 Hoy en clase</p>
  <ol class="space-y-2">
    {#each items as it, i}
      <li class="flex items-center gap-3">
        <button onclick={() => alternar(i)}
          class="flex-1 flex items-center gap-4 text-left px-5 py-4 rounded-2xl bg-white border-2 {it.hecho ? 'border-green-300' : 'border-gray-200'}">
          <span class="text-3xl">{it.hecho ? '✅' : `${i + 1}.`}</span>
          <span class="text-3xl {it.hecho ? 'line-through text-gray-400' : 'text-gray-900'}">{it.texto}</span>
        </button>
        <button onclick={() => quitar(i)} class="px-4 py-4 text-2xl text-gray-300 active:text-red-500" aria-label="Quitar">✕</button>
      </li>
    {:else}
      <p class="text-xl text-gray-400">Todavía no hay pasos. Escribí el primero abajo.</p>
    {/each}
  </ol>
  <form onsubmit={agregar} class="flex gap-2">
    <input bind:value={nuevo} maxlength="120" placeholder="Ej.: Repaso de la clase anterior"
      class="flex-1 text-2xl px-4 py-3 rounded-xl border border-gray-300 select-text" />
    <button type="submit" class="px-6 py-3 rounded-xl bg-indigo-600 text-white text-2xl font-bold">+ Agregar</button>
  </form>
</div>

<script lang="ts">
  import { page } from '$app/state';
  import AlumnoAlAzar from '$lib/components/pizarra/AlumnoAlAzar.svelte';
  import GruposPizarra from '$lib/components/pizarra/GruposPizarra.svelte';
  import PlanoPizarra from '$lib/components/pizarra/PlanoPizarra.svelte';
  import Temporizador from '$lib/components/pizarra/Temporizador.svelte';
  import AgendaClase from '$lib/components/pizarra/AgendaClase.svelte';
  import SemaforoRuido from '$lib/components/pizarra/SemaforoRuido.svelte';

  let { data } = $props();

  const TABS = [
    { id: 'azar', lbl: '🎲 Al azar' },
    { id: 'grupos', lbl: '👥 Grupos' },
    { id: 'plano', lbl: '🪑 Plano' },
    { id: 'tiempo', lbl: '⏱️ Temporizador' },
    { id: 'agenda', lbl: '📋 Agenda' },
    { id: 'ruido', lbl: '🔊 Ruido' }
  ] as const;
  type Tab = (typeof TABS)[number]['id'];

  const inicial = page.url.searchParams.get('tab');
  let tab = $state<Tab>(TABS.some((t) => t.id === inicial) ? (inicial as Tab) : 'azar');
</script>

<svelte:head><title>Pizarra — {data.cursoNombre}</title></svelte:head>

<div class="space-y-4">
  <div class="flex flex-wrap items-center gap-3">
    <a href="/pizarra" class="px-4 py-3 rounded-xl bg-gray-100 text-gray-700 text-lg">← Cursos</a>
    <p class="text-2xl md:text-3xl font-bold text-gray-900">{data.cursoNombre}</p>
    <span class="text-lg text-gray-500">{data.roster.length} alumnos</span>
  </div>

  <nav class="flex flex-wrap gap-2">
    {#each TABS as t}
      <button onclick={() => (tab = t.id)}
        class="px-5 py-4 rounded-2xl text-xl font-semibold transition-colors
               {tab === t.id ? 'bg-indigo-600 text-white' : 'bg-white border-2 border-gray-200 text-gray-700'}">
        {t.lbl}
      </button>
    {/each}
  </nav>

  {#if data.roster.length === 0}
    <p class="text-xl text-amber-700">No se pudo traer la lista de alumnos desde Moodle.</p>
  {/if}

  <!-- Todas montadas: cambiar de pestaña no corta el temporizador ni el micrófono.
       {#key}: al cambiar de curso se reinician (cada curso tiene su ronda y su agenda). -->
  {#key data.cursoId}
  <section class:hidden={tab !== 'azar'}><AlumnoAlAzar cursoId={data.cursoId} roster={data.roster} /></section>
  <section class:hidden={tab !== 'grupos'}>
    <GruposPizarra agrupaciones={data.agrupaciones} azar={data.azar} azarTamano={data.azarTamano} />
  </section>
  <section class:hidden={tab !== 'plano'}><PlanoPizarra plano={data.plano} cursoId={data.cursoId} /></section>
  <section class:hidden={tab !== 'tiempo'}><Temporizador /></section>
  <section class:hidden={tab !== 'agenda'}><AgendaClase cursoId={data.cursoId} /></section>
  <section class:hidden={tab !== 'ruido'}><SemaforoRuido /></section>
  {/key}
</div>

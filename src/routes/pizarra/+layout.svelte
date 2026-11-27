<script lang="ts">
  import { onMount } from 'svelte';

  let { data, children } = $props();

  // La pizarra es un equipo compartido: si nadie la toca en un rato, se cierra
  // la sesión sola (con un minuto de aviso). Mientras corre el temporizador
  // cuenta como actividad (evento 'pizarra:actividad').
  const INACTIVIDAD_MS = 15 * 60 * 1000;
  const AVISO_S = 60;

  let ultimo = Date.now();
  let restante = $state<number | null>(null);
  let pantallaCompleta = $state(false);
  let formSalir: HTMLFormElement | undefined = $state();

  function actividad() {
    ultimo = Date.now();
    restante = null;
  }
  function salir() {
    formSalir?.requestSubmit();
  }
  async function alternarPantallaCompleta() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      // algunos navegadores de pizarra no lo permiten: no pasa nada
    }
  }

  onMount(() => {
    const eventos = ['pointerdown', 'keydown', 'wheel', 'pizarra:actividad'];
    eventos.forEach((e) => window.addEventListener(e, actividad));
    const onFs = () => (pantallaCompleta = !!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    const t = setInterval(() => {
      const inactivo = Date.now() - ultimo;
      if (inactivo >= INACTIVIDAD_MS) salir();
      else if (inactivo >= INACTIVIDAD_MS - AVISO_S * 1000)
        restante = Math.ceil((INACTIVIDAD_MS - inactivo) / 1000);
    }, 1000);
    return () => {
      eventos.forEach((e) => window.removeEventListener(e, actividad));
      document.removeEventListener('fullscreenchange', onFs);
      clearInterval(t);
    };
  });
</script>

<div class="min-h-screen bg-slate-50 flex flex-col select-none">
  <header class="flex items-center gap-3 px-4 py-2 bg-white border-b border-gray-200">
    <a href="/pizarra" class="text-lg font-bold text-indigo-700">🖥️ Modo pizarra</a>
    <span class="text-sm text-gray-500 hidden sm:inline">· {data.nombreDocente}</span>
    <div class="ml-auto flex items-center gap-2">
      <button onclick={alternarPantallaCompleta}
        class="px-4 py-3 rounded-xl bg-gray-100 text-gray-700 text-base font-medium active:bg-gray-200">
        {pantallaCompleta ? '🗗 Salir de pantalla completa' : '⛶ Pantalla completa'}
      </button>
      <form method="POST" action="/auth?/logout" bind:this={formSalir}>
        <input type="hidden" name="volver" value="/pizarra" />
        <button type="submit" class="px-5 py-3 rounded-xl bg-red-600 text-white text-base font-bold active:bg-red-700">
          🚪 Cerrar sesión
        </button>
      </form>
    </div>
  </header>

  <main class="flex-1 p-4">
    {@render children()}
  </main>

  {#if restante != null}
    <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-8 text-center space-y-4 max-w-md">
        <p class="text-2xl font-bold text-gray-900">¿Seguís ahí?</p>
        <p class="text-lg text-gray-600">La sesión se cierra en <strong>{restante}</strong> s para proteger tus datos.</p>
        <button onclick={actividad} class="w-full py-4 rounded-xl bg-indigo-600 text-white text-xl font-bold">Sigo acá</button>
      </div>
    </div>
  {/if}
</div>

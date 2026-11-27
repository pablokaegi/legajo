<script lang="ts">
  let { data } = $props();

  function fechaHora(d: string | Date): string {
    return new Date(d).toLocaleString('es-AR', {
      day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  }

  // Identifica el navegador/dispositivo de forma simple a partir del user agent
  function dispositivo(ua: string | null): string {
    if (!ua) return 'Desconocido';
    if (/Android/i.test(ua)) return 'Android';
    if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
    if (/Windows/i.test(ua)) return 'Windows';
    if (/Macintosh|Mac OS/i.test(ua)) return 'Mac';
    if (/Linux/i.test(ua)) return 'Linux';
    return 'Otro';
  }

  function iniciales(n: string): string {
    return n.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  }
</script>

<svelte:head><title>Últimos conectados — Configuración</title></svelte:head>

<div class="space-y-3">
  <p class="text-xs text-gray-500">
    Últimas {data.conexiones.length} sesiones iniciadas. Una sesión "activa" sigue
    vigente; "cerrada" venció o se cerró sesión.
  </p>

  {#if data.conexiones.length === 0}
    <div class="card text-center py-8">
      <p class="text-gray-500 text-sm">No hay sesiones registradas.</p>
    </div>
  {:else}
    <div class="space-y-2">
      {#each data.conexiones as c}
        <div class="card flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
            {iniciales(c.nombre)}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">{c.nombre}</p>
            <p class="text-xs text-gray-500 truncate">{c.email}</p>
            <p class="text-xs text-gray-400">
              🕒 {fechaHora(c.createdAt)} · 💻 {dispositivo(c.userAgent)}{c.ip ? ` · ${c.ip}` : ''}
            </p>
          </div>
          <span
            class="text-xs px-2 py-0.5 rounded-full flex-shrink-0
                   {c.activa ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}"
          >
            {c.activa ? 'Activa' : 'Cerrada'}
          </span>
        </div>
      {/each}
    </div>
  {/if}
</div>

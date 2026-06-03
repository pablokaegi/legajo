<script lang="ts">
  import { INSTITUCION } from '$lib/institucional.js';

  let { data } = $props();

  function ext(path: string): string {
    return path.split('.').pop()?.toLowerCase() ?? '';
  }
  function esImagen(p: string): boolean {
    return ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext(p));
  }
  function esPdf(p: string): boolean {
    return ext(p) === 'pdf';
  }
  function imprimir() {
    window.print();
  }
</script>

<svelte:head>
  <title>Archivo de autorizaciones — {data.salida.titulo}</title>
  <style>
    @media print {
      .no-print { display: none !important; }
      .pagina-rotura { page-break-after: always; }
      body { background: white !important; }
    }
  </style>
</svelte:head>

<div class="space-y-4">
  <!-- Barra de acciones (no se imprime) -->
  <div class="flex items-center justify-between gap-2 no-print">
    <a href="/institucional/salidas/{data.salida.id}" class="text-indigo-600 text-sm hover:underline">
      ← Volver a la salida
    </a>
    <button onclick={imprimir} class="btn-primary text-sm">
      🖨 Imprimir / Guardar PDF
    </button>
  </div>

  <!-- Encabezado institucional (sí se imprime) -->
  <div class="card bg-indigo-50 border-indigo-200 space-y-1">
    <div class="flex items-center gap-3">
      <img
        src={INSTITUCION.logo}
        alt=""
        class="h-12 w-12 object-contain bg-white rounded-lg p-1 flex-shrink-0"
        onerror={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
      />
      <div>
        <p class="text-sm font-bold text-indigo-800">{INSTITUCION.nombre}</p>
        <p class="text-xs text-indigo-600">{INSTITUCION.nivel}</p>
      </div>
    </div>
    <h1 class="text-xl font-bold text-gray-900 pt-2">{data.salida.titulo}</h1>
    <div class="text-sm text-gray-700 grid sm:grid-cols-2 gap-x-4 gap-y-0.5 pt-1">
      <p>📅 <strong>Fecha:</strong> {data.salida.fecha}</p>
      <p>🎓 <strong>Curso:</strong> {data.salida.cursoNombre}</p>
      <p>📍 <strong>Destino:</strong> {data.salida.destino}</p>
      <p>👤 <strong>Responsable:</strong> {data.salida.responsableNombre}</p>
    </div>
    <p class="text-xs text-gray-500 pt-2">
      Autorizaciones recibidas: <strong class="text-green-700">{data.recibidas.length}</strong>
      {#if data.pendientes.length > 0}
        · Pendientes: <strong class="text-amber-700">{data.pendientes.length}</strong>
      {/if}
    </p>
  </div>

  <!-- Pendientes (no se imprime, es referencia interna) -->
  {#if data.pendientes.length > 0}
    <div class="card bg-amber-50 border-amber-200 no-print">
      <p class="text-sm font-semibold text-amber-800 mb-1">⏳ Pendientes ({data.pendientes.length})</p>
      <p class="text-xs text-amber-700">{data.pendientes.map((a) => a.alumnoNombre).join(' · ')}</p>
    </div>
  {/if}

  <!-- Autorizaciones recibidas -->
  {#if data.recibidas.length === 0}
    <div class="card text-center py-10">
      <p class="text-3xl mb-2">📭</p>
      <p class="text-gray-500 text-sm">Todavía no se recibieron autorizaciones para esta salida.</p>
    </div>
  {:else}
    <div class="space-y-3">
      {#each data.recibidas as aut, i}
        <div class="card space-y-2 {i < data.recibidas.length - 1 ? 'pagina-rotura' : ''}">
          <div class="flex items-start justify-between gap-2">
            <div>
              <p class="font-semibold text-gray-900">{aut.alumnoNombre}</p>
              <p class="text-xs text-gray-500">
                Autorización para "{data.salida.titulo}" — {data.salida.cursoNombre}
              </p>
            </div>
            <p class="text-xs text-gray-400 flex-shrink-0">
              {aut.documentoSubidoAt ? new Date(aut.documentoSubidoAt).toLocaleDateString('es-AR') : ''}
            </p>
          </div>

          {#if esImagen(aut.documentoPath!)}
            <img
              src="/autorizar/{aut.uploadToken}/archivo"
              alt="Autorización de {aut.alumnoNombre}"
              class="w-full max-h-[800px] object-contain border border-gray-200 rounded-lg bg-gray-50"
            />
          {:else if esPdf(aut.documentoPath!)}
            <embed
              src="/autorizar/{aut.uploadToken}/archivo"
              type="application/pdf"
              class="w-full h-[800px] border border-gray-200 rounded-lg"
            />
            <p class="text-xs text-gray-500 no-print">
              📎 PDF — <a href="/autorizar/{aut.uploadToken}/archivo" target="_blank" class="text-indigo-600 hover:underline">abrir en nueva pestaña</a>
            </p>
          {:else}
            <div class="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-3">
              <span class="text-2xl">📎</span>
              <span class="text-sm text-gray-700">Archivo adjunto ({ext(aut.documentoPath!).toUpperCase()})</span>
              <a
                href="/autorizar/{aut.uploadToken}/archivo"
                target="_blank"
                class="ml-auto text-xs text-indigo-600 hover:underline no-print"
              >Abrir</a>
            </div>
          {/if}
        </div>
      {/each}
    </div>

    <!-- Pie con instrucciones para supervisión (no se imprime) -->
    <div class="card bg-gray-50 no-print text-xs text-gray-600 space-y-1">
      <p class="font-semibold text-gray-800">💡 Para enviar a supervisión</p>
      <p>
        Apretá <strong>Imprimir / Guardar PDF</strong> y elegí "Guardar como PDF" en el destino.
        Te queda un único archivo con todas las autorizaciones que podés adjuntar al mail.
      </p>
      <p>
        Para una autorización individual: abrila desde el listado de la salida y guardala desde el navegador.
      </p>
    </div>
  {/if}
</div>

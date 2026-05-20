<script lang="ts">
  import { INSTITUCION } from '$lib/institucional.js';
  let { data, form } = $props();
  const { aut } = data;
  const { salida } = aut;

  let archivo = $state<File | null>(null);
  let enviando = $state(false);

  function onFile(e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    archivo = input.files?.[0] ?? null;
  }

  const yaSubido = aut.documentoPath || form?.ok;
</script>

<svelte:head><title>Autorización — {salida.titulo}</title></svelte:head>

<div class="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-4">
  <div class="w-full max-w-lg bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

    <!-- Header institucional -->
    <div class="bg-indigo-700 text-white px-5 py-4 flex items-center gap-3">
      <img src={INSTITUCION.logo} alt="Logo PDS"
        class="h-12 w-12 object-contain bg-white rounded-lg p-1 flex-shrink-0"
        onerror={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
      <div>
        <p class="font-bold text-sm">{INSTITUCION.nombre}</p>
        <p class="text-xs text-indigo-200">{INSTITUCION.nivel}</p>
        <p class="text-xs text-indigo-200">{INSTITUCION.telefono} · {INSTITUCION.email}</p>
      </div>
    </div>

    <div class="p-5 space-y-5">

      <!-- Alumno destacado -->
      <div class="bg-indigo-50 rounded-xl px-4 py-3 flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center flex-shrink-0">
          <span class="text-indigo-700 font-bold text-base">
            {aut.alumnoNombre.split(' ').map((w: string) => w[0]).slice(0, 2).join('')}
          </span>
        </div>
        <div>
          <p class="text-xs text-indigo-500 font-medium">Alumno/a</p>
          <p class="font-semibold text-indigo-900">{aut.alumnoNombre}</p>
        </div>
      </div>

      <!-- Datos de la salida -->
      <div>
        <h1 class="text-base font-bold text-gray-900">{salida.titulo}</h1>
      </div>

      <div class="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-500">Destino</span>
          <span class="font-medium text-right">{salida.destino}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">Fecha</span>
          <span class="font-medium">{salida.fecha}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">Curso</span>
          <span class="font-medium">{salida.cursoNombre}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">Docente</span>
          <span class="font-medium text-right">{salida.responsableNombre}</span>
        </div>
        {#if salida.costoEstimado}
          <div class="flex justify-between">
            <span class="text-gray-500">Costo estimado</span>
            <span class="font-medium">{salida.costoEstimado}</span>
          </div>
        {/if}
      </div>

      <!-- Ya fue subido -->
      {#if yaSubido}
        <div class="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p class="text-3xl mb-2">✅</p>
          <p class="text-sm font-semibold text-green-800">¡Autorización recibida!</p>
          <p class="text-xs text-green-600 mt-1">
            La autorización de <strong>{aut.alumnoNombre}</strong> fue enviada correctamente al establecimiento.
          </p>
        </div>

      {:else}
        <!-- Error -->
        {#if form?.error}
          <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {form.error}
          </div>
        {/if}

        <!-- Instrucciones -->
        <div class="text-sm text-gray-600 space-y-1">
          <p class="font-medium text-gray-800">📎 Subir autorización firmada</p>
          <p class="text-xs text-gray-500">
            Tomá una foto o escaneá la autorización con la firma del padre/madre/tutor
            y subila en formato PDF, JPG o PNG (máx. 10 MB).
          </p>
        </div>

        <!-- Formulario upload -->
        <form method="POST" action="?/subir" enctype="multipart/form-data" class="space-y-3"
          onsubmit={() => enviando = true}>
          <div>
            <label class="form-label">Seleccionar archivo *</label>
            <input type="file" name="archivo" accept=".pdf,.jpg,.jpeg,.png,.webp"
              required onchange={onFile}
              class="block w-full text-sm text-gray-700
                     file:mr-3 file:py-2 file:px-4
                     file:rounded-lg file:border-0
                     file:text-sm file:font-medium
                     file:bg-indigo-50 file:text-indigo-700
                     hover:file:bg-indigo-100 cursor-pointer" />
          </div>

          {#if archivo}
            <div class="text-xs text-gray-500 bg-gray-50 rounded px-3 py-2">
              📄 {archivo.name} · {(archivo.size / 1024).toFixed(0)} KB
            </div>
          {/if}

          <button type="submit" disabled={enviando}
            class="btn-primary w-full text-sm {enviando ? 'opacity-60 cursor-not-allowed' : ''}">
            {enviando ? 'Subiendo...' : '⬆ Enviar autorización'}
          </button>
        </form>
      {/if}

    </div>

    <!-- Pie -->
    <div class="bg-gray-50 border-t border-gray-100 px-5 py-3 text-xs text-gray-400 text-center">
      {INSTITUCION.nombre} · {INSTITUCION.direccion}
    </div>
  </div>
</div>

<script lang="ts">
  import { INSTITUCION } from '$lib/institucional.js';
  let { data, form } = $props();
  const { salida, imprimir } = data;
  let editando = $state(false);

  const ESTADO_COLOR: Record<string, string> = {
    borrador:  'bg-gray-100 text-gray-600',
    aprobado:  'bg-blue-100 text-blue-700',
    realizado: 'bg-green-100 text-green-700',
    cancelado: 'bg-red-100 text-red-600'
  };

  const ESTADOS = ['borrador', 'aprobado', 'realizado', 'cancelado'];

  // Public upload link
  const linkAutorizacion = typeof window !== 'undefined'
    ? `${window.location.origin}/autorizar/${salida.uploadToken}`
    : `/autorizar/${salida.uploadToken}`;

  function copiarLink() {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(linkAutorizacion);
    }
  }
</script>

<svelte:head><title>{salida.titulo} — Legajo</title></svelte:head>

<!-- VISTA IMPRESIÓN -->
{#if imprimir}
  <div class="print-only max-w-2xl mx-auto p-6 text-sm text-gray-900">
    <!-- Encabezado institucional -->
    <div class="flex items-center gap-4 border-b-2 border-gray-800 pb-4 mb-6">
      <img src={INSTITUCION.logo} alt="Logo" class="h-16 w-16 object-contain"
        onerror={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
      <div class="flex-1">
        <p class="font-bold text-base">{INSTITUCION.nombre}</p>
        <p class="text-xs">{INSTITUCION.nivel}</p>
        <p class="text-xs">{INSTITUCION.direccion}</p>
        <p class="text-xs">Tel.: {INSTITUCION.telefono} | {INSTITUCION.email}</p>
      </div>
    </div>

    <h1 class="text-center text-base font-bold uppercase mb-1">AUTORIZACIÓN DE SALIDA DIDÁCTICA</h1>
    <p class="text-center text-xs text-gray-500 mb-6">Formulario de autorización – Complete y devuelva firmado</p>

    <!-- Datos del viaje -->
    <div class="border border-gray-300 rounded p-4 mb-5 space-y-2">
      <p><strong>Actividad:</strong> {salida.titulo}</p>
      <p><strong>Destino:</strong> {salida.destino}</p>
      <p><strong>Fecha:</strong> {salida.fecha}</p>
      <p><strong>Curso / Grupo:</strong> {salida.cursoNombre}</p>
      <p><strong>Docente responsable:</strong> {salida.responsableNombre}</p>
      {#if salida.cantidadAlumnos}
        <p><strong>Cantidad de alumnos:</strong> {salida.cantidadAlumnos}</p>
      {/if}
      {#if salida.costoEstimado}
        <p><strong>Costo estimado por alumno:</strong> {salida.costoEstimado}</p>
      {/if}
      {#if salida.descripcion}
        <p class="mt-2 text-xs text-gray-700 whitespace-pre-wrap">{salida.descripcion}</p>
      {/if}
    </div>

    <!-- Sección firma -->
    <div class="border border-gray-300 rounded p-4 mb-5">
      <p class="font-semibold mb-4">Autorización del padre / madre / tutor</p>
      <p class="mb-6 text-xs">Yo, _________________________________ (nombre y apellido), DNI ___________________,
      en carácter de padre / madre / tutor del/la alumno/a
      _________________________________, autorizo su participación en la salida didáctica
      descripta arriba.</p>
      <div class="flex gap-8 mt-6">
        <div class="flex-1">
          <div class="border-b border-gray-400 mb-1 h-8"></div>
          <p class="text-xs text-center">Firma y aclaración</p>
        </div>
        <div class="w-36">
          <div class="border-b border-gray-400 mb-1 h-8"></div>
          <p class="text-xs text-center">Fecha</p>
        </div>
      </div>
    </div>

    <!-- Pie -->
    <p class="text-xs text-gray-400 text-center">{INSTITUCION.nombre} · {INSTITUCION.direccion}</p>

    <!-- Botón solo visible en pantalla -->
    <div class="no-print mt-6 text-center">
      <button onclick={() => window.print()} class="btn-primary text-sm">🖨 Imprimir</button>
      <a href="/institucional/salidas/{salida.id}" class="ml-3 text-sm text-indigo-600 hover:underline">← Volver</a>
    </div>
  </div>

<!-- VISTA NORMAL -->
{:else}
  <div class="space-y-4">
    <div>
      <a href="/institucional/salidas" class="text-indigo-600 text-sm hover:underline">← Salidas</a>
      <div class="flex items-start justify-between mt-1 gap-2">
        <h2 class="text-lg font-bold text-gray-900 flex-1">{salida.titulo}</h2>
        <span class="text-xs px-2 py-0.5 rounded-full flex-shrink-0 {ESTADO_COLOR[salida.estado] ?? 'bg-gray-100 text-gray-600'}">{salida.estado}</span>
      </div>
    </div>

    {#if form?.error}
      <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{form.error}</div>
    {/if}

    {#if !editando}
      <!-- Datos -->
      <div class="card space-y-3">
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">Fecha</span>
          <span class="font-medium">{salida.fecha}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">Destino</span>
          <span class="font-medium">{salida.destino}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">Curso / Grupo</span>
          <span class="font-medium">{salida.cursoNombre}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">Docente responsable</span>
          <span class="font-medium">{salida.responsableNombre}</span>
        </div>
        {#if salida.cantidadAlumnos}
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Cantidad de alumnos</span>
            <span class="font-medium">{salida.cantidadAlumnos}</span>
          </div>
        {/if}
        {#if salida.costoEstimado}
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Costo estimado</span>
            <span class="font-medium">{salida.costoEstimado}</span>
          </div>
        {/if}
        {#if salida.descripcion}
          <div class="text-sm">
            <span class="text-gray-500 block mb-1">Descripción</span>
            <p class="text-gray-700 whitespace-pre-wrap text-xs">{salida.descripcion}</p>
          </div>
        {/if}
        {#if salida.notas}
          <div class="text-sm">
            <span class="text-gray-500 block mb-1">Notas internas</span>
            <p class="text-gray-600 italic text-xs whitespace-pre-wrap">{salida.notas}</p>
          </div>
        {/if}
      </div>

      <!-- Documento subido -->
      {#if salida.documentoPath}
        <div class="card bg-green-50 border-green-200">
          <p class="text-sm font-medium text-green-800 mb-1">📎 Documento recibido</p>
          <p class="text-xs text-green-700">{salida.documentoNombre ?? 'Archivo subido'}</p>
          {#if salida.documentoSubidoAt}
            <p class="text-xs text-green-600 mt-0.5">Subido: {new Date(salida.documentoSubidoAt).toLocaleString('es-AR')}</p>
          {/if}
          <a href="/autorizar/{salida.uploadToken}/archivo" target="_blank"
            class="mt-2 inline-block text-xs text-green-700 underline hover:text-green-900">
            Ver documento
          </a>
        </div>
      {:else}
        <div class="card bg-amber-50 border-amber-200">
          <p class="text-sm font-medium text-amber-800 mb-1">📋 Documento pendiente</p>
          <p class="text-xs text-amber-700 mb-2">Todavía no se subió la autorización firmada.</p>
        </div>
      {/if}

      <!-- Link público -->
      <div class="card space-y-2">
        <p class="text-xs font-semibold text-gray-700">🔗 Link para subir documento (sin login)</p>
        <p class="text-xs text-gray-500">Compartí este link con el docente para que suba la autorización firmada sin necesidad de ingresar al sistema.</p>
        <div class="flex gap-2 items-center">
          <input type="text" readonly value={linkAutorizacion}
            class="form-input text-xs flex-1 bg-gray-50 cursor-text" />
          <button onclick={copiarLink}
            class="btn-secondary text-xs flex-shrink-0 px-3">Copiar</button>
        </div>
        <a href="/autorizar/{salida.uploadToken}" target="_blank"
          class="text-xs text-indigo-600 hover:underline">Abrir link →</a>
      </div>

      <!-- Acciones -->
      <div class="flex gap-2 flex-wrap">
        <a href="/institucional/salidas/{salida.id}?imprimir"
          class="btn-secondary text-sm flex-1 text-center">🖨 Ver autorización</a>
        <button onclick={() => editando = true}
          class="btn-secondary text-sm flex-1">✏️ Editar</button>
      </div>

    {:else}
      <!-- Formulario edición -->
      <form method="POST" action="?/editar" class="space-y-4">
        <div>
          <label class="form-label">Título *</label>
          <input type="text" name="titulo" required maxlength="200" value={salida.titulo} class="form-input" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="form-label">Fecha *</label>
            <input type="date" name="fecha" required value={salida.fecha} class="form-input" />
          </div>
          <div>
            <label class="form-label">Cantidad de alumnos</label>
            <input type="number" name="cantidadAlumnos" min="1" max="500"
              value={salida.cantidadAlumnos ?? ''} class="form-input" />
          </div>
        </div>

        <div>
          <label class="form-label">Destino *</label>
          <input type="text" name="destino" required maxlength="300" value={salida.destino} class="form-input" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="form-label">Docente responsable *</label>
            <input type="text" name="responsableNombre" required maxlength="200"
              value={salida.responsableNombre} class="form-input" />
          </div>
          <div>
            <label class="form-label">Curso / grupo *</label>
            <input type="text" name="cursoNombre" required maxlength="200"
              value={salida.cursoNombre} class="form-input" />
          </div>
        </div>

        <div>
          <label class="form-label">Descripción / objetivos</label>
          <textarea name="descripcion" rows="3" maxlength="3000"
            class="form-input resize-none">{salida.descripcion ?? ''}</textarea>
        </div>

        <div>
          <label class="form-label">Costo estimado por alumno</label>
          <input type="text" name="costoEstimado" maxlength="50"
            value={salida.costoEstimado ?? ''} class="form-input" />
        </div>

        <div>
          <label class="form-label">Estado</label>
          <select name="estado" class="form-input">
            {#each ESTADOS as est}
              <option value={est} selected={salida.estado === est}>{est}</option>
            {/each}
          </select>
        </div>

        <div>
          <label class="form-label">Notas internas</label>
          <textarea name="notas" rows="2" maxlength="2000"
            class="form-input resize-none">{salida.notas ?? ''}</textarea>
        </div>

        <div class="flex gap-3">
          <button type="submit" class="btn-primary flex-1">Guardar cambios</button>
          <button type="button" onclick={() => editando = false} class="btn-secondary flex-1">Cancelar</button>
        </div>
      </form>
    {/if}
  </div>
{/if}

<style>
  @media print {
    .no-print { display: none !important; }
  }
</style>

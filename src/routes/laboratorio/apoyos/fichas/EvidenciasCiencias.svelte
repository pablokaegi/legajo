<script lang="ts">
  import type { PageData } from './$types';

  let { evidencias, alumno, ficha }: { evidencias: NonNullable<PageData['evidencias']>; alumno: string; ficha: PageData['ficha'] } = $props();
  const fecha = new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Argentina/Cordoba'
  });
  const numero = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });
</script>

<section class="card space-y-4" aria-labelledby="evidencias-ciencias">
  <header class="flex flex-wrap items-baseline justify-between gap-2">
    <h2 id="evidencias-ciencias" class="text-xl font-semibold text-gray-900">Evidencia de Ciencias de {alumno}</h2>
    <a class="text-sm font-medium text-indigo-700 underline" href="#decision-apoyo">Revisar el apoyo</a>
  </header>

  {#if ficha}
    <div class="rounded-lg bg-indigo-50 px-3 py-2">
      <h3 class="text-sm font-semibold text-gray-900">Apoyo acordado</h3>
      <p class="whitespace-pre-wrap text-sm text-gray-800">{ficha.ajuste}</p>
      <p class="mt-1 text-sm text-gray-700">{ficha.ofrecido === 'si' ? 'Se ofreció el apoyo.' : ficha.ofrecido === 'no' ? 'No se ofreció el apoyo.' : 'Pendiente de registrar si se ofreció.'}</p>
    </div>
  {/if}

  <div class="grid gap-4 border-y border-gray-200 py-3 sm:grid-cols-2">
    <div>
      <h3 class="font-semibold text-gray-900">Cuestionario de Moodle</h3>
      {#if evidencias.cuestionario.url}
        <a class="text-indigo-700 underline" href={evidencias.cuestionario.url} target="_blank" rel="noreferrer">{evidencias.cuestionario.titulo}</a>
      {/if}
      {#if evidencias.cuestionario.ultimo}
        <p class="text-sm text-gray-700">Último intento · {evidencias.cuestionario.ultimo.numero} · {evidencias.cuestionario.ultimo.estado}</p>
      {:else}
        <p class="text-sm text-gray-700">{evidencias.cuestionario.estado}</p>
      {/if}
    </div>
    <div>
      <h3 class="font-semibold text-gray-900">Libro de Moodle</h3>
      {#if evidencias.libro.url}
        <a class="text-indigo-700 underline" href={evidencias.libro.url} target="_blank" rel="noreferrer">{evidencias.libro.titulo}</a>
      {/if}
      <p class="text-sm text-gray-700">{evidencias.libro.estado}{evidencias.libro.revision ? ' · Versión ' + evidencias.libro.revision : ''}</p>
    </div>
  </div>

  <div>
    <h3 class="font-semibold text-gray-900">Resultados por objetivo</h3>
    {#if evidencias.cuestionario.intento}
      <p class="text-sm text-gray-600">
        Puntajes del intento {evidencias.cuestionario.intento.numero}
        {#if evidencias.cuestionario.intento.fecha} · {fecha.format(evidencias.cuestionario.intento.fecha * 1000)}{/if}
      </p>
    {/if}
  </div>
  <div class="grid gap-3 lg:grid-cols-3">
    {#each evidencias.objetivos as objetivo (objetivo.nombre)}
      <article class="rounded-lg border border-gray-200 p-3">
        <h4 class="font-semibold text-gray-900">{objetivo.nombre}</h4>
        <p class="mt-1 flex flex-wrap items-baseline gap-x-1 text-sm text-gray-800" data-resultado>
          {#if objetivo.puntaje !== null}<strong>{numero.format(objetivo.puntaje)}/1</strong><span aria-hidden="true">·</span>{/if}
          <span>{objetivo.estado}</span>
        </p>
        {#if objetivo.capitulos.length}
          <p class="mt-3 text-sm font-medium text-gray-700">Para practicar en el Libro</p>
          <ul class="mt-1 space-y-1 text-sm">
            {#each objetivo.capitulos as capitulo (capitulo.url)}
              <li>
                <a class="text-indigo-700 underline" href={capitulo.url} target="_blank" rel="noreferrer">{capitulo.titulo}</a>
                {#if capitulo.audio}<span class="text-gray-600"> · Audio opcional</span>{/if}
              </li>
            {/each}
          </ul>
        {:else if evidencias.libro.url}
          <p class="mt-3 text-sm text-gray-600">Sin capítulo vinculado a este objetivo.</p>
        {/if}
      </article>
    {/each}
  </div>
</section>

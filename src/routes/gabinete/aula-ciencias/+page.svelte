<script lang="ts">
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
  let conIntentos = $derived(data.estudiantes.filter((e) => e.intentos.length));
  let sinIntentos = $derived(data.estudiantes.filter((e) => !e.errorLectura && !e.intentos.length));
  let sinLectura = $derived(data.estudiantes.filter((e) => e.errorLectura));
  const fecha = new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Argentina/Cordoba'
  });
  const numero = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });
</script>

<svelte:head><title>Objetivos de Ciencias · Gabinete</title></svelte:head>

<div class="space-y-4">
  <header class="card flex flex-wrap items-start justify-between gap-4">
    <div>
      <h2 class="text-xl font-semibold text-gray-900">Objetivos de Ciencias</h2>
      <p class="mt-1 text-sm text-gray-700">{data.titulo}</p>
      <p class="mt-1 text-sm text-gray-600">Práctica formativa · Resultados por intento desde Moodle de prueba</p>
    </div>
    <form method="GET" data-sveltekit-reload>
      <button class="btn-secondary min-h-11" type="submit">Actualizar resultados</button>
    </form>
  </header>

  {#each conIntentos as estudiante (estudiante.id)}
    <section class="card">
      <div class="flex flex-wrap items-baseline justify-between gap-2">
        <h3 class="font-semibold text-gray-900">{estudiante.nombre}</h3>
        <a class="text-sm font-medium text-indigo-700 underline" href={'/laboratorio/apoyos/fichas?alumnoId=' + estudiante.id}
          aria-label={'Abrir ficha de apoyos de ' + estudiante.nombre}>Abrir ficha de apoyos</a>
      </div>
      {#each estudiante.intentos as intento (intento.id)}
        <div class="mt-3 border-t border-gray-200 pt-3">
          <p class="text-sm text-gray-700">
            Intento {intento.numero} · {intento.estado}
            {#if intento.fecha} · {fecha.format(intento.fecha * 1000)}{/if}
          </p>
          {#if intento.puntajes}
            <dl class="mt-2 grid gap-2 sm:grid-cols-3">
              {#each data.objetivos as objetivo, i}
                {@const valor = intento.puntajes[i]}
                <div class="rounded-lg bg-gray-50 p-3">
                  <dt class="text-sm font-medium text-gray-800">{objetivo}</dt>
                  <dd class="mt-1 text-sm text-gray-700">
                    {#if valor === null}
                      Pendiente de corrección
                    {:else}
                      <strong>{numero.format(valor)}/1</strong> ·
                      {valor === 1 ? 'Logrado en este intento' : valor === 0 ? 'Sin puntaje en este intento' : 'Logro parcial'}
                    {/if}
                  </dd>
                </div>
              {/each}
            </dl>
          {/if}
        </div>
      {/each}
    </section>
  {/each}

  {#if sinIntentos.length}
    <section class="card">
      <h3 class="font-semibold text-gray-900">Sin intento ({sinIntentos.length})</h3>
      <p class="mt-1 text-sm text-gray-600">Todavía no hay evidencia del cuestionario para estos estudiantes.</p>
      <ul class="mt-2 grid gap-1 text-sm text-gray-700 sm:grid-cols-2">
        {#each sinIntentos as estudiante (estudiante.id)}
          <li><a class="text-indigo-700 underline" href={'/laboratorio/apoyos/fichas?alumnoId=' + estudiante.id}
            aria-label={'Abrir ficha de apoyos de ' + estudiante.nombre}>{estudiante.nombre}</a></li>
        {/each}
      </ul>
    </section>
  {/if}
  {#if sinLectura.length}
    <section class="card border-amber-300">
      <h3 class="font-semibold text-amber-900">Lectura pendiente de verificar</h3>
      <p class="mt-1 text-sm text-gray-700">Actualizá los resultados para volver a consultar a Moodle.</p>
      <ul class="mt-2 text-sm text-gray-700">
        {#each sinLectura as estudiante (estudiante.id)}
          <li><a class="text-indigo-700 underline" href={'/laboratorio/apoyos/fichas?alumnoId=' + estudiante.id}
            aria-label={'Abrir ficha de apoyos de ' + estudiante.nombre}>{estudiante.nombre}</a></li>
        {/each}
      </ul>
    </section>
  {/if}
  {#if !data.estudiantes.length}
    <p class="card text-sm text-gray-700">El padrón del curso no tiene estudiantes activos.</p>
  {/if}
</div>

<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { DEMO_KEY, demoInicial, demoSchema, enlaceMoodle, htmlParaMoodle } from '$lib/laboratorio/apoyos';

  type Vista = 'editor' | 'alumno' | 'apoyo';
  let demo = $state(demoInicial());
  let vista = $state<Vista>('editor');
  let listo = $state(false);
  let aviso = $state('');
  let audioDisponible = $state(false);
  let hablando = $state(false);
  let tituloPaso = $state<HTMLHeadingElement>();
  let locucion: SpeechSynthesisUtterance | null = null;

  const vistas: { id: Vista; nombre: string }[] = [
    { id: 'editor', nombre: 'Editor de actividad' },
    { id: 'alumno', nombre: 'Vista del estudiante' },
    { id: 'apoyo', nombre: 'Ficha de apoyos' }
  ];

  const paso = $derived(demo.actividad.pasos.find((item) => item.id === demo.pasoActivo));
  const posicion = $derived(demo.actividad.pasos.findIndex((item) => item.id === demo.pasoActivo));
  const total = $derived(demo.actividad.pasos.length);
  const enlace = $derived(enlaceMoodle(demo.actividad.moodleUrl));
  const completados = $derived(demo.actividad.pasos.filter((item) => demo.completados.includes(item.id)).length);

  onMount(() => {
    audioDisponible = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
    try {
      const anterior = localStorage.getItem(DEMO_KEY);
      if (anterior) {
        const resultado = demoSchema.safeParse(JSON.parse(anterior));
        if (resultado.success) {
          demo = resultado.data;
          if (!demo.actividad.pasos.some((item) => item.id === demo.pasoActivo)) {
            demo.pasoActivo = demo.actividad.pasos[0].id;
          }
        } else {
          aviso = 'El borrador guardado no es compatible. Se cargó el ejemplo.';
        }
      }
    } catch {
      aviso = 'No se pudo leer el borrador local. Se cargó el ejemplo.';
    }
    listo = true;
    return detenerAudio;
  });

  function guardar(mensaje: string) {
    try {
      localStorage.setItem(DEMO_KEY, JSON.stringify(demo));
      aviso = mensaje;
    } catch {
      aviso = 'El navegador bloqueó el guardado. Los cambios siguen disponibles en esta pestaña.';
    }
  }

  function cambiarVista(destino: Vista) {
    if (destino === 'alumno' && !validarActividad()) return;
    detenerAudio();
    aviso = '';
    vista = destino;
  }

  function validarActividad() {
    if (!demo.actividad.titulo.trim() || !demo.actividad.objetivo.trim() ||
        demo.actividad.pasos.some((item) => !item.titulo.trim() || !item.consigna.trim())) {
      aviso = 'Completá el título, el objetivo y las consignas de todos los pasos.';
      return false;
    }
    if (demo.actividad.moodleUrl.trim() && !enlace) {
      aviso = 'El enlace de Moodle debe ser una dirección HTTPS válida.';
      return false;
    }
    return true;
  }

  function agregarPaso() {
    if (total >= 8) return;
    demo.actividad.pasos.push({ id: crypto.randomUUID(), titulo: '', consigna: '', audio: '' });
  }

  function quitarPaso(indice: number) {
    if (total <= 1) return;
    const [quitado] = demo.actividad.pasos.splice(indice, 1);
    demo.completados = demo.completados.filter((id) => id !== quitado.id);
    if (demo.pasoActivo === quitado.id) demo.pasoActivo = demo.actividad.pasos[0].id;
  }

  function moverPaso(indice: number, diferencia: number) {
    const destino = indice + diferencia;
    if (destino < 0 || destino >= total) return;
    const [movido] = demo.actividad.pasos.splice(indice, 1);
    demo.actividad.pasos.splice(destino, 0, movido);
  }

  async function seleccionarPaso(id: string) {
    detenerAudio();
    demo.pasoActivo = id;
    guardar('');
    await tick();
    tituloPaso?.focus();
  }

  async function terminarPaso() {
    if (!paso) return;
    if (!demo.completados.includes(paso.id)) demo.completados.push(paso.id);
    const siguiente = demo.actividad.pasos[posicion + 1];
    if (siguiente) {
      await seleccionarPaso(siguiente.id);
    } else {
      guardar(completados === total ? 'Terminaste todos los pasos.' : 'Paso completado.');
    }
  }

  function detenerAudio() {
    if (locucion) {
      locucion.onend = null;
      locucion.onerror = null;
      locucion = null;
      window.speechSynthesis.cancel();
    }
    hablando = false;
  }

  function escuchar() {
    if (!audioDisponible || !paso?.audio.trim()) return;
    detenerAudio();
    const voz = new SpeechSynthesisUtterance(paso.audio);
    voz.lang = 'es-AR';
    voz.rate = 0.9;
    const voces = window.speechSynthesis.getVoices();
    const preferida = voces.find((item) => item.localService && item.lang.toLowerCase() === 'es-ar') ??
      voces.find((item) => item.localService && item.lang.toLowerCase().startsWith('es'));
    if (preferida) voz.voice = preferida;
    voz.onend = () => { hablando = false; locucion = null; };
    voz.onerror = () => {
      hablando = false;
      locucion = null;
      aviso = 'El dispositivo no pudo reproducir el audio. Podés leer la consigna.';
    };
    locucion = voz;
    hablando = true;
    window.speechSynthesis.speak(voz);
  }

  function exportar() {
    if (!validarActividad()) return;
    const archivo = new Blob([htmlParaMoodle(demo.actividad)], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(archivo);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'actividad-para-moodle.html';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    aviso = 'HTML descargado. Incluye el objetivo y las consignas en texto.';
  }

  function guardarApoyo() {
    if (![demo.apoyo.barrera, demo.apoyo.ajuste, demo.apoyo.responsable, demo.apoyo.revision].every((dato) => dato.trim())) {
      aviso = 'Completá la barrera, el apoyo, el responsable y la fecha de revisión.';
      return;
    }
    guardar('Ficha guardada en este navegador.');
  }
</script>

<svelte:head><title>Laboratorio de apoyos · Legajo</title></svelte:head>

<main class="laboratorio" data-ready={listo}>
  <header class="encabezado">
    <p class="marca">Legajo / Ciencias</p>
    <h1>Laboratorio de apoyos</h1>
    <p>Demo ficticia. Los cambios y el progreso se guardan en este navegador.</p>
  </header>
  <nav aria-label="Vistas del laboratorio">
    {#each vistas as opcion (opcion.id)}
      <button type="button" class:seleccionado={vista === opcion.id} aria-pressed={vista === opcion.id}
        onclick={() => cambiarVista(opcion.id)}>{opcion.nombre}</button>
    {/each}
  </nav>

  {#if vista === 'editor'}
    <form class="panel" onsubmit={(event) => { event.preventDefault(); if (validarActividad()) guardar('Actividad guardada en este navegador.'); }}>
      <h2>Prepará la actividad</h2>
      <div class="campos">
        <label>Título <input bind:value={demo.actividad.titulo} required maxlength="120" /></label>
        <label>Objetivo <textarea bind:value={demo.actividad.objetivo} required maxlength="500" rows="2"></textarea></label>
        <label>Enlace a la actividad en Moodle (opcional)
          <input type="url" bind:value={demo.actividad.moodleUrl} maxlength="2048" placeholder="https://…" />
        </label>
      </div>
      {#each demo.actividad.pasos as item, indice (item.id)}
        <fieldset>
          <legend>Paso {indice + 1}</legend>
          <div class="campos">
            <label>Título del paso <input bind:value={item.titulo} required maxlength="120" /></label>
            <label>Consigna <textarea bind:value={item.consigna} required maxlength="1400" rows="3"></textarea></label>
            <label>Guion para escuchar (opcional)
              <textarea bind:value={item.audio} maxlength="1400" rows="2"></textarea>
            </label>
          </div>
          <div class="acciones">
            <button type="button" disabled={indice === 0} onclick={() => moverPaso(indice, -1)}>Subir paso</button>
            <button type="button" disabled={indice === total - 1} onclick={() => moverPaso(indice, 1)}>Bajar paso</button>
            <button type="button" disabled={total === 1} onclick={() => quitarPaso(indice)}>Quitar paso</button>
          </div>
        </fieldset>
      {/each}
      <div class="acciones">
        <button type="button" disabled={total >= 8} onclick={agregarPaso}>Agregar paso</button>
        <button type="button" onclick={exportar}>Descargar HTML para Moodle</button>
        <button type="submit" class="principal">Guardar actividad</button>
      </div>
    </form>
  {:else if vista === 'alumno'}
    <section class="panel" aria-labelledby="actividad">
      <h2 id="actividad">{demo.actividad.titulo}</h2>
      <p>{demo.actividad.objetivo}</p>
      <label class="progreso">Progreso: {completados} de {total} pasos
        <progress value={completados} max={total}></progress>
      </label>
      {#if paso}
        <div class="consigna">
          <p class="marca">Ahora · Paso {posicion + 1} de {total}</p>
          <h3 bind:this={tituloPaso} tabindex="-1">{paso.titulo}</h3>
          <p class="texto">{paso.consigna}</p>
          {#if paso.audio.trim() && audioDisponible}
            <button type="button" onclick={hablando ? detenerAudio : escuchar}>{hablando ? 'Detener audio' : 'Escuchar el paso'}</button>
          {:else if paso.audio.trim()}
            <p class="nota">Este navegador no ofrece lectura en voz alta.</p>
          {/if}
        </div>
        {#if demo.actividad.pasos[posicion + 1]}
          <p><strong>Después:</strong> {demo.actividad.pasos[posicion + 1].titulo}</p>
        {/if}
        <div class="acciones">
          {#if posicion > 0}
            <button type="button" onclick={() => seleccionarPaso(demo.actividad.pasos[posicion - 1].id)}>Paso anterior</button>
          {/if}
          <button type="button" class="principal" onclick={terminarPaso}>
            {posicion < total - 1 ? 'Completar y seguir' : 'Completar paso'}
          </button>
        </div>
      {/if}
      {#if completados === total}
        <div class="cierre">
          <h3>Terminaste la actividad</h3>
          <p>Prepará tu entrega con la conclusión y los datos que la respaldan.</p>
          {#if enlace}<a href={enlace} target="_blank" rel="noopener noreferrer">Abrir la actividad en Moodle</a>{/if}
        </div>
      {/if}
    </section>
  {:else}
    <form class="panel" onsubmit={(event) => { event.preventDefault(); guardarApoyo(); }}>
      <h2>Ficha de apoyos</h2>
      <p class="nota">Estudiante ficticio: Alex Ejemplo · {demo.actividad.titulo}</p>
      <div class="campos">
        <label>Barrera observada <textarea bind:value={demo.apoyo.barrera} required maxlength="500" rows="2"></textarea></label>
        <label>Apoyo acordado <textarea bind:value={demo.apoyo.ajuste} required maxlength="500" rows="2"></textarea></label>
        <label>Responsable <input bind:value={demo.apoyo.responsable} required maxlength="120" /></label>
        <label>Fecha de revisión <input type="date" bind:value={demo.apoyo.revision} required /></label>
        <label>¿Se ofreció el apoyo?
          <select bind:value={demo.apoyo.ofrecido}>
            <option value="pendiente">Pendiente</option><option value="si">Sí</option><option value="no">No</option>
          </select>
        </label>
        <label>Qué pasó y qué dijo el estudiante
          <textarea bind:value={demo.apoyo.observacion} maxlength="500" rows="3"></textarea>
        </label>
        <label>Próxima decisión
          <select bind:value={demo.apoyo.decision}>
            <option value="pendiente">Pendiente</option><option value="mantener">Mantener</option>
            <option value="ajustar">Ajustar</option><option value="cerrar">Cerrar</option>
          </select>
        </label>
      </div>
      {#if enlace}<p><a href={enlace} target="_blank" rel="noopener noreferrer">Ver actividad de Moodle</a></p>{/if}
      <button type="submit" class="principal">Guardar ficha</button>
    </form>
  {/if}
  <p class="estado" role="status">{aviso}</p>
</main>

<style>
  .laboratorio { max-width: 54rem; margin: 0 auto; padding: clamp(1rem, 4vw, 3rem); color: #162e32; }
  .encabezado { display: grid; gap: .4rem; margin-bottom: 1.5rem; }
  .marca { font-size: .8rem; font-weight: 750; letter-spacing: .06em; text-transform: uppercase; color: #205f5b; }
  h1 { font-size: clamp(1.85rem, 5vw, 2.9rem); line-height: 1.15; font-weight: 800; }
  h2 { font-size: 1.5rem; font-weight: 760; }
  h3 { font-size: 1.25rem; font-weight: 730; }
  nav, .acciones { display: flex; flex-wrap: wrap; gap: .6rem; }
  nav { margin-bottom: 1rem; }
  .panel { display: grid; gap: 1rem; padding: clamp(1rem, 3vw, 1.75rem); background: white; border: 1px solid #ccdbda; border-radius: 1rem; }
  .campos { display: grid; gap: .85rem; }
  fieldset { border: 1px solid #ccdbda; border-radius: .75rem; padding: .9rem; display: grid; gap: .85rem; min-width: 0; }
  legend { padding: 0 .35rem; font-weight: 700; }
  label { display: grid; gap: .35rem; font-weight: 650; }
  input, textarea, select { border: 1px solid #859b9a; border-radius: .5rem; width: 100%; min-width: 0; min-height: 2.75rem; padding: .55rem .7rem; background: #fff; font-weight: 400; }
  textarea { resize: vertical; }
  button { justify-self: start; min-height: 2.75rem; padding: .5rem .8rem; border-radius: .55rem; border: 1px solid #6b8f8c; background: #fff; color: #144743; font-weight: 680; cursor: pointer; }
  button:disabled { opacity: .48; cursor: default; }
  .seleccionado, .principal { background: #195c57; color: white; border-color: #195c57; }
  .consigna, .cierre { background: #edf6f3; border: 1px solid #c1d9d2; padding: 1rem; border-radius: .75rem; display: grid; gap: .65rem; }
  .texto { white-space: pre-wrap; overflow-wrap: anywhere; line-height: 1.65; }
  progress { accent-color: #195c57; width: min(100%, 16rem); }
  .nota { color: #40585b; }
  .estado { min-height: 1.5rem; margin-top: 1rem; font-weight: 650; }
  a { color: #104f48; text-decoration: underline; text-underline-offset: .2em; }
  :is(button, input, textarea, select, a, h3):focus-visible { outline: 3px solid #aa4a0b; outline-offset: 3px; }
</style>

<script lang="ts">
  let { data } = $props();
</script>

<svelte:head><title>Guía de apoyos — Gabinete</title></svelte:head>

<div class="space-y-4">
  <div class="card space-y-1">
    <p class="text-sm font-semibold text-gray-800">Cómo trabaja este módulo</p>
    <ol class="text-sm text-gray-700 space-y-1 list-decimal pl-5">
      <li><strong>Detectar:</strong> la alerta temprana de cada curso cruza asistencia, conducta, rendimiento y vínculos.
        Los docentes y preceptores también pueden derivar desde <em>Derivar al gabinete</em>.</li>
      <li><strong>Evaluar:</strong> el caso entra como "derivado"; con el primer registro pasa a "en evaluación".</li>
      <li><strong>Intervenir:</strong> según el nivel de apoyo (abajo), con un responsable y fecha de revisión.</li>
      <li><strong>Monitorear:</strong> cada caso tiene próxima revisión (nivel 3 cada {data.dias[3]} días, nivel 2 cada
        {data.dias[2]}). Si no hay avance, se ajusta o se sube de nivel; si mejora, pasa a seguimiento o se cierra.</li>
    </ol>
    <p class="text-xs text-gray-400">Modelo de apoyos escalonados (MTSS / Respuesta a la intervención) — Fuchs & Fuchs (2006).</p>
  </div>

  {#each [1, 2, 3] as n}
    {@const g = data.guia[n as 1 | 2 | 3]}
    <div class="card space-y-2">
      <p class="text-sm font-semibold text-gray-800">{g.titulo}</p>
      {#each g.sugerencias as s}
        <div class="border-l-2 border-indigo-300 pl-3">
          <p class="text-sm text-gray-700">{s.texto}</p>
          <p class="text-xs text-gray-400">{s.fundamento}</p>
        </div>
      {/each}
    </div>
  {/each}

  <div class="card space-y-1 text-xs text-gray-600">
    <p class="text-sm font-semibold text-gray-800">Cuidado de la información</p>
    <p>Los casos solo los ven el gabinete y la administración. Quien deriva no ve el caso.</p>
    <p>Usar lenguaje descriptivo (qué se observó, cuándo, dónde), no etiquetas. Registrar también las fortalezas: son el punto de apoyo de cualquier plan.</p>
    <p>La alerta temprana detecta, no diagnostica: confirmar siempre con el equipo docente, el alumno y la familia.</p>
  </div>
</div>

<script lang="ts">
  import KioskoVotacion from '$lib/components/KioskoVotacion.svelte';
  let { data, form } = $props();
</script>

<svelte:head><title>Votación — {data.sesion.titulo}</title></svelte:head>

<div class="space-y-3">
  <a href="/agrupamientos/{data.sesion.id}" class="text-indigo-600 text-sm hover:underline">
    ← Volver al panel
  </a>

  <KioskoVotacion
    titulo={data.sesion.titulo}
    cursoNombre={data.sesion.cursoNombre}
    roster={data.roster}
    yaVotaron={data.yaVotaron}
    asignaciones={data.asignaciones}
    cerrada={data.sesion.estado === 'cerrada'}
    action="?/votar"
    {form}
  />
</div>

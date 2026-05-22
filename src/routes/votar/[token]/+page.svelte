<script lang="ts">
  import KioskoVotacion from '$lib/components/KioskoVotacion.svelte';
  let { data, form } = $props();
</script>

<svelte:head><title>Votación — {data.sesion.titulo}</title></svelte:head>

<div class="min-h-screen bg-gray-50 py-6 px-4">
  <KioskoVotacion
    titulo={data.sesion.titulo}
    cursoNombre={data.sesion.cursoNombre}
    roster={data.roster}
    yaVotaron={data.yaVotaron}
    asignaciones={data.asignaciones}
    cerrada={data.sesion.estado === 'cerrada'}
    action=""
    {form}
  />
</div>

<script lang="ts">
  import { page } from '$app/state';
  const institucion = $derived(page.data.institucion);
  interface Props {
    titulo: string;
    subtitulo?: string;
  }
  let { titulo, subtitulo = '' }: Props = $props();
  const hoy = new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
</script>

<div class="flex items-start gap-3 border-b-2 border-gray-800 pb-3">
  <img src={institucion.icono} alt="" class="h-14 w-14 object-contain"
    onerror={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
  <div class="flex-1 min-w-0">
    <p class="text-sm font-bold text-gray-900">{institucion.nombre} — {institucion.nivel}</p>
    {#if institucion.direccion}
      <p class="text-[11px] text-gray-500">{institucion.direccion} · Tel. {institucion.telefono} · {institucion.email}</p>
    {/if}
    <p class="text-base font-bold text-gray-900 mt-2">{titulo}</p>
    {#if subtitulo}<p class="text-xs text-gray-600">{subtitulo}</p>{/if}
  </div>
  <p class="text-[11px] text-gray-500 whitespace-nowrap">Emitido el {hoy}</p>
</div>

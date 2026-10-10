<script lang="ts">
  import { INSTITUCION } from '$lib/institucional';
  interface Props {
    titulo: string;
    subtitulo?: string;
  }
  let { titulo, subtitulo = '' }: Props = $props();
  const hoy = new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
</script>

<div class="flex items-start gap-3 border-b-2 border-gray-800 pb-3">
  <img src={INSTITUCION.logo} alt="" class="h-14 w-14 object-contain"
    onerror={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
  <div class="flex-1 min-w-0">
    <p class="text-sm font-bold text-gray-900">{INSTITUCION.nombre} — {INSTITUCION.nivel}</p>
    <p class="text-[11px] text-gray-500">{INSTITUCION.direccion} · Tel. {INSTITUCION.telefono} · {INSTITUCION.email}</p>
    <p class="text-base font-bold text-gray-900 mt-2">{titulo}</p>
    {#if subtitulo}<p class="text-xs text-gray-600">{subtitulo}</p>{/if}
  </div>
  <p class="text-[11px] text-gray-500 whitespace-nowrap">Emitido el {hoy}</p>
</div>

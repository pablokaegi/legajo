<script lang="ts">
  import { enhance } from '$app/forms';

  let { data, form } = $props();

  const ROL_LABEL: Record<string, string> = {
    admin: 'Admin', directivo: 'Dirección', preceptor: 'Preceptoría', docente: 'Docente',
    gabinete: 'Gabinete psicopedagógico', padre: 'Familia'
  };

  const PATRON_PIN = '\\d{6,8}';
  let abierto = $state<number | null>(null);
  let mostrarAlta = $state(false);
  let filtro = $state('');
  let lista = $derived(
    filtro.trim()
      ? data.usuarios.filter((u) =>
          `${u.nombre} ${u.email}`.toLowerCase().includes(filtro.trim().toLowerCase()))
      : data.usuarios
  );
</script>

<svelte:head><title>Usuarios — Configuración</title></svelte:head>

<div class="space-y-3">
  {#if form?.error}
    <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">{form.error}</div>
  {/if}
  {#if form?.ok}
    <div class="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-3 py-2">{form.ok}</div>
  {/if}

  <div class="flex items-center gap-2">
    <input type="search" bind:value={filtro} placeholder="Buscar por nombre o email…" class="form-input text-sm flex-1" />
    <button onclick={() => (mostrarAlta = !mostrarAlta)} class="btn-primary text-sm">+ Nueva cuenta</button>
  </div>

  {#if mostrarAlta}
    <form method="POST" action="?/crear" class="card space-y-3"
      use:enhance={() => async ({ update, result }) => {
        await update();
        if (result.type === 'success') mostrarAlta = false;
      }}>
      <p class="text-sm font-semibold text-gray-800">Nueva cuenta</p>
      <div class="grid sm:grid-cols-2 gap-3">
        <div>
          <label class="form-label" for="nombre">Nombre y apellido</label>
          <input id="nombre" name="nombre" maxlength="100" class="form-input" required />
        </div>
        <div>
          <label class="form-label" for="email">Email</label>
          <input id="email" name="email" type="email" class="form-input" required />
        </div>
        <div>
          <label class="form-label" for="pin">PIN inicial (6 a 8 dígitos)</label>
          <input id="pin" name="pin" type="password" inputmode="numeric" pattern={PATRON_PIN} autocomplete="new-password"
            class="form-input" required />
        </div>
      </div>
      <fieldset class="space-y-1">
        <legend class="form-label">Roles</legend>
        <div class="flex flex-wrap gap-3">
          {#each data.rolesDisponibles as r}
            <label class="flex items-center gap-1.5 text-sm text-gray-700">
              <input type="checkbox" name="rol" value={r} /> {ROL_LABEL[r] ?? r}
            </label>
          {/each}
        </div>
      </fieldset>
      <p class="text-xs text-gray-500">
        Pasale el PIN a la persona por un canal privado. Puede pedir que se lo cambies cuando quiera.
      </p>
      <button type="submit" class="btn-primary text-sm w-full">Crear cuenta</button>
    </form>
  {/if}

  <div class="space-y-2">
    {#each lista as u (u.id)}
      <div class="card space-y-2 {u.activo ? '' : 'opacity-60'}">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <p class="text-sm font-semibold text-gray-900 truncate">
              {u.nombre}{u.id === data.yoId ? ' (vos)' : ''}{u.activo ? '' : ' · desactivada'}
            </p>
            <p class="text-xs text-gray-500 truncate">{u.email}</p>
            <div class="flex flex-wrap gap-1 mt-1">
              {#each u.roles as r}
                <span class="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">{ROL_LABEL[r] ?? r}</span>
              {:else}
                <span class="text-[11px] text-gray-400">sin roles</span>
              {/each}
            </div>
          </div>
          <button onclick={() => (abierto = abierto === u.id ? null : u.id)} class="text-xs text-indigo-600 hover:underline flex-shrink-0">
            {abierto === u.id ? 'Cerrar' : 'Editar'}
          </button>
        </div>

        {#if abierto === u.id}
          <form method="POST" action="?/roles" use:enhance class="border-t border-gray-100 pt-2 space-y-2">
            <input type="hidden" name="usuarioId" value={u.id} />
            <div class="flex flex-wrap gap-3">
              {#each data.rolesDisponibles as r}
                <label class="flex items-center gap-1.5 text-sm text-gray-700">
                  <input type="checkbox" name="rol" value={r} checked={u.roles.includes(r)} /> {ROL_LABEL[r] ?? r}
                </label>
              {/each}
            </div>
            <button type="submit" class="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 text-white">Guardar roles</button>
          </form>

          <form method="POST" action="?/pin" use:enhance class="flex items-end gap-2">
            <input type="hidden" name="usuarioId" value={u.id} />
            <div class="flex-1">
              <label class="form-label" for="pin-{u.id}">Nuevo PIN</label>
              <input id="pin-{u.id}" name="pin" type="password" inputmode="numeric" pattern={PATRON_PIN}
                autocomplete="new-password" class="form-input text-sm" required />
            </div>
            <button type="submit" class="text-xs px-3 py-2 rounded-lg bg-gray-100 hover:bg-indigo-100">Cambiar PIN</button>
          </form>

          {#if u.id !== data.yoId}
            <form method="POST" action="?/activo"
              use:enhance={({ cancel }) => {
                if (u.activo && !confirm(`¿Desactivar la cuenta de ${u.nombre}? No va a poder ingresar.`)) cancel();
              }}>
              <input type="hidden" name="usuarioId" value={u.id} />
              <input type="hidden" name="activo" value={u.activo ? '0' : '1'} />
              <button type="submit" class="text-xs {u.activo ? 'text-red-500' : 'text-green-700'} hover:underline">
                {u.activo ? 'Desactivar cuenta' : 'Reactivar cuenta'}
              </button>
            </form>
          {/if}
        {/if}
      </div>
    {/each}
  </div>
</div>

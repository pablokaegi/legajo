<script lang="ts">
  import { enhance } from '$app/forms';

  let { data, form } = $props();
  let loading = $state(false);
</script>

<svelte:head>
  <title>Ingresar — Legajo {data.institucion.sigla}</title>
</svelte:head>

<div
  class="min-h-screen flex items-center justify-center p-4"
  class:acceso-alere={true}
  style:background-color={data.institucion.color}
>
  <div class="w-full max-w-sm relative">
    <!-- Card del formulario -->
    <div class="bg-white rounded-2xl shadow-2xl p-7 space-y-5">
      <!-- Logo + título -->
      <div class="text-center">
        <img
          src={data.institucion.logo}
          alt={data.institucion.corto}
          class="w-44 rounded-lg h-auto mx-auto mb-3"
          onerror={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
            const fb = document.getElementById('logo-fallback');
            if (fb) fb.style.display = 'flex';
          }}
        />
        <div
          id="logo-fallback"
          class="hidden items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-3 shadow-lg mx-auto"
        >
          <span class="text-white text-2xl">📝</span>
        </div>
        <h1 class="text-xl font-bold text-gray-900">Legajo Digital</h1>
        <p class="text-gray-500 text-sm mt-0.5">{data.institucion.nivel}</p>
      </div>

      <form
        method="POST"
        action="?/login"
        use:enhance={() => {
          loading = true;
          return async ({ update }) => {
            await update();
            loading = false;
          };
        }}
        class="space-y-4"
      >
        {#if form?.error}
          <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
            {form.error}
          </div>
        {/if}

        <div>
          <label for="email" class="form-label">Email institucional</label>
          <input
            id="email"
            name="email"
            type="email"
            autocomplete="email"
            required
            value={form?.email ?? ''}
            placeholder={data.institucion.ejemploEmail}
            class="form-input"
          />
        </div>

        <div>
          <label for="pin" class="form-label">PIN</label>
          <input
            id="pin"
            name="pin"
            type="password"
            inputmode="numeric"
            autocomplete="current-password"
            required
            maxlength="8"
            placeholder="••••••"
            class="form-input tracking-widest text-center text-lg"
          />
        </div>

        <button type="submit" class="btn-primary" disabled={loading}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>

    <p class="text-center text-xs text-white/80 mt-5 drop-shadow">
      ¿No tenés acceso? Contactá al administrador del sistema.
    </p>
  </div>
</div>

<script lang="ts">
  import { enhance } from '$app/forms';

  let { form } = $props();
  let loading = $state(false);
</script>

<svelte:head>
  <title>Ingresar — Legajo PDS</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
  <div class="w-full max-w-sm">
    <!-- Logo institucional -->
    <div class="text-center mb-8">
      <img
        src="/logo-pds.png"
        alt="Puertas del Sol"
        class="w-28 h-auto mx-auto mb-4 drop-shadow-sm"
        onerror={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = 'none';
          const fb = document.getElementById('logo-fallback');
          if (fb) fb.style.display = 'flex';
        }}
      />
      <div
        id="logo-fallback"
        class="hidden items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-4 shadow-lg mx-auto"
      >
        <span class="text-white text-2xl">📝</span>
      </div>
      <h1 class="text-xl font-bold text-gray-900">Legajo Digital</h1>
      <p class="text-gray-500 text-sm mt-0.5">Puertas del Sol</p>
    </div>

    <!-- Formulario -->
    <div class="card">
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
            placeholder="docente@pds.edu.ar"
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

    <p class="text-center text-xs text-gray-400 mt-6">
      ¿No tenés acceso? Contactá al administrador del sistema.
    </p>
  </div>
</div>

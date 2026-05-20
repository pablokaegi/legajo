import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      // El archivo de salida que Passenger usa como entrada
      out: 'build',
      // Aumentar el límite del body parser para permitir subida de fotos/imágenes (default: 512kb)
      bodyParser: {
        maxBodySize: '15mb'
      }
    })
  }
};

export default config;

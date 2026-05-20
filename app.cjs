// app.cjs — CommonJS entry point para Phusion Passenger
//
// Passenger carga el startup file con require() (node-loader.js line 243).
// La extension .cjs fuerza modo CommonJS en Node.js independientemente
// del campo "type":"module" del package.json raiz.
//
// require() de este archivo funciona. Desde aqui hacemos import() dinamico
// del bundle ESM de SvelteKit (build/index.js).

require('dotenv').config();

import('./build/index.js').catch(function (err) {
  console.error('[legajo] Error fatal al iniciar la aplicacion:', err);
  process.exit(1);
});

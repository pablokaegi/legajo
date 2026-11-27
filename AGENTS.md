# Colaborar en la demo Alere

Usá la rama `demo/alere` y datos ficticios. Node 22, SvelteKit 2 con Svelte 5, Vite 8, Drizzle y MariaDB componen la aplicación. El directorio de Moodle contiene el complemento que permite publicar el Libro desde Legajo.

1. Leé los permisos del módulo antes de cambiar pantallas o acciones. Verificá sesión, rol y alcance sobre el curso y el estudiante en cada petición que consulte o guarde datos.
2. Guardá la configuración privada fuera de Git. Generá contraseñas y tokens en la instalación. En los registros sólo deben aparecer el estado o los identificadores necesarios para operar la demo.
3. Ejecutá `npm ci`, `npm run check` y `npm run build` en el entorno de trabajo. Para compilar, configurá las variables de aplicación con una base y un campus de prueba. Compará los diagnósticos previos de tipos y comprobá que el build termine correctamente.
4. Versioná los cambios de fuente junto con `build/`. En el servidor, `deploy/demo/actualizar.sh` aplica la rama por avance directo. Conservá la configuración privada y los volúmenes del campus y de Legajo. [Guía del servidor](deploy/demo/README.md)

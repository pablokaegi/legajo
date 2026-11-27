# Libro de Ciencias de Legajo para Moodle 5.1

Complemento local del piloto. Publica la actividad de Ciencias como un Libro de Moodle, con un capítulo por paso. Los alumnos matriculados acceden desde el curso. Moodle sirve el archivo de audio de cada capítulo con los permisos habituales del Libro. La transcripción queda visible y la reproducción se inicia a elección del alumno.

## Configuración del laboratorio

1. Copiar esta carpeta a `public/local/legajolibro` de la instalación de Moodle 5.1 de prueba. Completar la instalación desde Administración del sitio → Notificaciones o desde el CLI de actualización de esa instalación.
2. En Administración del sitio → Extensiones → Extensiones locales → Libro de Ciencias de Legajo, indicar el ID del curso ficticio autorizado.
3. Configurar un servicio REST con usuarios autorizados que exponga sólo `local_legajolibro_leer` y `local_legajolibro_publicar`. Matricular una cuenta técnica en el curso. Su rol necesita `local/legajolibro:publicar`, `mod/book:addinstance`, `mod/book:edit`, `moodle/course:manageactivities`, acceso al curso y al libro. Habilitar `webservice/rest:use` para la cuenta técnica. Restringir el token a ese servicio, al contexto del curso y al origen local de Legajo.
4. Guardar el token únicamente en la configuración privada de Legajo como `MOODLE_AULA_LIBRO_TOKEN`. El laboratorio de esta computadora puede reconstruir el servicio con `work/aula_test/libro-servicio.php` una vez que se instaló el complemento.

## Publicación y actualización

El primer envío crea el Libro en la sección general. La clave estable es `LEGAJO-LIBRO-CIENCIAS-CAUDALES-V1`. La versión enviada es la revisión leída más uno. La lectura devuelve el ID del módulo y de los capítulos junto con títulos, objetivo, consignas y guiones. La publicación devuelve esos IDs y si hubo cambios.

Un envío repetido con el mismo contenido conserva revisión e identificadores. Al cambiar un paso se conserva su capítulo mientras permanezca el mismo ID en el editor. Al reordenar los pasos se actualiza su posición en el Libro. Si se retira un paso de la actividad al publicar, Moodle retira su capítulo y sus archivos. La actualización se procesa dentro de una transacción con un bloqueo compartido por las dos operaciones del complemento.

El contrato acepta hasta ocho pasos y archivos WAV o MP3 de hasta 5 MiB por paso. El guion se envía junto a la locución. Para conservar la grabación de un paso existente con el mismo guion alcanza con enviar su ID y el guion. El PHP del laboratorio admite 64 MiB por petición. La cuenta de Legajo sólo envía material docente destinado al curso. El complemento carece de campos para alumnos, apoyos o registros del gabinete.

Ante un conflicto de versiones hay que recargar el editor antes de publicar. Si alguien modifica desde Moodle el texto, el orden o los archivos de los capítulos, Legajo detiene la publicación para preservar esa edición. El equipo puede revisar ambas versiones antes de decidir qué contenido conservar.

# Alere · Campus y Legajo de demostración

Entorno para mostrar a un colegio un campus Moodle vinculado con seguimiento pedagógico en Legajo. Los nombres, las cuentas de prueba y la actividad de Ciencias son ficticios.

- El docente puede evaluar un oral con rúbrica y publicar la nota en Moodle.
- En el Laboratorio de apoyos puede preparar un Libro de Ciencias por pasos con narraciones opcionales.
- El gabinete consulta los resultados del cuestionario por objetivo, los capítulos asociados y el acuerdo de apoyo de cada estudiante.

El entorno usa Docker Compose, MariaDB, Moodle 5.1.9 y Legajo sobre Node 22. En la VM el temporizador comprueba `demo/alere` y aplica los commits nuevos. [Instalación y actualización](deploy/demo/README.md)

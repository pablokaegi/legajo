# Actividad de Ciencias para un curso de prueba Moodle 5.1

**¿Qué canilla consume más agua?** Los volúmenes son ficticios. El objetivo es comparar tasas y justificar una decisión con datos, unidades y una condición de medición. La prueba se puede hacer sin abrir una canilla.

## Laboratorio en Legajo

Desde la raíz del repositorio con las dependencias instaladas, ejecutá en PowerShell:

```powershell
$env:DATABASE_URL = 'mysql://demo:demo@127.0.0.1:3306/legajo_demo'
$env:SKIP_DB_INIT = '1'
npm run dev -- --host 127.0.0.1 --port 5173
```

Usá una terminal aparte para estos valores de ejemplo. Abrí [el laboratorio local](http://127.0.0.1:5173/laboratorio/apoyos). La ruta está habilitada en desarrollo. Los datos, el borrador y el progreso quedan en el almacenamiento del navegador. Este flujo funciona sin MySQL, cuentas de Moodle ni datos de estudiantes reales.

1. En **Editor de actividad**, editá una consigna o su guion de lectura y guardá. Podés agregar, quitar o reordenar pasos.
2. En **Vista del estudiante**, probá el paso actual, el próximo paso y la opción de escuchar. El navegador usa la síntesis de voz del dispositivo. Las instrucciones por escrito están siempre visibles. Completá un paso y recargá para comprobar que el progreso continúa.
3. En **Ficha de apoyos**, revisá la barrera y el apoyo de Alex Ejemplo, completá la fecha y registrá una decisión ficticia.
4. En el editor podés **descargar HTML para Moodle** con las consignas que editaste. Para probar el ejemplo completo en Moodle, usá los recursos que acompañan esta guía. El audio adjunto es una pista alternativa para el ejemplo original.

El ejemplo usa una ficha local y un estudiante ficticio. No requiere crear cuentas ni sincronizar personas o expedientes.

## Preparación en un curso de prueba

1. Como docente con permiso de edición, abrí un curso de prueba sin estudiantes reales y activá **Modo de edición**. Elegí **Añadir una actividad o recurso → Página**. Poné como nombre **¿Qué canilla consume más agua?**. En el editor del contenido abrí la vista de código HTML, pegá todo el contenido de `actividad.html` y guardá. Si el editor no expone el código, abrí el archivo en un navegador y copiá su contenido visible, preservando los encabezados y la tabla.
2. Si querés habilitar lectura en voz alta, insertá en la página la pista `consigna-es.wav` si acompaña al paquete, o usá `guion-audio.txt` para grabar una pista. Conservá el texto completo en pantalla y dejá que la reproducción la inicie el estudiante.
3. Si querés recoger la justificación, agregá una **Tarea** titulada **Justificá tu decisión**. Copiá la consigna del paso 3. En **Tipos de entrega**, habilitá **Texto en línea** y **Archivos enviados** si se aceptará un audio. Usá los mismos tres criterios para ambas opciones: decisión coherente, ambos caudales con sus unidades y una condición comparable.
4. Para la comprobación formativa, entrá al **Banco de preguntas → Importar**, elegí **Formato GIFT**, seleccioná una categoría del curso de prueba y subí `comprobacion.gift.txt`. Revisá que se importen tres preguntas. Creá un **Cuestionario** titulado **Comprobá tu comparación**, agregá esas tres preguntas desde el banco y habilitá retroalimentación específica en las opciones de revisión.
5. Abrí la Página y el Cuestionario con un usuario ficticio matriculado en el curso. En Legajo, vinculá la ficha de apoyo de demostración con la URL de esa Página, si la interfaz permite editarla. Comprobá que los tres pasos se entienden por escrito y que la actividad se puede completar sin reproducir audio. Si ofrecés audio, probalo en el navegador de prueba y verificá que conserve toda la consigna necesaria.

## Resultado esperado

La canilla A entrega **4 L/min**, la B **6 L/min** y la diferencia es **2 L/min**. La propuesta de revisar B se sostiene para las condiciones simuladas. Son ejemplos válidos mantener una apertura relativa comparable y registrar volumen y tiempo en cada medición. Los datos de la actividad no representan mediciones de Puertas del Sol.

El recurso HTML y el banco GIFT se prepararon para Moodle 5.1. Probá la importación con un usuario autorizado en un curso de prueba antes de usarlo en un aula real.

Fuentes: [Recurso Página](https://docs.moodle.org/501/en/Page_resource) · [Importar preguntas](https://docs.moodle.org/501/en/Import_questions) · [Formato GIFT](https://docs.moodle.org/501/en/GIFT_format) · [Tareas en Moodle 5.1](https://docs.moodle.org/501/en/Assignment_quick_guide).

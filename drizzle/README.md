# Base de la demo Alere

El esquema de Legajo se define en `src/lib/server/db/schema.ts`. El servicio `legajo-init` espera a que esté disponible el curso ficticio y aplica las migraciones numeradas a `legajo_demo`. Moodle usa su propia base `moodle_demo`.

En el primer arranque se crean las tablas. En los siguientes, el registro de migraciones permite continuar desde la última aplicada. Conservá los volúmenes de Docker entre versiones. [Preparación y actualización](../deploy/demo/README.md)

<?php
// Sólo CLI en la base dedicada. La web espera a que termine instalación y siembra.
define('CLI_SCRIPT', true);
require '/var/www/moodle/config.php';

function ejecutar(array $argumentos): void {
    $p = proc_open($argumentos, [STDIN, STDOUT, STDERR], $tuberias);
    if (!is_resource($p) || proc_close($p) !== 0) {
        throw new RuntimeException('No se pudo completar la preparación de Moodle. Revisá el paso anterior.');
    }
}

if (!$DB->get_tables()) {
    $clave = (string)getenv('DEMO_MOODLE_ADMIN_PASSWORD');
    $correo = (string)getenv('DEMO_MOODLE_ADMIN_EMAIL');
    if (strlen($clave) < 16 || !filter_var($correo, FILTER_VALIDATE_EMAIL)) {
        throw new RuntimeException('Revisá el correo y la contraseña inicial de administración Moodle.');
    }
    ejecutar([PHP_BINARY, '/var/www/moodle/admin/cli/install_database.php', '--lang=es', '--adminuser=admin',
        '--adminpass=' . $clave, '--adminemail=' . $correo, '--agree-license',
        '--fullname=Alere · Campus de demostración', '--shortname=Alere']);
} else {
    ejecutar([PHP_BINARY, '/var/www/moodle/admin/cli/upgrade.php', '--non-interactive']);
}
ejecutar([PHP_BINARY, '/opt/alere/fixtures/seed.php']);

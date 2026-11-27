<?php
declare(strict_types=1);

// CLI, fuera del directorio público. Nunca imprime contraseñas ni tokens.
if (PHP_SAPI !== 'cli') { exit(1); }
define('CLI_SCRIPT', true);
ini_set('zend.exception_ignore_args', '1');
umask(0077);
require '/var/www/moodle/config.php';

function exigir_demo(bool $condicion, string $mensaje): void {
    if (!$condicion) { throw new RuntimeException($mensaje); }
}

$origen = getenv('DEMO_MOODLE_ORIGIN');
$url = parse_url((string)$origen);
exigir_demo(getenv('LEGAJO_DEMO_ALOJADA') === '1' && is_array($url) && !empty($url['host'])
    && ($url['scheme'] ?? '') === 'https' && !array_diff(array_keys($url), ['scheme', 'host', 'port'])
    && $CFG->wwwroot === $origen
    && $CFG->dbhost === 'db' && $CFG->dbname === 'moodle_demo' && $CFG->dbuser === 'moodle_demo'
    && $DB->get_field_sql('SELECT DATABASE()') === 'moodle_demo'
    && $CFG->dataroot === '/var/moodledata', 'Destino fuera de la demo Alere.');
require_once $CFG->dirroot.'/course/modlib.php';
require_once $CFG->dirroot.'/user/lib.php';
require_once $CFG->dirroot.'/webservice/lib.php';
require_once __DIR__.'/actividades.php';
require_once __DIR__.'/servicios.php';

function escribir_privado(string $ruta, string $contenido, int $modo): void {
    $dir = dirname($ruta);
    exigir_demo(is_dir($dir) && is_writable($dir), 'El volumen privado no está disponible.');
    $temp = tempnam($dir, '.alere-');
    exigir_demo(is_string($temp) && dirname($temp) === $dir, 'No se pudo crear el archivo privado.');
    try {
        exigir_demo(file_put_contents($temp, $contenido) === strlen($contenido) && chmod($temp, $modo)
            && rename($temp, $ruta), 'No se pudo guardar el archivo privado.');
    } finally {
        if (is_file($temp)) { unlink($temp); }
    }
}

function usuario_demo(string $nombre, string $apellido, string $usuario, ?string $archivoClaves = null): stdClass {
    global $CFG, $DB;
    $idnumber = 'ALERE-DEMO-'.$usuario;
    $email = $usuario.'@example.test';
    $existente = $DB->get_record('user', ['username' => $usuario, 'mnethostid' => $CFG->mnet_localhost_id]);
    $claves = $archivoClaves && is_file($archivoClaves)
        ? json_decode(file_get_contents($archivoClaves), true, 512, JSON_THROW_ON_ERROR) : [];
    if ($existente) {
        exigir_demo($existente->idnumber === $idnumber && !$existente->deleted,
            'Una cuenta existente no pertenece al sembrado.');
        exigir_demo(!$archivoClaves || isset($claves[$usuario]), 'Falta la copia privada de acceso a una cuenta preexistente.');
        return $existente;
    }
    $clave = $claves[$usuario] ?? 'Alere-'.bin2hex(random_bytes(16)).'!9a';
    if ($archivoClaves && !isset($claves[$usuario])) {
        $claves[$usuario] = $clave;
        escribir_privado($archivoClaves, json_encode($claves, JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR)."\n", 0600);
    }
    $id = user_create_user((object)[
        'username' => $usuario, 'mnethostid' => $CFG->mnet_localhost_id,
        'firstname' => $nombre, 'lastname' => $apellido, 'idnumber' => $idnumber, 'email' => $email,
        'auth' => 'manual', 'password' => $clave, 'confirmed' => 1, 'country' => 'AR',
    ], true, false);
    return $DB->get_record('user', ['id' => $id], '*', MUST_EXIST);
}

function sembrar_ciencias(): void {
    global $CFG, $DB;
    \core\session\manager::set_user(get_admin());
    $curso = $DB->get_record('course', ['idnumber' => 'ALERE-CIENCIAS-DEMO-V1']);
    if (!$curso) {
        $curso = create_course((object)[
            'idnumber' => 'ALERE-CIENCIAS-DEMO-V1', 'shortname' => 'ALERE-CIENCIAS',
            'fullname' => 'Ciencias · Campus Alere',
            'summary' => 'Actividad de Ciencias con estudiantes ficticios para la demostración de Legajo.',
            'summaryformat' => FORMAT_PLAIN, 'category' => $DB->get_field_sql('SELECT MIN(id) FROM {course_categories}'),
            'format' => 'topics', 'startdate' => time(), 'enddate' => 0, 'visible' => 1,
        ]);
    }
    $ctx = context_course::instance($curso->id);
    $manual = enrol_get_plugin('manual');
    $instancia = $DB->get_record('enrol', ['courseid' => $curso->id, 'enrol' => 'manual']);
    if (!$instancia) {
        $instancia = $DB->get_record('enrol', ['id' => $manual->add_default_instance($curso)], '*', MUST_EXIST);
    }
    $claves = $CFG->dataroot.'/accesos-demo.json';
    $beto = null;
    foreach ([['Ada', 'Ficticia', 'alere-ada', 'student'], ['Beto', 'Ficticio', 'alere-beto', 'student'],
        ['Docente', 'de Ciencias', 'alere-docente', 'editingteacher']] as [$nombre, $apellido, $username, $rol]) {
        $persona = usuario_demo($nombre, $apellido, $username, $claves);
        $rolid = $DB->get_field('role', 'id', ['shortname' => $rol], MUST_EXIST);
        if (!$DB->record_exists('user_enrolments', ['enrolid' => $instancia->id, 'userid' => $persona->id])) {
            $manual->enrol_user($instancia, $persona->id, $rolid);
        }
        if ($username === 'alere-beto') { $beto = $persona; }
    }
    $tarea = tarea_ciencias_demo($curso);
    $quiz = cuestionario_ciencias_demo($curso, $beto);
    $configLibro = get_config('local_legajolibro', 'courseid');
    exigir_demo(!$configLibro || (int)$configLibro === (int)$curso->id, 'El complemento de Libro tiene otro curso configurado.');
    if (!$configLibro) { set_config('courseid', $curso->id, 'local_legajolibro'); }
    set_config('enablewebservices', 1);
    $protocolos = array_filter(explode(',', (string)get_config('core', 'webserviceprotocols')));
    if (!in_array('rest', $protocolos, true)) { set_config('webserviceprotocols', implode(',', [...$protocolos, 'rest'])); }
    $tokens = servicios_ciencias_demo($ctx, $instancia);
    $variables = $tokens + ['MOODLE_AULA_CURSO_ID' => $curso->id, 'MOODLE_AULA_TAREA_ID' => $tarea, 'MOODLE_AULA_QUIZ_ID' => $quiz];
    $salida = '';
    foreach ($variables as $nombre => $valor) { $salida .= $nombre.'='.$valor."\n"; }
    escribir_privado('/run/alere-demo/moodle.env', $salida, 0640);
}

$bloqueo = \core\lock\lock_config::get_lock_factory('local_legajolibro')->get_lock('alere_demo_ciencias_seed', 60);
exigir_demo((bool)$bloqueo, 'Hay otro sembrado en curso.');
try {
    sembrar_ciencias();
    echo "Campus Alere preparado. Las credenciales están en los volúmenes privados.\n";
} finally {
    $bloqueo->release();
}

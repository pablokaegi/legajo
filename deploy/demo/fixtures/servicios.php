<?php
declare(strict_types=1);
defined('CLI_SCRIPT') && CLI_SCRIPT || die();

function rol_servicio_demo(string $nombre, int $nivel, array $capacidades): int {
    global $DB;
    $rol = $DB->get_record('role', ['shortname' => $nombre]);
    if ($rol) {
        exigir_demo($rol->description === 'Servicio técnico del campus de demostración Alere.', 'Un rol de la demo ya tiene otro propietario.');
        return (int)$rol->id;
    }
    $id = create_role('Alere · '.$nombre, $nombre, 'Servicio técnico del campus de demostración Alere.');
    set_role_contextlevels($id, [$nivel]);
    foreach ($capacidades as $capacidad) {
        exigir_demo((bool)get_capability_info($capacidad), 'Falta una capacidad de Moodle necesaria para la demo.');
        assign_capability($capacidad, CAP_ALLOW, $id, context_system::instance()->id);
    }
    return (int)$id;
}

function token_servicio_demo(string $clave, array $funciones, stdClass $usuario, context $contexto): string {
    global $DB;
    $ws = new webservice();
    $nombre = 'alere_demo_'.$clave;
    $servicio = $ws->get_external_service_by_shortname($nombre);
    if (!$servicio) {
        $ws->add_external_service((object)['name' => 'Legajo Alere · '.$clave, 'shortname' => $nombre,
            'requiredcapability' => 'webservice/rest:use', 'enabled' => 1, 'restrictedusers' => 1,
            'downloadfiles' => 0, 'uploadfiles' => 0]);
        $servicio = $ws->get_external_service_by_shortname($nombre, MUST_EXIST);
        foreach ($funciones as $funcion) {
            $DB->get_record('external_functions', ['name' => $funcion], 'id', MUST_EXIST);
            $ws->add_external_function_to_service($funcion, $servicio->id);
        }
    }
    $condicion = ['externalserviceid' => $servicio->id];
    $actuales = $DB->get_fieldset_select('external_services_functions', 'functionname', 'externalserviceid = ?', [$servicio->id]);
    exigir_demo($servicio->enabled && $servicio->restrictedusers && !$servicio->uploadfiles && !$servicio->downloadfiles
        && $servicio->requiredcapability === 'webservice/rest:use'
        && !array_diff($actuales, $funciones) && !array_diff($funciones, $actuales),
        'Revisá la definición existente del servicio Moodle de la demo.');
    $cuenta = $condicion + ['userid' => $usuario->id];
    $autorizados = $DB->get_fieldset_select('external_services_users', 'userid', 'externalserviceid = ?', [$servicio->id]);
    exigir_demo(!array_diff($autorizados, [$usuario->id]), 'El servicio de la demo tiene otras cuentas autorizadas.');
    if (!$autorizados) {
        $DB->insert_record('external_services_users', (object)($cuenta + ['validuntil' => 0, 'timecreated' => time()]));
    }
    $registro = $DB->get_record('external_tokens', $cuenta);
    if ($registro) {
        exigir_demo((int)$registro->contextid === (int)$contexto->id && (int)$registro->tokentype === EXTERNAL_TOKEN_PERMANENT
            && (!$registro->validuntil || $registro->validuntil > time()), 'Revisá la vigencia y el contexto del token existente.');
        return $registro->token;
    }
    return \core_external\util::generate_token(EXTERNAL_TOKEN_PERMANENT, $servicio, (int)$usuario->id, $contexto);
}

function servicios_ciencias_demo(context_course $curso, stdClass $instancia): array {
    global $DB;
    $padron = ['moodle/course:view', 'moodle/course:viewparticipants', 'moodle/course:enrolreview',
        'moodle/user:viewdetails', 'moodle/site:viewuseridentity'];
    $lecturaNotas = ['moodle/grade:viewall', 'gradereport/user:view'];
    $matricula = 'core_enrol_get_enrolled_users';
    $notas = 'gradereport_user_get_grade_items';
    $servicios = [
        'lectura' => ['MOODLE_TOKEN', [...$padron, ...$lecturaNotas], ['core_webservice_get_site_info',
            'core_course_get_courses', 'core_course_get_categories', 'core_user_get_users', $matricula, $notas]],
        'oral' => ['MOODLE_AULA_TOKEN', [...$padron, ...$lecturaNotas, 'mod/assign:view', 'mod/assign:viewgrades', 'mod/assign:grade'],
            [$matricula, 'mod_assign_get_assignments', 'mod_assign_get_submission_status', 'mod_assign_save_grade', $notas]],
        'quiz' => ['MOODLE_AULA_QUIZ_TOKEN', [...$padron, 'mod/quiz:view', 'mod/quiz:viewreports'],
            [$matricula, 'mod_quiz_get_quizzes_by_courses', 'mod_quiz_get_user_quiz_attempts']],
        'libro' => ['MOODLE_AULA_LIBRO_TOKEN', ['moodle/course:view', 'moodle/course:manageactivities', 'local/legajolibro:publicar',
            'mod/book:addinstance', 'mod/book:read', 'mod/book:edit'], ['local_legajolibro_leer', 'local_legajolibro_publicar']],
    ];
    $tx = $DB->start_delegated_transaction();
    $rest = rol_servicio_demo('alere_demo_rest', CONTEXT_SYSTEM, ['webservice/rest:use']);
    $sistema = context_system::instance();
    $tokens = [];
    foreach ($servicios as $clave => [$variable, $capacidades, $funciones]) {
        $usuario = usuario_demo('Servicio', 'Alere '.$clave, 'alere-servicio-'.$clave);
        $rol = rol_servicio_demo('alere_demo_'.$clave, CONTEXT_COURSE, $capacidades);
        role_assign($rest, $usuario->id, $sistema->id);
        if (!$DB->record_exists('user_enrolments', ['enrolid' => $instancia->id, 'userid' => $usuario->id])) {
            enrol_get_plugin('manual')->enrol_user($instancia, $usuario->id, $rol);
        }
        exigir_demo(has_capability('webservice/rest:use', $sistema, $usuario->id)
            && has_all_capabilities($capacidades, $curso, $usuario->id), 'Revisá los permisos de la cuenta técnica de la demo.');
        // El sitio y las categorías se consultan en contexto de sistema; las capacidades de curso se asignan sólo en Ciencias.
        $tokens[$variable] = token_servicio_demo($clave, $funciones, $usuario, $clave === 'lectura' ? $sistema : $curso);
    }
    $tx->allow_commit();
    return $tokens;
}

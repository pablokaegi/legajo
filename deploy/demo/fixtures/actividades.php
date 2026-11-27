<?php
declare(strict_types=1);
defined('CLI_SCRIPT') && CLI_SCRIPT || die();

function actividad_demo(stdClass $curso, string $tipo, string $clave, array $opciones): stdClass {
    global $DB;
    $modulo = $DB->get_field('modules', 'id', ['name' => $tipo], MUST_EXIST);
    $cm = $DB->get_record('course_modules', ['course' => $curso->id, 'idnumber' => $clave]);
    if ($cm) {
        exigir_demo((int)$cm->module === (int)$modulo, 'El identificador de la actividad está ocupado.');
        return $cm;
    }
    $config = ['modulename' => $tipo, 'module' => $modulo, 'cmidnumber' => $clave, 'section' => 0,
        'visible' => 1, 'visibleoncoursepage' => 1, 'introformat' => FORMAT_PLAIN] + $opciones;
    $creado = add_moduleinfo((object)$config, $curso);
    return get_coursemodule_from_instance($tipo, $creado->instance, $curso->id, false, MUST_EXIST);
}

function tarea_ciencias_demo(stdClass $curso): int {
    $cm = actividad_demo($curso, 'assign', 'ALERE-ORAL-V1', [
        'name' => 'Oral de Ciencias · Caudales', 'intro' => 'Evaluación oral con datos ficticios.',
        'grade' => 10, 'duedate' => 0, 'cutoffdate' => 0, 'gradingduedate' => 0, 'allowsubmissionsfromdate' => 0,
        'submissiondrafts' => 0, 'requiresubmissionstatement' => 0, 'teamsubmission' => 0,
        'requireallteammemberssubmit' => 0, 'preventsubmissionnotingroup' => 0, 'blindmarking' => 0,
        'markingworkflow' => 0, 'markingallocation' => 0, 'attemptreopenmethod' => 'none', 'maxattempts' => 1,
        'sendnotifications' => 0, 'sendlatenotifications' => 0, 'sendstudentnotifications' => 0,
        'assignsubmission_onlinetext_enabled' => 0, 'assignsubmission_file_enabled' => 0,
        'assignfeedback_comments_enabled' => 1, 'assignfeedback_editpdf_enabled' => 0,
        'assignfeedback_file_enabled' => 0, 'assignfeedback_offline_enabled' => 0,
    ]);
    return (int)$cm->instance;
}

function cuestionario_ciencias_demo(stdClass $curso, stdClass $beto): int {
    global $DB, $CFG, $PAGE;
    require_once $CFG->dirroot.'/mod/quiz/locallib.php';
    require_once $CFG->dirroot.'/question/format.php';
    require_once $CFG->dirroot.'/question/format/gift/format.php';
    $PAGE->set_context(context_course::instance($curso->id));
    $clave = 'ALERE-CUESTIONARIO-CAUDALES-V1';
    $existente = $DB->get_record('course_modules', ['course' => $curso->id, 'idnumber' => $clave]);
    if ($existente) {
        exigir_demo((int)$existente->module === (int)$DB->get_field('modules', 'id', ['name' => 'quiz'], MUST_EXIST),
            'El identificador del cuestionario está ocupado.');
        return (int)$existente->instance;
    }
    $config = [
        'name' => 'Ciencias · Caudales por objetivo', 'intro' => 'Práctica formativa con mediciones ficticias.',
        'timeopen' => 0, 'timeclose' => 0, 'timelimit' => 1200, 'attempts' => 1, 'questionsperpage' => 0,
        'preferredbehaviour' => 'deferredfeedback', 'attemptonlast' => 0, 'grademethod' => 1, 'grade' => 0,
        'shuffleanswers' => 0, 'overduehandling' => 'autosubmit', 'graceperiod' => 0, 'quizpassword' => '', 'subnet' => '',
        'browsersecurity' => '', 'delay1' => 0, 'delay2' => 0, 'navmethod' => 'free', 'decimalpoints' => 2,
        'questiondecimalpoints' => -1, 'sumgrades' => 0, 'showuserpicture' => 0, 'showblocks' => 0,
    ];
    foreach (['attempt','correctness','maxmarks','marks','specificfeedback','generalfeedback','rightanswer','overallfeedback'] as $flag) {
        foreach (['during','immediately','open','closed'] as $fase) {
            $config[$flag.$fase] = (int)($fase !== 'during' || $flag === 'attempt');
        }
    }
    // La creación y su contenido son una sola operación. Una prueba ya creada pertenece al docente.
    $tx = $DB->start_delegated_transaction();
    $cm = actividad_demo($curso, 'quiz', $clave, $config);
    $quiz = $DB->get_record('quiz', ['id' => $cm->instance, 'course' => $curso->id], '*', MUST_EXIST);
    $quizid = (int)$quiz->id;
    $modelo = \mod_quiz\quiz_settings::create($quizid);
    $categoria = question_get_default_category($modelo->get_context()->id, true);
    $gift = new qformat_gift();
    $gift->setCategory($categoria);
    $gift->setCourse($curso);
    $gift->setContexts([$modelo->get_context()]);
    $gift->setFilename(__DIR__.'/comprobacion.gift.txt');
    $gift->setRealfilename('comprobacion.gift.txt');
    $gift->set_display_progress(false);
    exigir_demo($gift->importpreprocess() && $gift->importprocess() && $gift->importpostprocess(), 'No se pudieron cargar las preguntas de Ciencias.');
    $objetivos = [
        'Agua 01 - Caudal de la canilla A' => 'Calcula caudales',
        'Agua 02 - Comparación' => 'Compara caudales',
        'Agua 03 - Comparación justa' => 'Reconoce una comparación justa',
    ];
    foreach (array_keys($objetivos) as $pregunta) {
        $id = $DB->get_field_sql("SELECT q.id FROM {question} q JOIN {question_versions} v ON v.questionid=q.id
            JOIN {question_bank_entries} e ON e.id=v.questionbankentryid WHERE e.questioncategoryid=? AND q.name=?",
            [$categoria->id, $pregunta], MUST_EXIST);
        quiz_add_quiz_question((int)$id, $quiz, 1, 1);
    }
    $estructura = \mod_quiz\quiz_settings::create($quizid)->get_structure();
    foreach (array_values($objetivos) as $indice => $objetivo) {
        $item = (object)['quizid' => $quiz->id, 'name' => $objetivo];
        $estructura->create_grade_item($item);
        $estructura->update_slot_grade_item($estructura->get_slot_by_number($indice + 1), (int)$item->id);
    }
    $modelo->get_grade_calculator()->recompute_quiz_sumgrades();
    $modelo->get_override_manager()->save_override(['userid' => (int)$beto->id, 'timelimit' => 1800]);
    $tx->allow_commit();
    return (int)$quiz->id;
}

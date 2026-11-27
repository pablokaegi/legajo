<?php
namespace local_legajolibro;

/** Versioned publication of the single Science activity in the authorised course. */
class publicacion {
    private const CLAVE = 'LEGAJO-LIBRO-CIENCIAS-CAUDALES-V1';

    private static function texto(string $valor, int $max, bool $opcional = false): string {
        $valor = trim(str_replace(["\r\n", "\r"], "\n", $valor));
        if ((!$opcional && $valor === '') || \core_text::strlen($valor) > $max || str_contains($valor, "\0")) {
            throw new \invalid_parameter_exception('Texto de la actividad fuera de los límites.');
        }
        return $valor;
    }

    /** A Moodle editor can independently modify the chapters, files or Book settings. */
    private static function huella(\stdClass $book, \context_module $context): string {
        global $DB;
        $partes = [$book->name, $book->intro, $book->introformat, $book->revision];
        $fs = get_file_storage();
        $capitulos = $DB->get_records('book_chapters', ['bookid' => $book->id], 'pagenum ASC, id ASC');
        foreach ($capitulos as $cap) {
            $partes[] = [$cap->id, $cap->pagenum, $cap->title, $cap->content, $cap->hidden, $cap->subchapter, $cap->contentformat];
            foreach ($fs->get_area_files($context->id, 'mod_book', 'chapter', $cap->id, 'filepath, filename', false) as $archivo) {
                $partes[] = [$archivo->get_filepath(), $archivo->get_filename(), $archivo->get_contenthash()];
            }
        }
        return hash('sha256', json_encode($partes, JSON_THROW_ON_ERROR));
    }

    private static function estado(int $curso): array {
        global $DB;
        $fila = $DB->get_record('local_legajolibro', ['courseid' => $curso]);
        if (!$fila) {
            if ($DB->record_exists('course_modules', ['course' => $curso, 'idnumber' => self::CLAVE])) {
                throw new \moodle_exception('drift', 'local_legajolibro');
            }
            return [null, null, ['titulo' => '', 'objetivo' => '', 'pasos' => []]];
        }
        $cm = get_coursemodule_from_id('book', $fila->cmid, $curso);
        if (!$cm || (int)$cm->instance !== (int)$fila->bookid || $cm->idnumber !== self::CLAVE || $cm->deletioninprogress) {
            throw new \moodle_exception('drift', 'local_legajolibro');
        }
        $context = \context_module::instance($cm->id);
        require_capability('mod/book:edit', $context);
        $book = $DB->get_record('book', ['id' => $cm->instance, 'course' => $curso], '*', MUST_EXIST);
        if (!hash_equals($fila->statehash, self::huella($book, $context))) {
            throw new \moodle_exception('drift', 'local_legajolibro');
        }
        return [$fila, $book, json_decode($fila->activityjson, true, 512, JSON_THROW_ON_ERROR)];
    }

    private static function bloqueo(int $curso): \core\lock\lock {
        $lock = \core\lock\lock_config::get_lock_factory('local_legajolibro')->get_lock('ciencias-'.$curso, 5);
        if (!$lock) {
            throw new \moodle_exception('conflict', 'local_legajolibro');
        }
        return $lock;
    }

    public static function leer(int $curso): array {
        $lock = self::bloqueo($curso);
        try {
            [$fila, , $actividad] = self::estado($curso);
            return ['cmid' => (int)($fila->cmid ?? 0), 'bookid' => (int)($fila->bookid ?? 0),
                'revision' => (int)($fila->revision ?? 0)] + $actividad;
        } finally {
            $lock->release();
        }
    }

    private static function preparar(array $p): array {
        if ($p['revision'] < 1 || count($p['pasos']) < 1 || count($p['pasos']) > 8) {
            throw new \invalid_parameter_exception('Se requieren de uno a ocho pasos y una revisión positiva.');
        }
        $actividad = ['titulo' => self::texto($p['titulo'], 120), 'objetivo' => self::texto($p['objetivo'], 500), 'pasos' => []];
        $archivos = [];
        foreach ($p['pasos'] as $paso) {
            $id = $paso['id'];
            if (!preg_match('/\A[A-Za-z0-9_-]{1,64}\z/', $id) || array_key_exists($id, $archivos)) {
                throw new \invalid_parameter_exception('Identificador de paso inválido o repetido.');
            }
            $guion = self::texto($paso['audio'], 1400, true);
            if ($guion === '' && $paso['archivo'] !== '') {
                throw new \moodle_exception('invalidaudio', 'local_legajolibro');
            }
            $archivos[$id] = null;
            if ($paso['archivo'] !== '') {
                if (strlen($paso['archivo']) > 7 * 1024 * 1024) {
                    throw new \moodle_exception('invalidaudio', 'local_legajolibro');
                }
                $bytes = base64_decode($paso['archivo'], true);
                if ($bytes === false || strlen($bytes) < 44 || strlen($bytes) > 5 * 1024 * 1024) {
                    throw new \moodle_exception('invalidaudio', 'local_legajolibro');
                }
                $mime = (new \finfo(FILEINFO_MIME_TYPE))->buffer($bytes);
                if (in_array($mime, ['audio/wav','audio/x-wav','audio/vnd.wave'], true)
                        && substr($bytes, 0, 4) === 'RIFF' && substr($bytes, 8, 4) === 'WAVE') {
                    $ext = 'wav';
                } else if ($mime === 'audio/mpeg') {
                    $ext = 'mp3';
                } else {
                    throw new \moodle_exception('invalidaudio', 'local_legajolibro');
                }
                $archivos[$id] = ['ext' => $ext, 'bytes' => $bytes];
            }
            $actividad['pasos'][] = ['id' => $id, 'titulo' => self::texto($paso['titulo'], 120),
                'consigna' => self::texto($paso['consigna'], 1400), 'audio' => $guion];
        }
        return [$actividad, $archivos];
    }

    private static function crear_libro(\stdClass $course, array $actividad): \stdClass {
        global $DB;
        require_capability('mod/book:addinstance', \context_course::instance($course->id));
        [$module] = can_add_moduleinfo($course, 'book', 0);
        return add_moduleinfo((object)[
            'module' => $module->id, 'modulename' => 'book', 'cmidnumber' => self::CLAVE, 'section' => 0,
            'visible' => 1, 'visibleoncoursepage' => 1, 'name' => $actividad['titulo'],
            'intro' => s($actividad['objetivo']), 'introformat' => FORMAT_HTML, 'numbering' => 1,
            'navstyle' => 1, 'customtitles' => 0,
        ], $course);
    }

    /** Keep the same chapter and file when its narration is unchanged. */
    private static function capitulo(\stdClass $book, \context_module $context, int $pos, array $paso,
            ?array $anterior, ?array $grabacion, string $objetivo): int {
        global $DB;
        $fs = get_file_storage();
        $nuevo = !$anterior;
        $cap = $nuevo ? (object)[
            'bookid' => $book->id, 'timecreated' => time(), 'subchapter' => 0, 'hidden' => 0,
            'content' => '', 'importsrc' => '', 'contentformat' => FORMAT_HTML,
        ] : $DB->get_record('book_chapters', ['id' => $anterior['chapterid'], 'bookid' => $book->id], '*', MUST_EXIST);
        $previo = clone $cap;
        $cap->title = $paso['titulo'];
        $cap->pagenum = $pos;
        $cap->timemodified = time();
        if ($nuevo) {
            $cap->id = $DB->insert_record('book_chapters', $cap);
        }
        $misarchivos = $fs->get_area_files($context->id, 'mod_book', 'chapter', $cap->id, 'id', false);
        $audio = reset($misarchivos);
        $mismoguion = $anterior && $paso['audio'] === $anterior['audio'];
        if ($paso['audio'] !== '' && (!$audio || !$mismoguion) && !$grabacion) {
            throw new \moodle_exception('invalidaudio', 'local_legajolibro');
        }
        if (!$mismoguion || $paso['audio'] === '') {
            foreach ($misarchivos as $anteriorfile) {
                $anteriorfile->delete();
            }
            $audio = false;
        }
        if ($paso['audio'] !== '' && !$audio) {
            $audio = $fs->create_file_from_string(['contextid' => $context->id, 'component' => 'mod_book',
                'filearea' => 'chapter', 'itemid' => $cap->id, 'filepath' => '/',
                'filename' => 'consigna.'.$grabacion['ext'], 'mimetype' => $grabacion['ext'] === 'wav' ? 'audio/wav' : 'audio/mpeg'],
                $grabacion['bytes']);
        }
        $html = $pos === 1 ? '<p><strong>Objetivo.</strong> '.s($objetivo).'</p>' : '';
        foreach (explode("\n", $paso['consigna']) as $linea) {
            if (trim($linea) !== '') {
                $html .= '<p>'.s($linea).'</p>';
            }
        }
        if ($audio) {
            $html .= '<p>Escuchá la consigna si lo preferís.</p><audio controls="controls" preload="none" src="@@PLUGINFILE@@/' .
                $audio->get_filename().'"></audio><p><strong>Transcripción.</strong> '.s($paso['audio']).'</p>';
        }
        $cap->content = $html;
        if ($nuevo || $previo->title !== $cap->title || (int)$previo->pagenum !== $pos || $previo->content !== $html) {
            $DB->update_record('book_chapters', $cap);
            $evento = $nuevo ? \mod_book\event\chapter_created::class : \mod_book\event\chapter_updated::class;
            $evento::create_from_chapter($book, $context, $cap)->trigger();
        }
        return (int)$cap->id;
    }

    private static function resultado(\stdClass $fila, array $actividad, bool $changed): array {
        return ['cmid' => $fila->cmid, 'bookid' => $fila->bookid, 'revision' => $fila->revision, 'changed' => $changed,
            'chapters' => array_map(fn($paso) => ['id' => $paso['id'], 'chapterid' => $paso['chapterid']], $actividad['pasos'])];
    }

    public static function guardar(array $p): array {
        global $CFG, $DB;
        require_once($CFG->dirroot.'/course/modlib.php');
        [$actividad, $archivos] = self::preparar($p);
        $curso = $p['courseid'];
        $lock = self::bloqueo($curso);
        try {
            $tx = $DB->start_delegated_transaction();
            try {
                [$fila, $book, $anterior] = self::estado($curso);
                $version = (int)($fila->revision ?? 0);
                $previos = array_column($anterior['pasos'], null, 'id');
                $comparable = $anterior;
                foreach ($comparable['pasos'] as &$paso) {
                    unset($paso['chapterid']);
                }
                unset($paso);
                if ($fila && $actividad === $comparable && in_array($p['revision'], [$version, $version + 1], true)) {
                    $tx->allow_commit();
                    return self::resultado($fila, $anterior, false);
                }
                if ($p['revision'] !== $version + 1) {
                    throw new \moodle_exception('conflict', 'local_legajolibro');
                }
                if (!$fila) {
                    $mod = self::crear_libro(get_course($curso), $actividad);
                    $fila = (object)['courseid' => $curso, 'cmid' => $mod->coursemodule, 'bookid' => $mod->instance];
                    $book = $DB->get_record('book', ['id' => $fila->bookid, 'course' => $curso], '*', MUST_EXIST);
                }
                $context = \context_module::instance($fila->cmid);
                require_capability('mod/book:edit', $context);
                require_capability('moodle/course:manageactivities', $context);
                foreach ($actividad['pasos'] as $i => $paso) {
                    $id = $paso['id'];
                    $actividad['pasos'][$i]['chapterid'] = self::capitulo($book, $context, $i+1, $paso,
                        $previos[$id] ?? null, $archivos[$id], $actividad['objetivo']);
                    unset($previos[$id]);
                }
                foreach ($previos as $retirado) {
                    $cap = $DB->get_record('book_chapters', ['id' => $retirado['chapterid'], 'bookid' => $book->id], '*', MUST_EXIST);
                    \core_tag_tag::remove_all_item_tags('mod_book', 'book_chapters', $cap->id);
                    get_file_storage()->delete_area_files($context->id, 'mod_book', 'chapter', $cap->id);
                    $DB->delete_records('book_chapters', ['id' => $cap->id, 'bookid' => $book->id]);
                    \mod_book\event\chapter_deleted::create_from_chapter($book, $context, $cap)->trigger();
                }
                $DB->update_record('book', (object)['id' => $book->id, 'name' => $actividad['titulo'],
                    'intro' => s($actividad['objetivo']), 'revision' => (int)$book->revision + 1, 'timemodified' => time()]);
                $book = $DB->get_record('book', ['id' => $book->id], '*', MUST_EXIST);
                $fila->revision = $p['revision'];
                $fila->activityjson = json_encode($actividad, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
                $fila->statehash = self::huella($book, $context);
                if (isset($fila->id)) {
                    $DB->update_record('local_legajolibro', $fila);
                } else {
                    $fila->id = $DB->insert_record('local_legajolibro', $fila);
                }
                rebuild_course_cache($curso, true);
                $tx->allow_commit();
                return self::resultado($fila, $actividad, true);
            } catch (\Throwable $e) {
                $tx->rollback($e);
                throw $e;
            }
        } finally {
            $lock->release();
        }
    }
}

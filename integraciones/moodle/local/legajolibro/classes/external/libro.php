<?php
namespace local_legajolibro\external;

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_multiple_structure;
use core_external\external_single_structure;
use core_external\external_value;
use local_legajolibro\publicacion;

class libro extends external_api {
    private static function paso(bool $entrada): external_single_structure {
        $campos = [];
        foreach (['id', 'titulo', 'consigna', 'audio'] as $campo) {
            $campos[$campo] = new external_value(PARAM_RAW, $campo);
        }
        if ($entrada) {
            $campos['archivo'] = new external_value(PARAM_RAW, 'Audio en base64, o vacío');
        } else {
            $campos['chapterid'] = new external_value(PARAM_INT, 'ID del capítulo');
        }
        return new external_single_structure($campos);
    }

    public static function leer_parameters(): external_function_parameters {
        return new external_function_parameters(['courseid' => new external_value(PARAM_INT, 'Curso')]);
    }

    private static function autorizar(int $courseid): void {
        if ($courseid <= 1 || $courseid !== (int)get_config('local_legajolibro', 'courseid')) {
            throw new \moodle_exception('nopermissions', 'error', '', 'local/legajolibro:publicar');
        }
        $context = \context_course::instance($courseid);
        self::validate_context($context);
        require_capability('local/legajolibro:publicar', $context);
    }

    public static function leer(int $courseid): array {
        $p = self::validate_parameters(self::leer_parameters(), compact('courseid'));
        self::autorizar($p['courseid']);
        return publicacion::leer($p['courseid']);
    }

    public static function leer_returns(): external_single_structure {
        return new external_single_structure([
            'cmid' => new external_value(PARAM_INT, 'Módulo'), 'bookid' => new external_value(PARAM_INT, 'Libro'),
            'revision' => new external_value(PARAM_INT, 'Versión'), 'titulo' => new external_value(PARAM_RAW, 'Título'),
            'objetivo' => new external_value(PARAM_RAW, 'Objetivo'), 'pasos' => new external_multiple_structure(self::paso(false)),
        ]);
    }

    public static function publicar_parameters(): external_function_parameters {
        return new external_function_parameters([
            'courseid' => new external_value(PARAM_INT, 'Curso'), 'revision' => new external_value(PARAM_INT, 'Versión propuesta'),
            'titulo' => new external_value(PARAM_RAW, 'Título'), 'objetivo' => new external_value(PARAM_RAW, 'Objetivo'),
            'pasos' => new external_multiple_structure(self::paso(true)),
        ]);
    }

    public static function publicar(int $courseid, int $revision, string $titulo, string $objetivo, array $pasos): array {
        $p = self::validate_parameters(self::publicar_parameters(), compact('courseid','revision','titulo','objetivo','pasos'));
        self::autorizar($p['courseid']);
        return publicacion::guardar($p);
    }

    public static function publicar_returns(): external_single_structure {
        return new external_single_structure([
            'cmid' => new external_value(PARAM_INT, 'Módulo'), 'bookid' => new external_value(PARAM_INT, 'Libro'),
            'revision' => new external_value(PARAM_INT, 'Versión'), 'changed' => new external_value(PARAM_BOOL, 'Se modificó el libro'),
            'chapters' => new external_multiple_structure(new external_single_structure([
                'id' => new external_value(PARAM_RAW, 'Identificador de paso'),
                'chapterid' => new external_value(PARAM_INT, 'Capítulo'),
            ])),
        ]);
    }
}

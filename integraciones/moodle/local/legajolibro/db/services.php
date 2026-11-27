<?php
defined('MOODLE_INTERNAL') || die();

$functions = [
    'local_legajolibro_leer' => [
        'classname' => 'local_legajolibro\\external\\libro', 'methodname' => 'leer',
        'description' => 'Read the editable public activity for the configured course.',
        'type' => 'read', 'capabilities' => 'local/legajolibro:publicar',
    ],
    'local_legajolibro_publicar' => [
        'classname' => 'local_legajolibro\\external\\libro', 'methodname' => 'publicar',
        'description' => 'Create or update the versioned science Book and its chapters.',
        'type' => 'write', 'capabilities' => 'local/legajolibro:publicar,mod/book:edit',
    ],
];

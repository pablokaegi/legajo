<?php
defined('MOODLE_INTERNAL') || die();

$capabilities = [
    'local/legajolibro:publicar' => [
        'captype' => 'write', 'contextlevel' => CONTEXT_COURSE, 'archetypes' => [],
    ],
];

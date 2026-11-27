<?php
defined('MOODLE_INTERNAL') || die();

if ($hassiteconfig) {
    $settings = new admin_settingpage('local_legajolibro', get_string('pluginname', 'local_legajolibro'));
    $ADMIN->add('localplugins', $settings);
    $settings->add(new admin_setting_configtext('local_legajolibro/courseid',
        get_string('courseid', 'local_legajolibro'), get_string('courseid_help', 'local_legajolibro'), 0, PARAM_INT));
}

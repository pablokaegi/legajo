<?php
unset($CFG);
global $CFG;
$CFG = new stdClass();
$CFG->dbtype = 'mariadb';
$CFG->dblibrary = 'native';
$CFG->dbhost = 'db';
$CFG->dbname = 'moodle_demo';
$CFG->dbuser = 'moodle_demo';
$CFG->dbpass = getenv('DEMO_MOODLE_DB_PASSWORD');
$CFG->prefix = 'mdl_';
$CFG->dboptions = ['dbcollation' => 'utf8mb4_unicode_ci'];
$CFG->wwwroot = getenv('DEMO_MOODLE_ORIGIN');
$origen = parse_url((string)$CFG->wwwroot);
if (!$origen || array_diff(array_keys($origen), ['scheme', 'host', 'port']) ||
        ($origen['scheme'] ?? '') !== 'https' || empty($origen['host']) ||
        !preg_match('/^campus\.(?:alere\.(?:[a-z]{2,24}|(?:com|org|edu|net|co)\.[a-z]{2})|(?:[0-9]{1,3}-){3}[0-9]{1,3}\.(?:sslip|nip)\.io)$/D', $origen['host'])) {
    throw new RuntimeException('Revisá el origen HTTPS del Moodle de demostración.');
}
$CFG->sslproxy = true;
$CFG->dataroot = '/var/moodledata';
$CFG->directorypermissions = 0700;
$CFG->noemailever = true;
$CFG->disableupdateautodeploy = true;
require_once __DIR__ . '/lib/setup.php';

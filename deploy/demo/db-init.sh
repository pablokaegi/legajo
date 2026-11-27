#!/bin/sh
set -eu
for clave in "$DEMO_LEGAJO_DB_PASSWORD" "$DEMO_MOODLE_DB_PASSWORD"; do
    case "$clave" in ''|*[!0-9a-fA-F]*) echo 'Las claves de las bases de la demo deben ser hexadecimales.' >&2; exit 1;; esac
    test "${#clave}" -ge 32 || { echo 'Las claves de las bases requieren 32 caracteres o más.' >&2; exit 1; }
done
mariadb --host=db --user=root <<SQL
CREATE DATABASE IF NOT EXISTS legajo_demo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS moodle_demo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'legajo_demo'@'%' IDENTIFIED BY '$DEMO_LEGAJO_DB_PASSWORD';
CREATE USER IF NOT EXISTS 'moodle_demo'@'%' IDENTIFIED BY '$DEMO_MOODLE_DB_PASSWORD';
SQL
mariadb --host=db --user=root <<'SQL'
GRANT ALL PRIVILEGES ON `legajo\_demo`.* TO 'legajo_demo'@'%';
GRANT ALL PRIVILEGES ON `moodle\_demo`.* TO 'moodle_demo'@'%';
SQL
MYSQL_PWD="$DEMO_LEGAJO_DB_PASSWORD" mariadb -hdb -ulegajo_demo legajo_demo -e 'DO 1'
MYSQL_PWD="$DEMO_MOODLE_DB_PASSWORD" mariadb -hdb -umoodle_demo moodle_demo -e 'DO 1'

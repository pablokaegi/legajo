#!/usr/bin/env bash
# Uso: bash preparar-entorno.sh ARCHIVO_PRIVADO URL_LEGAJO URL_CAMPUS CORREO_ADMIN
set -euo pipefail
umask 077
[[ $# -eq 4 && "$1" = /* ]] || { echo 'Indicá ruta absoluta fuera del repo, dos orígenes HTTPS y el correo de administración.' >&2; exit 2; }
archivo=$(realpath -m -- "$1")
repositorio=$(cd "$(dirname "$0")/../.." && pwd -P)
[[ "$archivo" != "$repositorio" && "$archivo" != "$repositorio/"* && ! -e "$archivo" ]] ||
    { echo 'Elegí un archivo nuevo fuera del repositorio.' >&2; exit 2; }
for origen in "$2" "$3"; do
    [[ "$origen" =~ ^https://[a-z0-9-]+(\.[a-z0-9-]+)+(:[0-9]{1,5})?$ ]] ||
        { echo 'Cada origen debe contener sólo https:// y el nombre del sitio.' >&2; exit 2; }
done
legajo_host=${2#https://}; legajo_host=${legajo_host%%:*}
campus_host=${3#https://}; campus_host=${campus_host%%:*}
base_demo='(alere\.([a-z]{2,24}|(com|org|edu|net|co)\.[a-z]{2})|([0-9]{1,3}-){3}[0-9]{1,3}\.(sslip|nip)\.io)'
[[ "$campus_host" =~ ^campus\.$base_demo$ && "$legajo_host" == "legajo.${campus_host#campus.}" &&
   "$4" =~ ^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$ ]] ||
    { echo 'Revisá que los dominios sean distintos y el correo administrativo sea válido.' >&2; exit 2; }
mkdir -p -- "$(dirname "$archivo")"
temporal=$(mktemp -- "$archivo.XXXXXXXX")
trap 'rm -f -- "$temporal"' EXIT
{
    printf 'DEMO_LEGAJO_ORIGIN=%s\nDEMO_MOODLE_ORIGIN=%s\nDEMO_MOODLE_ADMIN_EMAIL=%s\n' "$2" "$3" "$4"
    printf 'DEMO_LEGAJO_HOST=%s\nDEMO_MOODLE_HOST=%s\n' "$legajo_host" "$campus_host"
    for clave in DEMO_DB_ROOT_PASSWORD DEMO_LEGAJO_DB_PASSWORD DEMO_MOODLE_DB_PASSWORD DEMO_SESSION_SECRET; do
        aleatorio=$(openssl rand -hex 32)
        printf '%s=%s\n' "$clave" "$aleatorio"
    done
    aleatorio=$(openssl rand -hex 32)
    printf 'DEMO_MOODLE_ADMIN_PASSWORD=Aa9!%s\n' "$aleatorio"
} > "$temporal"
ln -- "$temporal" "$archivo"
echo 'Archivo privado creado con permisos 0600. Conservá una copia privada para recuperar el mismo entorno.'

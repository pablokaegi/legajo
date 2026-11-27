#!/usr/bin/env bash
# El servidor de demo toma la rama desde GitHub y conserva sus volúmenes entre actualizaciones.
set -euo pipefail
umask 077
cd "$(dirname "$0")/../.."
entorno=${1:?Indicá la ruta absoluta al archivo privado de la demo.}
[[ "$entorno" == /* && -r "$entorno" ]]
[[ "$(git branch --show-current)" == demo/alere ]]
[[ -z "$(git status --porcelain --untracked-files=normal)" ]] || { echo "Hay cambios locales en el clon de la demo."; exit 1; }
directorio_git=$(git rev-parse --absolute-git-dir)
exec 9>"$directorio_git/alere-update.lock"
flock -n 9 || exit 0
git fetch --quiet --no-tags origin refs/heads/demo/alere
objetivo=$(git rev-parse FETCH_HEAD)
marca="$directorio_git/alere-desplegado"
if [[ -f "$marca" && "$(<"$marca")" == "$objetivo" && "$(git rev-parse HEAD)" == "$objetivo" ]]; then exit 0; fi
git merge --ff-only "$objetivo"
[[ "$(git rev-parse HEAD)" == "$objetivo" ]] || { echo "El clon tiene commits pendientes de subir."; exit 1; }
compose=(docker compose --project-name alere-demo --env-file "$entorno" -f deploy/demo/compose.yaml -f deploy/demo/compose.public.yaml)
"${compose[@]}" config --quiet
if [[ ${ALERE_BUILD_SERIAL:-0} == 1 ]]; then
    "${compose[@]}" build moodle
    "${compose[@]}" build legajo
else
    "${compose[@]}" build
fi
"${compose[@]}" up -d --wait --wait-timeout 600
printf '%s\n' "$objetivo" > "$marca"
echo "Alere actualizado a $objetivo"

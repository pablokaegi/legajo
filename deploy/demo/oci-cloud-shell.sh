#!/usr/bin/env bash
# Oracle Cloud Shell · bash alere-oci.sh network REGION COMPARTIMENTO [--apply]
#                    · bash alere-oci.sh metadata REGION COMPARTIMENTO INSTANCIA [--apply]
# Usá la región de origen de la cuenta y los OCID que muestra la consola.
# Para acciones OCI, Cloud Shell puede usar OCI Service Network. Para SSH, en la
# misma región seleccioná Network > Private network definition list > Create.
# Elegí alere-demo-vcn y alere-demo-public, activá la red y conectate a la IPv4
# privada de Ubuntu: ssh -i RUTA_CLAVE_PRIVADA ubuntu@IP_PRIVADA_VM
# La sesión requiere permisos de IAM para usar subnets y VNICs. Conservá la clave
# privada del par que elegiste al crear la VM. Volvé a OCI Service Network para usar la CLI.
# https://docs.oracle.com/en-us/iaas/Content/API/Concepts/cloudshellintro_topic-Cloud_Shell_Networking.htm
set -eu
exec python3 - "$@" <<'PYTHON'
import base64
import fcntl
import hashlib
import ipaddress
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile
import time

def fail(msg):
    raise SystemExit(msg)

args = sys.argv[1:]
apply = bool(args and args[-1] == "--apply")
if apply:
    args.pop()
if not args or args[0] not in ("network", "metadata") or len(args) != (3 if args[0] == "network" else 4):
    fail("Uso: bash alere-oci.sh network REGION COMPARTIMENTO [--apply]\n"
         "     bash alere-oci.sh metadata REGION COMPARTIMENTO INSTANCIA [--apply]")
mode, region, compartment, *instances = args
if not re.fullmatch(r"[a-z]{2}-[a-z0-9-]+-\d+", region) or not re.fullmatch(r"ocid1\.(compartment|tenancy)\.[a-z0-9.-]+", compartment):
    fail("Revisá la región y el OCID del compartimento o tenancy.")
if instances and not re.fullmatch(r"ocid1\.instance\.[a-z0-9.-]+", instances[0]):
    fail("Se requiere el OCID de la instancia de demostración.")

vcn_cidr = "10.77.0.0/16"
public = "10.77.1.0/24"
internet = "0.0.0.0/0"
tag = {"alere-demo": "network-v1"}
plan = (f"VCN alere-demo-vcn {vcn_cidr}, subred pública regional {public}, gateway de Internet y ruta de salida. "
        f"Entrada TCP 80/443 desde Internet y TCP 22 desde las direcciones privadas {public} de la propia subred. Salida IPv4 permitida."
        if mode == "network" else "Guardar la IPv4 pública de la VNIC principal en alere_public_ipv4 de la VM Alere; conservar el resto de los metadatos.")
print(f"Región {region}. {plan}", flush=True)
if not apply:
    print("Vista previa local. Agregá --apply al comando para ejecutar en Oracle Cloud Shell.")
    sys.exit(0)

def oci(group, resource, action, *opts):
    proc = subprocess.run(["oci", "--region", region, "--output", "json", group, resource, action, *opts],
                          capture_output=True, text=True)
    if proc.returncode:
        # Las respuestas completas podrían incluir metadatos, claves públicas o datos de la cuenta.
        code = re.search(r'"code"\s*:\s*"([A-Za-z0-9._-]+)"', proc.stderr)
        detail = code.group(1) if code else f"salida {proc.returncode}"
        fail(f"OCI {group} {resource} {action}: {detail}. Verificá el recurso en la consola y repetí el comando.")
    # OCI CLI puede representar una lista vacía con salida vacía o sólo cabeceras.
    raw = proc.stdout.strip()
    reply = json.loads(raw) if raw else {}
    if action in ("list", "list-vnics") and "data" not in reply:
        reply["data"] = []
    return reply

def open_lock():
    # Cloud Shell conserva el directorio personal. También protege reintentos de distintas terminales del mismo usuario.
    os.umask(0o077)
    directory = Path.home() / ".alere-demo"
    directory.mkdir(mode=0o700, exist_ok=True)
    path = directory / (hashlib.sha256((region + compartment).encode()).hexdigest()[:24] + ".lock")
    lock = path.open("a")
    fcntl.flock(lock, fcntl.LOCK_EX)
    return lock

def cli_json(value):
    return json.dumps(value, separators=(",", ":"))

def owned(resource, suffix, vcn_id, options, valid):
    name = "alere-demo-" + suffix
    scope = ["--compartment-id", compartment]
    if vcn_id:
        scope += ["--vcn-id", vcn_id]
    listed = oci("network", resource, "list", *scope, "--all")["data"]
    matches = [r for r in listed if r.get("display-name") == name and r.get("lifecycle-state") != "TERMINATED"]
    if len(matches) > 1:
        fail(f"Hay varios recursos con nombre {name}; revisalos en la consola.")
    if matches:
        obj = matches[0]
        print(f"Verificando {name}.", flush=True)
    else:
        print(f"Creando {name}.", flush=True)
        obj = oci("network", resource, "create", *scope, "--display-name", name, "--freeform-tags", cli_json(tag),
                  *options, "--wait-for-state", "AVAILABLE")["data"]
    if not (obj.get("compartment-id") == compartment and obj.get("display-name") == name and
            (obj.get("freeform-tags") or {}).get("alere-demo") == tag["alere-demo"] and
            (not vcn_id or obj.get("vcn-id") == vcn_id) and obj.get("lifecycle-state") == "AVAILABLE" and valid(obj)):
        fail(f"{name} está en transición, pertenece a otra configuración o difiere de la prevista. Revisalo en la consola.")
    return obj["id"]

def network():
    vcn = owned("vcn", "vcn", None, ["--cidr-block", vcn_cidr, "--dns-label", "aleredemo"],
                lambda r: (r.get("cidr-blocks") or [r.get("cidr-block")]) == [vcn_cidr] and
                r.get("dns-label") == "aleredemo" and not r.get("ipv6-cidr-blocks"))
    gateway = owned("internet-gateway", "igw", vcn, ["--is-enabled", "true"], lambda r: r.get("is-enabled") is True)
    rules = [{"destination": internet, "destinationType": "CIDR_BLOCK", "networkEntityId": gateway}]
    def route_ok(obj):
        items = obj.get("route-rules") or []
        return len(items) == 1 and (items[0].get("destination") or items[0].get("cidr-block")) == internet and (
            items[0].get("destination-type") == "CIDR_BLOCK" and items[0].get("network-entity-id") == gateway)
    route = owned("route-table", "route", vcn, ["--route-rules", cli_json(rules)], route_ok)
    ports = [(internet, 80), (internet, 443), (public, 22)]
    ingress = [{"source": src, "sourceType": "CIDR_BLOCK", "protocol": "6", "isStateless": False,
                "tcpOptions": {"destinationPortRange": {"min": port, "max": port}}} for src, port in ports]
    egress = [{"destination": internet, "destinationType": "CIDR_BLOCK", "protocol": "all", "isStateless": False}]
    def security_ok(obj):
        actual = []
        for rule in obj.get("ingress-security-rules") or []:
            tcp = rule.get("tcp-options") or {}
            bounds = tcp.get("destination-port-range") or {}
            if (rule.get("protocol") != "6" or rule.get("is-stateless") is not False or
                    rule.get("source-type") != "CIDR_BLOCK" or tcp.get("source-port-range") or
                    not isinstance(bounds.get("min"), int) or bounds.get("min") != bounds.get("max")):
                return False
            actual.append((rule.get("source"), bounds["min"]))
        out = obj.get("egress-security-rules") or []
        return (len(actual) == len(ports) and set(actual) == set(ports) and len(out) == 1 and
                out[0].get("destination") == internet and out[0].get("destination-type") == "CIDR_BLOCK" and
                out[0].get("protocol") == "all" and out[0].get("is-stateless") is False)
    security = owned("security-list", "security", vcn, ["--ingress-security-rules", cli_json(ingress),
                     "--egress-security-rules", cli_json(egress)], security_ok)
    subnet = owned("subnet", "public", vcn, ["--cidr-block", public, "--dns-label", "publica", "--route-table-id", route,
                   "--prohibit-public-ip-on-vnic", "false", "--security-list-ids", cli_json([security])],
                   lambda r: r.get("cidr-block") == public and r.get("dns-label") == "publica" and
                   not r.get("availability-domain") and r.get("prohibit-public-ip-on-vnic") is False and
                   not r.get("ipv6-cidr-blocks") and r.get("route-table-id") == route and r.get("security-list-ids") == [security])
    print(f"Red verificada. Para la VM elegí la subred alere-demo-public ({subnet}) y asigná IPv4 pública.")

def metadata():
    vm = instances[0]
    def get():
        return oci("compute", "instance", "get", "--instance-id", vm)
    snapshot = get()
    obj = snapshot["data"]
    data = obj.get("metadata") or {}
    if obj.get("id") != vm or obj.get("compartment-id") != compartment or obj.get("shape") != "VM.Standard.A1.Flex" or obj.get("lifecycle-state") != "RUNNING":
        fail("La instancia debe estar en ejecución, usar A1 Flex y pertenecer al compartimento indicado.")
    try:
        boot = base64.b64decode(data.get("user_data", ""), validate=True).decode()
    except (ValueError, UnicodeError):
        fail("Los datos de arranque de esta instancia no identifican la demo.")
    boot = boot.strip()
    include = r"#include\s+https://raw\.githubusercontent\.com/pablokaegi/legajo/(?:[0-9a-f]{40}|(?:refs/heads/)?demo/alere)/deploy/demo/oci-cloud-init\.yaml"
    if not (re.fullmatch(include, boot) or (boot.startswith("#cloud-config") and "/usr/local/sbin/alere-demo-iniciar" in boot and "https://github.com/pablokaegi/legajo.git" in boot)):
        fail("La configuración de arranque de la VM no contiene el instalador de la demo Alere.")
    cards = oci("compute", "instance", "list-vnics", "--instance-id", vm, "--compartment-id", compartment, "--all")["data"]
    primary = [v for v in cards if v.get("is-primary") is True]
    if len(primary) != 1:
        fail("Se esperaba una única VNIC principal.")
    try:
        ip = ipaddress.IPv4Address(primary[0].get("public-ip") or "")
    except ValueError:
        fail("La VNIC principal todavía no tiene IPv4 pública.")
    if not ip.is_global or ip.is_multicast:
        fail("La dirección de la VNIC principal no es una IPv4 pública unicast.")
    ip = str(ip)
    key = "alere_public_ipv4"
    if data.get(key) not in (None, "", ip):
        fail("Ya se publicó otra IP. Revisá el cambio de dirección antes de modificar un campus existente.")
    if data.get(key) != ip:
        etag = snapshot.get("etag")
        if not etag:
            fail("OCI no devolvió un ETag; volvé a leer la instancia antes de actualizarla.")
        merged = dict(data, **{key: ip})
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "metadata.json"
            path.write_text(cli_json(merged), encoding="utf-8")
            oci("compute", "instance", "update", "--instance-id", vm, "--if-match", etag,
                "--metadata", "file://" + str(path), "--force")
        for attempt in range(10):
            after = get()["data"].get("metadata") or {}
            if after.get(key) == ip and all(after.get(k) == v for k, v in merged.items()):
                break
            if attempt == 9:
                fail("OCI aceptó la petición; falta verificar que la copia de metadatos sea la esperada.")
            time.sleep(5)
    host = ip.replace(".", "-")
    print(f"IPv4 verificada. Direcciones previstas tras la instalación:\nhttps://legajo.{host}.sslip.io\nhttps://campus.{host}.sslip.io")

with open_lock():
    network() if mode == "network" else metadata()
PYTHON

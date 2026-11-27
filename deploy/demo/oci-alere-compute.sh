#!/usr/bin/env bash
# Desde Oracle Cloud Shell: bash oci-alere-compute.sh preflight|launch OCID_COMPARTIMENTO clave.pub
# Si el compartimento no es la raíz, exportá ALERE_TENANCY_OCID. ALERE_SUBNET_ID es opcional.
set -eu
exec python3 - "$@" <<'PYTHON'
import base64
import fcntl
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile

def stop(message):
    raise SystemExit(message)

if len(sys.argv) != 4 or sys.argv[1] not in {"preflight", "launch"}:
    stop("Uso: bash oci-alere-compute.sh preflight|launch OCID_COMPARTIMENTO RUTA_CLAVE_PUBLICA")
mode, comp, key_path = sys.argv[1:]
tenancy = os.environ.get("ALERE_TENANCY_OCID") or (comp if comp.startswith("ocid1.tenancy.") else os.environ.get("OCI_TENANCY", ""))
if not re.fullmatch(r"ocid1\.(?:tenancy|compartment)\.oc1\.[a-z0-9.]+", comp) or not re.fullmatch(r"ocid1\.tenancy\.oc1\.[a-z0-9.]+", tenancy):
    stop("Indicá el compartimento y, si es distinto de la raíz, ALERE_TENANCY_OCID.")
try:
    key = Path(key_path).read_text(encoding="ascii").strip()
    kind, encoded, *_ = key.split()
    wire = base64.b64decode(encoded, validate=True)
    assert "\n" not in key and kind in {"ssh-ed25519", "ssh-rsa", "ecdsa-sha2-nistp256", "ecdsa-sha2-nistp384", "ecdsa-sha2-nistp521"}
    assert wire[4:4+int.from_bytes(wire[:4],"big")].decode() == kind
    assert subprocess.run(["ssh-keygen","-l","-f",key_path],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL).returncode == 0
except (OSError, ValueError, AssertionError, UnicodeError):
    stop("La ruta debe contener una sola clave PÚBLICA OpenSSH válida.")
REGION = "us-chicago-1"
SHAPE = "VM.Standard.A1.Flex"
NAME = "alere-demo"
TAG = {"alere-demo":"compute-v1"}
BOOT = "#include\nhttps://raw.githubusercontent.com/pablokaegi/legajo/fdca419047e965a094711af1c529565a1555bf8d/deploy/demo/oci-cloud-init.yaml\n"
os.umask(0o077)

def command(opts):
    return subprocess.run(["oci", "--region", REGION, "--output", "json", "--no-retry", *opts], capture_output=True,text=True)

def query(*opts, many=False):
    p = command(opts)
    if p.returncode:
        code = re.search(r'"code"\s*:\s*"([a-zA-Z0-9._-]+)"', p.stderr)
        stop("Error de consulta OCI (%s): %s." % (" ".join(opts[:3]), code.group(1) if code else p.returncode))
    try:
        if many and not p.stdout.strip():
            return []
        doc = json.loads(p.stdout)
        if many and "data" not in doc and set(doc) <= {"opc-request-id", "etag"}:
            return []
        result = doc["data"]
        if many and not isinstance(result,list):
            raise ValueError()
        return result
    except (ValueError, KeyError, TypeError):
        stop("La respuesta OCI no permite comprobar "+ " ".join(opts[:3]))

def listing(*opts):
    return query(*opts,"--all",many=True)

def unique_network(family, name, *extra):
    rows = [r for r in listing("network",family,"list","--compartment-id",comp,*extra)
            if r["display-name"] == name and r["lifecycle-state"] != "TERMINATED"]
    if len(rows) != 1 or rows[0]["lifecycle-state"] != "AVAILABLE" or (rows[0].get("freeform-tags") or {}).get("alere-demo") != "network-v1":
        stop("Se esperaba el recurso disponible de la demo: "+name)
    return rows[0]

if [r["region-name"] for r in listing("iam","region-subscription","list","--tenancy-id",tenancy) if r.get("is-home-region") is True] != [REGION]:
    stop("El perfil debe pertenecer a una tenancy cuya región de origen sea Chicago.")
vcn = unique_network("vcn","alere-demo-vcn")
sub = unique_network("subnet","alere-demo-public","--vcn-id",vcn["id"])
if ((vcn.get("cidr-blocks") or [vcn.get("cidr-block")]) != ["10.77.0.0/16"] or
        sub.get("cidr-block") != "10.77.1.0/24" or sub.get("vcn-id") != vcn["id"] or
        sub.get("prohibit-public-ip-on-vnic") is not False or sub.get("availability-domain") or
        os.environ.get("ALERE_SUBNET_ID",sub["id"]) != sub["id"]):
    stop("La VCN/subred difiere de la prevista para la demo.")
domains = sorted(r["name"] for r in listing("iam","availability-domain","list","--compartment-id",tenancy))
if not domains:
    stop("Sin dominios de disponibilidad.")
scope = [tenancy] + [r["id"] for r in listing("iam","compartment","list","--compartment-id",tenancy,
        "--compartment-id-in-subtree","true","--access-level","ANY") if r["lifecycle-state"] == "ACTIVE"]
if comp not in scope:
    stop("El compartimento no está bajo la tenancy seleccionada.")

folder = Path.home()/".alere-demo"
folder.mkdir(mode=0o700,exist_ok=True)
stamp = hashlib.sha256((tenancy+"|"+comp+"|"+REGION+"|"+NAME).encode()).hexdigest()[:32]
lock = (folder/(stamp+".compute-lock")).open("a")
fcntl.flock(lock,fcntl.LOCK_EX)
receipt = folder/(stamp+".compute-launch")

def existing(rows):
    same = [v for v in rows if v.get("display-name") == NAME and v.get("lifecycle-state") != "TERMINATED"]
    if not same:
        return
    if len(same) != 1:
        stop("Hay más de una instancia llamada alere-demo. Verificá el inventario.")
    vm = same[0]
    configured = vm.get("shape-config") or {}
    if (vm.get("freeform-tags") or {}).get("alere-demo") != TAG["alere-demo"] or vm.get("shape") != SHAPE or configured.get("ocpus") != 1 or configured.get("memory-in-gbs") != 6:
        stop("Hay una instancia homónima. No se creó otra.")
    print("Ya existe",vm["id"],vm["lifecycle-state"],flush=True)
    sys.exit(0)

def current():
    return listing("compute","instance","list","--compartment-id",comp)

existing(current())
if receipt.exists():
    stop("Existe constancia local de un lanzamiento cuya instancia aún no apareció en el inventario. Revisá Compute y el historial de solicitudes antes de repetir.")
images = [r for r in listing("compute","image","list","--compartment-id",comp,"--shape",SHAPE)
          if r.get("lifecycle-state") == "AVAILABLE" and "compartment-id" in r and r["compartment-id"] is None and
          re.fullmatch(r"Canonical-Ubuntu-24\.04-Minimal-aarch64-\d{4}\.\d{2}\.\d{2}-\d+",r.get("display-name") or "")]
if not images:
    stop("No se encontró la imagen oficial Canonical Ubuntu 24.04 Minimal aarch64 compatible con A1.")
image = max(images,key=lambda r:r["time-created"])
print("Imagen",image["display-name"],"| A1 1 OCPU/6 GB | arranque 50 GB Balanced (10 VPU/GB).",flush=True)

# El inventario incluye volúmenes huérfanos y todos los compartimentos activos de la región.
cpu = memory = storage = 0
for item in scope:
    for vm in listing("compute","instance","list","--compartment-id",item):
        if vm.get("shape") == SHAPE and vm["lifecycle-state"] != "TERMINATED":
            cpu += vm["shape-config"]["ocpus"]
            memory += vm["shape-config"]["memory-in-gbs"]
    for family in ("volume","boot-volume"):
        for vol in listing("bv",family,"list","--compartment-id",item):
            if vol["lifecycle-state"] != "TERMINATED":
                storage += int(vol["size-in-gbs"])
eligible = []
used_cores = used_memory = 0
for ad in domains:
    available = []
    for limit in ("standard-a1-core-count","standard-a1-memory-count"):
        stats = query("limits","resource-availability","get","--compartment-id",tenancy,"--service-name","compute","--limit-name",limit,"--availability-domain",ad)
        usage = stats.get("fractional-usage") if stats.get("fractional-usage") is not None else stats.get("used")
        if not isinstance(usage,(int,float)):
            stop("OCI no informó el consumo de cuota A1 para "+ad)
        if limit == "standard-a1-core-count":
            used_cores += usage
        else:
            used_memory += usage
        spare = stats.get("fractional-availability") if stats.get("fractional-availability") is not None else stats.get("available")
        available.append(spare or 0)
    if available[0] >= 1 and available[1] >= 6:
        eligible.append(ad)
cpu,memory = max(used_cores,cpu),max(used_memory,memory)
print("Uso actual en Chicago:",cpu,"OCPU A1,",memory,"GB de RAM A1 y",storage,"GB de volúmenes.",flush=True)
if cpu+1>2 or memory+6>12 or storage+50>200 or not eligible:
    stop("La VM no cabe dentro de los límites gratuitos o de la cuota A1 disponible.")
if mode == "preflight":
    print("Preflight correcto. Dominios con cuota:",", ".join(eligible),". La disponibilidad física se comprueba al lanzar.")
    sys.exit(0)

for ad in eligible:
    existing(current())
    body = {"availabilityDomain":ad,"compartmentId":comp,"displayName":NAME,"freeformTags":TAG,"shape":SHAPE,
            "shapeConfig":{"ocpus":1,"memoryInGBs":6},"instanceOptions":{"areLegacyImdsEndpointsDisabled":True},
            "createVnicDetails":{"subnetId":sub["id"],"assignPublicIp":True},
            "sourceDetails":{"sourceType":"image","imageId":image["id"],"bootVolumeSizeInGBs":50,"bootVolumeVpusPerGB":10},
            "metadata":{"ssh_authorized_keys":key,"user_data":base64.b64encode(BOOT.encode()).decode()}}
    # El mismo destino y dominio producen el mismo token en otra sesión de Cloud Shell.
    token = hashlib.sha256((stamp+"|"+ad).encode()).hexdigest()
    with tempfile.TemporaryDirectory() as tmp:
        target=Path(tmp)/"launch.json"
        target.write_text(json.dumps(body),encoding="utf-8")
        receipt.write_text("Pendiente de conciliación: "+ad+"\n",encoding="utf-8")
        p=command(["raw-request","--http-method","POST","--target-uri","https://iaas.us-chicago-1.oraclecloud.com/20160918/instances",
                   "--request-headers",json.dumps({"opc-retry-token":token}),"--request-body","file://"+str(target)])
    try:
        response=json.loads(p.stdout or "{}")
        code=str(response.get("status","")).split(" ")[0]
        data=response.get("data") or {}
    except (TypeError,ValueError):
        code,data="",{}
    if p.returncode == 0 and code in ("200","201","202") and isinstance(data,dict) and str(data.get("id","")).startswith("ocid1.instance."):
        receipt.write_text(data["id"]+"\n",encoding="utf-8")
        print("Instancia aceptada en",ad,data["id"],flush=True)
        sys.exit(0)
    # Algunos CLI devuelven ServiceError en stderr, otros devuelven el cuerpo HTTP en stdout.
    if not code and p.stderr:
        match=re.search(r'"code"\s*:\s*"([^"]+)"',p.stderr)
        message=re.search(r'"message"\s*:\s*"([^"]+)"',p.stderr)
        if match and message:
            data={"code":match[1],"message":message[1]}
    if isinstance(data,dict) and data.get("code") == "InternalError" and "out of host capacity" in str(data.get("message","")).lower():
        receipt.unlink()
        print("Sin capacidad física en",ad,flush=True)
        continue
    if code.isdigit() and 400 <= int(code) < 500 and code not in ("408","409"):
        receipt.unlink()
    stop("Lanzamiento interrumpido ("+str(data.get("code",code) if isinstance(data,dict) else code)+"). Revisá el estado antes de volver a ejecutar.")
stop("Oracle informó falta de capacidad física en todos los dominios con cuota. Podés repetir el mismo comando más tarde.")
PYTHON

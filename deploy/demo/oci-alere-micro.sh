#!/usr/bin/env bash
# Desde Oracle Cloud Shell: bash oci-alere-micro.sh preflight|launch OCID_COMPARTIMENTO clave.pub
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
    stop("Uso: bash oci-alere-micro.sh preflight|launch OCID_COMPARTIMENTO RUTA_CLAVE_PUBLICA")
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
SHAPE = "VM.Standard.E2.1.Micro"
NAME = "alere-demo"
TAG = {"alere-demo":"compute-v1"}
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
    if (vm.get("freeform-tags") or {}).get("alere-demo") != TAG["alere-demo"] or vm.get("shape") not in (SHAPE,"VM.Standard.A1.Flex"):
        stop("Hay una instancia homónima. No se creó otra.")
    print("Ya existe",vm["id"],vm["lifecycle-state"],flush=True)
    sys.exit(0)

def current():
    return listing("compute","instance","list","--compartment-id",comp)

existing(current())
if receipt.exists():
    stop("Existe constancia local de un lanzamiento cuya instancia aún no apareció en el inventario. Revisá Compute y el historial de solicitudes antes de repetir.")
# Confirmar por API que A1 1/6 siga sin capacidad en los tres AD de Chicago.
if len(domains) != 3:
    stop("Se esperaban tres dominios de Chicago.")
requested = json.dumps([{"instanceShape":"VM.Standard.A1.Flex","instanceShapeConfig":{"ocpus":1,"memoryInGBs":6}}])
for ad in domains:
    report = query("compute","compute-capacity-report","create","--compartment-id",tenancy,
                   "--availability-domain",ad,"--shape-availabilities",requested)
    a1 = [r for r in report.get("shape-availabilities",[]) if r.get("instance-shape") == "VM.Standard.A1.Flex"]
    if not a1 or any(r.get("availability-status") != "OUT_OF_HOST_CAPACITY" for r in a1):
        stop("A1 no informó explícitamente falta de capacidad en "+ad+". Revisá primero la opción A1.")
eligible = [ad for ad in domains if ad.endswith("-AD-1") or ad == "AD-1"]
if len(eligible) != 1:
    stop("No se identificó el AD1 de Chicago.")
images = [r for r in listing("compute","image","list","--compartment-id",comp,"--shape",SHAPE)
          if r.get("lifecycle-state") == "AVAILABLE" and "compartment-id" in r and r["compartment-id"] is None and
          re.fullmatch(r"Canonical-Ubuntu-24\.04-Minimal-\d{4}\.\d{2}\.\d{2}-\d+",r.get("display-name") or "")]
if not images:
    stop("Falta la imagen oficial Canonical Ubuntu 24.04 Minimal AMD64 compatible con E2 Micro.")
image = max(images,key=lambda r:r["time-created"])
offers = listing("compute","shape","list","--compartment-id",comp,"--availability-domain",eligible[0],"--image-id",image["id"])
if not any(r.get("shape") == SHAPE for r in offers):
    compatibility = query("compute","image-shape-compatibility-entry","get",
                          "--image-id",image["id"],"--shape-name",SHAPE)
    if compatibility.get("shape") != SHAPE:
        stop("OCI no confirmó que esta imagen sea compatible con E2 Micro.")
    print("El catálogo de AD1 omitió la Micro. OCI confirmó que la imagen es compatible. La solicitud única en AD1 comprobará la disponibilidad.",flush=True)
count = storage = 0
for item in scope:
    count += sum(vm.get("shape") == SHAPE and vm["lifecycle-state"] != "TERMINATED"
                 for vm in listing("compute","instance","list","--compartment-id",item))
    for family in ("volume","boot-volume"):
        storage += sum(int(vol["size-in-gbs"]) for vol in listing("bv",family,"list","--compartment-id",item)
                       if vol["lifecycle-state"] != "TERMINATED")
print("Imagen",image["display-name"],"| E2.1.Micro, 1 GB RAM | arranque 50 GB Balanced | swap 2 GiB.",flush=True)
print("Inventario en Chicago:",count,"E2 Micro y",storage,"GB de volúmenes.",flush=True)
if count+1 > 2 or storage+50 > 200:
    stop("La instancia excedería el cupo gratuito de Micro o almacenamiento.")
if mode == "preflight":
    print("Preflight correcto. Falta que OCI acepte el lanzamiento en "+eligible[0]+".")
    sys.exit(0)

# Se valida el YAML público. Los ajustes de memoria pertenecen sólo a la VM Micro.
from urllib.request import urlopen
url = "https://raw.githubusercontent.com/pablokaegi/legajo/fdca419047e965a094711af1c529565a1555bf8d/deploy/demo/oci-cloud-init.yaml"
try:
    if os.environ.get("ALERE_BOOTSTRAP_FILE"):
        original = Path(os.environ["ALERE_BOOTSTRAP_FILE"]).read_bytes()
    else:
        with urlopen(url, timeout=25) as response:
            original = response.read(16000)
except OSError:
    stop("No se pudo verificar la copia del instalador fijada en GitHub.")
if hashlib.sha256(original).hexdigest() != "922da4a36d43cfb3d083fb5ae9055f070bb350eded719f0ea44d52bb54f1b332":
    stop("El YAML no coincide con el hash de fdca419.")
base = original.decode("utf-8")
dropin = """  - path: /etc/systemd/system/alere-demo.service.d/recursos-micro.conf
    permissions: '0644'
    content: |
      [Service]
      Environment=ALERE_BUILD_SERIAL=1
      Environment=COMPOSE_PARALLEL_LIMIT=1
      Environment=COMPOSE_BAKE=false
"""
BOOT = base.replace("write_files:\n","swap:\n  filename: /swap-alere.img\n  size: 2147483648\nwrite_files:\n"+dropin,1)
if BOOT == base:
    stop("No se reconoció el YAML base.")
for ad in eligible:
    existing(current())
    body = {"availabilityDomain":ad,"compartmentId":comp,"displayName":NAME,"freeformTags":TAG,"shape":SHAPE,
            "instanceOptions":{"areLegacyImdsEndpointsDisabled":True},
            "createVnicDetails":{"subnetId":sub["id"],"assignPublicIp":True},
            "sourceDetails":{"sourceType":"image","imageId":image["id"],"bootVolumeSizeInGBs":50,"bootVolumeVpusPerGB":10},
            "metadata":{"ssh_authorized_keys":key,"user_data":base64.b64encode(BOOT.encode()).decode()}}
    # El mismo destino y dominio producen el mismo token en otra sesión de Cloud Shell.
    token = hashlib.sha256((stamp+"|"+ad+"|"+SHAPE).encode()).hexdigest()
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

#!/usr/bin/env python3
"""Solicita una sola VM A1 de Alere con un pool y horario gestionados por Oracle."""
import argparse
import base64
import fcntl
import hashlib
import ipaddress
import json
import os
from pathlib import Path
import re
import subprocess

REGION, SHAPE, IP = "us-chicago-1", "VM.Standard.A1.Flex", "10.77.1.45"
TAG = {"alere-demo": "pool-v1"}
BOOT = "#include\nhttps://raw.githubusercontent.com/pablokaegi/legajo/fdca419047e965a094711af1c529565a1555bf8d/deploy/demo/oci-cloud-init.yaml\n"
POLICY = {"policyType":"scheduled", "displayName":"mantener-una", "isEnabled":True,
          "capacity":{"initial":1}, "executionSchedule":{"type":"cron","timezone":"UTC","expression":"0 17 * ? * * *"}}
CM = "compute-management"
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("modo", choices=("preflight","apply"))
parser.add_argument("compartimento")
parser.add_argument("clave_publica", type=Path)
parser.add_argument("--front-ip", type=ipaddress.IPv4Address)
arg = parser.parse_args()
comp = arg.compartimento
root = comp if comp.startswith("ocid1.tenancy.") else os.getenv("ALERE_TENANCY_OCID") or os.getenv("OCI_TENANCY","")

def require(condition, message):
    if not condition:
        raise SystemExit(message)

def oci(*args, many=False, pending=None):
    if many:
        args += ("--all",)
    p = subprocess.run(["oci","--region",REGION,"--output","json","--no-retry",*args],capture_output=True,text=True)
    if p.returncode:
        match = re.search(r'"code"\s*:\s*"([\w.-]+)"',p.stderr)
        status = re.search(r'"status"\s*:\s*(\d+)',p.stderr)
        if pending and status and int(status[1]) in (400,401,403,404,429):
            pending.unlink(missing_ok=True)
        raise SystemExit(f"OCI {' '.join(args[:3])}: {match[1] if match else p.returncode}. Revisá la operación en OCI.")
    result = json.loads(p.stdout or "{}")
    if many and "data" not in result and set(result) <= {"etag","opc-request-id"}:
        return []
    require("data" in result and (not many or isinstance(result["data"],list)), "Respuesta OCI inesperada.")
    return result["data"]

def listed(service, resource, *filters, compartment=comp):
    return oci(service,resource,"list","--compartment-id",compartment,*filters,many=True)

def owned(rows, name, mark=TAG):
    matches = [r for r in rows if r.get("lifecycle-state") not in ("TERMINATED","DELETED") and
               (r.get("display-name") == name or (r.get("freeform-tags") or {}).get("alere-demo") == mark["alere-demo"])]
    require(len(matches)<=1 and all(r.get("display-name")==name and
            (r.get("freeform-tags") or {}).get("alere-demo")==mark["alere-demo"] for r in matches),
            "Nombre o etiqueta en conflicto: "+name)
    return matches[0] if matches else None

def matches(actual, expected):
    if isinstance(expected,dict):
        return isinstance(actual,dict) and all(matches(actual.get(re.sub(r"(?<=[a-z0-9])(?=[A-Z])","-",k).lower()),v) for k,v in expected.items())
    return actual == expected

def create(service, resource, name, *options):
    # Una respuesta de transporte ambigua no permite repetir un POST con otro token.
    marker = folder/(stamp+"."+resource+".pending")
    require(not marker.exists(), "Hay un alta pendiente de conciliación: "+name)
    marker.touch(exist_ok=False)
    data = oci(service,resource,"create","--compartment-id",comp,"--display-name",name,
               "--freeform-tags",json.dumps(TAG),*options,pending=marker)
    require(data.get("id"), "OCI no devolvió el identificador de "+name)
    return data

def public_key():
    key=arg.clave_publica.read_text(encoding="ascii").strip()
    require("\n" not in key and re.match(r"^(ssh-ed25519|ssh-rsa|ecdsa-sha2-nistp(?:256|384|521)) ",key)
            and subprocess.run(["ssh-keygen","-lf",str(arg.clave_publica)],capture_output=True).returncode == 0,
            "Se requiere una única clave pública OpenSSH válida.")
    return key

require(re.fullmatch(r"ocid1\.(tenancy|compartment)\.oc1\.[a-z0-9.]+",comp) and
        re.fullmatch(r"ocid1\.tenancy\.oc1\.[a-z0-9.]+",root),"Indicá un compartimento y su tenancy.")
metadata={"ssh_authorized_keys":public_key(),"user_data":base64.b64encode(BOOT.encode()).decode()}
if arg.front_ip:
    require(arg.front_ip.is_global and not arg.front_ip.is_multicast,"La IP de entrada debe ser IPv4 pública.")
    metadata["alere_public_ipv4"]=str(arg.front_ip)
os.umask(0o077)
folder=Path.home()/".alere-demo"
folder.mkdir(mode=0o700,exist_ok=True)
stamp=hashlib.sha256(f"{root}|{comp}|{REGION}|alere-demo".encode()).hexdigest()[:32]
lock=(folder/(stamp+".compute-lock")).open("a")
fcntl.flock(lock,fcntl.LOCK_EX)
require(not (folder/(stamp+".compute-launch")).exists(),"Conciliá primero el recibo de lanzamiento directo.")
require([r["region-name"] for r in oci("iam","region-subscription","list","--tenancy-id",root,many=True)
         if r.get("is-home-region") is True]==[REGION],"Chicago debe ser la región de origen.")
net={"alere-demo":"network-v1"}
vcn=owned(listed("network","vcn"),"alere-demo-vcn",net)
require(vcn and vcn.get("lifecycle-state")=="AVAILABLE" and (vcn.get("cidr-blocks") or [vcn.get("cidr-block")])==["10.77.0.0/16"],"VCN inesperada.")
sub=owned(listed("network","subnet","--vcn-id",vcn["id"]),"alere-demo-public",net)
require(sub and sub.get("lifecycle-state")=="AVAILABLE" and sub.get("vcn-id")==vcn["id"] and
        sub.get("cidr-block")=="10.77.1.0/24" and not sub.get("availability-domain") and
        sub.get("prohibit-public-ip-on-vnic") is False,"Se requiere la subred pública regional de Alere.")
subnet=sub["id"]
pool=owned(listed(CM,"instance-pool"),"alere-demo-pool")
cfg=owned(listed(CM,"instance-configuration"),"alere-demo-pool-config")
autos_rows=listed("autoscaling","configuration")
autos=owned(autos_rows,"alere-demo-pool-horario")
members=set()
if pool:
    pool=oci(CM,"instance-pool","get","--instance-pool-id",pool["id"])
    require(cfg and pool.get("instance-configuration-id")==cfg["id"] and pool.get("size") in (0,1) and
            pool.get("lifecycle-state") in ("RUNNING","PROVISIONING","STARTING","SCALING"),"Pool con configuración o estado inesperados.")
    members={r["id"] for r in oci(CM,"instance-pool","list-instances","--compartment-id",comp,"--instance-pool-id",pool["id"],many=True)
             if str(r.get("state") or r.get("lifecycle-state","")).upper()!="TERMINATED"}
    require(len(members)<=1,"El pool tiene más de una instancia.")
    require(all(a.get("id")==((autos or {}).get("id")) for a in autos_rows
                if (a.get("resource") or {}).get("id")==pool["id"]),"El pool ya tiene otro horario.")
if autos:
    autos=oci("autoscaling","configuration","get","--auto-scaling-configuration-id",autos["id"])
    policies=autos.get("policies") or []
    require(pool and matches(autos.get("resource"),{"type":"instancePool","id":pool["id"]}) and len(policies)==1 and
            matches(policies[0],POLICY) and not policies[0].get("resource-action"),"La política existente difiere del objetivo 1.")
iprows=oci("network","private-ip","list","--subnet-id",subnet,"--ip-address",IP,many=True)
if iprows:
    vnics={v["id"] for vm in members for v in oci("compute","instance","list-vnics","--instance-id",vm,many=True)}
    require(len(iprows)==1 and iprows[0].get("vnic-id") in vnics,IP+" pertenece a otra VNIC o aún no se confirmó su dueña.")
scope=[root]+[r["id"] for r in listed("iam","compartment","--compartment-id-in-subtree","true","--access-level","ANY",compartment=root) if r["lifecycle-state"]=="ACTIVE"]
require(comp in scope,"El compartimento no pertenece a la tenancy.")
cpu=ram=storage=0
for c in scope:
    for vm in listed("compute","instance",compartment=c):
        if vm.get("lifecycle-state")=="TERMINATED":
            continue
        mark=(vm.get("freeform-tags") or {}).get("alere-demo")
        if c==comp and (vm.get("display-name")=="alere-demo" or mark in ("pool-v1","compute-v1")):
            require(vm["id"] in members,"Ya existe una VM de Alere ajena al pool o pendiente de asociación.")
        if vm.get("shape")==SHAPE:
            cpu+=vm["shape-config"]["ocpus"]
            ram+=vm["shape-config"]["memory-in-gbs"]
    storage+=sum(int(v["size-in-gbs"]) for family in ("volume","boot-volume") for v in listed("bv",family,compartment=c) if v["lifecycle-state"]!="TERMINATED")
domains=sorted(r["name"] for r in oci("iam","availability-domain","list","--compartment-id",root,many=True))
eligible=[]
used=[0,0]
for ad in domains:
    spare=[]
    for i,limit in enumerate(("standard-a1-core-count","standard-a1-memory-count")):
        val=oci("limits","resource-availability","get","--compartment-id",root,"--service-name","compute","--limit-name",limit,"--availability-domain",ad)
        require(isinstance(val.get("used"),(float,int)) and isinstance(val.get("available"),(float,int)),"OCI no informó una cuota A1.")
        used[i]+=val["used"]
        spare.append(val["available"])
    if spare[0]>=1 and spare[1]>=6:
        eligible.append(ad)
extra=0 if members else 1
require(max(used[0],cpu)+extra<=2 and max(used[1],ram)+6*extra<=12 and storage+50*extra<=200 and (eligible or members),
        "El objetivo excede el cupo gratuito o no hay AD con cuota.")
if pool:
    places=pool.get("placement-configurations") or []
    require(places and all(p.get("availability-domain") in domains and (p.get("primary-subnet-id") or
            (p.get("primary-vnic-subnets") or {}).get("subnet-id"))==subnet for p in places),"Ubicación del pool inesperada.")
image_re=r"Canonical-Ubuntu-24\.04-Minimal-aarch64-\d{4}\.\d{2}\.\d{2}-\d+"
if cfg:
    details=oci(CM,"instance-configuration","get","--instance-configuration-id",cfg["id"])["instance-details"]
    image_id=details["launch-details"]["source-details"]["image-id"]
    image=oci("compute","image","get","--image-id",image_id)
else:
    images=[r for r in listed("compute","image","--shape",SHAPE) if re.fullmatch(image_re,r["display-name"]) and r.get("compartment-id") is None and r.get("lifecycle-state")=="AVAILABLE"]
    require(images,"Falta la imagen Ubuntu 24.04 Minimal ARM de Oracle.")
    image=max(images,key=lambda r:r["time-created"])
require(re.fullmatch(image_re,image["display-name"]) and "compartment-id" in image and image["compartment-id"] is None,"Imagen no válida.")
launch={"compartmentId":comp,"displayName":"alere-demo","shape":SHAPE,"shapeConfig":{"ocpus":1,"memoryInGBs":6},
        "metadata":metadata,"freeformTags":TAG,"instanceOptions":{"areLegacyImdsEndpointsDisabled":True},
        "createVnicDetails":{"assignPublicIp":True,"privateIp":IP},
        "sourceDetails":{"sourceType":"image","imageId":image["id"],"bootVolumeSizeInGBs":50,"bootVolumeVpusPerGB":10}}
template={"instanceType":"compute","launchDetails":launch}
if cfg:
    require(matches(details,template) and details["launch-details"]["metadata"]==metadata,"La plantilla existente difiere del arranque solicitado.")
print(f"Chicago · A1 1 OCPU / 6 GB · disco Balanced 50 GB · IP privada {IP} · objetivo 1.",flush=True)
if arg.modo=="preflight":
    raise SystemExit(0)
if not cfg:
    cfg=create(CM,"instance-configuration","alere-demo-pool-config","--instance-details",json.dumps(template))
if not pool:
    places=[{"availabilityDomain":ad,"primarySubnetId":subnet} for ad in eligible]
    pool=create(CM,"instance-pool","alere-demo-pool","--instance-configuration-id",cfg["id"],"--size","0",
                "--placement-configurations",json.dumps(places),"--wait-for-state","RUNNING","--max-wait-seconds","300")
if not autos:
    autos=create("autoscaling","configuration","alere-demo-pool-horario","--resource",json.dumps({"type":"instancePool","id":pool["id"]}),
                 "--policies",json.dumps([POLICY]),"--is-enabled","true")
    fresh=oci(CM,"instance-pool","get","--instance-pool-id",pool["id"])
    if fresh.get("size")==0 and fresh.get("lifecycle-state")=="RUNNING" and not members:
        oci(CM,"instance-pool","update","--instance-pool-id",pool["id"],"--size","1","--force")
print("Pool:",pool["id"],"Horario UTC al minuto 17:",autos["id"],
      "habilitado" if autos.get("is-enabled",True) else "deshabilitado","Instancias confirmadas:",len(members),flush=True)

#!/usr/bin/env python3
"""Oracle Cloud Shell: python3 oci-entrada.py preflight|create|status OCID_COMPARTIMENTO."""
import argparse
import hashlib
import ipaddress
import json
import os
import re
import subprocess
import time

REGION = "us-chicago-1"
NAME = "alere-demo-entrada"
TAG = {"alere-demo": "entrada-v1"}
FRONT = "10.77.1.44"
BACK = "10.77.1.45"
API = f"https://network-load-balancer-api.{REGION}.oci.oraclecloud.com/20200501/networkLoadBalancers"


def require(ok, message):
    if not ok:
        raise SystemExit(message)


def cli(*args):
    result = subprocess.run(["oci", "--region", REGION, "--output", "json", "--no-retry", *args],
                            text=True, capture_output=True)
    if result.returncode:
        error = re.search(r'"code"\s*:\s*"([a-zA-Z0-9._-]+)"', result.stderr)
        raise SystemExit(f"OCI {' '.join(args[:3])}: {error[1] if error else result.returncode}.")
    return json.loads(result.stdout) if result.stdout.strip() else {}


def rows(*args):
    doc = cli(*args, "--all")
    if set(doc) <= {"opc-request-id", "etag"}:
        return []
    data = doc["data"]
    if isinstance(data, dict):
        data = data["items"]
    require(isinstance(data, list), "Inventario OCI incompleto.")
    return data


def network(kind, name, comp, *extra):
    matches = [r for r in rows("network", kind, "list", "--compartment-id", comp, *extra)
               if r["display-name"] == name and r["lifecycle-state"] != "TERMINATED"]
    require(len(matches) == 1 and matches[0]["lifecycle-state"] == "AVAILABLE"
            and (matches[0].get("freeform-tags") or {}).get("alere-demo") == "network-v1",
            "Falta el recurso de red identificado de Alere: " + name)
    return matches[0]


def config(comp, subnet):
    body = {"compartmentId": comp, "displayName": NAME, "freeformTags": TAG, "subnetId": subnet,
            "isPrivate": False, "isPreserveSourceDestination": False, "nlbIpVersion": "IPV4",
            "assignedPrivateIpv4": FRONT, "listeners": {}, "backendSets": {}}
    for port in (80, 443):
        name = f"web{port}"
        body["listeners"][name] = {"name": name, "port": port, "protocol": "TCP",
                                   "ipVersion": "IPV4", "defaultBackendSetName": name}
        body["backendSets"][name] = {
            "policy": "FIVE_TUPLE", "ipVersion": "IPV4", "isPreserveSource": False,
            "healthChecker": {"protocol": "TCP", "port": port, "retries": 3,
                              "timeoutInMillis": 3000, "intervalInMillis": 10000},
            "backends": [{"ipAddress": BACK, "port": port, "weight": 1}]}
    return body


def existing(scope, comp, subnet):
    active = [r for folder in scope for r in rows("nlb", "network-load-balancer", "list",
              "--compartment-id", folder) if r["lifecycle-state"] != "DELETED"]
    if not active:
        return None
    require(len(active) == 1, "Hay varios NLB en Chicago. Revisá el cupo Always Free.")
    nlb = active[0]
    require(nlb["display-name"] == NAME and nlb["compartment-id"] == comp and nlb["subnet-id"] == subnet
            and (nlb.get("freeform-tags") or {}).get("alere-demo") == TAG["alere-demo"],
            "Otro NLB ya ocupa el cupo gratuito en Chicago.")
    return nlb["id"]


def verify(nlb, comp, subnet):
    require(nlb["display-name"] == NAME and nlb["compartment-id"] == comp and nlb["subnet-id"] == subnet
            and nlb["freeform-tags"].get("alere-demo") == TAG["alere-demo"]
            and nlb["is-private"] is False and nlb["is-preserve-source-destination"] is False
            and nlb["nlb-ip-version"] == "IPV4", "El NLB encontrado difiere del previsto.")
    listeners, sets = nlb["listeners"], nlb["backend-sets"]
    require(set(listeners) == set(sets) == {"web80", "web443"}, "Listeners o grupos inesperados.")
    for port in (80, 443):
        name = f"web{port}"
        listener, group = listeners[name], sets[name]
        backend, health = group["backends"], group["health-checker"]
        require(listener["protocol"] == "TCP" and listener["port"] == port
                and listener["default-backend-set-name"] == name
                and group["policy"] == "FIVE_TUPLE" and group["is-preserve-source"] is False
                and len(backend) == 1 and backend[0]["ip-address"] == BACK and backend[0]["port"] == port
                and not any(backend[0].get(flag) for flag in ("is-backup", "is-offline", "is-drain", "target-id"))
                and health["protocol"] == "TCP" and health["port"] == port, f"Configuración inesperada en {name}.")
    public = [ipaddress.IPv4Address(a["ip-address"]) for a in nlb["ip-addresses"] if a["is-public"]]
    require(len(public) == 1 and public[0].is_global and not public[0].is_multicast,
            "OCI todavía no confirma una IPv4 pública.")
    return str(public[0])


def run(mode, comp, tenancy):
    require(re.fullmatch(r"ocid1\.(?:tenancy|compartment)\.oc1\.[a-z0-9.]+", comp)
            and re.fullmatch(r"ocid1\.tenancy\.oc1\.[a-z0-9.]+", tenancy),
            "Indicá el OCID del compartimento y, si difiere de la raíz, ALERE_TENANCY_OCID.")
    regions = rows("iam", "region-subscription", "list", "--tenancy-id", tenancy)
    require([r["region-name"] for r in regions if r["is-home-region"]] == [REGION],
            "Se requiere Chicago como región de origen.")
    folders = rows("iam", "compartment", "list", "--compartment-id", tenancy,
                   "--compartment-id-in-subtree", "true", "--access-level", "ANY")
    scope = {tenancy} | {r["id"] for r in folders if r["lifecycle-state"] == "ACTIVE"}
    require(comp in scope, "El compartimento no figura en el inventario de la cuenta.")
    vcn = network("vcn", "alere-demo-vcn", comp)
    sub = network("subnet", "alere-demo-public", comp, "--vcn-id", vcn["id"])
    require((vcn.get("cidr-blocks") or [vcn.get("cidr-block")]) == ["10.77.0.0/16"]
            and sub["vcn-id"] == vcn["id"] and sub["cidr-block"] == "10.77.1.0/24"
            and sub["prohibit-public-ip-on-vnic"] is False and not sub.get("availability-domain"),
            "La red o la subred pública de Alere difiere de la esperada.")
    subnet = sub["id"]
    identity = existing(scope, comp, subnet)
    if not identity:
        if mode == "status":
            print("ESTADO=AUSENTE")
            return
        assigned = rows("network", "private-ip", "list", "--subnet-id", subnet)
        require(not any(ip["ip-address"] in {FRONT, BACK} for ip in assigned),
                "La dirección privada del frontend o del futuro backend ya está ocupada. Revisá antes de crear.")
        if mode == "preflight":
            print("Cupo disponible. Red verificada. Se puede crear un NLB IPv4 público en Chicago.")
            return
        payload = json.dumps(config(comp, subnet), separators=(",", ":"), sort_keys=True)
        token = hashlib.sha256(payload.encode()).hexdigest()
        reply = cli("raw-request", "--http-method", "POST", "--target-uri", API,
                    "--request-headers", json.dumps({"opc-retry-token": token}), "--request-body", payload)
        if str(reply.get("status", "")).split(" ")[0] not in {"200", "201", "202"}:
            reason = (reply.get("data") or {}).get("code", "sin código")
            raise SystemExit(f"OCI no confirmó la creación ({reason}). Consultá status antes de reintentar.")
        identity = (reply.get("data") or {}).get("id")
    for attempt in range(37 if mode == "create" else 1):
        identity = identity or existing(scope, comp, subnet)
        if identity:
            nlb = cli("nlb", "network-load-balancer", "get", "--network-load-balancer-id", identity)["data"]
            state = nlb["lifecycle-state"]
            if state == "ACTIVE":
                address = verify(nlb, comp, subnet)
                print("ESTADO=ACTIVE")
                print("IP_PUBLICA=" + address)
                return
            require(state in {"CREATING", "UPDATING"}, "Revisá el NLB existente. Estado: " + state)
            if mode != "create":
                print("ESTADO=" + state)
                return
        if attempt < 36:
            time.sleep(5)
    raise SystemExit("La solicitud sigue pendiente. Volvé a ejecutar status.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("modo", choices=("preflight", "create", "status"))
    parser.add_argument("compartimento")
    options = parser.parse_args()
    tenant = os.environ.get("ALERE_TENANCY_OCID") or (
        options.compartimento if options.compartimento.startswith("ocid1.tenancy.") else os.environ.get("OCI_TENANCY", ""))
    try:
        run(options.modo, options.compartimento, tenant)
    except (KeyError, TypeError, ValueError, OSError) as exc:
        raise SystemExit(f"No se pudo verificar la respuesta de OCI: {type(exc).__name__}.")

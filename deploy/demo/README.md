# Demo comercial Alere

Esta rama prepara Legajo y un campus Moodle 5.1.9 con el complemento del Libro, dos bases MariaDB y datos ficticios. Los sitios tienen direcciones HTTPS distintas. Caddy atiende ambos y los datos sobreviven a las actualizaciones en volúmenes de Docker.

## Preparar el servidor

1. En la región principal de la cuenta OCI, elegí una VM Linux **Always Free** con Ubuntu. Para Ampere A1, la cuota gratuita publicada es de hasta 2 OCPU y 12 GB de RAM en total. La disponibilidad de capacidad depende de la región. Oracle puede recuperar instancias ociosas. Verificá la indicación de gratuidad en la consola antes de crear recursos. [Límites oficiales de OCI](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm)
2. Asigná una IP pública a la VM. Los sitios usan `legajo` y `campus` bajo el mismo dominio. Para una demo gratuita, usá `legajo.IP-CON-GUIONES.sslip.io` y `campus.IP-CON-GUIONES.sslip.io`, reemplazando el marcador por la IPv4 real. También se admite la misma notación con `nip.io` y dominios Alere como `legajo.alere.com.ar` y `campus.alere.com.ar` si administrás sus DNS. Habilitá TCP 80 y 443 en OCI y en el firewall del servidor para que Caddy solicite y renueve los certificados. Docker mantiene los puertos de aplicación ligados a loopback. [DNS de prueba](https://sslip.io/) · [HTTPS de Caddy](https://caddyserver.com/docs/automatic-https)
3. Instalá Git, OpenSSL, util-linux y Docker Engine con los complementos Buildx y Compose v2 en la VM. La cuenta de servicio `alere` necesita acceso a Docker para actualizar la demo. [Instalación de Docker en Ubuntu](https://docs.docker.com/engine/install/ubuntu/)

En una VM Ubuntu 24.04 nueva, cargá [oci-cloud-init.yaml](oci-cloud-init.yaml) como configuración inicial en OCI. Los metadatos de red suelen indicar la IPv4 privada. Para obtener la pública, abrí los detalles de la instancia en la consola de Oracle, entrá a la VNIC principal y copiá su **dirección IPv4 pública**. [Metadatos de las VNIC en OCI](https://docs.oracle.com/en-us/iaas/Content/Compute/Tasks/gettingmetadata.htm)

Abrí una sesión SSH con tu clave privada en esa VM como `ubuntu`. Esperá a que termine cloud-init y ejecutá el inicializador allí. Reemplazá `192.0.2.1`, una dirección reservada para ejemplos, por la IPv4 pública que copiaste.

```bash
cloud-init status --wait
sudo /usr/local/sbin/alere-demo-iniciar 192.0.2.1
```

El inicializador muestra las dos direcciones HTTPS y arranca el despliegue en segundo plano. Para comprobar cuándo terminó, seguí las verificaciones de la sección de actualizaciones.

Si preferís preparar manualmente una VM que ya está creada, usá los pasos siguientes.

```bash
sudo useradd --system --create-home --user-group --groups docker alere
sudo install -d -m 0750 -o alere -g alere /opt/alere
sudo install -d -m 0700 -o alere -g alere /etc/alere
sudo -u alere -H git clone --single-branch --branch demo/alere https://github.com/pablokaegi/legajo.git /opt/alere/legajo
cd /opt/alere/legajo
```

Generá las claves una sola vez. Los siguientes valores de ejemplo se reemplazan por los dos nombres que ya resuelven a la IP y por el correo del administrador.

```bash
sudo -u alere -H bash deploy/demo/preparar-entorno.sh /etc/alere/demo.env \
  https://legajo.192-0-2-1.sslip.io https://campus.192-0-2-1.sslip.io admin@example.test
sudo -u alere -H bash deploy/demo/actualizar.sh /etc/alere/demo.env
```

Guardá una copia privada de `/etc/alere/demo.env` y de los volúmenes de datos. Los PIN de los usuarios ficticios se generan en el volumen `accesoslegajo`, archivo `/var/legajo-demo/accesos-legajo.json` del servicio `legajo-init`. Los accesos de Moodle quedan en `moodledata`, archivo `/var/moodledata/accesos-demo.json`. El administrador recupera esos archivos en la VM y comparte con cada participante sólo su acceso de prueba.

Para la primera publicación del Libro, entrá con el docente de Ciencias en **Legajo → Laboratorio de apoyos → Libro de Ciencias**, revisá las consignas y elegí **Publicar en Moodle**. El cuestionario del curso asigna 20 minutos a Ada y 30 a Beto.

## Actualizar después de cada push

El inicializador de cloud-init instala el servicio y activa el temporizador. En una instalación manual, hacelo una vez en la VM.

```bash
sudo install -m 0644 deploy/demo/alere-demo.service deploy/demo/alere-demo.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now alere-demo.timer
systemctl list-timers alere-demo.timer
```

Para publicar cambios de Legajo, generá el build como indica [AGENTS.md](../../AGENTS.md), incluí `src/` y `build/` en el mismo commit y hacé push a `demo/alere`. El temporizador comprueba la rama aproximadamente cada dos minutos. Actualiza el clon por avance directo, reconstruye las imágenes y registra el commit después de que los servicios están listos. Los archivos de entorno quedan fuera de Git.

Desde SSH, verificá que el temporizador indique `active` y que el SHA desplegado coincida con el primero que muestra `git ls-remote`. El primer despliegue crea el archivo `alere-desplegado` cuando los servicios están listos. Podés seguir el progreso en el registro.

```bash
systemctl is-active alere-demo.timer
sudo -u alere -H cat /opt/alere/legajo/.git/alere-desplegado
git ls-remote --heads https://github.com/pablokaegi/legajo.git refs/heads/demo/alere
sudo journalctl -u alere-demo.service -n 40 --no-pager
```

Desde un equipo fuera de la VM, abrí las dos direcciones HTTPS en el navegador. Verificá que Legajo muestre el acceso de Alere y que el campus muestre Moodle, ambos con un certificado válido.

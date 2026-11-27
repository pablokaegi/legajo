FROM php:8.3-apache-bookworm
WORKDIR /var/www/moodle
RUN apt-get update && apt-get install -y --no-install-recommends \
      ca-certificates curl libfreetype6-dev libicu-dev libjpeg62-turbo-dev libpng-dev libxml2-dev libzip-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j2 gd intl mysqli soap zip exif opcache \
    && rm -rf /var/lib/apt/lists/* \
    && php -r 'foreach (["iconv","mbstring","curl","openssl","ctype","zip","zlib","gd","simplexml","spl","pcre","dom","xml","xmlreader","intl","json","hash","fileinfo","sodium","mysqli"] as $e) { if (!extension_loaded($e)) {fwrite(STDERR, "Falta $e\n"); exit(1);} }' \
    && printf '%s\n' 'max_input_vars=5000' 'max_execution_time=180' 'memory_limit=384M' \
       'upload_max_filesize=64M' 'post_max_size=68M' 'display_errors=Off' 'log_errors=On' > /usr/local/etc/php/conf.d/alere.ini \
    && groupadd --gid 12000 alere-demo && usermod -a -G alere-demo www-data \
    && install -d -o www-data -g www-data -m 0700 /var/moodledata \
    && install -d -o www-data -g alere-demo -m 2750 /run/alere-demo
# Paquete oficial de la versión, con el hash publicado para el tarball estable.
RUN curl -fsSL --retry 3 https://download.moodle.org/download.php/direct/stable501/moodle-5.1.9.tgz -o /tmp/moodle.tgz \
    && echo 'cc9953dd00ef998bddb2e39e19ed12a8481883f6e8944750651542a12d5bcb3e  /tmp/moodle.tgz' | sha256sum --check --status \
    && tar -xzf /tmp/moodle.tgz --strip-components=1 --no-same-owner && rm /tmp/moodle.tgz
COPY deploy/demo/moodle-apache.conf /etc/apache2/sites-available/000-default.conf
COPY deploy/demo/moodle-config.php ./config.php
COPY integraciones/moodle/local/legajolibro/ ./public/local/legajolibro/
COPY deploy/demo/moodle-init.php /opt/alere/moodle-init.php
COPY deploy/demo/fixtures/ /opt/alere/fixtures/
COPY docs/laboratorio-apoyos/comprobacion.gift.txt /opt/alere/fixtures/comprobacion.gift.txt

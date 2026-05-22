-- Migración 0004: módulo Agrupamientos / Sociograma.
-- Pegar este script en phpMyAdmin (pestaña SQL) sobre la base de producción.
-- Las tablas no tienen datos reales todavía, así que es seguro recrearlas.

DROP TABLE IF EXISTS `agrupamiento_grupos`;
DROP TABLE IF EXISTS `agrupamiento_votos`;
DROP TABLE IF EXISTS `agrupamiento_sesiones`;

CREATE TABLE `agrupamiento_sesiones` (
  `id`               int NOT NULL AUTO_INCREMENT,
  `curso_moodle_id`  int NOT NULL,
  `curso_nombre`     varchar(200) NOT NULL,
  `titulo`           varchar(200) NOT NULL,
  `fecha`            date NOT NULL,
  `estado`           varchar(16) NOT NULL DEFAULT 'abierta' COMMENT 'abierta|cerrada',
  `cantidad_evaluar` int NOT NULL DEFAULT 5,
  `voto_token`       varchar(36) DEFAULT NULL,
  `notas`            text,
  `created_by`       int NOT NULL,
  `created_at`       timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_agrup_sesion_token` (`voto_token`),
  KEY `idx_agrup_sesion_curso` (`curso_moodle_id`),
  KEY `idx_agrup_sesion_fecha` (`fecha`),
  CONSTRAINT `agrupamiento_sesiones_created_by_fk`
    FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id`)
);

CREATE TABLE `agrupamiento_votos` (
  `id`                  int NOT NULL AUTO_INCREMENT,
  `sesion_id`           int NOT NULL,
  `votante_moodle_id`   int NOT NULL,
  `votante_nombre`      varchar(200) NOT NULL,
  `calificaciones`      text NOT NULL COMMENT 'JSON: [{ id, nombre, puntaje }]',
  `bloqueado_moodle_id` int DEFAULT NULL,
  `bloqueado_nombre`    varchar(200) DEFAULT NULL,
  `created_at`          timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`          timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_agrup_voto_sesion_votante` (`sesion_id`, `votante_moodle_id`),
  KEY `idx_agrup_voto_sesion` (`sesion_id`),
  CONSTRAINT `agrupamiento_votos_sesion_fk`
    FOREIGN KEY (`sesion_id`) REFERENCES `agrupamiento_sesiones` (`id`) ON DELETE CASCADE
);

CREATE TABLE `agrupamiento_grupos` (
  `id`          int NOT NULL AUTO_INCREMENT,
  `sesion_id`   int NOT NULL,
  `nombre`      varchar(200) NOT NULL,
  `modo`        varchar(20) NOT NULL COMMENT 'afinidad|rendimiento|heterogeneo|aleatorio|manual',
  `grupos_json` text NOT NULL COMMENT 'JSON: [[{id,nombre}, ...], ...]',
  `created_at`  timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_agrup_grupos_sesion` (`sesion_id`),
  CONSTRAINT `agrupamiento_grupos_sesion_fk`
    FOREIGN KEY (`sesion_id`) REFERENCES `agrupamiento_sesiones` (`id`) ON DELETE CASCADE
);

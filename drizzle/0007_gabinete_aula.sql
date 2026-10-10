-- Migración 0007: gabinete psicopedagógico (casos + intervenciones) y planos del aula.
-- Idempotente: CREATE TABLE IF NOT EXISTS. El rol "gabinete" no necesita cambios
-- de esquema (roles.rol es varchar).

CREATE TABLE IF NOT EXISTS `gabinete_casos` (
  `id`                int NOT NULL AUTO_INCREMENT,
  `alumno_moodle_id`  int NOT NULL,
  `alumno_nombre`     varchar(200) NOT NULL,
  `curso_moodle_id`   int NULL,
  `curso_nombre`      varchar(200) NULL,
  `estado`            varchar(20) NOT NULL DEFAULT 'derivado' COMMENT 'derivado|evaluacion|intervencion|seguimiento|cerrado',
  `nivel`             tinyint NOT NULL DEFAULT 2 COMMENT 'nivel de apoyo 1|2|3',
  `motivo`            text NOT NULL,
  `fortalezas`        text NULL,
  `origen`            varchar(16) NOT NULL DEFAULT 'derivacion' COMMENT 'derivacion|alerta|gabinete',
  `derivado_por`      int NOT NULL,
  `responsable_id`    int NULL,
  `proxima_revision`  date NULL,
  `created_at`        timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`        timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `cerrado_at`        timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_gab_caso_alumno` (`alumno_moodle_id`),
  KEY `idx_gab_caso_estado` (`estado`),
  CONSTRAINT `gab_caso_derivado_por_fk` FOREIGN KEY (`derivado_por`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `gab_caso_responsable_fk` FOREIGN KEY (`responsable_id`) REFERENCES `usuarios` (`id`)
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS `gabinete_intervenciones` (
  `id`           int NOT NULL AUTO_INCREMENT,
  `caso_id`      int NOT NULL,
  `tipo`         varchar(24) NOT NULL,
  `fecha`        date NOT NULL,
  `descripcion`  text NOT NULL,
  `acuerdos`     text NULL,
  `autor_id`     int NOT NULL,
  `created_at`   timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_gab_int_caso` (`caso_id`),
  CONSTRAINT `gab_int_caso_fk` FOREIGN KEY (`caso_id`) REFERENCES `gabinete_casos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `gab_int_autor_fk` FOREIGN KEY (`autor_id`) REFERENCES `usuarios` (`id`)
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS `aula_planos` (
  `id`               int NOT NULL AUTO_INCREMENT,
  `curso_moodle_id`  int NOT NULL,
  `curso_nombre`     varchar(200) NOT NULL,
  `nombre`           varchar(200) NOT NULL,
  `columnas`         tinyint NOT NULL DEFAULT 3,
  `bancos_json`      text NOT NULL,
  `origen`           varchar(16) NOT NULL DEFAULT 'manual' COMMENT 'inclusiva|aleatorio|alfabetico|manual',
  `sesion_id`        int NULL,
  `vigente`          tinyint(1) NOT NULL DEFAULT 0,
  `created_by`       int NOT NULL,
  `created_at`       timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_aula_plano_curso` (`curso_moodle_id`),
  CONSTRAINT `aula_plano_created_by_fk` FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id`)
);

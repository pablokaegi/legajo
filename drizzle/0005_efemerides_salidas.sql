-- Migración 0005: efemérides y salidas didácticas (con autorizaciones por alumno).
-- Estas tablas se habían creado a mano en producción pero faltaban en las
-- migraciones (drift respecto de schema.ts). Idempotente: CREATE TABLE IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS `efemerides` (
  `id`                   int NOT NULL AUTO_INCREMENT,
  `fecha`                date NOT NULL,
  `titulo`               varchar(200) NOT NULL,
  `descripcion`          text,
  `cursos_responsables`  text COMMENT 'JSON: [{cursoId,cursoNombre}]',
  `docente_responsable`  varchar(200),
  `estado`               varchar(20) NOT NULL DEFAULT 'planificado' COMMENT 'planificado|realizado|cancelado',
  `notas`                text,
  `created_by`           int NOT NULL,
  `created_at`           timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`           timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_efem_fecha` (`fecha`),
  CONSTRAINT `efemerides_created_by_fk`
    FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id`)
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS `salidas` (
  `id`                  int NOT NULL AUTO_INCREMENT,
  `titulo`              varchar(200) NOT NULL,
  `fecha`               date NOT NULL,
  `destino`             varchar(300) NOT NULL,
  `descripcion`         text,
  `responsable_nombre`  varchar(200) NOT NULL,
  `curso_nombre`        varchar(200) NOT NULL,
  `cantidad_alumnos`    int,
  `costo_estimado`      varchar(50),
  `estado`              varchar(20) NOT NULL DEFAULT 'borrador' COMMENT 'borrador|aprobado|realizado|cancelado',
  `upload_token`        varchar(36) NOT NULL,
  `documento_path`      varchar(500),
  `documento_nombre`    varchar(200),
  `documento_subido_at` timestamp NULL DEFAULT NULL,
  `notas`               text,
  `created_by`          int NOT NULL,
  `created_at`          timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`          timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_salidas_token` (`upload_token`),
  KEY `idx_salidas_fecha` (`fecha`),
  CONSTRAINT `salidas_created_by_fk`
    FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id`)
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS `salidas_autorizaciones` (
  `id`                  int NOT NULL AUTO_INCREMENT,
  `salida_id`           int NOT NULL,
  `alumno_moodle_id`    int NOT NULL,
  `alumno_nombre`       varchar(200) NOT NULL,
  `upload_token`        varchar(36) NOT NULL,
  `documento_path`      varchar(500),
  `documento_nombre`    varchar(200),
  `documento_subido_at` timestamp NULL DEFAULT NULL,
  `created_at`          timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_salidaaut_token` (`upload_token`),
  UNIQUE KEY `uq_salidaaut_salida_alumno` (`salida_id`, `alumno_moodle_id`),
  KEY `idx_salidaaut_salida` (`salida_id`),
  KEY `idx_salidaaut_alumno` (`alumno_moodle_id`),
  CONSTRAINT `salidas_autorizaciones_salida_fk`
    FOREIGN KEY (`salida_id`) REFERENCES `salidas` (`id`) ON DELETE CASCADE
);

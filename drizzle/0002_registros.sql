-- Migración 0002: faltas, amonestaciones, reincorporaciones, actas, auditoría, jobs.
-- Idempotente: usa IF NOT EXISTS / IF EXISTS en cada bloque.

CREATE TABLE IF NOT EXISTS `faltas` (
  `id`              bigint unsigned NOT NULL AUTO_INCREMENT,
  `fecha`           date NOT NULL,
  `tipo`            varchar(32) NOT NULL COMMENT 'ausente|retraso|salida_anticipada|otra',
  `descripcion`     text,
  `preceptor_id`    int NOT NULL,
  `curso_moodle_id` int NOT NULL,
  `curso_nombre`    varchar(200) NOT NULL,
  `estado`          varchar(16) NOT NULL DEFAULT 'registrada' COMMENT 'registrada|confirmada',
  `visibilidad`     varchar(16) NOT NULL DEFAULT 'publica' COMMENT 'publica|interna',
  `created_at`      timestamp NOT NULL DEFAULT (now()),
  `updated_at`      timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `faltas_id` PRIMARY KEY (`id`),
  CONSTRAINT `faltas_preceptor_id_fk` FOREIGN KEY (`preceptor_id`) REFERENCES `usuarios`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS `faltas_alumnos` (
  `falta_id`        bigint unsigned NOT NULL,
  `alumno_moodle_id` int NOT NULL,
  `alumno_nombre`   varchar(200) NOT NULL,
  `nota`            text,
  `created_at`      timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `faltas_alumnos_pk` PRIMARY KEY (`falta_id`, `alumno_moodle_id`),
  CONSTRAINT `faltas_alumnos_falta_id_fk` FOREIGN KEY (`falta_id`) REFERENCES `faltas`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION
);
--> statement-breakpoint

CREATE INDEX IF NOT EXISTS `idx_faltas_preceptor` ON `faltas`(`preceptor_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_faltas_curso` ON `faltas`(`curso_moodle_id`, `fecha`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_faltas_alumnos_alumno` ON `faltas_alumnos`(`alumno_moodle_id`, `falta_id`);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS `amonestaciones` (
  `id`                  bigint unsigned NOT NULL AUTO_INCREMENT,
  `alumno_moodle_id`    int NOT NULL,
  `alumno_nombre`       varchar(200) NOT NULL,
  `fecha`               date NOT NULL,
  `gravedad`            varchar(8) NOT NULL COMMENT 'leve|mediana|grave',
  `motivo`              text NOT NULL,
  `preceptor_id`        int NOT NULL,
  `acciones_sugeridas`  text,
  `curso_moodle_id`     int,
  `curso_nombre`        varchar(200),
  `created_at`          timestamp NOT NULL DEFAULT (now()),
  `updated_at`          timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `amonestaciones_id` PRIMARY KEY (`id`),
  CONSTRAINT `amonestaciones_preceptor_id_fk` FOREIGN KEY (`preceptor_id`) REFERENCES `usuarios`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_amon_alumno` ON `amonestaciones`(`alumno_moodle_id`, `fecha`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_amon_preceptor` ON `amonestaciones`(`preceptor_id`);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS `reincorporaciones` (
  `id`                      bigint unsigned NOT NULL AUTO_INCREMENT,
  `alumno_moodle_id`        int NOT NULL,
  `alumno_nombre`           varchar(200) NOT NULL,
  `fecha_reincorporacion`   date NOT NULL,
  `preceptor_id`            int NOT NULL,
  `observaciones`           text,
  `documento_url`           varchar(500),
  `linked_falta_id`         bigint unsigned,
  `created_at`              timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `reincorporaciones_id` PRIMARY KEY (`id`),
  CONSTRAINT `reincorporaciones_preceptor_id_fk` FOREIGN KEY (`preceptor_id`) REFERENCES `usuarios`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `reincorporaciones_falta_id_fk` FOREIGN KEY (`linked_falta_id`) REFERENCES `faltas`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_reinc_alumno` ON `reincorporaciones`(`alumno_moodle_id`);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS `actas` (
  `id`          bigint unsigned NOT NULL AUTO_INCREMENT,
  `fecha`       date NOT NULL,
  `titulo`      varchar(300) NOT NULL,
  `resumen`     text NOT NULL,
  `acuerdos`    text,
  `estado`      varchar(16) NOT NULL DEFAULT 'abierta' COMMENT 'abierta|cerrada',
  `created_by`  int NOT NULL,
  `created_at`  timestamp NOT NULL DEFAULT (now()),
  `updated_at`  timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `actas_id` PRIMARY KEY (`id`),
  CONSTRAINT `actas_created_by_fk` FOREIGN KEY (`created_by`) REFERENCES `usuarios`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS `actas_asistentes` (
  `acta_id`     bigint unsigned NOT NULL,
  `usuario_id`  int NOT NULL,
  `rol`         varchar(32),
  CONSTRAINT `actas_asistentes_pk` PRIMARY KEY (`acta_id`, `usuario_id`),
  CONSTRAINT `actas_asistentes_acta_fk` FOREIGN KEY (`acta_id`) REFERENCES `actas`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `actas_asistentes_usuario_fk` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS `actas_alumnos` (
  `acta_id`           bigint unsigned NOT NULL,
  `alumno_moodle_id`  int NOT NULL,
  `alumno_nombre`     varchar(200) NOT NULL,
  CONSTRAINT `actas_alumnos_pk` PRIMARY KEY (`acta_id`, `alumno_moodle_id`),
  CONSTRAINT `actas_alumnos_acta_fk` FOREIGN KEY (`acta_id`) REFERENCES `actas`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS `actas_tareas` (
  `id`              bigint unsigned NOT NULL AUTO_INCREMENT,
  `acta_id`         bigint unsigned NOT NULL,
  `descripcion`     text NOT NULL,
  `responsable_id`  int,
  `due_date`        date,
  `estado`          varchar(16) NOT NULL DEFAULT 'pendiente' COMMENT 'pendiente|en_progreso|completada',
  `created_at`      timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `actas_tareas_id` PRIMARY KEY (`id`),
  CONSTRAINT `actas_tareas_acta_fk` FOREIGN KEY (`acta_id`) REFERENCES `actas`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `actas_tareas_responsable_fk` FOREIGN KEY (`responsable_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS `actas_versiones` (
  `id`          bigint unsigned NOT NULL AUTO_INCREMENT,
  `acta_id`     bigint unsigned NOT NULL,
  `resumen`     text NOT NULL,
  `acuerdos`    text,
  `editado_por` int NOT NULL,
  `created_at`  timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `actas_versiones_id` PRIMARY KEY (`id`),
  CONSTRAINT `actas_versiones_acta_fk` FOREIGN KEY (`acta_id`) REFERENCES `actas`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `actas_versiones_editor_fk` FOREIGN KEY (`editado_por`) REFERENCES `usuarios`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_actas_versiones` ON `actas_versiones`(`acta_id`, `created_at`);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS `logs_acciones` (
  `id`            bigint unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id`    int,
  `accion`        varchar(50) NOT NULL,
  `tabla_destino` varchar(50),
  `id_destino`    varchar(50),
  `payload_json`  text,
  `ip`            varchar(45),
  `created_at`    timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `logs_acciones_id` PRIMARY KEY (`id`)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_logs_usuario` ON `logs_acciones`(`usuario_id`, `created_at`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_logs_tabla` ON `logs_acciones`(`tabla_destino`, `id_destino`);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS `jobs` (
  `id`              varchar(36) NOT NULL,
  `tipo`            varchar(50) NOT NULL,
  `estado`          varchar(16) NOT NULL DEFAULT 'pendiente' COMMENT 'pendiente|procesando|completado|error',
  `payload_json`    text,
  `resultado_json`  text,
  `usuario_id`      int,
  `total`           int NOT NULL DEFAULT 0,
  `procesados`      int NOT NULL DEFAULT 0,
  `errores`         int NOT NULL DEFAULT 0,
  `created_at`      timestamp NOT NULL DEFAULT (now()),
  `updated_at`      timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `jobs_id` PRIMARY KEY (`id`)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_jobs_usuario` ON `jobs`(`usuario_id`, `created_at`);

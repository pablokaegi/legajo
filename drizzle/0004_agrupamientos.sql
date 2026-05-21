-- Migración 0004: módulo Agrupamientos / Sociograma.
-- Idempotente: usa IF NOT EXISTS en cada bloque.
-- Pegar este script en phpMyAdmin (pestaña SQL) sobre la base de producción.

CREATE TABLE IF NOT EXISTS `agrupamiento_sesiones` (
  `id`              int NOT NULL AUTO_INCREMENT,
  `curso_moodle_id` int NOT NULL,
  `curso_nombre`    varchar(200) NOT NULL,
  `titulo`          varchar(200) NOT NULL,
  `fecha`           date NOT NULL,
  `estado`          varchar(16) NOT NULL DEFAULT 'abierta' COMMENT 'abierta|cerrada',
  `notas`           text,
  `created_by`      int NOT NULL,
  `created_at`      timestamp NOT NULL DEFAULT (now()),
  `updated_at`      timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `agrupamiento_sesiones_id` PRIMARY KEY (`id`),
  CONSTRAINT `agrupamiento_sesiones_created_by_fk` FOREIGN KEY (`created_by`) REFERENCES `usuarios`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_agrup_sesion_curso` ON `agrupamiento_sesiones`(`curso_moodle_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_agrup_sesion_fecha` ON `agrupamiento_sesiones`(`fecha`);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS `agrupamiento_votos` (
  `id`                  int NOT NULL AUTO_INCREMENT,
  `sesion_id`           int NOT NULL,
  `votante_moodle_id`   int NOT NULL,
  `votante_nombre`      varchar(200) NOT NULL,
  `calificaciones`      text NOT NULL COMMENT 'JSON: [{ id, nombre, puntaje }]',
  `bloqueado_moodle_id` int,
  `bloqueado_nombre`    varchar(200),
  `created_at`          timestamp NOT NULL DEFAULT (now()),
  `updated_at`          timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `agrupamiento_votos_id` PRIMARY KEY (`id`),
  CONSTRAINT `agrupamiento_votos_sesion_fk` FOREIGN KEY (`sesion_id`) REFERENCES `agrupamiento_sesiones`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `uq_agrup_voto_sesion_votante` UNIQUE (`sesion_id`, `votante_moodle_id`)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_agrup_voto_sesion` ON `agrupamiento_votos`(`sesion_id`);

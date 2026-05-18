-- Migración 0001: rename docentes→usuarios, agrega roles, vinculos_familia, sessions, índices.
-- Conserva datos existentes. Idempotente para drizzle journal.

ALTER TABLE `docentes` RENAME TO `usuarios`;
--> statement-breakpoint
ALTER TABLE `usuarios` ADD COLUMN `telefono` varchar(30) NULL AFTER `email`;
--> statement-breakpoint
ALTER TABLE `usuarios` MODIFY COLUMN `moodle_user_id` int NULL;
--> statement-breakpoint

ALTER TABLE `observaciones` DROP FOREIGN KEY `observaciones_docente_id_docentes_id_fk`;
--> statement-breakpoint
ALTER TABLE `observaciones` CHANGE COLUMN `docente_id` `usuario_id` int NOT NULL;
--> statement-breakpoint
ALTER TABLE `observaciones` ADD CONSTRAINT `observaciones_usuario_id_usuarios_id_fk`
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE no action ON UPDATE no action;
--> statement-breakpoint

CREATE INDEX `idx_obs_alumno` ON `observaciones`(`alumno_moodle_id`, `fecha`);
--> statement-breakpoint
CREATE INDEX `idx_obs_curso` ON `observaciones`(`curso_moodle_id`, `fecha`);
--> statement-breakpoint
CREATE INDEX `idx_obs_usuario` ON `observaciones`(`usuario_id`, `fecha`);
--> statement-breakpoint

CREATE TABLE `roles` (
  `id` int AUTO_INCREMENT NOT NULL,
  `usuario_id` int NOT NULL,
  `rol` varchar(20) NOT NULL,
  `scope` varchar(50),
  `created_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `roles_id` PRIMARY KEY(`id`),
  CONSTRAINT `roles_usuario_id_usuarios_id_fk` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE no action ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX `idx_roles_usuario` ON `roles`(`usuario_id`);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_roles_usuario_rol_scope` ON `roles`(`usuario_id`, `rol`, `scope`);
--> statement-breakpoint

INSERT INTO `roles` (`usuario_id`, `rol`, `scope`)
  SELECT `id`, 'docente', NULL FROM `usuarios`;
--> statement-breakpoint

CREATE TABLE `vinculos_familia` (
  `id` int AUTO_INCREMENT NOT NULL,
  `padre_id` int NOT NULL,
  `alumno_moodle_id` int NOT NULL,
  `parentesco` varchar(30),
  `verificado` boolean NOT NULL DEFAULT false,
  `verificado_por` int,
  `verificado_at` timestamp,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `vinculos_familia_id` PRIMARY KEY(`id`),
  CONSTRAINT `vinculos_familia_padre_id_usuarios_id_fk` FOREIGN KEY (`padre_id`) REFERENCES `usuarios`(`id`) ON DELETE no action ON UPDATE no action,
  CONSTRAINT `vinculos_familia_verificado_por_usuarios_id_fk` FOREIGN KEY (`verificado_por`) REFERENCES `usuarios`(`id`) ON DELETE no action ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX `idx_vinc_padre` ON `vinculos_familia`(`padre_id`);
--> statement-breakpoint
CREATE INDEX `idx_vinc_alumno` ON `vinculos_familia`(`alumno_moodle_id`);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_vinc_padre_alumno` ON `vinculos_familia`(`padre_id`, `alumno_moodle_id`);
--> statement-breakpoint

CREATE TABLE `sessions` (
  `id` varchar(64) NOT NULL,
  `usuario_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `expires_at` timestamp NOT NULL,
  `revoked_at` timestamp,
  `ip_address` varchar(45),
  `user_agent` varchar(255),
  CONSTRAINT `sessions_id` PRIMARY KEY(`id`),
  CONSTRAINT `sessions_usuario_id_usuarios_id_fk` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE no action ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX `idx_sessions_usuario` ON `sessions`(`usuario_id`);
--> statement-breakpoint
CREATE INDEX `idx_sessions_expires` ON `sessions`(`expires_at`);

-- Evaluaciones orales y cola de publicaciones del piloto Aula.
CREATE TABLE IF NOT EXISTS `aula_orales` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `curso_moodle_id` int NOT NULL,
  `tarea_moodle_id` int NOT NULL,
  `alumno_moodle_id` int NOT NULL,
  `autor_id` int NOT NULL,
  `revision` int NOT NULL DEFAULT 1,
  `estado` varchar(16) NOT NULL,
  `caudales` tinyint NULL,
  `unidades` tinyint NULL,
  `justificacion` tinyint NULL,
  `devolucion` varchar(500) NOT NULL DEFAULT '',
  `actualizado_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_aula_oral_destino` (`curso_moodle_id`, `tarea_moodle_id`, `alumno_moodle_id`),
  CONSTRAINT `fk_aula_oral_autor` FOREIGN KEY (`autor_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS `aula_publicaciones` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `oral_id` int NOT NULL,
  `revision` int NOT NULL,
  `autor_id` int NOT NULL,
  `nota` decimal(4,2) NOT NULL,
  `devolucion` varchar(500) NOT NULL,
  `estado` varchar(16) NOT NULL DEFAULT 'pendiente',
  `intentos` int NOT NULL DEFAULT 0,
  `intento_moodle` int NULL,
  `id_proceso` varchar(36) NULL,
  `procesando_desde` timestamp NULL,
  `verificado_at` timestamp NULL,
  `ultimo_error` varchar(200) NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_aula_publicacion_revision` (`oral_id`, `revision`),
  CONSTRAINT `fk_aula_publicacion_oral` FOREIGN KEY (`oral_id`) REFERENCES `aula_orales` (`id`),
  CONSTRAINT `fk_aula_publicacion_autor` FOREIGN KEY (`autor_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

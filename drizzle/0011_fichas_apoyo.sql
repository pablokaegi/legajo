CREATE TABLE IF NOT EXISTS `fichas_apoyo` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `curso_moodle_id` int NOT NULL,
  `alumno_moodle_id` int NOT NULL,
  `version` int NOT NULL DEFAULT 1,
  `barrera` varchar(500) NOT NULL,
  `ajuste` varchar(500) NOT NULL,
  `responsable` varchar(120) NOT NULL,
  `fecha_revision` date NOT NULL,
  `ofrecido` varchar(10) NOT NULL DEFAULT 'pendiente',
  `observacion` varchar(500) NOT NULL DEFAULT '',
  `decision` varchar(10) NOT NULL DEFAULT 'pendiente',
  `autor_id` int NOT NULL,
  `actualizado_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_ficha_apoyo_curso_alumno` (`curso_moodle_id`, `alumno_moodle_id`),
  CONSTRAINT `fk_ficha_apoyo_autor` FOREIGN KEY (`autor_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

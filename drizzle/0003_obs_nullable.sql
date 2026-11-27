-- Migración 0003: actitud, tarea_completa y participacion pasan a nullable
-- para permitir observaciones sin evaluación numérica.

ALTER TABLE `observaciones`
  MODIFY COLUMN `actitud` tinyint NULL,
  MODIFY COLUMN `tarea_completa` boolean NULL,
  MODIFY COLUMN `participacion` tinyint NULL;

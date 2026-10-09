-- Migración 0006: Agrupamientos v2.
-- * modo_voto: 'nominacion' (cada alumno elige hasta N compañeros de toda la
--   lista) para las sesiones nuevas; las existentes quedan en 'calificacion'
--   (formato anterior: calificar 1-5 a compañeros asignados al azar).
-- * permite_bloqueo: si la sesión pregunta "con quién preferirías no trabajar".
-- * prediccion_json: predicción del docente antes de ver resultados (sintonía).
-- * meta_json / evaluacion*: roles, ubicación y evaluación local de cada agrupación.
-- Idempotente (MariaDB): ADD COLUMN IF NOT EXISTS.

ALTER TABLE `agrupamiento_sesiones`
  ADD COLUMN IF NOT EXISTS `modo_voto` varchar(16) NOT NULL DEFAULT 'calificacion' COMMENT 'nominacion|calificacion',
  ADD COLUMN IF NOT EXISTS `permite_bloqueo` tinyint(1) NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS `prediccion_json` text NULL;
--> statement-breakpoint

ALTER TABLE `agrupamiento_grupos`
  ADD COLUMN IF NOT EXISTS `meta_json` text NULL COMMENT 'JSON: roles, ubicación, tutorías',
  ADD COLUMN IF NOT EXISTS `evaluacion` varchar(16) NULL COMMENT 'funciono|regular|no_funciono',
  ADD COLUMN IF NOT EXISTS `evaluacion_nota` text NULL,
  ADD COLUMN IF NOT EXISTS `evaluado_at` timestamp NULL DEFAULT NULL;

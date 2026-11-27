-- Las filas existentes conservan su escala original y su calificación.
ALTER TABLE `aula_orales`
  ADD COLUMN IF NOT EXISTS `version_rubrica` tinyint NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS `apoyo` varchar(24) NULL;

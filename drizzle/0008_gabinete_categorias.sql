-- Migración 0008: categorías de motivo en los casos y marca de intervención
-- compartible con la familia (para el informe a familias). Idempotente (MariaDB).

ALTER TABLE `gabinete_casos`
  ADD COLUMN IF NOT EXISTS `categorias_json` text NULL COMMENT 'JSON: ids de categorías (ver gabinete/categorias.ts)';
--> statement-breakpoint

ALTER TABLE `gabinete_intervenciones`
  ADD COLUMN IF NOT EXISTS `visible_familia` tinyint(1) NOT NULL DEFAULT 0;

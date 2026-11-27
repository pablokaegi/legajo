CREATE TABLE `cache_cursos` (
	`moodle_id` int NOT NULL,
	`nombre` varchar(200) NOT NULL,
	`shortname` varchar(100) NOT NULL,
	`data_json` text NOT NULL,
	`cached_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cache_cursos_moodle_id` PRIMARY KEY(`moodle_id`)
);
--> statement-breakpoint
CREATE TABLE `docentes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`moodle_user_id` int NOT NULL,
	`nombre` varchar(100) NOT NULL,
	`email` varchar(200) NOT NULL,
	`pin_hash` varchar(255) NOT NULL,
	`activo` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `docentes_id` PRIMARY KEY(`id`),
	CONSTRAINT `docentes_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `observaciones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`docente_id` int NOT NULL,
	`alumno_moodle_id` int NOT NULL,
	`alumno_nombre` varchar(200) NOT NULL,
	`curso_moodle_id` int NOT NULL,
	`curso_nombre` varchar(200) NOT NULL,
	`actitud` tinyint NOT NULL,
	`tarea_completa` boolean NOT NULL,
	`participacion` tinyint NOT NULL,
	`observacion_texto` varchar(500),
	`fecha` varchar(10) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `observaciones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sync_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tipo` varchar(50) NOT NULL,
	`status` varchar(20) NOT NULL,
	`mensaje` varchar(500) NOT NULL,
	`payload_json` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sync_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `observaciones` ADD CONSTRAINT `observaciones_docente_id_docentes_id_fk` FOREIGN KEY (`docente_id`) REFERENCES `docentes`(`id`) ON DELETE no action ON UPDATE no action;
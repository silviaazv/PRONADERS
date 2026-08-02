-- ============================================================
-- pronaders-sqlite.sql
-- Estructura y datos de la base de datos de PRONADERS (SQLite).
--
-- NO se edita a mano. Se genera con:  npm run exportar-bd
-- Para armar la base desde acá:       npm run crear-bd
-- ============================================================

PRAGMA foreign_keys = OFF;
BEGIN TRANSACTION;

-- ── tbl_archivos ──────────────────────────────────
DROP TABLE IF EXISTS tbl_archivos;
CREATE TABLE tbl_archivos (
    id_archivo          INTEGER NOT NULL,
    id_usuario          INTEGER NOT NULL,
    id_proyecto         INTEGER,
    id_solicitud        INTEGER,
    id_reporte          INTEGER,
    nombre_archivo      TEXT    NOT NULL,
    ruta_archivo        TEXT,
    descripcion_archivo TEXT,
    tamano_bytes        INTEGER,
    CONSTRAINT tbl_evidencias_pk PRIMARY KEY ( id_archivo ),
    CONSTRAINT tbl_archivos_tbl_usrs_fk FOREIGN KEY ( id_usuario )
        REFERENCES tbl_usuarios ( id_usuario ),
    CONSTRAINT tbl_archivos_tbl_prys_fk FOREIGN KEY ( id_proyecto )
        REFERENCES tbl_proyectos ( id_proyecto ),
    CONSTRAINT tbl_archivos_tbl_sols_fk FOREIGN KEY ( id_solicitud )
        REFERENCES tbl_solicitudes ( id_solicitud ),
    CONSTRAINT tbl_archivos_tbl_reps_fk FOREIGN KEY ( id_reporte )
        REFERENCES tbl_reportes ( id_reporte ),
    CONSTRAINT chk_archivos_tamano CHECK ( tamano_bytes > 0 ),
    CONSTRAINT chk_archivos_origen
        CHECK ( (
            CASE WHEN id_reporte   IS NOT NULL THEN 1 ELSE 0 END +
            CASE WHEN id_solicitud IS NOT NULL THEN 1 ELSE 0 END +
            CASE WHEN id_proyecto  IS NOT NULL THEN 1 ELSE 0 END
        ) <= 1 ),
    -- Original: REGEXP_LIKE(nombre_archivo, '\.(pdf|doc|docx|...)$', 'i')
    -- Reescrito con LIKE, comparando en minúsculas para simular 'i' (case-insensitive)
    CONSTRAINT chk_archivos_extension
        CHECK ( LOWER(nombre_archivo) LIKE '%.pdf'  OR LOWER(nombre_archivo) LIKE '%.doc'
             OR LOWER(nombre_archivo) LIKE '%.docx' OR LOWER(nombre_archivo) LIKE '%.xls'
             OR LOWER(nombre_archivo) LIKE '%.xlsx' OR LOWER(nombre_archivo) LIKE '%.ppt'
             OR LOWER(nombre_archivo) LIKE '%.pptx' OR LOWER(nombre_archivo) LIKE '%.jpg'
             OR LOWER(nombre_archivo) LIKE '%.jpeg' OR LOWER(nombre_archivo) LIKE '%.png'
             OR LOWER(nombre_archivo) LIKE '%.gif'  OR LOWER(nombre_archivo) LIKE '%.bmp'
             OR LOWER(nombre_archivo) LIKE '%.txt'  OR LOWER(nombre_archivo) LIKE '%.csv'
             OR LOWER(nombre_archivo) LIKE '%.zip'  OR LOWER(nombre_archivo) LIKE '%.rar'
             OR LOWER(nombre_archivo) LIKE '%.7z' )
);

-- ── tbl_bitacora ──────────────────────────────────
DROP TABLE IF EXISTS tbl_bitacora;
CREATE TABLE tbl_bitacora (
    id_registro      INTEGER NOT NULL,
    id_usuario       INTEGER NOT NULL,
    tipo_accion      TEXT    NOT NULL,
    tipo_objeto      TEXT,
    id_objeto        INTEGER,
    fecha_accion     TEXT    NOT NULL,
    campo_modificado TEXT,
    valor_antiguo    TEXT,
    valor_nuevo      TEXT,
    CONSTRAINT tbl_bitacora_pk PRIMARY KEY ( id_registro ),
    CONSTRAINT tbl_bitacora_tbl_usuarios_fk FOREIGN KEY ( id_usuario )
        REFERENCES tbl_usuarios ( id_usuario ),
    -- Corregido: se eliminó la coma sobrante después de 'RECHAZO' que
    -- causaba un error de sintaxis en el archivo original.
    CONSTRAINT chk_bitacora_tipo_accion
        CHECK ( ( tipo_accion IN ( 'INSERT', 'UPDATE', 'DELETE', 'REVISION',
                                    'EMISION', 'APROBACION', 'RECHAZO' )
                  AND tipo_objeto IS NOT NULL AND id_objeto IS NOT NULL )
                OR ( tipo_accion IN ( 'LOGIN', 'LOGOUT' )
                     AND tipo_objeto IS NULL AND id_objeto IS NULL ) ),
    CONSTRAINT chk_bitacora_tipo_objeto
        CHECK ( tipo_objeto IS NULL
                OR tipo_objeto IN ( 'USUARIO', 'PROYECTO', 'SOLICITUD', 'REPORTE', 'ARCHIVO' ) ),
    CONSTRAINT chk_bitacora_sesion
        CHECK ( NOT ( tipo_objeto = 'SESION' AND id_objeto IS NOT NULL ) )
);

INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (1, 1, 'LOGIN', NULL, NULL, '2026-07-28T01:30:13.890Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (2, 1, 'LOGIN', NULL, NULL, '2026-07-28T01:35:42.278Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (3, 1, 'LOGIN', NULL, NULL, '2026-07-28T01:49:48.310Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (4, 1, 'LOGIN', NULL, NULL, '2026-07-28T02:02:10.785Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (5, 1, 'LOGIN', NULL, NULL, '2026-07-28T02:04:24.285Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (6, 1, 'LOGIN', NULL, NULL, '2026-07-28T02:17:32.763Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (7, 1, 'LOGIN', NULL, NULL, '2026-07-28T02:29:02.929Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (8, 2, 'LOGIN', NULL, NULL, '2026-07-28T02:30:21.489Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (9, 1, 'LOGIN', NULL, NULL, '2026-07-28T03:17:45.524Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (10, 2, 'LOGIN', NULL, NULL, '2026-07-28T03:21:16.991Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (11, 1, 'LOGIN', NULL, NULL, '2026-07-28T03:22:32.715Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (12, 1, 'LOGIN', NULL, NULL, '2026-07-28T03:23:27.611Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (13, 1, 'LOGIN', NULL, NULL, '2026-07-28T03:32:44.326Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (14, 1, 'LOGIN', NULL, NULL, '2026-07-28T03:34:42.415Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (15, 1, 'LOGIN', NULL, NULL, '2026-07-28T03:37:43.135Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (16, 1, 'LOGIN', NULL, NULL, '2026-07-28T03:39:32.628Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (17, 1, 'LOGIN', NULL, NULL, '2026-07-28T03:55:55.869Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (18, 2, 'LOGIN', NULL, NULL, '2026-07-28T04:05:49.887Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (19, 4, 'LOGIN', NULL, NULL, '2026-07-28T04:07:52.752Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (20, 1, 'LOGIN', NULL, NULL, '2026-07-28T12:54:03.018Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (21, 1, 'LOGIN', NULL, NULL, '2026-07-28T14:34:00.673Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (22, 2, 'LOGIN', NULL, NULL, '2026-07-28T14:38:51.353Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (23, 4, 'LOGIN', NULL, NULL, '2026-07-28T14:39:30.466Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (24, 2, 'LOGIN', NULL, NULL, '2026-07-28T15:50:23.907Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (25, 1, 'LOGIN', NULL, NULL, '2026-07-28T22:01:46.714Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (26, 2, 'LOGIN', NULL, NULL, '2026-07-28T22:13:44.942Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (27, 2, 'LOGIN', NULL, NULL, '2026-07-28T22:30:39.795Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (28, 1, 'LOGIN', NULL, NULL, '2026-07-28T22:30:57.787Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (29, 2, 'LOGIN', NULL, NULL, '2026-07-28T22:49:46.845Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (30, 4, 'LOGIN', NULL, NULL, '2026-07-28T23:00:11.653Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (31, 2, 'LOGIN', NULL, NULL, '2026-07-28T23:54:17.976Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (32, 1, 'LOGIN', NULL, NULL, '2026-07-28T23:54:30.510Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (33, 1, 'LOGIN', NULL, NULL, '2026-07-28T23:57:19.855Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (34, 1, 'LOGIN', NULL, NULL, '2026-07-29T00:07:09.803Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (35, 3, 'LOGIN', NULL, NULL, '2026-07-29T01:19:10.861Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (36, 1, 'LOGIN', NULL, NULL, '2026-07-29T01:22:26.298Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (37, 3, 'LOGIN', NULL, NULL, '2026-07-29T02:56:25.654Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (38, 1, 'LOGIN', NULL, NULL, '2026-07-29T03:09:55.554Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (39, 1, 'INSERT', 'USUARIO', 5, '2026-07-29T03:10:36.406Z', NULL, NULL, 'Usuario "Isaac Carranza" creado con rol 1');
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (40, 1, 'UPDATE', 'USUARIO', 5, '2026-07-29T03:10:53.178Z', 'estado_usuario', '1', '0');
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (41, 4, 'LOGIN', NULL, NULL, '2026-07-29T03:36:27.036Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (42, 1, 'LOGIN', NULL, NULL, '2026-07-29T03:40:50.187Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (43, 3, 'LOGIN', NULL, NULL, '2026-07-29T03:42:20.872Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (44, 1, 'LOGIN', NULL, NULL, '2026-07-29T03:44:00.685Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (45, 3, 'LOGIN', NULL, NULL, '2026-07-29T04:00:56.004Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (46, 1, 'LOGIN', NULL, NULL, '2026-07-29T14:23:29.114Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (47, 3, 'LOGIN', NULL, NULL, '2026-07-29T14:24:30.595Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (48, 1, 'LOGIN', NULL, NULL, '2026-07-30T12:27:50.283Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (49, 1, 'REVISION', 'REPORTE', 3, '2026-07-30 12:28:09', 'estado_reporte', '0', '1 (Aprobado)');
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (50, 1, 'APROBACION', 'SOLICITUD', 1, '2026-07-30 13:05:27', 'estado_solicitud', 'PENDIENTE', 'APROBADA - Comentario: Materiales disponibles');
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (51, 4, 'LOGIN', NULL, NULL, '2026-07-30T13:05:54.515Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (52, 3, 'LOGIN', NULL, NULL, '2026-07-30T13:06:21.086Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (53, 4, 'LOGIN', NULL, NULL, '2026-07-30T13:10:35.270Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (54, 3, 'LOGIN', NULL, NULL, '2026-07-30T13:13:58.553Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (55, 4, 'LOGIN', NULL, NULL, '2026-07-30T13:18:40.560Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (56, 1, 'LOGIN', NULL, NULL, '2026-07-30T13:29:09.707Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (57, 1, 'LOGIN', NULL, NULL, '2026-07-30T13:59:29.783Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (58, 1, 'REVISION', 'REPORTE', 1, '2026-07-30 14:01:05', 'estado_reporte', '0', '1 (Aprobado)');
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (59, 3, 'LOGIN', NULL, NULL, '2026-07-30T14:07:24.103Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (60, 1, 'LOGIN', NULL, NULL, '2026-07-30T19:31:14.692Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (61, 3, 'LOGIN', NULL, NULL, '2026-07-30T19:33:34.793Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (62, 4, 'LOGIN', NULL, NULL, '2026-07-30T19:34:23.256Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (63, 3, 'LOGIN', NULL, NULL, '2026-07-30T19:34:59.330Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (64, 3, 'LOGIN', NULL, NULL, '2026-07-30T20:17:48.873Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (65, 3, 'LOGIN', NULL, NULL, '2026-07-30T21:33:56.091Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (66, 1, 'LOGIN', NULL, NULL, '2026-07-30T21:55:00.212Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (67, 3, 'LOGIN', NULL, NULL, '2026-07-31T01:13:30.703Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (68, 2, 'LOGIN', NULL, NULL, '2026-07-31T01:14:35.745Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (69, 1, 'LOGIN', NULL, NULL, '2026-07-31T01:23:55.747Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (70, 3, 'LOGIN', NULL, NULL, '2026-07-31T01:38:57.986Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (71, 1, 'LOGIN', NULL, NULL, '2026-07-31T02:31:27.229Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (72, 1, 'LOGIN', NULL, NULL, '2026-07-31T03:05:07.874Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (73, 3, 'LOGIN', NULL, NULL, '2026-07-31T03:06:21.792Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (74, 1, 'LOGIN', NULL, NULL, '2026-07-31T03:15:35.607Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (75, 1, 'REVISION', 'REPORTE', 7, '2026-07-31 03:32:55', 'estado_reporte', '0', '1 (Aprobado)');
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (76, 1, 'LOGIN', NULL, NULL, '2026-07-31T03:46:51.144Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (77, 3, 'LOGIN', NULL, NULL, '2026-07-31T03:58:02.633Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (78, 1, 'LOGIN', NULL, NULL, '2026-07-31T04:00:21.091Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (79, 1, 'REVISION', 'REPORTE', 4, '2026-07-31 04:00:36', 'estado_reporte', '0', '1 (Aprobado)');
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (80, 2, 'LOGIN', NULL, NULL, '2026-07-31T04:02:45.387Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (81, 4, 'LOGIN', NULL, NULL, '2026-07-31T04:03:41.864Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (82, 4, 'REVISION', 'SOLICITUD', 1, '2026-07-31 04:14:57', 'estado_solicitud', 'APROBADA', 'EN DESPACHO - Responsable: Andrea Amador');
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (83, 3, 'LOGIN', NULL, NULL, '2026-07-31T04:16:40.795Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (84, 4, 'LOGIN', NULL, NULL, '2026-07-31T04:31:21.372Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (85, 1, 'LOGIN', NULL, NULL, '2026-07-31T04:33:34.119Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (86, 3, 'LOGIN', NULL, NULL, '2026-07-31T04:42:15.377Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (87, 2, 'LOGIN', NULL, NULL, '2026-07-31T05:25:34.850Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (88, 1, 'EMISION', 'SOLICITUD', 13, '2026-07-31 05:26:34', NULL, NULL, 'Solicitud creada para proyecto Construcción de Sistema de Riego');
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (89, 1, 'LOGIN', NULL, NULL, '2026-07-31T05:26:58.856Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (90, 1, 'APROBACION', 'SOLICITUD', 13, '2026-07-31 05:27:37', 'estado_solicitud', 'PENDIENTE', 'APROBADA - Comentario: Materiales disponibles');
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (91, 1, 'RECHAZO', 'SOLICITUD', 12, '2026-07-31 05:27:46', 'estado_solicitud', 'PENDIENTE', 'RECHAZADA - Motivo: No se');
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (92, 1, 'RECHAZO', 'SOLICITUD', 5, '2026-07-31 05:28:10', 'estado_solicitud', 'PENDIENTE', 'RECHAZADA - Motivo: Probando rechazos');
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (93, 1, 'APROBACION', 'SOLICITUD', 4, '2026-07-31 05:28:26', 'estado_solicitud', 'PENDIENTE', 'APROBADA - Comentario: Aprobado');
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (94, 1, 'INSERT', 'PROYECTO', 6, '2026-07-31T05:30:08.656Z', NULL, NULL, 'Proyecto "Proyecto Prueba" creado con supervisor 2');
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (95, 3, 'LOGIN', NULL, NULL, '2026-07-31T05:41:15.349Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (96, 4, 'LOGIN', NULL, NULL, '2026-07-31T05:48:38.116Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (97, 3, 'LOGIN', NULL, NULL, '2026-07-31T05:55:15.102Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (98, 3, 'REVISION', 'SOLICITUD', 4, '2026-07-31 05:56:25', 'estado_solicitud', 'ENTREGADA', 'CONFIRMADA - Recepción confirmada. ');
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (99, 4, 'LOGIN', NULL, NULL, '2026-07-31T05:56:34.869Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (100, 3, 'LOGIN', NULL, NULL, '2026-07-31T05:56:49.691Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (101, 3, 'LOGIN', NULL, NULL, '2026-07-31T06:05:25.782Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (102, 3, 'INSERT', 'REPORTE', 9, '2026-07-31 06:08:33', NULL, NULL, 'Reporte creado para proyecto 3');
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (103, 1, 'LOGIN', NULL, NULL, '2026-07-31T06:09:13.686Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (104, 2, 'LOGIN', NULL, NULL, '2026-07-31T06:11:04.959Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (105, 2, 'REVISION', 'SOLICITUD', 13, '2026-07-31 06:11:42', 'estado_solicitud', 'ENTREGADA', 'CONFIRMADA - Recepción confirmada. ');
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (106, 2, 'REVISION', 'SOLICITUD', 1, '2026-07-31 06:11:52', 'estado_solicitud', 'ENTREGADA', 'CONFIRMADA - Recepción confirmada. ');
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (107, 1, 'LOGIN', NULL, NULL, '2026-08-02T03:38:07.956Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (108, 1, 'UPDATE', 'USUARIO', 5, '2026-08-02T03:38:39.732Z', 'estado_usuario', '0', '1');
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (109, 1, 'UPDATE', 'USUARIO', 5, '2026-08-02T03:38:44.099Z', 'estado_usuario', '1', '0');
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (110, 1, 'INSERT', 'USUARIO', 6, '2026-08-02T03:43:59.126Z', NULL, NULL, 'Usuario "Prueba" creado con rol 1');
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (111, 1, 'UPDATE', 'USUARIO', 6, '2026-08-02T03:44:43.228Z', 'estado_usuario', '1', '0');
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (112, 1, 'LOGIN', NULL, NULL, '2026-08-02T03:45:11.495Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (113, 3, 'LOGIN', NULL, NULL, '2026-08-02T03:46:15.026Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (114, 4, 'LOGIN', NULL, NULL, '2026-08-02T03:48:05.200Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (115, 2, 'LOGIN', NULL, NULL, '2026-08-02T03:51:11.863Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (116, 2, 'LOGIN', NULL, NULL, '2026-08-02T03:51:50.891Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (117, 2, 'EMISION', 'SOLICITUD', 14, '2026-08-02 03:52:29', NULL, NULL, 'Solicitud creada para proyecto Prueba 2');
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (118, 2, 'INSERT', 'REPORTE', 10, '2026-08-02 03:53:22', NULL, NULL, 'Reporte creado para proyecto 4');
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (119, 1, 'LOGIN', NULL, NULL, '2026-08-02T03:53:56.039Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (120, 1, 'RECHAZO', 'SOLICITUD', 11, '2026-08-02 03:54:25', 'estado_solicitud', 'PENDIENTE', 'RECHAZADA - Motivo: probando rechazo');
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (121, 1, 'APROBACION', 'SOLICITUD', 14, '2026-08-02 03:54:57', 'estado_solicitud', 'PENDIENTE', 'APROBADA - Comentario: Probando aprobacion de solicitud');
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (122, 1, 'REVISION', 'REPORTE', 10, '2026-08-02 03:55:27', 'estado_reporte', '0', '1 (Aprobado)');
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (123, 2, 'LOGIN', NULL, NULL, '2026-08-02T03:57:15.676Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (124, 1, 'LOGIN', NULL, NULL, '2026-08-02T03:58:08.541Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (125, 1, 'LOGIN', NULL, NULL, '2026-08-02T18:06:46.814Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (126, 1, 'UPDATE', 'PROYECTO', 6, '2026-08-02T18:21:36.553Z', 'estado_proyecto', 'ACTIVO', 'FINALIZADO - Monto ejecutado: L 2500000.00');
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (127, 1, 'UPDATE', 'PROYECTO', 5, '2026-08-02T18:22:12.572Z', 'estado_proyecto', 'ACTIVO', 'CANCELADO');
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (128, 1, 'LOGIN', NULL, NULL, '2026-08-02T19:09:41.099Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (129, 3, 'LOGIN', NULL, NULL, '2026-08-02T19:27:56.158Z', NULL, NULL, NULL);
INSERT INTO tbl_bitacora (id_registro, id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo) VALUES (130, 3, 'INSERT', 'REPORTE', 11, '2026-08-02 19:28:25', NULL, NULL, 'Reporte creado para proyecto 3');

-- ── tbl_departamentos ──────────────────────────────────
DROP TABLE IF EXISTS tbl_departamentos;
CREATE TABLE tbl_departamentos (
    id_departamento     INTEGER NOT NULL,
    nombre_departamento TEXT    NOT NULL,
    CONSTRAINT tbl_departamentos_pk PRIMARY KEY ( id_departamento )
);

INSERT INTO tbl_departamentos (id_departamento, nombre_departamento) VALUES (1, 'Atlantida');
INSERT INTO tbl_departamentos (id_departamento, nombre_departamento) VALUES (2, 'Choluteca');
INSERT INTO tbl_departamentos (id_departamento, nombre_departamento) VALUES (3, 'Colon');
INSERT INTO tbl_departamentos (id_departamento, nombre_departamento) VALUES (4, 'Comayagua');
INSERT INTO tbl_departamentos (id_departamento, nombre_departamento) VALUES (5, 'Copan');
INSERT INTO tbl_departamentos (id_departamento, nombre_departamento) VALUES (6, 'Cortes');
INSERT INTO tbl_departamentos (id_departamento, nombre_departamento) VALUES (7, 'El Paraiso');
INSERT INTO tbl_departamentos (id_departamento, nombre_departamento) VALUES (8, 'Francisco Morazan');
INSERT INTO tbl_departamentos (id_departamento, nombre_departamento) VALUES (9, 'Gracias a Dios');
INSERT INTO tbl_departamentos (id_departamento, nombre_departamento) VALUES (10, 'Intibuca');
INSERT INTO tbl_departamentos (id_departamento, nombre_departamento) VALUES (11, 'Islas de la Bahia');
INSERT INTO tbl_departamentos (id_departamento, nombre_departamento) VALUES (12, 'La Paz');
INSERT INTO tbl_departamentos (id_departamento, nombre_departamento) VALUES (13, 'Lempira');
INSERT INTO tbl_departamentos (id_departamento, nombre_departamento) VALUES (14, 'Ocotepeque');
INSERT INTO tbl_departamentos (id_departamento, nombre_departamento) VALUES (15, 'Olancho');
INSERT INTO tbl_departamentos (id_departamento, nombre_departamento) VALUES (16, 'Santa Barbara');
INSERT INTO tbl_departamentos (id_departamento, nombre_departamento) VALUES (17, 'Valle');
INSERT INTO tbl_departamentos (id_departamento, nombre_departamento) VALUES (18, 'Yoro');

-- ── tbl_equipos ──────────────────────────────────
DROP TABLE IF EXISTS tbl_equipos;
CREATE TABLE tbl_equipos (
    id_equipo_log     INTEGER NOT NULL,
    nombre_equipo_log TEXT    NOT NULL,
    CONSTRAINT tbl_equipos_pk PRIMARY KEY ( id_equipo_log )
);

INSERT INTO tbl_equipos (id_equipo_log, nombre_equipo_log) VALUES (1, 'Camión HN-001');
INSERT INTO tbl_equipos (id_equipo_log, nombre_equipo_log) VALUES (2, 'Camión HN-002');
INSERT INTO tbl_equipos (id_equipo_log, nombre_equipo_log) VALUES (3, 'Pickup Toyota');
INSERT INTO tbl_equipos (id_equipo_log, nombre_equipo_log) VALUES (4, 'Bodega Central');
INSERT INTO tbl_equipos (id_equipo_log, nombre_equipo_log) VALUES (5, 'Unidad Móvil 05');

-- ── tbl_fila_solicitud ──────────────────────────────────
DROP TABLE IF EXISTS tbl_fila_solicitud;
CREATE TABLE tbl_fila_solicitud (
    id_fila             INTEGER NOT NULL,
    id_solicitud        INTEGER NOT NULL,
    tipo_recurso        TEXT    NOT NULL,
    descripcion_recurso TEXT    NOT NULL,
    cantidad_recurso    INTEGER NOT NULL,
    CONSTRAINT tbl_fila_solicitud_pk PRIMARY KEY ( id_fila ),
    CONSTRAINT tbl_fila_sol_tbl_sol_fk FOREIGN KEY ( id_solicitud )
        REFERENCES tbl_solicitudes ( id_solicitud ),
    CONSTRAINT chk_fila_cantidad CHECK ( cantidad_recurso > 0 ),
    CONSTRAINT chk_fila_tipo CHECK ( tipo_recurso IN ( 'MATERIAL', 'EQUIPO', 'FINANCIERO' ) )
);

INSERT INTO tbl_fila_solicitud (id_fila, id_solicitud, tipo_recurso, descripcion_recurso, cantidad_recurso) VALUES (1, 1, 'MATERIAL', 'Tubería PVC 4"', 150);
INSERT INTO tbl_fila_solicitud (id_fila, id_solicitud, tipo_recurso, descripcion_recurso, cantidad_recurso) VALUES (2, 13, 'MATERIAL', 'Cemento', 10);
INSERT INTO tbl_fila_solicitud (id_fila, id_solicitud, tipo_recurso, descripcion_recurso, cantidad_recurso) VALUES (3, 14, 'EQUIPO', 'Escabadora', 2);

-- ── tbl_municipios ──────────────────────────────────
DROP TABLE IF EXISTS tbl_municipios;
CREATE TABLE tbl_municipios (
    id_municipio     INTEGER NOT NULL,
    id_departamento  INTEGER NOT NULL,
    nombre_municipio TEXT    NOT NULL,
    CONSTRAINT tbl_municipios_pk PRIMARY KEY ( id_municipio ),
    CONSTRAINT tbl_mun_tbl_dpt_fk FOREIGN KEY ( id_departamento )
        REFERENCES tbl_departamentos ( id_departamento )
);

INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (1, 1, 'La Ceiba');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (2, 1, 'El Porvenir');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (3, 1, 'Esparta');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (4, 1, 'Jutiapa');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (5, 1, 'La Masica');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (6, 1, 'San Francisco');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (7, 1, 'Tela');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (8, 1, 'Arizona');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (9, 2, 'Choluteca');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (10, 2, 'Apacilagua');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (11, 2, 'Concepción de Maria');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (12, 2, 'Duyure');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (13, 2, 'El Corpus');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (14, 2, 'El Triunfo');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (15, 2, 'Marcovia');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (16, 2, 'Morolica');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (17, 2, 'Namasigue');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (18, 2, 'Orocuina');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (19, 2, 'Pespire');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (20, 2, 'San Antonio de Flores');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (21, 2, 'San Isidro');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (22, 2, 'San José');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (23, 2, 'San Marcos de Colon');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (24, 2, 'Santa Ana de Yusguare');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (25, 3, 'Trujillo');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (26, 3, 'Balfate');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (27, 3, 'Iriona');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (28, 3, 'Limon');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (29, 3, 'Saba');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (30, 3, 'Santa Fe');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (31, 3, 'Santa Rosa de Aguan');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (32, 3, 'Sonaguera');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (33, 3, 'Tocoa');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (34, 3, 'Bonito Oriental');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (35, 4, 'Comayagua');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (36, 4, 'Ajuterique');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (37, 4, 'El Rosario');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (38, 4, 'Esquias');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (39, 4, 'Humuya');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (40, 4, 'La Libertad');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (41, 4, 'Lamani');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (42, 4, 'La Trinidad');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (43, 4, 'Lejamani');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (44, 4, 'Meambar');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (45, 4, 'Minas de Oro');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (46, 4, 'Ojos de Agua');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (47, 4, 'San Jeronimo');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (48, 4, 'San José de Comayagua');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (49, 4, 'San José del Potrero');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (50, 4, 'San Luis');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (51, 4, 'San Sebastián');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (52, 4, 'Siguatepeque');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (53, 4, 'Villa de San Antonio');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (54, 4, 'Las Lajas');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (55, 4, 'Taulabe');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (56, 5, 'Santa Rosa de Copan');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (57, 5, 'Cabañas');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (58, 5, 'Concepción');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (59, 5, 'Copan Ruinas');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (60, 5, 'Corquín');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (61, 5, 'Cucuyagua');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (62, 5, 'Dolores');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (63, 5, 'Dulce Nombre');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (64, 5, 'El Paraiso');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (65, 5, 'Florida');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (66, 5, 'La Jigua');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (67, 5, 'La Union');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (68, 5, 'Nueva Arcadia');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (69, 5, 'San Agustin');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (70, 5, 'San Antonio');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (71, 5, 'San Jeronimo');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (72, 5, 'San Jose');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (73, 5, 'San Juan de Opoa');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (74, 5, 'San Nicolas');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (75, 5, 'San Pedro');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (76, 5, 'Santa Rita');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (77, 5, 'Trinidad de Copan');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (78, 5, 'Veracruz');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (79, 6, 'San Pedro Sula');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (80, 6, 'Choloma');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (81, 6, 'Omoa');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (82, 6, 'Pimienta');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (83, 6, 'Potrerillos');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (84, 6, 'Puerto Cortés');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (85, 6, 'San Antonio de Cortes');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (86, 6, 'San Francisco de Yojoa');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (87, 6, 'San Manuel');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (88, 6, 'Santa Cruz de Yojoa');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (89, 6, 'Villanueva');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (90, 6, 'La Lima');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (91, 7, 'Yuscaran');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (92, 7, 'Alauca');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (93, 7, 'Danli');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (94, 7, 'El Paraiso');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (95, 7, 'Guinope');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (96, 7, 'Jacaleapa');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (97, 7, 'Liure');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (98, 7, 'Moroceli');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (99, 7, 'Oropoli');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (100, 7, 'Potrerillos');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (101, 7, 'San Antonio de Flores');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (102, 7, 'San Lucas');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (103, 7, 'San Matias');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (104, 7, 'Soledad');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (105, 7, 'Teupasenti');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (106, 7, 'Texiguat');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (107, 7, 'Vado Ancho');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (108, 7, 'Yauyupe');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (109, 7, 'Trojes');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (110, 8, 'Distrito Central');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (111, 8, 'Alubaren');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (112, 8, 'Cedros');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (113, 8, 'Curaren');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (114, 8, 'El Porvenir');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (115, 8, 'Guaimaca');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (116, 8, 'La Libertad');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (117, 8, 'La Venta');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (118, 8, 'Lepaterique');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (119, 8, 'Maraita');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (120, 8, 'Marale');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (121, 8, 'Nueva Armenia');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (122, 8, 'Ojojona');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (123, 8, 'Orica');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (124, 8, 'Reitoca');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (125, 8, 'Sabanagrande');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (126, 8, 'San Antonio de Oriente');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (127, 8, 'San Buenaventura');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (128, 8, 'San Ignacio');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (129, 8, 'San Juan de Flores');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (130, 8, 'San Miguelito');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (131, 8, 'Santa Ana');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (132, 8, 'Santa Lucia');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (133, 8, 'Talanga');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (134, 8, 'Tatumbla');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (135, 8, 'Valle de Ángeles');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (136, 8, 'Villa de San Francisco');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (137, 8, 'Vallecillo');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (138, 9, 'Puerto Lempira');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (139, 9, 'Brus Laguna');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (140, 9, 'Ahuas');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (141, 9, 'Juan Francisco Bulnes');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (142, 9, 'Ramon Villeda Morales');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (143, 9, 'Wampusirpi');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (144, 10, 'La Esperanza');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (145, 10, 'Camasca');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (146, 10, 'Colomoncagua');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (147, 10, 'Concepción');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (148, 10, 'Dolores');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (149, 10, 'Intibuca');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (150, 10, 'Jesus de Otoro');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (151, 10, 'Magdalena');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (152, 10, 'Masaguara');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (153, 10, 'San Antonio');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (154, 10, 'San Isidro');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (155, 10, 'San Juan');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (156, 10, 'San Marcos de la Sierra');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (157, 10, 'San Miguelito');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (158, 10, 'Santa Lucia');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (159, 10, 'Yamaranguila');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (160, 10, 'San Francisco de Opalaca');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (161, 11, 'Roatan');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (162, 11, 'Guanaja');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (163, 11, 'Jose Santos Guardiola');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (164, 11, 'Utila');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (165, 12, 'La Paz');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (166, 12, 'Aguanqueterique');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (167, 12, 'Cabañas');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (168, 12, 'Cane');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (169, 12, 'Chinacla');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (170, 12, 'Guajiquiro');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (171, 12, 'Lauterique');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (172, 12, 'Marcala');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (173, 12, 'Mercedes de Oriente');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (174, 12, 'Opatoro');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (175, 12, 'San Antonio del Norte');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (176, 12, 'San Jose');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (177, 12, 'San Juan');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (178, 12, 'San Pedro de Tutule');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (179, 12, 'Santa Ana');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (180, 12, 'Santa Elena');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (181, 12, 'Santa Maria');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (182, 12, 'Santiago de Puringla');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (183, 12, 'Yarula');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (184, 13, 'Gracias');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (185, 13, 'Belen');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (186, 13, 'Candelaria');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (187, 13, 'Cololaca');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (188, 13, 'Erandique');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (189, 13, 'Gualcince');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (190, 13, 'Guarita');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (191, 13, 'La Campa');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (192, 13, 'La Iguala');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (193, 13, 'Las Flores');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (194, 13, 'La Union');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (195, 13, 'La Virtud');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (196, 13, 'Lepaera');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (197, 13, 'Mapulaca');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (198, 13, 'Piraera');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (199, 13, 'San Andres');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (200, 13, 'San Francisco');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (201, 13, 'San Juan Guarita');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (202, 13, 'San Manuel Colohete');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (203, 13, 'San Rafael');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (204, 13, 'San Sebastian');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (205, 13, 'Santa Cruz');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (206, 13, 'Talgua');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (207, 13, 'Tambla');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (208, 13, 'Tomala');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (209, 13, 'Valladolid');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (210, 13, 'Virginia');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (211, 13, 'San Marcos de Caiquin');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (212, 14, 'Nueva Ocotepeque');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (213, 14, 'Belen Gualcho');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (214, 14, 'Concepcion');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (215, 14, 'Dolores Merendon');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (216, 14, 'Fraternidad');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (217, 14, 'La Encarnacion');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (218, 14, 'La Labor');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (219, 14, 'Lucerna');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (220, 14, 'Mercedes');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (221, 14, 'San Fernando');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (222, 14, 'San Francisco del Valle');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (223, 14, 'San Jorge');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (224, 14, 'San Marcos');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (225, 14, 'Santa Fe');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (226, 14, 'Sensenti');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (227, 14, 'Sinuapa');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (228, 15, 'Juticalpa');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (229, 15, 'Campamento');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (230, 15, 'Catacamas');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (231, 15, 'Concordia');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (232, 15, 'Dulce Nombre de Culmi');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (233, 15, 'El Rosario');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (234, 15, 'Esquipulas del Norte');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (235, 15, 'Gualaco');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (236, 15, 'Guarizama');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (237, 15, 'Guata');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (238, 15, 'Guayape');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (239, 15, 'Jano');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (240, 15, 'La Union');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (241, 15, 'Mangulile');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (242, 15, 'Manto');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (243, 15, 'Salamá');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (244, 15, 'San Esteban');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (245, 15, 'San Francisco de Becerra');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (246, 15, 'San Francisco de la Paz');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (247, 15, 'Santa María del Real');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (248, 15, 'Silca');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (249, 15, 'Yocon');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (250, 15, 'Patuca');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (251, 16, 'Santa Barbara');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (252, 16, 'Arada');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (253, 16, 'Atima');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (254, 16, 'Azacualpa');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (255, 16, 'Ceguaca');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (256, 16, 'Concepcion del Norte');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (257, 16, 'Concepcion del Sur');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (258, 16, 'Chinda');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (259, 16, 'El Nispero');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (260, 16, 'Gualala');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (261, 16, 'Ilama');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (262, 16, 'Las Vegas');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (263, 16, 'Macuelizo');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (264, 16, 'Naranjito');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (265, 16, 'Nueva Celilac');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (266, 16, 'Petoa');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (267, 16, 'Proteccion');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (268, 16, 'Quimistan');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (269, 16, 'San Francisco de Ojuera');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (270, 16, 'San Luis');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (271, 16, 'San Marcos');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (272, 16, 'San Nicolas');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (273, 16, 'San Pedro Zacapa');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (274, 16, 'San Vicente Centenario');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (275, 16, 'Santa Rita');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (276, 16, 'Trinidad');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (277, 16, 'Las Vegas del Norte');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (278, 16, 'Nueva Frontera');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (279, 17, 'Nacaome');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (280, 17, 'Alianza');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (281, 17, 'Amapala');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (282, 17, 'Aramecina');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (283, 17, 'Caridad');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (284, 17, 'Goascoran');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (285, 17, 'Langue');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (286, 17, 'San Francisco de Coray');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (287, 17, 'San Lorenzo');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (288, 18, 'Yoro');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (289, 18, 'Arenal');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (290, 18, 'El Negrito');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (291, 18, 'El Progreso');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (292, 18, 'Jocon');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (293, 18, 'Morazán');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (294, 18, 'Olanchito');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (295, 18, 'Santa Rita');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (296, 18, 'Sulaco');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (297, 18, 'Victoria');
INSERT INTO tbl_municipios (id_municipio, id_departamento, nombre_municipio) VALUES (298, 18, 'Yorito');

-- ── tbl_proyectos ──────────────────────────────────
DROP TABLE IF EXISTS tbl_proyectos;
CREATE TABLE tbl_proyectos (
    id_proyecto           INTEGER NOT NULL,
    tipo_proyecto         TEXT    NOT NULL,
    estado_proyecto       TEXT    NOT NULL,
    id_ubicacion          INTEGER NOT NULL,
    nombre_proyecto       TEXT    NOT NULL,
    descripcion_proyecto  TEXT,
    fecha_inicio          TEXT    NOT NULL,
    fecha_fin             TEXT,
    presupuesto_inicial   NUMERIC NOT NULL,
    presupuesto_ejecutado NUMERIC, id_supervisor INTEGER REFERENCES tbl_usuarios(id_usuario),
    CONSTRAINT tbl_proyectos_pk PRIMARY KEY ( id_proyecto ),
    CONSTRAINT tbl_proyectos_tbl_mun_fk FOREIGN KEY ( id_ubicacion )
        REFERENCES tbl_municipios ( id_municipio ),
    CONSTRAINT chk_proyectos_tipo
        CHECK ( tipo_proyecto IN ( 'AGRICOLA', 'INFRAESTRUCTURA', 'SOCIAL' ) ),
    CONSTRAINT chk_proyectos_estado
        CHECK ( estado_proyecto IN ( 'ACTIVO', 'RETRASADO', 'FINALIZADO', 'CANCELADO' ) ),
    CONSTRAINT chk_proyectos_presup CHECK ( presupuesto_ejecutado >= 0 ),
    CONSTRAINT chk_proyectos_fechas CHECK ( fecha_fin >= fecha_inicio OR fecha_fin IS NULL )
);

INSERT INTO tbl_proyectos (id_proyecto, tipo_proyecto, estado_proyecto, id_ubicacion, nombre_proyecto, descripcion_proyecto, fecha_inicio, fecha_fin, presupuesto_inicial, presupuesto_ejecutado, id_supervisor) VALUES (1, 'INFRAESTRUCTURA', 'ACTIVO', 165, 'Construcción de Sistema de Riego', 'Proyecto de Infraestructura', '2026-01-10', '2026-10-30', 2500000, 1350000, 2);
INSERT INTO tbl_proyectos (id_proyecto, tipo_proyecto, estado_proyecto, id_ubicacion, nombre_proyecto, descripcion_proyecto, fecha_inicio, fecha_fin, presupuesto_inicial, presupuesto_ejecutado, id_supervisor) VALUES (2, 'SOCIAL', 'CANCELADO', 32, 'Abastecimiento Rural', 'Sistema de agua', '2026-02-01', '2026-12-15', 1800000, 250000, 3);
INSERT INTO tbl_proyectos (id_proyecto, tipo_proyecto, estado_proyecto, id_ubicacion, nombre_proyecto, descripcion_proyecto, fecha_inicio, fecha_fin, presupuesto_inicial, presupuesto_ejecutado, id_supervisor) VALUES (3, 'AGRICOLA', 'ACTIVO', 8, 'Bosques Verdes', 'Reforestación comunitaria', '2026-03-01', '2026-11-30', 980000, 420000, 3);
INSERT INTO tbl_proyectos (id_proyecto, tipo_proyecto, estado_proyecto, id_ubicacion, nombre_proyecto, descripcion_proyecto, fecha_inicio, fecha_fin, presupuesto_inicial, presupuesto_ejecutado, id_supervisor) VALUES (4, 'INFRAESTRUCTURA', 'ACTIVO', 110, 'Puente Blvd Fuerzas Armadas', 'Puente en el Blvd Fuerzas Armadas, a la altura del BCH', '2026-08-20', '2026-12-10', 10000000, NULL, 2);
INSERT INTO tbl_proyectos (id_proyecto, tipo_proyecto, estado_proyecto, id_ubicacion, nombre_proyecto, descripcion_proyecto, fecha_inicio, fecha_fin, presupuesto_inicial, presupuesto_ejecutado, id_supervisor) VALUES (5, 'INFRAESTRUCTURA', 'CANCELADO', 34, 'Prueba 2', 'Probando el INSERT en la tabla tbl_proyectos_usuarios', '2026-07-31', '2026-10-20', 600000, NULL, 2);
INSERT INTO tbl_proyectos (id_proyecto, tipo_proyecto, estado_proyecto, id_ubicacion, nombre_proyecto, descripcion_proyecto, fecha_inicio, fecha_fin, presupuesto_inicial, presupuesto_ejecutado, id_supervisor) VALUES (6, 'INFRAESTRUCTURA', 'FINALIZADO', 161, 'Proyecto Prueba', NULL, '2026-12-26', '2027-06-15', 2000000, 2500000, 2);

-- ── tbl_reportes ──────────────────────────────────
DROP TABLE IF EXISTS tbl_reportes;
CREATE TABLE "tbl_reportes" (
    id_reporte INTEGER NOT NULL,
    id_proyecto INTEGER NOT NULL,
    id_usuario INTEGER NOT NULL,
    descripcion_reporte TEXT,
    fecha_reporte TEXT NOT NULL,
    estado_reporte INTEGER NOT NULL,
    fecha_revision_reporte TEXT, avance_fisico INTEGER DEFAULT 0, avance_financiero INTEGER DEFAULT 0,
    CONSTRAINT tbl_reportes_pk PRIMARY KEY (id_reporte),
    CONSTRAINT tbl_reportes_tbl_proyectos_fk FOREIGN KEY (id_proyecto) REFERENCES tbl_proyectos(id_proyecto),
    CONSTRAINT tbl_reportes_tbl_usuarios_fk FOREIGN KEY (id_usuario) REFERENCES tbl_usuarios(id_usuario),
    CONSTRAINT chk_reportes_estado CHECK (estado_reporte IN (0, 1, 2)),
    CONSTRAINT chk_reportes_fechas CHECK (fecha_revision_reporte >= fecha_reporte OR fecha_revision_reporte IS NULL)
);

INSERT INTO tbl_reportes (id_reporte, id_proyecto, id_usuario, descripcion_reporte, fecha_reporte, estado_reporte, fecha_revision_reporte, avance_fisico, avance_financiero) VALUES (1, 1, 1, 'Se completó el 40% del sistema de riego.', '2026-05-10', 1, '2026-07-30T14:01:05.408Z', 0, 0);
INSERT INTO tbl_reportes (id_reporte, id_proyecto, id_usuario, descripcion_reporte, fecha_reporte, estado_reporte, fecha_revision_reporte, avance_fisico, avance_financiero) VALUES (2, 2, 1, 'Entrega de materiales.', '2026-05-15', 1, NULL, 0, 0);
INSERT INTO tbl_reportes (id_reporte, id_proyecto, id_usuario, descripcion_reporte, fecha_reporte, estado_reporte, fecha_revision_reporte, avance_fisico, avance_financiero) VALUES (3, 3, 3, 'Se completó el 40% del sistema de riego.', '2026-06-10', 1, '2026-07-30T12:28:09.448Z', 0, 0);
INSERT INTO tbl_reportes (id_reporte, id_proyecto, id_usuario, descripcion_reporte, fecha_reporte, estado_reporte, fecha_revision_reporte, avance_fisico, avance_financiero) VALUES (4, 2, 3, 'hola', '2026-07-30T14:16:58.895Z', 1, '2026-07-31T04:00:36.238Z', 0, 0);
INSERT INTO tbl_reportes (id_reporte, id_proyecto, id_usuario, descripcion_reporte, fecha_reporte, estado_reporte, fecha_revision_reporte, avance_fisico, avance_financiero) VALUES (5, 2, 3, 'hola', '2026-07-30T14:17:18.371Z', 2, '2026-07-31T03:57:19.633Z', 0, 0);
INSERT INTO tbl_reportes (id_reporte, id_proyecto, id_usuario, descripcion_reporte, fecha_reporte, estado_reporte, fecha_revision_reporte, avance_fisico, avance_financiero) VALUES (6, 3, 3, 'Hola', '2026-07-30T14:41:17.657Z', 2, '2026-07-31T03:57:11.069Z', 0, 0);
INSERT INTO tbl_reportes (id_reporte, id_proyecto, id_usuario, descripcion_reporte, fecha_reporte, estado_reporte, fecha_revision_reporte, avance_fisico, avance_financiero) VALUES (7, 3, 3, 'Hola', '2026-07-30T14:41:23.626Z', 1, '2026-07-31T03:32:55.462Z', 0, 0);
INSERT INTO tbl_reportes (id_reporte, id_proyecto, id_usuario, descripcion_reporte, fecha_reporte, estado_reporte, fecha_revision_reporte, avance_fisico, avance_financiero) VALUES (8, 2, 3, 'hola', '2026-07-31T03:59:15.525Z', 2, '2026-07-31T05:30:48.338Z', 0, 0);
INSERT INTO tbl_reportes (id_reporte, id_proyecto, id_usuario, descripcion_reporte, fecha_reporte, estado_reporte, fecha_revision_reporte, avance_fisico, avance_financiero) VALUES (9, 3, 3, 'Probando envio de reportes', '2026-07-31T06:08:33.451Z', 2, '2026-07-31T06:09:22.661Z', 0, 0);
INSERT INTO tbl_reportes (id_reporte, id_proyecto, id_usuario, descripcion_reporte, fecha_reporte, estado_reporte, fecha_revision_reporte, avance_fisico, avance_financiero) VALUES (10, 4, 2, 'Probando la creacion de reportes', '2026-08-02T03:53:22.135Z', 1, '2026-08-02T03:55:27.415Z', 0, 0);
INSERT INTO tbl_reportes (id_reporte, id_proyecto, id_usuario, descripcion_reporte, fecha_reporte, estado_reporte, fecha_revision_reporte, avance_fisico, avance_financiero) VALUES (11, 3, 3, 'Probando porcentajes de avances', '2026-08-02T19:28:25.261Z', 0, NULL, 61, 36);

-- ── tbl_roles ──────────────────────────────────
DROP TABLE IF EXISTS tbl_roles;
CREATE TABLE tbl_roles (
    id_rol     INTEGER NOT NULL,
    nombre_rol TEXT    NOT NULL,
    CONSTRAINT tbl_roles_pk PRIMARY KEY ( id_rol )
);

INSERT INTO tbl_roles (id_rol, nombre_rol) VALUES (1, 'Administrador de Oficina');
INSERT INTO tbl_roles (id_rol, nombre_rol) VALUES (2, 'Supervisor de Campo');
INSERT INTO tbl_roles (id_rol, nombre_rol) VALUES (3, 'Equipo de Logistica');

-- ── tbl_solicitudes ──────────────────────────────────
DROP TABLE IF EXISTS tbl_solicitudes;
CREATE TABLE tbl_solicitudes (
    id_solicitud             INTEGER NOT NULL,
    id_proyecto              INTEGER NOT NULL,
    id_usuario                INTEGER NOT NULL,
    estado_solicitud         TEXT    NOT NULL,
    fecha_solicitud          TEXT    NOT NULL,
    justificacion            TEXT,
    fecha_revision_solicitud TEXT,
    motivo_rechazo           TEXT,
    id_equipo_log            INTEGER,
    CONSTRAINT tbl_solicitudes_pk PRIMARY KEY ( id_solicitud ),
    CONSTRAINT tbl_sol_tbl_proyectos_fk FOREIGN KEY ( id_proyecto )
        REFERENCES tbl_proyectos ( id_proyecto ),
    CONSTRAINT tbl_sol_tbl_usuarios_fk FOREIGN KEY ( id_usuario )
        REFERENCES tbl_usuarios ( id_usuario ),
    CONSTRAINT tbl_sol_tbl_equipos_fk FOREIGN KEY ( id_equipo_log )
        REFERENCES tbl_equipos ( id_equipo_log ),
    CONSTRAINT chk_solicitudes_estado
        CHECK ( estado_solicitud IN ( 'PENDIENTE', 'APROBADA', 'RECHAZADA', 'EN DESPACHO', 'ENTREGADA',
                                      'CONFIRMADA', 'CANCELADA' ) ),
    CONSTRAINT chk_solicitudes_fechas
        CHECK ( fecha_revision_solicitud >= fecha_solicitud OR fecha_revision_solicitud IS NULL )
);

INSERT INTO tbl_solicitudes (id_solicitud, id_proyecto, id_usuario, estado_solicitud, fecha_solicitud, justificacion, fecha_revision_solicitud, motivo_rechazo, id_equipo_log) VALUES (1, 1, 1, 'CONFIRMADA', '2026-06-10', 'Compra de tubería PVC', '2026-07-30T13:05:27.251Z', NULL, 1);
INSERT INTO tbl_solicitudes (id_solicitud, id_proyecto, id_usuario, estado_solicitud, fecha_solicitud, justificacion, fecha_revision_solicitud, motivo_rechazo, id_equipo_log) VALUES (2, 2, 3, 'PENDIENTE', '2026-07-31T01:40:19.780Z', 'Prueba', NULL, NULL, NULL);
INSERT INTO tbl_solicitudes (id_solicitud, id_proyecto, id_usuario, estado_solicitud, fecha_solicitud, justificacion, fecha_revision_solicitud, motivo_rechazo, id_equipo_log) VALUES (3, 2, 3, 'PENDIENTE', '2026-07-31T01:40:33.108Z', 'Prueba', NULL, NULL, NULL);
INSERT INTO tbl_solicitudes (id_solicitud, id_proyecto, id_usuario, estado_solicitud, fecha_solicitud, justificacion, fecha_revision_solicitud, motivo_rechazo, id_equipo_log) VALUES (4, 2, 3, 'CONFIRMADA', '2026-07-31T01:41:04.685Z', 'Prueba', '2026-07-31T05:28:26.657Z', NULL, 2);
INSERT INTO tbl_solicitudes (id_solicitud, id_proyecto, id_usuario, estado_solicitud, fecha_solicitud, justificacion, fecha_revision_solicitud, motivo_rechazo, id_equipo_log) VALUES (5, 2, 3, 'RECHAZADA', '2026-07-31T01:41:25.733Z', 'Prueba', '2026-07-31T05:28:10.109Z', 'Probando rechazos', NULL);
INSERT INTO tbl_solicitudes (id_solicitud, id_proyecto, id_usuario, estado_solicitud, fecha_solicitud, justificacion, fecha_revision_solicitud, motivo_rechazo, id_equipo_log) VALUES (6, 2, 3, 'PENDIENTE', '2026-07-31T02:26:49.654Z', 'Prueba', NULL, NULL, NULL);
INSERT INTO tbl_solicitudes (id_solicitud, id_proyecto, id_usuario, estado_solicitud, fecha_solicitud, justificacion, fecha_revision_solicitud, motivo_rechazo, id_equipo_log) VALUES (7, 2, 3, 'PENDIENTE', '2026-07-31T02:29:57.820Z', 'Prueba', NULL, NULL, NULL);
INSERT INTO tbl_solicitudes (id_solicitud, id_proyecto, id_usuario, estado_solicitud, fecha_solicitud, justificacion, fecha_revision_solicitud, motivo_rechazo, id_equipo_log) VALUES (8, 3, 3, 'PENDIENTE', '2026-07-31T05:09:30.974Z', 'Probando enviar una solicitud', NULL, NULL, NULL);
INSERT INTO tbl_solicitudes (id_solicitud, id_proyecto, id_usuario, estado_solicitud, fecha_solicitud, justificacion, fecha_revision_solicitud, motivo_rechazo, id_equipo_log) VALUES (9, 3, 3, 'PENDIENTE', '2026-07-31T05:10:23.896Z', 'Probando el envio de solicitudes', NULL, NULL, NULL);
INSERT INTO tbl_solicitudes (id_solicitud, id_proyecto, id_usuario, estado_solicitud, fecha_solicitud, justificacion, fecha_revision_solicitud, motivo_rechazo, id_equipo_log) VALUES (10, 3, 3, 'PENDIENTE', '2026-07-31T05:15:47.606Z', 'Probando el envio de solicitudes', NULL, NULL, NULL);
INSERT INTO tbl_solicitudes (id_solicitud, id_proyecto, id_usuario, estado_solicitud, fecha_solicitud, justificacion, fecha_revision_solicitud, motivo_rechazo, id_equipo_log) VALUES (11, 1, 1, 'RECHAZADA', '2026-07-31T05:17:23.592Z', 'Prueba de creación', '2026-08-02T03:54:24.920Z', 'probando rechazo', NULL);
INSERT INTO tbl_solicitudes (id_solicitud, id_proyecto, id_usuario, estado_solicitud, fecha_solicitud, justificacion, fecha_revision_solicitud, motivo_rechazo, id_equipo_log) VALUES (12, 1, 1, 'RECHAZADA', '2026-07-31T05:20:59.810Z', 'Prueba directa', '2026-07-31T05:27:46.042Z', 'No se', NULL);
INSERT INTO tbl_solicitudes (id_solicitud, id_proyecto, id_usuario, estado_solicitud, fecha_solicitud, justificacion, fecha_revision_solicitud, motivo_rechazo, id_equipo_log) VALUES (13, 1, 1, 'CONFIRMADA', '2026-07-31T05:26:34.850Z', 'Prueba directa', '2026-07-31T05:27:37.301Z', NULL, 3);
INSERT INTO tbl_solicitudes (id_solicitud, id_proyecto, id_usuario, estado_solicitud, fecha_solicitud, justificacion, fecha_revision_solicitud, motivo_rechazo, id_equipo_log) VALUES (14, 5, 2, 'ENTREGADA', '2026-08-02T03:52:29.047Z', 'prueba', '2026-08-02T03:54:57.026Z', NULL, 4);

-- ── tbl_usuarios ──────────────────────────────────
DROP TABLE IF EXISTS tbl_usuarios;
CREATE TABLE tbl_usuarios (
    id_usuario     INTEGER NOT NULL,
    id_rol         INTEGER NOT NULL,
    estado_usuario INTEGER NOT NULL,
    nombre_usuario TEXT    NOT NULL,
    correo         TEXT    NOT NULL,
    telefono       TEXT,
    contrasena     TEXT,
    fecha_registro TEXT    NOT NULL,
    CONSTRAINT tbl_usuarios_pk PRIMARY KEY ( id_usuario ),
    CONSTRAINT tbl_usuarios_correo UNIQUE ( correo ),
    CONSTRAINT tbl_usuarios_tbl_roles_fk FOREIGN KEY ( id_rol )
        REFERENCES tbl_roles ( id_rol ),
    CONSTRAINT chk_usuarios_estado CHECK ( estado_usuario IN ( 0, 1 ) ),
    -- Original: REGEXP_LIKE(correo, '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
    -- SQLite no tiene REGEXP nativo; validación aproximada con LIKE.
    CONSTRAINT chk_usuarios_correo CHECK ( correo LIKE '_%@_%.__%' ),
    -- Original: REGEXP_LIKE(telefono, '^[0-9]{8,15}$')
    -- Equivalente con GLOB: solo dígitos y longitud entre 8 y 15.
    CONSTRAINT chk_usuarios_telefono CHECK ( telefono IS NULL
        OR ( LENGTH(telefono) BETWEEN 8 AND 15
             AND telefono GLOB '[0-9]*'
             AND telefono NOT GLOB '*[^0-9]*' ) )
);

INSERT INTO tbl_usuarios (id_usuario, id_rol, estado_usuario, nombre_usuario, correo, telefono, contrasena, fecha_registro) VALUES (1, 1, 1, 'Administrador General', 'admin@pronaders.gob.hn', '99998888', '$2a$10$M/pSZNqLDuFXt8A0V5dYReji5NFPZ6jkKksubjduGXalEaVaO5BFG', '2026-07-28T01:25:49.397Z');
INSERT INTO tbl_usuarios (id_usuario, id_rol, estado_usuario, nombre_usuario, correo, telefono, contrasena, fecha_registro) VALUES (2, 2, 1, 'Andrea Amador', 'andrea.amador@pronaders.gob.hn', '99889988', '$2a$10$JSyoKucPRhyxc3Yq5kWGX.mRAua5W1kkCDpg45V.HNjArHNpXp6V2', '2026-07-28T02:29:07.073Z');
INSERT INTO tbl_usuarios (id_usuario, id_rol, estado_usuario, nombre_usuario, correo, telefono, contrasena, fecha_registro) VALUES (3, 2, 1, 'Silvia Alejandra Zuniga', 'silvia.zuniga@pronaders.gob.hn', '98765432', '$2a$10$iVYujzi56Jo5hA0UejnSpuWG8Eg5sT4Haf.Vu5z0S4hyUPmMq3IAa', '2026-07-28T03:18:52.310Z');
INSERT INTO tbl_usuarios (id_usuario, id_rol, estado_usuario, nombre_usuario, correo, telefono, contrasena, fecha_registro) VALUES (4, 3, 1, 'Equipo Logistico Centro', 'logistico@pronaders.gob.hn', '34567898', '$2a$10$GCQxmnsdFotaYA7Y0/j.fOimLjlZOQddkvxw/lkCE0RXypll0gwLO', '2026-07-28T04:02:50.814Z');
INSERT INTO tbl_usuarios (id_usuario, id_rol, estado_usuario, nombre_usuario, correo, telefono, contrasena, fecha_registro) VALUES (5, 1, 0, 'Isaac Carranza', 'isaac.carranza@pronaders.gob.hn', '76543902', '$2a$10$/Y4GiheILHbrTP0Y0iTS0.L3IeXoebC9fNGDzdvOxRcIlsJ3Sl.Eq', '2026-07-29T03:10:36.386Z');
INSERT INTO tbl_usuarios (id_usuario, id_rol, estado_usuario, nombre_usuario, correo, telefono, contrasena, fecha_registro) VALUES (6, 1, 0, 'Prueba', 'prueba@prueba.com', '76453254', '$2a$10$8zOmid50KpumZ8u8cuZRQOu/N.PbPDSze/N4/u8hXf60Jhrz1WDnq', '2026-08-02T03:43:59.111Z');

COMMIT;
PRAGMA foreign_keys = ON;

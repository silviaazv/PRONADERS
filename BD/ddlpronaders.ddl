-- Generado por Oracle SQL Developer Data Modeler 24.3.1.347.1153
--   en:        2026-07-23 13:05:00 CST
--   sitio:      Oracle Database 11g
--   tipo:      Oracle Database 11g



-- predefined type, no DDL - MDSYS.SDO_GEOMETRY

-- predefined type, no DDL - XMLTYPE

CREATE TABLE tbl_archivos (
    id_archivo          NUMBER NOT NULL,
    id_usuario          NUMBER NOT NULL,
    id_proyecto         NUMBER,
    id_solicitud        NUMBER,
    id_reporte          NUMBER,
    nombre_archivo      VARCHAR2(255) NOT NULL,
    ruta_archivo        VARCHAR2(500),
    descripcion_archivo CLOB,
    tamano_bytes        NUMBER
);

ALTER TABLE tbl_archivos
    ADD CONSTRAINT chk_archivos_extension
        CHECK ( REGEXP_LIKE ( nombre_archivo,
                              '\.(pdf|doc|docx|xls|xlsx|ppt|pptx|jpg|jpeg|png|gif|bmp|txt|csv|zip|rar|7z)$',
                              'i' ) );

ALTER TABLE tbl_archivos ADD CONSTRAINT chk_archivos_tamano CHECK ( tamano_bytes > 0 );

ALTER TABLE tbl_archivos
    ADD CONSTRAINT chk_archivos_origen
        CHECK ( (
            CASE
                WHEN id_reporte IS NOT NULL THEN
                    1
                ELSE
                    0
            END
            +
            CASE
                WHEN id_solicitud IS NOT NULL THEN
                    1
                ELSE
                    0
            END
            +
            CASE
                WHEN id_proyecto IS NOT NULL THEN
                    1
                ELSE
                    0
            END
        ) <= 1 );

ALTER TABLE tbl_archivos ADD CONSTRAINT tbl_evidencias_pk PRIMARY KEY ( id_archivo );

CREATE TABLE tbl_bitacora (
    id_registro  NUMBER NOT NULL,
    id_usuario   NUMBER NOT NULL,
    tipo_accion  VARCHAR2(50) NOT NULL,
    tipo_objeto  VARCHAR2(20),
    id_objeto    NUMBER,
    fecha_accion TIMESTAMP NOT NULL
);

ALTER TABLE TBL_BITACORA 
    ADD CONSTRAINT CHK_BITACORA_TIPO_ACCION 
    CHECK ((tipo_accion IN ( 'INSERT',
                                                                                            'UPDATE',
                                                                                            'DELETE',
                                                                                            'REVISION',
                                                                                            'EMISION',
                                                                                            'APROBACION',
                                                                                            'RECHAZO',
    ) and tipo_objeto IS NOT NULL and id_objeto IS NOT NULL)
OR 
(
        tipo_accion IN ('LOGIN', 'LOGOUT')
        AND tipo_objeto IS NULL
        AND id_objeto IS NULL
    ))
;
ALTER TABLE tbl_bitacora
    ADD CONSTRAINT chk_bitacora_tipo_objeto
        CHECK ( tipo_objeto IS NULL
                OR tipo_objeto IN ( 'USUARIO', 'PROYECTO', 'SOLICITUD', 'REPORTE', 'ARCHIVO' ) );

ALTER TABLE tbl_bitacora
    ADD CONSTRAINT chk_bitacora_sesion
        CHECK ( NOT ( tipo_objeto = 'SESION'
                      AND id_objeto IS NOT NULL ) );

ALTER TABLE tbl_bitacora ADD CONSTRAINT tbl_bitacora_pk PRIMARY KEY ( id_registro );

CREATE TABLE tbl_departamentos (
    id_departamento     NUMBER NOT NULL,
    nombre_departamento VARCHAR2(255) NOT NULL
);

ALTER TABLE tbl_departamentos ADD CONSTRAINT tbl_departamentos_pk PRIMARY KEY ( id_departamento );

CREATE TABLE tbl_equipos (
    id_equipo_log     NUMBER NOT NULL,
    nombre_equipo_log VARCHAR2(255) NOT NULL
);

ALTER TABLE tbl_equipos ADD CONSTRAINT tbl_equipos_pk PRIMARY KEY ( id_equipo_log );

CREATE TABLE tbl_fila_solicitud (
    id_fila             NUMBER NOT NULL,
    id_solicitud        NUMBER NOT NULL,
    tipo_recurso        VARCHAR2(20) NOT NULL,
    descripcion_recurso VARCHAR2(255) NOT NULL,
    cantidad_recurso    NUMBER NOT NULL
);

ALTER TABLE tbl_fila_solicitud ADD CONSTRAINT chk_fila_cantidad CHECK ( cantidad_recurso > 0 );

ALTER TABLE tbl_fila_solicitud
    ADD CONSTRAINT chk_fila_tipo
        CHECK ( tipo_recurso IN ( 'MATERIAL', 'EQUIPO', 'FINANCIERO' ) );

ALTER TABLE tbl_fila_solicitud ADD CONSTRAINT tbl_fila_solicitud_pk PRIMARY KEY ( id_fila );

CREATE TABLE tbl_municipios (
    id_municipio     NUMBER NOT NULL,
    id_departamento  NUMBER NOT NULL,
    nombre_municipio VARCHAR2(255) NOT NULL
);

ALTER TABLE tbl_municipios ADD CONSTRAINT tbl_municipios_pk PRIMARY KEY ( id_municipio );

CREATE TABLE tbl_proyectos (
    id_proyecto           NUMBER NOT NULL,
    tipo_proyecto         VARCHAR2(100) NOT NULL,
    estado_proyecto       VARCHAR2(100) NOT NULL,
    id_ubicacion          NUMBER NOT NULL,
    nombre_proyecto       VARCHAR2(255) NOT NULL,
    descripcion_proyecto  CLOB,
    fecha_inicio          DATE NOT NULL,
    fecha_fin             DATE,
    presupuesto_inicial   NUMBER(18, 2) NOT NULL,
    presupuesto_ejecutado NUMBER(18, 2)
);

ALTER TABLE tbl_proyectos
    ADD CONSTRAINT chk_proyectos_tipo
        CHECK ( tipo_proyecto IN ( 'AGRICOLA', 'INFRAESTRUCTURA', 'SOCIAL' ) );

ALTER TABLE tbl_proyectos
    ADD CONSTRAINT chk_proyectos_estado
        CHECK ( estado_proyecto IN ( 'ACTIVO', 'RETRASADO', 'FINALIZADO', 'CANCELADO' ) );

ALTER TABLE tbl_proyectos ADD CONSTRAINT chk_proyectos_presup CHECK ( presupuesto_ejecutado >= 0 );

ALTER TABLE tbl_proyectos ADD CONSTRAINT chk_proyectos_fechas CHECK ( fecha_fin >= fecha_inicio );

ALTER TABLE tbl_proyectos ADD CONSTRAINT tbl_proyectos_pk PRIMARY KEY ( id_proyecto );

CREATE TABLE tbl_proyectos_usuarios (
    id_usuario  NUMBER NOT NULL,
    id_proyecto NUMBER NOT NULL
);

ALTER TABLE tbl_proyectos_usuarios ADD CONSTRAINT tbl_proyectos_usuarios_pk PRIMARY KEY ( id_usuario,
                                                                                          id_proyecto );

CREATE TABLE tbl_reportes (
    id_reporte             NUMBER NOT NULL,
    id_proyecto            NUMBER NOT NULL,
    id_usuario             NUMBER NOT NULL,
    descripcion_reporte    CLOB,
    fecha_reporte          TIMESTAMP NOT NULL,
    estado_reporte         NUMBER(1) NOT NULL,
    fecha_revision_reporte TIMESTAMP
);

ALTER TABLE tbl_reportes
    ADD CONSTRAINT chk_reportes_fechas
        CHECK ( fecha_revision_reporte >= fecha_reporte
                OR fecha_revision_reporte IS NULL );

ALTER TABLE tbl_reportes
    ADD CONSTRAINT chk_reportes_estado CHECK ( estado_reporte IN ( 0, 1 ) );

ALTER TABLE tbl_reportes ADD CONSTRAINT tbl_reportes_pk PRIMARY KEY ( id_reporte );

CREATE TABLE tbl_roles (
    id_rol     NUMBER NOT NULL,
    nombre_rol VARCHAR2(255) NOT NULL
);

ALTER TABLE tbl_roles ADD CONSTRAINT tbl_roles_pk PRIMARY KEY ( id_rol );

CREATE TABLE tbl_solicitudes (
    id_solicitud             NUMBER NOT NULL,
    id_proyecto              NUMBER NOT NULL,
    id_usuario               NUMBER NOT NULL,
    estado_solicitud         VARCHAR2(100) NOT NULL,
    fecha_solicitud          TIMESTAMP NOT NULL,
    justificacion            CLOB,
    fecha_revision_solicitud TIMESTAMP,
    motivo_rechazo           CLOB,
    id_equipo_log            NUMBER
);

ALTER TABLE tbl_solicitudes
    ADD CONSTRAINT chk_solicitudes_estado
        CHECK ( estado_solicitud IN ( 'PENDIENTE', 'APROBADA', 'RECHAZADA', 'EN DESPACHO', 'ENTREGADA',
                                      'CONFIRMADA', 'CANCELADA' ) );

ALTER TABLE tbl_solicitudes
    ADD CONSTRAINT chk_solicitudes_fechas
        CHECK ( fecha_revision_solicitud >= fecha_solicitud
                OR fecha_revision_solicitud IS NULL );

ALTER TABLE tbl_solicitudes ADD CONSTRAINT tbl_solicitudes_pk PRIMARY KEY ( id_solicitud );

CREATE TABLE tbl_usuarios (
    id_usuario     NUMBER NOT NULL,
    id_rol         NUMBER NOT NULL,
    estado_usuario NUMBER(1) NOT NULL,
    nombre_usuario VARCHAR2(255) NOT NULL,
    correo         VARCHAR2(255) NOT NULL,
    telefono       VARCHAR2(15),
    contrasena     VARCHAR2(255),
    fecha_registro TIMESTAMP NOT NULL
);

ALTER TABLE tbl_usuarios
    ADD CONSTRAINT chk_usuarios_estado CHECK ( estado_usuario IN ( 0, 1 ) );

ALTER TABLE tbl_usuarios
    ADD CONSTRAINT chk_usuarios_correo CHECK ( REGEXP_LIKE ( correo,
                                                             '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' ) );

ALTER TABLE tbl_usuarios
    ADD CONSTRAINT chk_usuarios_telefono CHECK ( REGEXP_LIKE ( telefono,
                                                               '^[0-9]{8,15}$' ) );

ALTER TABLE tbl_usuarios ADD CONSTRAINT tbl_usuarios_pk PRIMARY KEY ( id_usuario );

ALTER TABLE tbl_usuarios ADD CONSTRAINT tbl_usuarios_correo UNIQUE ( correo );

ALTER TABLE tbl_archivos
    ADD CONSTRAINT tbl_archivos_tbl_prys_fk FOREIGN KEY ( id_proyecto )
        REFERENCES tbl_proyectos ( id_proyecto );

ALTER TABLE tbl_archivos
    ADD CONSTRAINT tbl_archivos_tbl_reps_fk FOREIGN KEY ( id_reporte )
        REFERENCES tbl_reportes ( id_reporte );

ALTER TABLE tbl_archivos
    ADD CONSTRAINT tbl_archivos_tbl_sols_fk FOREIGN KEY ( id_solicitud )
        REFERENCES tbl_solicitudes ( id_solicitud );

ALTER TABLE tbl_archivos
    ADD CONSTRAINT tbl_archivos_tbl_usrs_fk FOREIGN KEY ( id_usuario )
        REFERENCES tbl_usuarios ( id_usuario );

ALTER TABLE tbl_bitacora
    ADD CONSTRAINT tbl_bitacora_tbl_usuarios_fk FOREIGN KEY ( id_usuario )
        REFERENCES tbl_usuarios ( id_usuario );

ALTER TABLE tbl_fila_solicitud
    ADD CONSTRAINT tbl_fila_sol_tbl_sol_fk FOREIGN KEY ( id_solicitud )
        REFERENCES tbl_solicitudes ( id_solicitud );

ALTER TABLE tbl_municipios
    ADD CONSTRAINT tbl_mun_tbl_dpt_fk FOREIGN KEY ( id_departamento )
        REFERENCES tbl_departamentos ( id_departamento );

ALTER TABLE tbl_proyectos
    ADD CONSTRAINT tbl_proyectos_tbl_mun_fk FOREIGN KEY ( id_ubicacion )
        REFERENCES tbl_municipios ( id_municipio );

ALTER TABLE tbl_proyectos_usuarios
    ADD CONSTRAINT tbl_pry_usr_tbl_pry_fk FOREIGN KEY ( id_proyecto )
        REFERENCES tbl_proyectos ( id_proyecto );

ALTER TABLE tbl_proyectos_usuarios
    ADD CONSTRAINT tbl_pry_usr_tbl_usr_fk FOREIGN KEY ( id_usuario )
        REFERENCES tbl_usuarios ( id_usuario );

ALTER TABLE tbl_reportes
    ADD CONSTRAINT tbl_reportes_tbl_proyectos_fk FOREIGN KEY ( id_proyecto )
        REFERENCES tbl_proyectos ( id_proyecto );

ALTER TABLE tbl_reportes
    ADD CONSTRAINT tbl_reportes_tbl_usuarios_fk FOREIGN KEY ( id_usuario )
        REFERENCES tbl_usuarios ( id_usuario );

ALTER TABLE tbl_solicitudes
    ADD CONSTRAINT tbl_sol_tbl_equipos_fk FOREIGN KEY ( id_equipo_log )
        REFERENCES tbl_equipos ( id_equipo_log );

ALTER TABLE tbl_solicitudes
    ADD CONSTRAINT tbl_sol_tbl_proyectos_fk FOREIGN KEY ( id_proyecto )
        REFERENCES tbl_proyectos ( id_proyecto );

ALTER TABLE tbl_solicitudes
    ADD CONSTRAINT tbl_sol_tbl_usuarios_fk FOREIGN KEY ( id_usuario )
        REFERENCES tbl_usuarios ( id_usuario );

ALTER TABLE tbl_usuarios
    ADD CONSTRAINT tbl_usuarios_tbl_roles_fk FOREIGN KEY ( id_rol )
        REFERENCES tbl_roles ( id_rol );



-- Informe de Resumen de Oracle SQL Developer Data Modeler: 
-- 
-- CREATE TABLE                            12
-- CREATE INDEX                             0
-- ALTER TABLE                             48
-- CREATE VIEW                              0
-- ALTER VIEW                               0
-- CREATE PACKAGE                           0
-- CREATE PACKAGE BODY                      0
-- CREATE PROCEDURE                         0
-- CREATE FUNCTION                          0
-- CREATE TRIGGER                           0
-- ALTER TRIGGER                            0
-- CREATE COLLECTION TYPE                   0
-- CREATE STRUCTURED TYPE                   0
-- CREATE STRUCTURED TYPE BODY              0
-- CREATE CLUSTER                           0
-- CREATE CONTEXT                           0
-- CREATE DATABASE                          0
-- CREATE DIMENSION                         0
-- CREATE DIRECTORY                         0
-- CREATE DISK GROUP                        0
-- CREATE ROLE                              0
-- CREATE ROLLBACK SEGMENT                  0
-- CREATE SEQUENCE                          0
-- CREATE MATERIALIZED VIEW                 0
-- CREATE MATERIALIZED VIEW LOG             0
-- CREATE SYNONYM                           0
-- CREATE TABLESPACE                        0
-- CREATE USER                              0
-- 
-- DROP TABLESPACE                          0
-- DROP DATABASE                            0
-- 
-- REDACTION POLICY                         0
-- 
-- ORDS DROP SCHEMA                         0
-- ORDS ENABLE SCHEMA                       0
-- ORDS ENABLE OBJECT                       0
-- 
-- ERRORS                                   0
-- WARNINGS                                 0

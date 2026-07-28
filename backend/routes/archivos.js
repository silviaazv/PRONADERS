const genericCrud = require('./genericCrud');

// Nota: aquí solo se guarda el REGISTRO del archivo (nombre, ruta, tamaño) en
// la base de datos. La subida física del archivo al servidor (multipart/form-data)
// requiere un middleware como 'multer', que no está incluido en este ejemplo
// base. Si lo necesitas, avísame y lo agregamos. VERIFICAR SI SE REQUIERE EL USO DE MULTER PARA LA SUBIDA DE ARCHIVOS.
module.exports = genericCrud({
  table: 'tbl_archivos',
  pk: 'id_archivo',
  columns: [
    'id_archivo',
    'id_usuario',
    'id_proyecto',
    'id_solicitud',
    'id_reporte',
    'nombre_archivo',
    'ruta_archivo',
    'descripcion_archivo',
    'tamano_bytes',
  ],
});

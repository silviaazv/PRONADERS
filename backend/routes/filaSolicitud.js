const genericCrud = require('./genericCrud');

module.exports = genericCrud({
  table: 'tbl_fila_solicitud',
  pk: 'id_fila',
  columns: ['id_fila', 'id_solicitud', 'tipo_recurso', 'descripcion_recurso', 'cantidad_recurso'],
});

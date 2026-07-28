const genericCrud = require('./genericCrud');

module.exports = genericCrud({
  table: 'tbl_equipos',
  pk: 'id_equipo_log',
  columns: ['id_equipo_log', 'nombre_equipo_log'],
});

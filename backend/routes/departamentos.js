const genericCrud = require('./genericCrud');

module.exports = genericCrud({
  table: 'tbl_departamentos',
  pk: 'id_departamento',
  columns: ['id_departamento', 'nombre_departamento'],
});

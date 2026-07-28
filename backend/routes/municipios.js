const genericCrud = require('./genericCrud');

module.exports = genericCrud({
  table: 'tbl_municipios',
  pk: 'id_municipio',
  columns: ['id_municipio', 'id_departamento', 'nombre_municipio'],
});

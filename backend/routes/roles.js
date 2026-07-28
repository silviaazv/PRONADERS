const genericCrud = require('./genericCrud');

module.exports = genericCrud({
  table: 'tbl_roles',
  pk: 'id_rol',
  columns: ['id_rol', 'nombre_rol'],
});

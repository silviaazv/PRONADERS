/* ============================================================
   dashboard-oficina.js — DASHBOARD DE OFICINA (heredado)
   Esta página quedó reemplazada por dashboard-admin.html.
   Se redirige al usuario administrador a su dashboard actual.
   ============================================================ */
if((sessionStorage.getItem('pron_role')||'admin_oficina') === 'admin_oficina'){
  window.location.replace('dashboard-admin.html');
}

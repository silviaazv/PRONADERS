/* ============================================================
   dashboard-logistica.js — DASHBOARD DEL EQUIPO DE LOGÍSTICA
   El sidebar/topbar se inyectan desde shared.js. Este script
   asegura que el enlace "Despachos Asignados" del menú abra la
   vista de logística en el módulo de solicitudes, mostrando solo
   los despachos asignados a este centro (también cuando el
   administrador entra desde su acceso de Logística).
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Interceptar los enlaces del sidebar hacia solicitudes.html
  document.querySelectorAll('.sidebar a[href="solicitudes.html"]').forEach(a => {
    a.addEventListener('click', () => sessionStorage.setItem('pron_vista_logistica','1'));
  });
});

/* ============================================================
   dashboard-campo.js — DASHBOARD DEL SUPERVISOR DE CAMPO / EMPLEADO
   El sidebar, topbar y notificaciones se cargan desde shared.js.
   Aquí solo se ajusta la vista para el rol EMPLEADO:
   los empleados NO tienen acceso al módulo de reportes, por lo que
   se ocultan los enlaces y la métrica relacionados con reportes.
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const role = sessionStorage.getItem('pron_role') || 'campo';
  if(role !== 'empleado') return;

  // Ocultar accesos directos al módulo de reportes (acción rápida y enlaces)
  document.querySelectorAll('.main a[href="reportes.html"]').forEach(a => a.style.display='none');

  // Ocultar la métrica "Reportes Pendientes" para empleados
  document.querySelectorAll('.metric-card').forEach(card => {
    const lbl = card.querySelector('.metric-label');
    if(lbl && lbl.textContent.includes('Reportes')) card.style.display='none';
  });
});

/* ============================================================
   finalizados.js — MÓDULO: PROYECTOS FINALIZADOS (Admin de Oficina)
   El sidebar, topbar, notificaciones y utilidades de
   validación se cargan desde shared.js (incluido antes).
   ============================================================ */

function verDetalle(nombre){
  document.getElementById('det-title').innerHTML = `<em style="font-style:italic">${nombre}</em>`;
  document.getElementById('modal-detalle').classList.add('open');
}
function generarPDF(nombre){
  alert(`Generando PDF del proyecto "${nombre}"...\n\nEl archivo incluirá:\n• Datos generales del proyecto\n• Todos los reportes de avance\n• Proyecciones registradas\n• Evidencias fotográficas\n• Historial de solicitudes de recursos`);
}
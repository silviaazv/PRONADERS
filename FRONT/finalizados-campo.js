/* ============================================================
   finalizados-campo.js — MÓDULO: PROYECTOS FINALIZADOS (Supervisor de Campo)
   El sidebar, topbar, notificaciones y utilidades de
   validación se cargan desde shared.js (incluido antes).
   ============================================================ */

let anioFiltro = '';
let tipoFiltro = '';
function filtrarAnio(val){ anioFiltro = val; aplicarFiltros(); }
function filtrarTipo(val){ tipoFiltro = val; aplicarFiltros(); }
function aplicarFiltros(){
  const cards = document.querySelectorAll('#lista-proyectos .fin-card');
  let visible = 0;
  cards.forEach(card => {
    const anio = card.dataset.anio || '';
    const tipo = card.dataset.tipo || '';
    const show = (!anioFiltro || anio === anioFiltro) && (!tipoFiltro || tipo === tipoFiltro);
    card.style.display = show ? '' : 'none';
    if(show) visible++;
  });
  document.getElementById('total-count').textContent = visible;
  document.getElementById('empty-state').style.display = visible === 0 ? 'block' : 'none';
}
function verDetalle(nombre, inicio, fin, presupuesto, ejecutado){
  document.getElementById('det-title').innerHTML = '<em style="font-style:italic">'+nombre+'</em>';
  document.getElementById('det-inicio').textContent = inicio;
  document.getElementById('det-fin').textContent = fin;
  document.getElementById('det-presupuesto').textContent = presupuesto;
  document.getElementById('det-ejecutado').textContent = ejecutado;
  document.getElementById('modal-detalle').classList.add('open');
}
function generarPDF(nombre){
  alert('Generando PDF del proyecto "'+nombre+'"...\n\nEl archivo incluirá:\n• Datos generales del proyecto\n• Todos los reportes de avance\n• Evidencias fotográficas');
}
(function(){
  const role = sessionStorage.getItem('pron_role') || 'campo';
  if(role !== 'campo'){ window.location.replace('finalizados.html'); }
})();
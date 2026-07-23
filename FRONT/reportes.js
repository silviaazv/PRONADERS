/* ============================================================
   reportes.js — MÓDULO: REPORTES DE AVANCE (vista de tarjetas)
   ------------------------------------------------------------
   - Vista de TARJETAS LARGAS (estilo Proyectos Finalizados) con
     toda la información del reporte, fechas de emisión/revisión
     y footer de imágenes/documentos adjuntos.
   - FILTROS por estado (pendientes/revisados/todos) y por
     proyecto, ordenados por fecha DESCENDENTE, con botón de
     acceso directo al proyecto asociado.
   - Visor de adjuntos con pie informativo (código + descripción).
   Reglas por rol:
   - EMPLEADO: sin acceso → se redirige a su dashboard.
   - SUPERVISOR DE CAMPO: crea y consulta; NO aprueba.
   - ADMIN DE OFICINA: revisa y aprueba; sin botón "Nuevo Reporte".
   El sidebar, topbar y utilidades se cargan desde shared.js.
   ============================================================ */

// ─────────────────────────────────────────────────────────────
// DATOS DE REPORTES
// ─────────────────────────────────────────────────────────────
const REPORTES = [
  {
    id:'REP-2026-031', titulo:'Avance semana 14', proyecto:'Puente Choluteca', proyectoId:'PRY-001',
    autor:'Isaac Carranza', iniciales:'IC', avatarBg:'var(--info-bg)', avatarColor:'var(--info)',
    fechaEmision:'13 abr 2026', fechaRevision:null, orden:20260413,
    avanceFisico:68, avanceFinanciero:61, estado:'Pendiente',
    descripcion:'Montaje del 60% de la estructura metálica del claro principal. Se concluyó la soldadura de vigas en el estribo norte y se inició el arriostramiento lateral.',
    incidencias:'Sin incidencias reportadas.', incidenciaGrave:false,
    observaciones:'Se recomienda programar la inspección de soldaduras para la próxima semana.',
    adjuntos:[
      {tipo:'img', nombre:'estructura_norte.jpg'},
      {tipo:'img', nombre:'soldadura_vigas.jpg'},
      {tipo:'pdf', nombre:'bitacora_semana14.pdf'},
    ],
  },
  {
    id:'REP-2026-030', titulo:'Incidencia pluvial', proyecto:'Riego El Paraíso', proyectoId:'PRY-002',
    autor:'Silvia Zuniga', iniciales:'SZ', avatarBg:'var(--warning-bg)', avatarColor:'var(--warning)',
    fechaEmision:'12 abr 2026', fechaRevision:null, orden:20260412,
    avanceFisico:41, avanceFinanciero:39, estado:'Pendiente',
    descripcion:'Lluvias intensas interrumpieron la excavación de la zanja del tramo B durante 5 días. Se reprograma el cronograma de instalación de la red principal.',
    incidencias:'⚠ Retraso de 5 días por lluvias. Zanja del tramo B parcialmente inundada.', incidenciaGrave:true,
    observaciones:'Solicitar bomba de achique si las lluvias continúan la próxima semana.',
    adjuntos:[
      {tipo:'img', nombre:'zanja_inundada.jpg'},
      {tipo:'img', nombre:'tramo_b_afectado.jpg'},
    ],
  },
  {
    id:'REP-2026-029', titulo:'Reporte mensual', proyecto:'Centro San Pedro', proyectoId:'PRY-003',
    autor:'Andrea Amador', iniciales:'AA', avatarBg:'var(--success-bg)', avatarColor:'var(--success)',
    fechaEmision:'10 abr 2026', fechaRevision:null, orden:20260410,
    avanceFisico:85, avanceFinanciero:80, estado:'Pendiente',
    descripcion:'Techumbre instalada en su totalidad. Trabajos eléctricos iniciados en el salón multiuso y la cocina. Acabados interiores al 80%.',
    incidencias:'Sin incidencias. Material eléctrico pendiente de aprobación en solicitud SOL-2026-039.', incidenciaGrave:false,
    observaciones:'La comunidad solicita coordinar la fecha tentativa de entrega.',
    adjuntos:[
      {tipo:'img', nombre:'techumbre_completa.jpg'},
      {tipo:'doc', nombre:'acta_avance_abril.docx'},
    ],
  },
  {
    id:'REP-2026-028', titulo:'Reporte inicial', proyecto:'Escuela Comayagua', proyectoId:'PRY-004',
    autor:'Jose Luis Montero', iniciales:'JM', avatarBg:'var(--cream-dark)', avatarColor:'var(--text-light)',
    fechaEmision:'08 abr 2026', fechaRevision:null, orden:20260408,
    avanceFisico:29, avanceFinanciero:24, estado:'Pendiente',
    descripcion:'Limpieza de terreno completada. Fundaciones de las primeras dos aulas en proceso de colado.',
    incidencias:'Sin incidencias reportadas.', incidenciaGrave:false,
    observaciones:'Se sugiere adelantar el pedido de bloques para el levantado de paredes.',
    adjuntos:[
      {tipo:'img', nombre:'terreno_limpio.jpg'},
    ],
  },
  {
    id:'REP-2026-026', titulo:'Avance quincenal', proyecto:'Camino Copán', proyectoId:'PRY-005',
    autor:'Jose Luis Montero', iniciales:'JM', avatarBg:'var(--info-bg)', avatarColor:'var(--info)',
    fechaEmision:'05 abr 2026', fechaRevision:null, orden:20260405,
    avanceFisico:55, avanceFinanciero:50, estado:'Pendiente',
    descripcion:'Tramo norte (km 0-4) completado con cunetas terminadas. Apertura del tramo sur iniciada con maquinaria en sitio.',
    incidencias:'Sin incidencias reportadas.', incidenciaGrave:false,
    observaciones:'Verificar disponibilidad de material selecto para la base del tramo sur.',
    adjuntos:[
      {tipo:'img', nombre:'tramo_norte_final.jpg'},
      {tipo:'pdf', nombre:'medicion_topografica.pdf'},
    ],
  },
  {
    id:'REP-2026-027', titulo:'Avance semana 13', proyecto:'Puente Choluteca', proyectoId:'PRY-001',
    autor:'Isaac Carranza', iniciales:'IC', avatarBg:'var(--success-bg)', avatarColor:'var(--success)',
    fechaEmision:'06 abr 2026', fechaRevision:'07 abr 2026', orden:20260406,
    avanceFisico:62, avanceFinanciero:58, estado:'Aprobado',
    descripcion:'Colado de columnas del estribo sur finalizado. Curado en proceso según especificación técnica del diseño.',
    incidencias:'Sin incidencias reportadas.', incidenciaGrave:false,
    observaciones:'Resultados de resistencia del concreto dentro del rango esperado.',
    adjuntos:[
      {tipo:'img', nombre:'columnas_estribo_sur.jpg'},
    ],
  },
  {
    id:'REP-2026-024', titulo:'Avance mensual marzo', proyecto:'Riego El Paraíso', proyectoId:'PRY-002',
    autor:'Silvia Zuniga', iniciales:'SZ', avatarBg:'var(--success-bg)', avatarColor:'var(--success)',
    fechaEmision:'31 mar 2026', fechaRevision:'02 abr 2026', orden:20260331,
    avanceFisico:38, avanceFinanciero:35, estado:'Aprobado',
    descripcion:'Tramo A de la red principal instalado y probado a presión. 62 familias capacitadas en el primer módulo de riego.',
    incidencias:'Sin incidencias reportadas.', incidenciaGrave:false,
    observaciones:'Buena participación de la comunidad en las capacitaciones.',
    adjuntos:[
      {tipo:'pdf', nombre:'informe_marzo.pdf'},
      {tipo:'img', nombre:'prueba_presion.jpg'},
    ],
  },
  {
    id:'REP-2026-022', titulo:'Reporte semana 10', proyecto:'Centro San Pedro', proyectoId:'PRY-003',
    autor:'Andrea Amador', iniciales:'AA', avatarBg:'var(--success-bg)', avatarColor:'var(--success)',
    fechaEmision:'28 mar 2026', fechaRevision:'29 mar 2026', orden:20260328,
    avanceFisico:78, avanceFinanciero:72, estado:'Aprobado',
    descripcion:'Paredes y estructura de techo concluidas. Se recibió el material eléctrico de la primera fase.',
    incidencias:'Sin incidencias reportadas.', incidenciaGrave:false,
    observaciones:'—',
    adjuntos:[],
  },
  {
    id:'REP-2026-021', titulo:'Avance quincenal', proyecto:'Camino Copán', proyectoId:'PRY-005',
    autor:'Jose Luis Montero', iniciales:'JM', avatarBg:'var(--success-bg)', avatarColor:'var(--success)',
    fechaEmision:'20 mar 2026', fechaRevision:'21 mar 2026', orden:20260320,
    avanceFisico:46, avanceFinanciero:41, estado:'Aprobado',
    descripcion:'Movimiento de tierra del km 0 al 4 finalizado. Material de base colocado y compactado.',
    incidencias:'Sin incidencias reportadas.', incidenciaGrave:false,
    observaciones:'—',
    adjuntos:[
      {tipo:'img', nombre:'compactacion_km2.jpg'},
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// ESTADO DEL MÓDULO Y ROL
// ─────────────────────────────────────────────────────────────
const ROLE_REP  = sessionStorage.getItem('pron_role') || 'campo';
const ES_ADMIN_REP = (ROLE_REP === 'admin_oficina' || ROLE_REP === 'admin');
const NOMBRE_REP = sessionStorage.getItem('pron_nombre') || '';

/* Reportes visibles según el rol: el ADMIN los ve TODOS; el
   SUPERVISOR DE CAMPO solo los que ÉL emitió en sus proyectos. */
function reportesVisibles(){
  return ES_ADMIN_REP ? REPORTES : REPORTES.filter(r => r.autor === NOMBRE_REP);
}

// ─────────────────────────────────────────────────────────────
// RENDER DE TARJETAS
// ─────────────────────────────────────────────────────────────
/* Construye una tarjeta larga con TODA la información del reporte:
   autor, fechas de emisión y revisión, avances, descripción,
   incidencias, observaciones y el footer de adjuntos. */
function cardReporte(r){
  const badge = r.estado === 'Aprobado'
    ? '<span class="badge badge-success"><span class="material-symbols-rounded" style="font-size:12px">check_circle</span>Aprobado</span>'
    : '<span class="badge badge-warning"><span class="material-symbols-rounded" style="font-size:12px">pending</span>Pendiente</span>';

  // Acciones según rol: solo el ADMIN puede aprobar; el campo ve el estado
  let acciones = '';
  if(r.estado === 'Pendiente'){
    acciones = ES_ADMIN_REP
      ? `<button class="btn btn-success btn-sm" onclick="aprobarReporte('${r.id}')">
           <span class="material-symbols-rounded" style="font-size:14px">check</span> Aprobar
         </button>`
      : `<span class="text-xs text-muted" style="align-self:center">En revisión por oficina</span>`;
  }

  // Footer de adjuntos (como en Proyectos Finalizados), separados por tipo.
  // Cada miniatura abre el VISOR con el código del reporte y su descripción al pie.
  const fotos = r.adjuntos.filter(a=>a.tipo==='img');
  const docs  = r.adjuntos.filter(a=>a.tipo!=='img');
  const thumb = (a) => `
    <div class="evidence-thumb" title="${a.nombre}"
         onclick='abrirVisor({tipo:"${a.tipo}",nombre:"${a.nombre}",codigo:"${r.id}",tipoCodigo:"reporte",descripcion:${JSON.stringify(r.titulo+' — '+r.descripcion)}})'>
      <span class="material-symbols-rounded">${a.tipo==='img'?'image':a.tipo==='pdf'?'picture_as_pdf':'description'}</span>
    </div>`;
  const footerAdjuntos = r.adjuntos.length ? `
    <div style="display:flex;gap:22px;flex-wrap:wrap">
      ${fotos.length?`<div>
        <div style="font-size:10.5px;font-weight:600;text-transform:uppercase;letter-spacing:.6px;color:var(--muted);margin-bottom:6px">Fotografías</div>
        <div style="display:flex;gap:8px">${fotos.map(thumb).join('')}</div>
      </div>`:''}
      ${docs.length?`<div>
        <div style="font-size:10.5px;font-weight:600;text-transform:uppercase;letter-spacing:.6px;color:var(--muted);margin-bottom:6px">Documentos</div>
        <div style="display:flex;gap:8px">${docs.map(thumb).join('')}</div>
      </div>`:''}
    </div>`
    : '<span class="text-xs text-muted">Sin adjuntos</span>';

  return `
  <div class="rep-card" id="rep-${r.id}">
    <div class="flex-between" style="margin-bottom:6px;flex-wrap:wrap;gap:10px">
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        <span style="font-size:11px;font-weight:600;color:var(--muted)">${r.id}</span>
        ${badge}
        ${r.incidenciaGrave?'<span class="badge badge-danger"><span class="material-symbols-rounded" style="font-size:12px">warning</span>Con incidencia</span>':''}
      </div>
      <!-- Acceso directo al proyecto asociado -->
      <a href="proyectos.html" class="btn btn-primary btn-sm" style="text-decoration:none"
         onclick="sessionStorage.setItem('pron_open_proyecto','${r.proyectoId}')" title="Abrir el proyecto asociado">
        <span class="material-symbols-rounded" style="font-size:14px">folder_open</span> Ver proyecto
      </a>
    </div>

    <div style="font-size:17px;font-weight:600;color:var(--navy);margin-bottom:2px">${r.titulo} — ${r.proyecto}</div>
    <div class="text-xs text-muted" style="margin-bottom:14px;display:flex;align-items:center;gap:6px">
      <div class="avatar" style="width:22px;height:22px;font-size:9px;background:${r.avatarBg};color:${r.avatarColor}">${r.iniciales}</div>
      ${r.autor}
    </div>

    <!-- Fechas de emisión y revisión + avances -->
    <div style="display:flex;gap:24px;flex-wrap:wrap;margin-bottom:14px">
      <div class="info-row"><span class="material-symbols-rounded">calendar_today</span>Emitido: <strong>${r.fechaEmision}</strong></div>
      <div class="info-row"><span class="material-symbols-rounded">event_available</span>Revisado: <strong style="color:${r.fechaRevision?'var(--success)':'var(--muted)'}">${r.fechaRevision||'Pendiente'}</strong></div>
      <div class="info-row"><span class="material-symbols-rounded">bar_chart</span>Avance físico: <strong>${r.avanceFisico}%</strong></div>
      <div class="info-row"><span class="material-symbols-rounded">payments</span>Avance financiero: <strong>${r.avanceFinanciero}%</strong></div>
    </div>

    <div class="progress-bar mb-16" style="max-width:420px"><div class="progress-fill ${r.avanceFisico>=75?'success':r.avanceFisico>=40?'gold':'danger'}" style="width:${r.avanceFisico}%"></div></div>

    <!-- Toda la información del reporte -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px">
      <div>
        <div style="font-size:10.5px;font-weight:600;text-transform:uppercase;letter-spacing:.6px;color:var(--muted);margin-bottom:4px">Descripción del avance</div>
        <p style="font-size:13px;line-height:1.65;color:var(--text)">${r.descripcion}</p>
      </div>
      <div>
        <div style="font-size:10.5px;font-weight:600;text-transform:uppercase;letter-spacing:.6px;color:var(--muted);margin-bottom:4px">Incidencias</div>
        <p style="font-size:13px;line-height:1.65;color:${r.incidenciaGrave?'var(--danger)':'var(--text-light)'}">${r.incidencias}</p>
        <div style="font-size:10.5px;font-weight:600;text-transform:uppercase;letter-spacing:.6px;color:var(--muted);margin:10px 0 4px">Observaciones técnicas</div>
        <p style="font-size:13px;line-height:1.65;color:var(--text-light)">${r.observaciones}</p>
      </div>
    </div>

    <!-- Footer: adjuntos + acciones (como en Finalizados) -->
    <div style="display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:12px;padding-top:14px;border-top:1px solid var(--cream-dark)">
      ${footerAdjuntos}
      <div style="display:flex;gap:8px">${acciones}</div>
    </div>
  </div>`;
}

/* Renderiza el listado aplicando los filtros en línea (estado,
   proyecto) y el ORDEN por fecha elegido (desc = más recientes). */
function renderReportes(){
  const estado = (document.getElementById('f-rep-estado')||{}).value ?? 'Pendiente';
  const proy   = (document.getElementById('f-rep-proyecto')||{}).value || '';
  const orden  = (document.getElementById('f-rep-orden')||{}).value || 'desc';

  let data = reportesVisibles()
    .filter(r => (!estado || r.estado === estado) && (!proy || r.proyecto === proy))
    .sort((a,b) => orden==='desc' ? b.orden - a.orden : a.orden - b.orden);

  const cont = document.getElementById('lista-reportes');
  cont.innerHTML = data.length
    ? data.map(cardReporte).join('')
    : `<div class="card" style="text-align:center;padding:44px;color:var(--muted)">
        <span class="material-symbols-rounded" style="font-size:38px;display:block;margin-bottom:10px;color:var(--cream-dark)">search_off</span>
        No hay reportes con los filtros seleccionados.
       </div>`;

  const cc = document.getElementById('rep-contador');
  if(cc) cc.textContent = `${data.length} reporte${data.length!==1?'s':''} · ${reportesVisibles().filter(r=>r.estado==='Pendiente').length} pendientes de revisión`;

  // "Limpiar filtros" a la izquierda del primer filtro, solo con filtros
  // aplicados (el estado por defecto "Pendientes" no cuenta como filtro).
  const hay = (estado !== 'Pendiente') || proy || (orden !== 'desc');
  const btn = document.getElementById('btn-limpiar-rep');
  if(btn) btn.style.display = hay ? '' : 'none';
}

/* Restablece los filtros del módulo de reportes */
function limpiarFiltrosReportes(){
  document.getElementById('f-rep-estado').value = 'Pendiente';
  document.getElementById('f-rep-proyecto').value = '';
  document.getElementById('f-rep-orden').value = 'desc';
  renderReportes();
}

/* Aprueba un reporte (exclusivo del Admin de Oficina) */
function aprobarReporte(id){
  const r = REPORTES.find(x=>x.id===id);
  if(!r) return;
  r.estado = 'Aprobado';
  r.fechaRevision = new Date().toLocaleDateString('es-HN',{day:'2-digit',month:'short',year:'numeric'});
  renderReportes();
  showToast(`Reporte ${id} aprobado y registrado en la bitácora.`,'success');
}

// ─────────────────────────────────────────────────────────────
// INICIALIZACIÓN POR ROL
// ─────────────────────────────────────────────────────────────
function initReportes(){
  // ── EMPLEADO: sin acceso a reportes ──
  if(ROLE_REP === 'empleado'){
    window.location.replace('dashboard-campo.html');
    return;
  }

  // Poblar el filtro de proyectos
  const sel = document.getElementById('f-rep-proyecto');
  [...new Set(reportesVisibles().map(r=>r.proyecto))].sort().forEach(p=>{
    const o = document.createElement('option'); o.value = p; o.textContent = p; sel.appendChild(o);
  });

  if(ES_ADMIN_REP){
    // ── ADMIN: revisa y aprueba, pero no crea reportes ──
    const btnNuevo = document.getElementById('btn-nuevo-reporte');
    if(btnNuevo) btnNuevo.remove();
  }

  renderReportes();

  // Deep-link: si se llegó desde el detalle de un proyecto con un
  // reporte específico, mostrar "Todos", resaltarlo y hacer scroll.
  const abrir = sessionStorage.getItem('pron_open_reporte');
  if(abrir){
    sessionStorage.removeItem('pron_open_reporte');
    document.getElementById('f-rep-estado').value = ''; // mostrar todos
    renderReportes();
    setTimeout(()=>{
      const el = document.getElementById('rep-'+abrir);
      if(el){ el.classList.add('destacado'); el.scrollIntoView({behavior:'smooth', block:'center'}); }
    }, 150);
  }
}
document.addEventListener('DOMContentLoaded', initReportes);

/* Envía un nuevo reporte de avance (Supervisor de Campo).
   Valida los campos obligatorios sin borrar lo escrito. */
function enviarReporte(){
  const errores = FormUtils.validar([
    {id:'rep-proyecto', msg:'Selecciona el proyecto del reporte.'},
    {id:'rep-desc',     msg:'Describe el avance realizado en este período.'},
  ]);
  if(errores){ showToast(`Faltan ${errores} campo(s) obligatorio(s) por completar.`,'warning'); return; }
  document.getElementById('modal-reporte').classList.remove('open');
  // Mensaje de registro exitoso
  showToast('Reporte registrado y enviado. El Administrador de Oficina fue notificado.','success');
  // Limpiar SOLO después de un envío exitoso
  document.getElementById('rep-proyecto').value='';
  document.getElementById('rep-desc').value='';
}

/* ── Toast de mensajes del módulo ── */
let _toastTimer;
function showToast(msg, tipo='success'){
  const t=document.getElementById('toast');
  if(!t){ alert(msg); return; }
  const icons={success:'check_circle',warning:'warning',info:'info'};
  t.className=`toast ${tipo}`;
  document.getElementById('toast-icon').textContent=icons[tipo]||'check_circle';
  document.getElementById('toast-msg').textContent=msg;
  t.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer=setTimeout(()=>t.classList.remove('show'),4500);
}

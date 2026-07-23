/* ============================================================
   solicitudes.js — MÓDULO: SOLICITUDES DE RECURSOS
   Vistas por rol: Campo (mis solicitudes), Admin (gestión),
   Logística (despachos asignados) y Empleado (necesidades).
   El sidebar, topbar, notificaciones y utilidades de
   validación se cargan desde shared.js (incluido antes).
   ============================================================ */

// ─────────────────────────────────────────────────────────────
// DATOS DE MUESTRA
// ─────────────────────────────────────────────────────────────
const SOLICITUDES = [
  {
    id:'SOL-2026-047', proyecto:'Puente Choluteca', solicitante:'Isaac Carranza',
    fecha:'26 abr 2026', estado:'pendiente', justificacion:'Agotamiento de materiales para continuar con la segunda columna.',
    items:[
      {tipo:'Material',desc:'Cemento Portland',cantidad:'150 bolsas',monto:22500},
      {tipo:'Material',desc:'Varilla de hierro 3/8"',cantidad:'200 unidades',monto:18000},
      {tipo:'Equipo',  desc:'Mezcladora de concreto (renta)',cantidad:'1 semana',monto:4500},
    ],
    timeline:[
      {estado:'Solicitud creada',actor:'Isaac Carranza',fecha:'26 abr 2026 · 10:30',color:'var(--info)',icon:'add_circle',docs:[]},
      {estado:'Notificación enviada a Gerencia Técnica',actor:'Sistema automático',fecha:'26 abr 2026 · 10:30',color:'var(--gold)',icon:'email',docs:[]},
    ]
  },
  {
    id:'SOL-2026-046', proyecto:'Puente Choluteca', solicitante:'Isaac Carranza',
    fecha:'24 abr 2026', estado:'aprobada', logistica:'EQL-02', equipoNombre:'Equipo Logístico Centro',
    justificacion:'Equipo de altura para montaje de estructura metálica.',
    items:[
      {tipo:'Equipo',desc:'Andamio metálico 2m',cantidad:'6 unidades',monto:9600},
      {tipo:'Equipo',desc:'Taladro percutor 1/2"',cantidad:'2 unidades',monto:4200},
    ],
    timeline:[
      {estado:'Solicitud creada',actor:'Isaac Carranza',fecha:'24 abr 2026 · 08:40',color:'var(--info)',icon:'add_circle',docs:[]},
      {estado:'Aprobada por Gerencia Técnica',actor:'Silvia Zuniga',fecha:'25 abr 2026 · 10:10',color:'var(--success)',icon:'check_circle',docs:['aprobacion_046.pdf'],comentario:'Equipo necesario para la etapa actual.'},
      {estado:'Asignado a Equipo Logístico Centro',actor:'Silvia Zuniga',fecha:'25 abr 2026 · 10:11',color:'#6a1b9a',icon:'local_shipping',docs:[]},
    ]
  },
  {
    id:'SOL-2026-044', proyecto:'Riego El Paraíso', solicitante:'Isaac Carranza',
    fecha:'22 abr 2026', estado:'aprobada', logistica:'EQL-02', equipoNombre:'Equipo Logístico Centro',
    justificacion:'Sistema de tuberías dañado por deslizamiento de tierra.',
    items:[
      {tipo:'Material',desc:'Tubería PVC 4"',cantidad:'80 metros',monto:12000},
      {tipo:'Material',desc:'Uniones y accesorios PVC',cantidad:'1 lote',monto:3200},
    ],
    timeline:[
      {estado:'Solicitud creada',actor:'Isaac Carranza',fecha:'22 abr 2026 · 09:15',color:'var(--info)',icon:'add_circle',docs:[]},
      {estado:'Notificación enviada a Gerencia Técnica',actor:'Sistema automático',fecha:'22 abr 2026 · 09:15',color:'var(--gold)',icon:'email',docs:[]},
      {estado:'Aprobada por Gerencia Técnica',actor:'Silvia Zuniga',fecha:'23 abr 2026 · 14:20',color:'var(--success)',icon:'check_circle',docs:['Autorización_presupuestal_044.pdf'],comentario:'Presupuesto disponible. Proceder inmediatamente.'},
      {estado:'Solicitante notificado por correo',actor:'Sistema automático',fecha:'23 abr 2026 · 14:20',color:'var(--gold)',icon:'mark_email_read',docs:[]},
      {estado:'Asignado a Equipo Logístico Centro',actor:'Silvia Zuniga',fecha:'23 abr 2026 · 14:21',color:'#6a1b9a',icon:'local_shipping',docs:[]},
    ]
  },
  {
    id:'SOL-2026-039', proyecto:'Centro San Pedro', solicitante:'Isaac Carranza',
    fecha:'15 abr 2026', estado:'rechazada',
    justificacion:'Falta de materiales eléctricos para instalación de paneles.',
    items:[
      {tipo:'Material',desc:'Cable eléctrico #12 AWG',cantidad:'500 metros',monto:15000},
      {tipo:'Equipo',  desc:'Tablero eléctrico 12 polos',cantidad:'2 unidades',monto:8400},
    ],
    timeline:[
      {estado:'Solicitud creada',actor:'Isaac Carranza',fecha:'15 abr 2026 · 08:00',color:'var(--info)',icon:'add_circle',docs:[]},
      {estado:'Notificación enviada a Gerencia Técnica',actor:'Sistema automático',fecha:'15 abr 2026 · 08:00',color:'var(--gold)',icon:'email',docs:[]},
      {estado:'Rechazada por Gerencia Técnica',actor:'Silvia Zuniga',fecha:'16 abr 2026 · 10:45',color:'var(--danger)',icon:'cancel',docs:[],motivo:'El presupuesto del Q2 no contempla materiales eléctricos. Incluir en solicitud del Q3.'},
      {estado:'Solicitante notificado por correo',actor:'Sistema automático',fecha:'16 abr 2026 · 10:45',color:'var(--gold)',icon:'mark_email_read',docs:[]},
    ]
  },
  {
    id:'SOL-2026-035', proyecto:'Camino Copán', solicitante:'Isaac Carranza',
    fecha:'10 abr 2026', estado:'en_despacho', logistica:'EQL-04', equipoNombre:'Equipo Logístico Occidente',
    justificacion:'Equipo de topografía dañado e inoperable.',
    items:[
      {tipo:'Equipo',desc:'Nivel óptico profesional',cantidad:'1 unidad',monto:14000},
      {tipo:'Equipo',desc:'Trípode de aluminio',cantidad:'1 unidad',monto:3500},
    ],
    timeline:[
      {estado:'Solicitud creada',actor:'Isaac Carranza',fecha:'10 abr 2026 · 11:00',color:'var(--info)',icon:'add_circle',docs:[]},
      {estado:'Notificación enviada a Gerencia Técnica',actor:'Sistema automático',fecha:'10 abr 2026 · 11:00',color:'var(--gold)',icon:'email',docs:[]},
      {estado:'Aprobada por Gerencia Técnica',actor:'Silvia Zuniga',fecha:'11 abr 2026 · 09:30',color:'var(--success)',icon:'check_circle',docs:['OF-2026-035-aprobacion.pdf'],comentario:'Equipo indispensable. Proceder.'},
      {estado:'Solicitante notificado por correo',actor:'Sistema automático',fecha:'11 abr 2026 · 09:30',color:'var(--gold)',icon:'mark_email_read',docs:[]},
      {estado:'Asignado a Equipo Logístico Occidente',actor:'Silvia Zuniga',fecha:'11 abr 2026 · 09:31',color:'#6a1b9a',icon:'local_shipping',docs:[]},
      {estado:'Despacho registrado',actor:'Equipo Logístico Occidente',fecha:'14 abr 2026 · 07:00',color:'#00695c',icon:'inventory_2',docs:['Remision_firmada_DSP-035.pdf'],obs:'Todos los ítems despachados en perfecto estado.'},
    ]
  },
  {
    id:'SOL-2026-028', proyecto:'Riego El Paraíso', solicitante:'Isaac Carranza',
    fecha:'01 abr 2026', estado:'entregada', logistica:'EQL-02', equipoNombre:'Equipo Logístico Centro',
    justificacion:'Herramientas manuales para mantenimiento del sistema de riego.',
    items:[
      {tipo:'Material',desc:'Palas y picos',cantidad:'10 unidades',monto:3500},
      {tipo:'Material',desc:'Carretillas metálicas',cantidad:'4 unidades',monto:4800},
    ],
    timeline:[
      {estado:'Solicitud creada',actor:'Isaac Carranza',fecha:'01 abr 2026 · 08:00',color:'var(--info)',icon:'add_circle',docs:[]},
      {estado:'Notificación enviada a Gerencia Técnica',actor:'Sistema automático',fecha:'01 abr 2026 · 08:00',color:'var(--gold)',icon:'email',docs:[]},
      {estado:'Aprobada por Gerencia Técnica',actor:'Silvia Zuniga',fecha:'02 abr 2026 · 10:00',color:'var(--success)',icon:'check_circle',docs:['aprobacion_028.pdf'],comentario:'Aprobado. Herramientas básicas.'},
      {estado:'Solicitante notificado por correo',actor:'Sistema automático',fecha:'02 abr 2026 · 10:00',color:'var(--gold)',icon:'mark_email_read',docs:[]},
      {estado:'Asignado a Equipo Logístico Centro',actor:'Silvia Zuniga',fecha:'02 abr 2026 · 10:01',color:'#6a1b9a',icon:'local_shipping',docs:[]},
      {estado:'Despacho registrado',actor:'Equipo Logístico Centro',fecha:'04 abr 2026 · 06:30',color:'#00695c',icon:'inventory_2',docs:['Remision_DSP-028.pdf'],obs:'Todo entregado en orden.'},
      {estado:'Entregada al solicitante',actor:'Equipo Logístico Centro',fecha:'05 abr 2026 · 14:00',color:'var(--navy)',icon:'check_circle',docs:[]},
    ]
  },
  {
    id:'SOL-2026-020', proyecto:'Puente Choluteca', solicitante:'Isaac Carranza',
    fecha:'20 mar 2026', estado:'confirmada', logistica:'EQL-02', equipoNombre:'Equipo Logístico Centro',
    justificacion:'Materiales iniciales para inicio de obra.',
    items:[
      {tipo:'Material',desc:'Bloques de concreto',cantidad:'500 unidades',monto:12500},
      {tipo:'Material',desc:'Arena y grava',cantidad:'10 m³',monto:8000},
    ],
    timeline:[
      {estado:'Solicitud creada',actor:'Isaac Carranza',fecha:'20 mar 2026 · 09:00',color:'var(--info)',icon:'add_circle',docs:[]},
      {estado:'Notificación enviada a Gerencia Técnica',actor:'Sistema automático',fecha:'20 mar 2026 · 09:00',color:'var(--gold)',icon:'email',docs:[]},
      {estado:'Aprobada por Gerencia Técnica',actor:'Silvia Zuniga',fecha:'21 mar 2026 · 11:00',color:'var(--success)',icon:'check_circle',docs:['auth_020.pdf'],comentario:'Materiales contemplados en presupuesto inicial.'},
      {estado:'Solicitante notificado por correo',actor:'Sistema automático',fecha:'21 mar 2026 · 11:00',color:'var(--gold)',icon:'mark_email_read',docs:[]},
      {estado:'Asignado a Equipo Logístico Centro',actor:'Silvia Zuniga',fecha:'21 mar 2026 · 11:02',color:'#6a1b9a',icon:'local_shipping',docs:[]},
      {estado:'Despacho registrado',actor:'Equipo Logístico Centro',fecha:'24 mar 2026 · 07:00',color:'#00695c',icon:'inventory_2',docs:['Remision_DSP-020.pdf'],obs:'Despacho completo.'},
      {estado:'Entregada al solicitante',actor:'Equipo Logístico Centro',fecha:'25 mar 2026 · 15:00',color:'var(--navy)',icon:'local_shipping',docs:[]},
      {estado:'Recepción confirmada',actor:'Isaac Carranza',fecha:'25 mar 2026 · 16:30',color:'var(--navy)',icon:'verified',docs:[],obs:'Recibido todo conforme. Sin observaciones.'},
    ]
  },
];

// Lista colaborativa de necesidades
const NECESIDADES = [
  {id:'NEQ-01',autor:'Josue Vasquez',initials:'JV',proyecto:'Puente Choluteca',tipo:'Material',desc:'Andamios metálicos de 2m',cantidad:'6 unidades',monto:9600,fecha:'25 abr 2026',duplicado:false},
  {id:'NEQ-02',autor:'Lamine Yamal',initials:'LY',proyecto:'Puente Choluteca',tipo:'Equipo',desc:'Taladro percutor',cantidad:'2 unidades',monto:4200,fecha:'25 abr 2026',duplicado:false},
  {id:'NEQ-03',autor:'Carlos Costly',initials:'CC',proyecto:'Riego El Paraíso',tipo:'Material',desc:'Cemento Portland',cantidad:'50 bolsas',monto:7500,fecha:'26 abr 2026',duplicado:true,duplicadoPor:'SOL-2026-047'},
];

// ─────────────────────────────────────────────────────────────
// RENDER POR ROL
// ─────────────────────────────────────────────────────────────
const ROLE = sessionStorage.getItem('pron_role') || 'campo';

// Mapa código de solicitud → ID del proyecto asociado (acceso directo)
const SOL_PROYECTO = {
  'SOL-2026-047':'PRY-001', 'SOL-2026-046':'PRY-001', 'SOL-2026-020':'PRY-001',
  'SOL-2026-044':'PRY-002', 'SOL-2026-028':'PRY-002',
  'SOL-2026-039':'PRY-003', 'SOL-2026-035':'PRY-005',
};

/* Extrae del timeline la información derivada que se muestra en la tarjeta:
   motivo de rechazo, fecha de revisión (aprobación/rechazo) y quién realizó
   el envío/entrega (responsable de logística). */
function infoDerivada(s){
  const tl = s.timeline || [];
  const rechazo   = tl.find(t => /rechazada/i.test(t.estado||''));
  const revision  = tl.find(t => /(aprobada|rechazada)/i.test(t.estado||''));
  const entrega   = tl.find(t => /entregada/i.test(t.estado||''));
  const despacho  = tl.find(t => /despacho registrado/i.test(t.estado||''));
  return {
    motivoRechazo: (rechazo && rechazo.motivo) || s.motivoRechazo || null,
    fechaRevision: revision ? revision.fecha : null,
    enviadoPor:    (entrega && entrega.actor) || (despacho && despacho.actor) || null,
    fechaEntrega:  entrega ? entrega.fecha : null,
    docsAdjuntos:  tl.flatMap(t => (t.docs||[]).map(d => ({nombre:d, evento:t.estado}))),
  };
}

/* Orden DESCENDENTE por fecha corta "26 abr 2026" */
const _MESES_SOL = {ene:0,feb:1,mar:2,abr:3,may:4,jun:5,jul:6,ago:7,sep:8,oct:9,nov:10,dic:11};
function fechaSolValor(txt){
  const m = /(\d{1,2})\s+([a-z]+)\s+(\d{4})/i.exec(txt||'');
  if(!m) return 0;
  return parseInt(m[3])*10000 + ((_MESES_SOL[m[2].toLowerCase().slice(0,3)]??0)+1)*100 + parseInt(m[1]);
}
function ordenarDesc(lista){
  return [...lista].sort((a,b) => fechaSolValor(b.fecha) - fechaSolValor(a.fecha));
}

// Nombre del equipo de logística en sesión (para filtrar SOLO sus despachos)
const EQUIPO_LOGISTICA = ROLE === 'logistica'
  ? (sessionStorage.getItem('pron_nombre') || 'Equipo Logístico Centro')
  : null;

// Bandera: cuando el ADMIN entra desde el panel de Logística (botón
// "Despachar" o "Despachos Asignados"), debe ver la vista de logística
// y no su vista de gestión de solicitudes. Corrige el bug reportado.
const _forzarVistaLogistica = sessionStorage.getItem('pron_vista_logistica') === '1';
sessionStorage.removeItem('pron_vista_logistica');

// Deep-link: si viene un ID en pron_despachar, se abre directamente
// el modal de despacho de esa solicitud.
const _despacharDirecto = sessionStorage.getItem('pron_despachar');
sessionStorage.removeItem('pron_despachar');

document.addEventListener('DOMContentLoaded', () => {
  renderVista();
  // Abrir el modal de despacho automáticamente si se llegó con el botón "Despachar"
  if(_despacharDirecto){
    setTimeout(()=> abrirModalDespacho(_despacharDirecto), 150);
  }
  // Deep-link desde el detalle de un proyecto: resaltar la solicitud
  const abrirSol = sessionStorage.getItem('pron_open_solicitud');
  if(abrirSol){
    sessionStorage.removeItem('pron_open_solicitud');
    setTimeout(()=>{
      // Mostrar "Todas" para garantizar que la tarjeta esté visible
      const selEstado = document.getElementById('f-sol-estado');
      if(selEstado){ selEstado.value=''; renderListaSolicitudes(); }
      else if(document.getElementById('tabs-log')){
        // Vista logística: activar la pestaña "Todas" directamente
        const tabTodas = [...document.querySelectorAll('#tabs-log .tab')].find(t=>/todas/i.test(t.textContent));
        filtrarLog('todas', tabTodas || null);
      }
      setTimeout(()=>{
        const card = document.getElementById('card-'+abrirSol);
        if(card){
          card.style.outline = '2px solid var(--gold)';
          card.scrollIntoView({behavior:'smooth', block:'center'});
        }
      }, 120);
    }, 150);
  }
});

function renderVista(){
  if(_forzarVistaLogistica || ROLE === 'logistica') renderVistaLogistica();
  else if(ROLE === 'campo')     renderVistaCampo();
  else if(ROLE === 'admin_oficina' || ROLE === 'admin') renderVistaAdmin();
  else if(ROLE === 'empleado')  renderVistaEmpleado();
  else renderVistaCampo(); // fallback
}

// Solicitudes visibles para el equipo de logística en sesión:
// solo los despachos asignados a SU centro (si es rol logística).
// Equipos de logística por zona (visibles para el admin en su acceso)
const EQUIPOS_LOG = [
  {codigo:'EQL-01', nombre:'Equipo Logístico Norte',     zona:'Zona Norte · Atlántida / Colón'},
  {codigo:'EQL-02', nombre:'Equipo Logístico Centro',    zona:'Zona Centro · Francisco Morazán / Comayagua'},
  {codigo:'EQL-03', nombre:'Equipo Logístico Sur',       zona:'Zona Sur · Choluteca / Valle'},
  {codigo:'EQL-04', nombre:'Equipo Logístico Occidente', zona:'Zona Occidente · Copán / Lempira'},
];

/* Solicitudes visibles en la vista de logística:
   - Rol LOGÍSTICA: bloqueado a su propio centro.
   - ADMIN (acceso a logística): todos los equipos, con posibilidad de
     filtrar POR ZONA con el selector de equipos. */
function solicitudesLogistica(){
  if(EQUIPO_LOGISTICA) return SOLICITUDES.filter(s => s.equipoNombre === EQUIPO_LOGISTICA);
  const eq = (document.getElementById('f-log-equipo')||{}).value || '';
  return eq ? SOLICITUDES.filter(s => s.equipoNombre === eq) : SOLICITUDES;
}

// ──────────────────────────────────────────────────
// VISTA CAMPO
// ──────────────────────────────────────────────────
function renderVistaCampo(){
  const proyectos = [...new Set(solicitudesVisibles().map(s=>s.proyecto))].sort();
  document.getElementById('main-content').innerHTML = `
  <div class="flex-between mb-24 fade-up">
    <div class="section-head" style="margin-bottom:0">
      <h2>Solicitud de <em style="font-style:italic">Recursos</em></h2>
      <p>Gestiona las solicitudes de materiales, equipo y recursos de tus proyectos</p>
    </div>
    <button class="btn btn-gold" onclick="abrirModalSol()">
      <span class="material-symbols-rounded">add</span> Nueva Solicitud
    </button>
  </div>
  <!-- Filtros en línea (no pestañas): estado + proyecto + orden por fecha -->
  <div class="card mb-16 fade-up" style="padding:12px 18px">
    <div style="display:flex;gap:10px;align-items:center;justify-content:flex-end;flex-wrap:wrap">
      <span class="text-xs text-muted" id="sol-contador" style="margin-right:auto"></span>
      <button class="btn btn-outline btn-sm" id="btn-limpiar-sol" onclick="limpiarFiltrosSol()" style="display:none;white-space:nowrap">
        <span class="material-symbols-rounded" style="font-size:13px">clear</span> Limpiar filtros
      </button>
      <select class="form-control" id="f-sol-estado" style="width:auto;padding:7px 32px 7px 12px;font-size:13px" onchange="renderListaSolicitudes()">
        <option value="">Todas</option>
        <option value="pendiente">Pendientes</option>
        <option value="aprobada">Aprobadas</option>
        <option value="rechazada">Rechazadas</option>
        <option value="en_despacho">En despacho</option>
        <option value="entregada">Entregadas</option>
        <option value="confirmada">Confirmadas</option>
      </select>
      <select class="form-control" id="f-sol-proyecto" style="width:auto;padding:7px 32px 7px 12px;font-size:13px" onchange="renderListaSolicitudes()">
        <option value="">Todos los proyectos</option>
        ${proyectos.map(p=>`<option value="${p}">${p}</option>`).join('')}
      </select>
      <select class="form-control" id="f-sol-orden" style="width:auto;padding:7px 32px 7px 12px;font-size:13px" onchange="renderListaSolicitudes()" title="Orden por fecha de emisión">
        <option value="desc" selected>Fecha: más recientes</option>
        <option value="asc">Fecha: más antiguos</option>
      </select>
    </div>
  </div>
  <div id="lista-solicitudes" style="display:flex;flex-direction:column;gap:14px" class="fade-up"></div>`;
  renderListaSolicitudes();
}

/* Renderiza la lista de solicitudes de las vistas CAMPO y ADMIN aplicando
   los filtros en línea (estado, proyecto) y el orden por fecha elegido. */
/* Solicitudes visibles según el rol: el ADMIN las ve TODAS; el
   SUPERVISOR DE CAMPO solo las que ÉL emitió en sus proyectos. */
function solicitudesVisibles(){
  const esAdminSol = (ROLE==='admin_oficina'||ROLE==='admin');
  if(esAdminSol) return SOLICITUDES;
  const nombre = sessionStorage.getItem('pron_nombre') || '';
  return SOLICITUDES.filter(s => s.solicitante === nombre);
}

function renderListaSolicitudes(){
  const estado = (document.getElementById('f-sol-estado')||{}).value || '';
  const proy   = (document.getElementById('f-sol-proyecto')||{}).value || '';
  const orden  = (document.getElementById('f-sol-orden')||{}).value || 'desc';
  const vista  = (ROLE==='admin_oficina'||ROLE==='admin') && !_forzarVistaLogistica ? 'admin' : 'campo';

  let data = solicitudesVisibles().filter(s => (!estado || s.estado===estado) && (!proy || s.proyecto===proy));
  data = ordenarDesc(data);
  if(orden === 'asc') data.reverse(); // más antiguos primero

  const cont = document.getElementById('lista-solicitudes');
  if(!cont) return;
  cont.innerHTML = data.length
    ? data.map(s=>cardSolicitud(s, vista)).join('')
    : `<div class="card" style="text-align:center;padding:40px;color:var(--muted)">
        <span class="material-symbols-rounded" style="font-size:36px;display:block;margin-bottom:10px;color:var(--cream-dark)">inbox</span>
        No hay solicitudes con los filtros seleccionados.
       </div>`;

  const cc = document.getElementById('sol-contador');
  if(cc) cc.textContent = `${data.length} de ${solicitudesVisibles().length} solicitudes · ${solicitudesVisibles().filter(s=>s.estado==='pendiente').length} pendientes`;

  // "Limpiar filtros" solo con filtros aplicados (en admin el estado por
  // defecto es "Pendientes"; cualquier otro valor cuenta como filtro)
  const defEstado = vista==='admin' ? 'pendiente' : '';
  const hay = (estado !== defEstado) || proy || (orden !== 'desc');
  const btn = document.getElementById('btn-limpiar-sol');
  if(btn) btn.style.display = hay ? '' : 'none';
}

/* Restablece los filtros del módulo de solicitudes */
function limpiarFiltrosSol(){
  const vista  = (ROLE==='admin_oficina'||ROLE==='admin') && !_forzarVistaLogistica ? 'admin' : 'campo';
  document.getElementById('f-sol-estado').value = vista==='admin' ? 'pendiente' : '';
  document.getElementById('f-sol-proyecto').value = '';
  document.getElementById('f-sol-orden').value = 'desc';
  renderListaSolicitudes();
}

// ──────────────────────────────────────────────────
// VISTA ADMIN
// ──────────────────────────────────────────────────
function renderVistaAdmin(){
  const pendientes = SOLICITUDES.filter(s=>s.estado==='pendiente').length;
  const proyectos = [...new Set(SOLICITUDES.map(s=>s.proyecto))].sort();
  document.getElementById('main-content').innerHTML = `
  <div class="flex-between mb-24 fade-up">
    <div class="section-head" style="margin-bottom:0">
      <h2>Solicitudes <em style="font-style:italic">Recibidas</em></h2>
      <p>Revisión y aprobación de solicitudes de recursos de los proyectos</p>
    </div>
  </div>
  <!-- Filtros en línea (no pestañas): estado + proyecto + orden por fecha -->
  <div class="card mb-16 fade-up" style="padding:12px 18px">
    <div style="display:flex;gap:10px;align-items:center;justify-content:flex-end;flex-wrap:wrap">
      <span class="text-xs text-muted" id="sol-contador" style="margin-right:auto"></span>
      <button class="btn btn-outline btn-sm" id="btn-limpiar-sol" onclick="limpiarFiltrosSol()" style="display:none;white-space:nowrap">
        <span class="material-symbols-rounded" style="font-size:13px">clear</span> Limpiar filtros
      </button>
      <select class="form-control" id="f-sol-estado" style="width:auto;padding:7px 32px 7px 12px;font-size:13px" onchange="renderListaSolicitudes()">
        <option value="">Todas</option>
        <option value="pendiente" selected>Pendientes (${pendientes})</option>
        <option value="aprobada">Aprobadas</option>
        <option value="rechazada">Rechazadas</option>
        <option value="en_despacho">En despacho</option>
        <option value="entregada">Entregadas</option>
        <option value="confirmada">Confirmadas</option>
      </select>
      <select class="form-control" id="f-sol-proyecto" style="width:auto;padding:7px 32px 7px 12px;font-size:13px" onchange="renderListaSolicitudes()">
        <option value="">Todos los proyectos</option>
        ${proyectos.map(p=>`<option value="${p}">${p}</option>`).join('')}
      </select>
      <select class="form-control" id="f-sol-orden" style="width:auto;padding:7px 32px 7px 12px;font-size:13px" onchange="renderListaSolicitudes()" title="Orden por fecha de emisión">
        <option value="desc" selected>Fecha: más recientes</option>
        <option value="asc">Fecha: más antiguos</option>
      </select>
    </div>
  </div>
  <div id="lista-solicitudes" style="display:flex;flex-direction:column;gap:14px" class="fade-up"></div>`;
  renderListaSolicitudes();
}



// ──────────────────────────────────────────────────
// VISTA LOGÍSTICA
// ──────────────────────────────────────────────────
function renderVistaLogistica(){
  // Solo se muestran los despachos asignados a ESTE centro de logística
  const base      = solicitudesLogistica();
  const asignadas = base.filter(s=>['aprobada','en_despacho'].includes(s.estado));
  const subt = EQUIPO_LOGISTICA
    ? `Solicitudes aprobadas asignadas a <strong>${EQUIPO_LOGISTICA}</strong>`
    : 'Vista administrativa: logística de todos los equipos, por zonas';

  // Selector de equipos POR ZONA (visible solo para el admin; el rol
  // logística está bloqueado a su propio centro)
  const selectorEquipos = EQUIPO_LOGISTICA ? '' : `
    <select class="form-control" id="f-log-equipo" style="width:auto;padding:7px 32px 7px 12px;font-size:13px" onchange="filtrarLog(_estadoLog)" title="Filtrar por equipo de logística (zona)">
      <option value="">Todos los equipos (todas las zonas)</option>
      ${EQUIPOS_LOG.map(e=>`<option value="${e.nombre}">${e.codigo} — ${e.zona}</option>`).join('')}
    </select>`;

  document.getElementById('main-content').innerHTML = `
  <div class="flex-between mb-24 fade-up">
    <div class="section-head" style="margin-bottom:0">
      <h2>Despachos <em style="font-style:italic">Asignados</em></h2>
      <p>${subt}</p>
    </div>
    <div style="display:flex;gap:10px;align-items:center">
      ${selectorEquipos}
      <!-- Botón para despachar VARIAS solicitudes seleccionadas en un solo despacho -->
      <button class="btn btn-info" id="btn-despacho-multiple" onclick="abrirDespachoSeleccionadas()" style="display:none">
        <span class="material-symbols-rounded">local_shipping</span>
        Despachar seleccionadas (<span id="despacho-multi-count">0</span>)
      </button>
    </div>
  </div>
  <div class="tabs fade-up" id="tabs-log">
    <button class="tab active" onclick="filtrarLog('aprobada',this)">Por despachar <span class="nav-badge" style="background:var(--warning);color:var(--white);margin-left:4px">${asignadas.filter(s=>s.estado==='aprobada').length}</span></button>
    <button class="tab" onclick="filtrarLog('en_despacho',this)">En tránsito</button>
    <button class="tab" onclick="filtrarLog('todas',this)">Todas</button>
  </div>
  <div id="lista-solicitudes-log" style="display:flex;flex-direction:column;gap:14px" class="fade-up"></div>`;
  filtrarLog('aprobada');
}

let _estadoLog = 'aprobada'; // pestaña activa (para el selector de equipos)
function filtrarLog(estado, btn){
  _estadoLog = estado;
  if(btn){ document.querySelectorAll('#tabs-log .tab').forEach(t=>t.classList.remove('active')); btn.classList.add('active'); }
  const base = solicitudesLogistica();
  const data = estado === 'todas'
    ? base.filter(s=>['aprobada','en_despacho','entregada','confirmada'].includes(s.estado))
    : base.filter(s=>s.estado===estado);
  const c = document.getElementById('lista-solicitudes-log');
  c.innerHTML = data.length
    ? ordenarDesc(data).map(s=>cardSolicitud(s,'logistica')).join('')
    : `<div class="card" style="text-align:center;padding:40px;color:var(--muted)">
        <span class="material-symbols-rounded" style="font-size:36px;display:block;margin-bottom:10px;color:var(--cream-dark)">inbox</span>
        No hay despachos de este centro en esta categoría.
       </div>`;
  actualizarBarraSeleccion();
}

// ── Selección múltiple de despachos ──────────────
// Devuelve los IDs de las solicitudes marcadas con checkbox
function despachosSeleccionados(){
  return Array.from(document.querySelectorAll('.chk-despacho:checked')).map(c=>c.value);
}

// Muestra/oculta el botón "Despachar seleccionadas" según la selección
function actualizarBarraSeleccion(){
  const btn = document.getElementById('btn-despacho-multiple');
  if(!btn) return;
  const n = despachosSeleccionados().length;
  document.getElementById('despacho-multi-count').textContent = n;
  btn.style.display = n > 1 ? 'inline-flex' : 'none';
}

// Abre el modal de despacho con TODAS las solicitudes seleccionadas
function abrirDespachoSeleccionadas(){
  const ids = despachosSeleccionados();
  if(ids.length === 0){ showToast('Selecciona al menos una solicitud para despachar','warning'); return; }
  abrirModalDespacho(ids);
}

// ──────────────────────────────────────────────────
// VISTA EMPLEADO (lista de necesidades)
// ──────────────────────────────────────────────────
function renderVistaEmpleado(){
  document.getElementById('main-content').innerHTML = `
  <div class="flex-between mb-24 fade-up">
    <div class="section-head" style="margin-bottom:0">
      <h2>Lista de <em style="font-style:italic">Necesidades</em></h2>
      <p>Propón recursos que el equipo necesita. El Supervisor de Campo revisa y convierte en solicitud oficial.</p>
    </div>
    <button class="btn btn-gold" onclick="document.getElementById('modal-necesidad').classList.add('open')">
      <span class="material-symbols-rounded">add</span> Proponer necesidad
    </button>
  </div>
  <div id="lista-necesidades-emp" style="display:flex;flex-direction:column;gap:10px" class="fade-up"></div>`;
  renderNecesidades('lista-necesidades-emp', false);
}

// ──────────────────────────────────────────────────
// RENDERIZAR CARD DE SOLICITUD
// ──────────────────────────────────────────────────
function cardSolicitud(s, vistaRol){
  const estadoConf = {
    pendiente:   {label:'Pendiente',    cls:'badge-warning',  icon:'pending'},
    aprobada:    {label:'Aprobada',     cls:'badge-success',  icon:'check_circle'},
    rechazada:   {label:'Rechazada',    cls:'badge-danger',   icon:'cancel'},
    en_despacho: {label:'En despacho',  cls:'badge-dispatch', icon:'local_shipping'},
    entregada:   {label:'Entregada',    cls:'badge-delivered',icon:'inventory_2'},
    confirmada:  {label:'Confirmada',   cls:'badge-confirmed',icon:'verified'},
  };
  const ec = estadoConf[s.estado] || estadoConf.pendiente;
  const total = s.items.reduce((a,i)=>a+i.monto,0);
  const extra = infoDerivada(s); // motivo de rechazo, fechas y responsable de envío
  // NOTA: por corrección de la Gerencia, las tarjetas ya no muestran
  // montos por ítem ni el total estimado de la solicitud.

  // Botones de acción según rol y estado
  let acciones = '';
  if((vistaRol === 'admin_oficina' || vistaRol === 'admin') && s.estado === 'pendiente'){
    acciones = `
      <button class="btn btn-danger btn-sm" onclick="abrirModalRechazar('${s.id}')">
        <span class="material-symbols-rounded" style="font-size:14px">cancel</span> Rechazar
      </button>
      <button class="btn btn-success btn-sm" onclick="abrirModalAprobar('${s.id}')">
        <span class="material-symbols-rounded" style="font-size:14px">check_circle</span> Aprobar
      </button>`;
  } else if(vistaRol === 'logistica' && s.estado === 'aprobada'){
    acciones = `<button class="btn btn-info btn-sm" onclick="abrirModalDespacho('${s.id}')">
      <span class="material-symbols-rounded" style="font-size:14px">local_shipping</span> Registrar despacho
    </button>`;
  } else if(vistaRol === 'campo' && s.estado === 'entregada'){
    acciones = `<button class="btn btn-success btn-sm" onclick="abrirModalRecepcion('${s.id}')">
      <span class="material-symbols-rounded" style="font-size:14px">verified</span> Confirmar recepción
    </button>`;
  }

  // Tabla de ítems
  const itemsHtml = s.items.map(it=>`
    <tr>
      <td style="padding:7px 12px;font-size:12.5px">${it.tipo}</td>
      <td style="padding:7px 12px;font-size:12.5px">${it.desc}</td>
      <td style="padding:7px 12px;font-size:12.5px">${it.cantidad}</td>
    </tr>`).join('');

  // (El bloque visual del historial de estados fue removido por corrección;
  //  los eventos siguen guardándose en s.timeline para trazabilidad interna.)

  // Checkbox de selección múltiple: solo en vista logística y estado "aprobada"
  const chkSeleccion = (vistaRol === 'logistica' && s.estado === 'aprobada')
    ? `<input type="checkbox" class="chk-despacho" value="${s.id}" onchange="actualizarBarraSeleccion()"
         title="Seleccionar para despacho múltiple"
         style="width:16px;height:16px;accent-color:var(--navy);margin-right:4px;cursor:pointer">`
    : '';

  return `
  <div class="sol-card" id="card-${s.id}">
    <div class="flex-between mb-12">
      <div>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          ${chkSeleccion}
          <span style="font-size:11px;font-weight:600;color:var(--muted)">${s.id}</span>
          <span class="badge ${ec.cls}">
            <span class="material-symbols-rounded" style="font-size:12px">${ec.icon}</span>${ec.label}
          </span>
          ${s.equipoNombre?`<span class="badge" style="background:#f3e8ff;color:#6a1b9a;font-size:10.5px"><span class="material-symbols-rounded" style="font-size:11px">local_shipping</span>${s.equipoNombre}</span>`:''}
        </div>
        <div style="font-size:16px;font-weight:600;color:var(--navy);margin-top:6px">${s.proyecto}</div>
        <!-- Fechas de emisión y de revisión (aprobación/rechazo) -->
        <div class="text-xs text-muted mt-4" style="display:flex;gap:14px;flex-wrap:wrap">
          <span><span class="material-symbols-rounded" style="font-size:12px;vertical-align:-2px">person</span> ${s.solicitante}</span>
          <span><span class="material-symbols-rounded" style="font-size:12px;vertical-align:-2px">calendar_today</span> Emitida: <strong>${s.fecha}</strong></span>
          <span><span class="material-symbols-rounded" style="font-size:12px;vertical-align:-2px">event_available</span> Revisada: <strong style="color:${extra.fechaRevision?'var(--success)':'var(--muted)'}">${extra.fechaRevision||'Pendiente'}</strong></span>
        </div>
      </div>
      <div style="text-align:right;display:flex;flex-direction:column;align-items:flex-end;gap:8px">
        <!-- Acceso directo al proyecto asociado -->
        ${SOL_PROYECTO[s.id]?`
        <a href="proyectos.html" class="btn btn-outline btn-sm" style="text-decoration:none"
           onclick="sessionStorage.setItem('pron_open_proyecto','${SOL_PROYECTO[s.id]}')" title="Abrir el proyecto asociado">
          <span class="material-symbols-rounded" style="font-size:13px">folder_open</span> Ver proyecto
        </a>`:''}
      </div>
    </div>

    ${extra.motivoRechazo && s.estado==='rechazada' ? `
    <!-- Motivo del rechazo (visible para admin Y supervisor de campo) -->
    <div style="background:var(--danger-bg);border-left:3px solid var(--danger);border-radius:var(--radius);padding:10px 14px;margin-bottom:12px">
      <div style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--danger);margin-bottom:3px">
        <span class="material-symbols-rounded" style="font-size:12px;vertical-align:-2px">cancel</span> Motivo del rechazo
      </div>
      <div style="font-size:12.5px;color:var(--text);line-height:1.55">${extra.motivoRechazo}</div>
    </div>`:''}

    <div class="text-sm text-muted mb-12" style="line-height:1.6"><strong>Justificación:</strong> ${s.justificacion}</div>

    <!-- Ítems -->
    <div style="border:1px solid var(--cream-dark);border-radius:var(--radius);overflow:hidden;margin-bottom:12px">
      <table style="width:100%;border-collapse:collapse">
        <thead><tr style="background:var(--cream)">
          <th style="padding:7px 12px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.7px;color:var(--muted);font-weight:600">Tipo</th>
          <th style="padding:7px 12px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.7px;color:var(--muted);font-weight:600">Recurso</th>
          <th style="padding:7px 12px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.7px;color:var(--muted);font-weight:600">Cantidad</th>
        </tr></thead>
        <tbody style="font-size:12.5px">${itemsHtml}</tbody>
      </table>
    </div>

    <!-- NOTA: el "Historial de estados" visual sigue removido (corrección);
         los eventos permanecen en s.timeline para trazabilidad interna. -->

    <!-- Footer: documentos e imágenes adjuntos + acciones (como en Finalizados).
         Cada adjunto abre el visor con el código de la solicitud y su
         justificación al pie (estilo Facebook). -->
    <div style="display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-top:14px;padding-top:14px;border-top:1px solid var(--cream-dark)">
      ${vistaRol==='logistica' ? '<span class="text-xs text-muted">Detalle de la solicitud a despachar</span>' : extra.docsAdjuntos.length?`
      <div>
        <div style="font-size:10.5px;font-weight:600;text-transform:uppercase;letter-spacing:.6px;color:var(--muted);margin-bottom:6px">Documentos adjuntos</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${extra.docsAdjuntos.map(d=>`
          <div class="evidence-thumb" style="width:70px;height:52px;border-radius:8px;background:var(--cream-dark);display:flex;align-items:center;justify-content:center;font-size:20px;color:var(--muted);cursor:pointer"
               title="${d.nombre} · ${d.evento}"
               onclick='abrirVisor({tipo:"${/\.(jpg|jpeg|png)$/i.test(d.nombre)?"img":"pdf"}",nombre:"${d.nombre}",codigo:"${s.id}",tipoCodigo:"solicitud",descripcion:${JSON.stringify('Solicitud de '+s.proyecto+' — '+s.justificacion)}})'>
            <span class="material-symbols-rounded">${/\.(jpg|jpeg|png)$/i.test(d.nombre)?'image':'picture_as_pdf'}</span>
          </div>`).join('')}
        </div>
      </div>`:'<span class="text-xs text-muted">Sin documentos adjuntos</span>'}
      ${acciones?`<div style="display:flex;gap:8px">${acciones}</div>`:''}
    </div>
  </div>`;
}

// ──────────────────────────────────────────────────
// STAT CARDS
// ──────────────────────────────────────────────────
function statCard(label,val,tipo,icon){
  const conf={
    warning:{c:'var(--warning)',bg:'var(--warning-bg)'},
    success:{c:'var(--success)',bg:'var(--success-bg)'},
    danger:{c:'var(--danger)',bg:'var(--danger-bg)'},
    dispatch:{c:'#6a1b9a',bg:'#f3e8ff'},
    delivered:{c:'#00695c',bg:'#e0f2f1'},
    confirmed:{c:'var(--navy)',bg:'rgba(13,27,62,0.07)'},
  };
  const t=conf[tipo]||conf.warning;
  return `<div class="card" style="padding:14px 16px;text-align:center">
    <div style="width:32px;height:32px;border-radius:8px;background:${t.bg};display:flex;align-items:center;justify-content:center;margin:0 auto 8px">
      <span class="material-symbols-rounded" style="font-size:16px;color:${t.c}">${icon}</span>
    </div>
    <div style="font-family:var(--font-serif);font-size:24px;font-weight:300;color:${t.c}">${val}</div>
    <div style="font-size:10.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;margin-top:2px">${label}</div>
  </div>`;
}

// ──────────────────────────────────────────────────
// LISTA DE NECESIDADES (modal para campo)
// ──────────────────────────────────────────────────


function renderNecesidades(containerId, conCheckbox){
  const c = document.getElementById(containerId);
  if(!c) return;
  c.innerHTML = NECESIDADES.map((n,idx)=>`
  <div class="need-item ${n.duplicado?'duplicado':''}">
    ${conCheckbox?`<input type="checkbox" id="nec-chk-${idx}" style="width:16px;height:16px;accent-color:var(--navy);flex-shrink:0" ${n.duplicado?'':'checked'}>`:''}
    <div class="need-avatar">${n.initials}</div>
    <div style="flex:1">
      <div style="font-size:13px;font-weight:600;color:var(--text)">${n.desc}</div>
      <div class="text-xs text-muted">${n.autor} · ${n.proyecto} · ${n.tipo} · ${n.cantidad}</div>
      ${n.duplicado?`<div style="font-size:11px;color:var(--warning);margin-top:2px;display:flex;align-items:center;gap:4px">
        <span class="material-symbols-rounded" style="font-size:13px">warning</span>
        Este ítem ya está incluido en ${n.duplicadoPor}
      </div>`:''}
    </div>
    <div style="font-size:13px;font-weight:600;color:var(--navy);white-space:nowrap">L ${n.monto.toLocaleString('es-HN',{minimumFractionDigits:2})}</div>
    ${conCheckbox?`<button type="button" onclick="NECESIDADES.splice(${idx},1);renderNecesidades('${containerId}',${conCheckbox})" style="background:none;border:none;cursor:pointer;color:var(--danger)"><span class="material-symbols-rounded" style="font-size:18px">delete</span></button>`:''}
  </div>`).join('') || '<div style="text-align:center;padding:24px;color:var(--muted);font-size:13px">No hay propuestas pendientes.</div>';
}



// ──────────────────────────────────────────────────
// MODAL NUEVA SOLICITUD (lista simple: Tipo / Recurso / Cantidad)
// ──────────────────────────────────────────────────
let itemCount = 0;
function abrirModalSol(){
  FormUtils.limpiarErrores(document.getElementById('modal-sol'));
  // Asegurar al menos una fila de ítem vacía al abrir
  if(!document.querySelectorAll('#sol-items-body tr').length) agregarFilaItem();
  document.getElementById('modal-sol').classList.add('open');
  setTimeout(()=>document.getElementById('sol-proyecto').focus(), 80);
}

/* ── Lista dinámica de ítems de la solicitud (Tipo / Recurso / Cantidad) ── */
function agregarFilaItem(){
  const tb = document.getElementById('sol-items-body');
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td style="padding:6px 6px 6px 0">
      <select class="form-control sol-item-tipo" style="font-size:13px;padding:7px 28px 7px 10px">
        <option value="">Tipo...</option>
        <option value="Material">Material</option>
        <option value="Equipo">Equipo</option>
        <option value="Financiero">Financiero</option>
      </select>
    </td>
    <td style="padding:6px"><input type="text" class="form-control sol-item-recurso" style="font-size:13px" placeholder="Ej. Cemento Portland 42.5 kg"></td>
    <td style="padding:6px"><input type="text" class="form-control sol-item-cantidad" style="font-size:13px;width:110px" placeholder="150 bolsas"></td>
    <td style="padding:6px 0 6px 6px;text-align:right">
      <button type="button" class="btn btn-outline btn-sm" title="Quitar recurso" onclick="this.closest('tr').remove()" style="padding:6px 8px">✕</button>
    </td>`;
  tb.appendChild(tr);
  tr.querySelector('.sol-item-tipo').focus();
}













function cerrarModalSol(){
  FormUtils.limpiarErrores(document.getElementById('modal-sol'));
  document.getElementById('modal-sol').classList.remove('open');
}

function enviarSolicitudOficial(){
  let errores = FormUtils.validar([
    {id:'sol-proyecto',      msg:'Selecciona el proyecto de la solicitud.'},
    {id:'sol-justificacion', msg:'Escribe la justificación de la solicitud.'},
  ]);

  // Leer la LISTA de recursos (Tipo / Recurso / Cantidad); al menos
  // una fila completa es obligatoria
  const filas = [...document.querySelectorAll('#sol-items-body tr')];
  const items = [];
  filas.forEach(tr=>{
    const tipo = tr.querySelector('.sol-item-tipo').value;
    const rec  = tr.querySelector('.sol-item-recurso').value.trim();
    const cant = tr.querySelector('.sol-item-cantidad').value.trim();
    if(tipo && rec && cant) items.push({tipo, desc:rec, cantidad:cant, monto:0});
    else if(tipo || rec || cant){
      // Fila incompleta: marcar sus campos vacíos
      if(!tipo) FormUtils.marcarInvalido(tr.querySelector('.sol-item-tipo'), 'Selecciona el tipo.');
      if(!rec)  FormUtils.marcarInvalido(tr.querySelector('.sol-item-recurso'), 'Describe el recurso.');
      if(!cant) FormUtils.marcarInvalido(tr.querySelector('.sol-item-cantidad'), 'Indica la cantidad.');
      errores++;
    }
  });
  if(items.length === 0 && !errores){
    showToast('Agrega al menos un recurso a la lista (Tipo, Recurso y Cantidad).','warning');
    return;
  }
  if(errores){
    showToast(`No se pudo enviar: hay ${errores} campo(s) por completar.`,'warning');
    return; // Los datos escritos se conservan
  }

  const proyecto = document.getElementById('sol-proyecto').value;
  const justif   = document.getElementById('sol-justificacion').value.trim();
  const docsAdjuntos = [...document.querySelectorAll('#sol-files .file-chip')].map(c=>c.dataset.filename||'adjunto');

  // Registrar la solicitud en estado PENDIENTE
  const newId = 'SOL-2026-0' + (48 + SOLICITUDES.filter(x=>x.id.startsWith('SOL-2026-0')).length % 50);
  SOLICITUDES.unshift({
    id:newId, proyecto, solicitante: sessionStorage.getItem('pron_nombre')||'Supervisor',
    fecha: new Date().toLocaleDateString('es-HN',{day:'2-digit',month:'short',year:'numeric'}),
    estado:'pendiente', justificacion:justif, items,
    timeline:[{estado:'Solicitud creada', actor: sessionStorage.getItem('pron_nombre')||'Supervisor',
               fecha:new Date().toLocaleDateString('es-HN',{day:'2-digit',month:'short',year:'numeric'}),
               docs: docsAdjuntos}],
  });

  cerrarModalSol();
  // Limpiar SOLO tras un envío exitoso
  document.getElementById('sol-proyecto').value='';
  document.getElementById('sol-justificacion').value='';
  document.getElementById('sol-items-body').innerHTML='';
  const sf=document.getElementById('sol-files'); if(sf) sf.innerHTML='';
  showToast(`Solicitud ${newId} registrada y enviada${docsAdjuntos.length?` · ${docsAdjuntos.length} documento(s) adjunto(s)`:''} · Gerencia Técnica notificada`, 'success');
  renderListaSolicitudes();
}

// funciones stub para compatibilidad
function agregarItemSol(){}
function filaItem(){}
function calcularTotal(){}

// ──────────────────────────────────────────────────
// PROPONER NECESIDAD (empleado)
// ──────────────────────────────────────────────────
function proponerNecesidad(){
  // Validación con mensajes por campo; los valores escritos se conservan.
  const errores = FormUtils.validar([
    {id:'need-proyecto', msg:'Selecciona el proyecto.'},
    {id:'need-desc',     msg:'Describe el recurso que necesitas.'},
    {id:'need-cantidad', msg:'Indica la cantidad requerida.'},
    {id:'need-monto',    msg:'Indica un monto estimado mayor a cero.', cond:v=>parseFloat(v)>0},
  ]);
  if(errores){ showToast(`Faltan ${errores} campo(s) obligatorio(s) por completar.`,'warning'); return; }

  const desc  = document.getElementById('need-desc').value.trim();
  const proy  = document.getElementById('need-proyecto').value;

  // Verificar duplicado
  const yaExiste = NECESIDADES.find(n=>n.desc.toLowerCase()===desc.toLowerCase());
  const enSol    = SOLICITUDES.find(s=>s.items.find(i=>i.desc.toLowerCase()===desc.toLowerCase()));

  const nombre   = sessionStorage.getItem('pron_nombre')||'Empleado';
  const initials = sessionStorage.getItem('pron_initials')||'EM';

  if(enSol||yaExiste){
    showToast(`⚠ "${desc}" ya fue solicitado anteriormente — revisa el historial`, 'warning');
    const nv={
      id:'NEQ-0'+(NECESIDADES.length+1),autor:nombre,initials,proyecto:proy,
      tipo:document.getElementById('need-tipo').value,desc,
      cantidad:document.getElementById('need-cantidad').value,
      monto:parseFloat(document.getElementById('need-monto').value)||0,
      fecha:'Hoy',duplicado:true,duplicadoPor:enSol?enSol.id:'Lista actual'
    };
    NECESIDADES.push(nv);
  } else {
    NECESIDADES.push({
      id:'NEQ-0'+(NECESIDADES.length+1),autor:nombre,initials,proyecto:proy,
      tipo:document.getElementById('need-tipo').value,desc,
      cantidad:document.getElementById('need-cantidad').value,
      monto:parseFloat(document.getElementById('need-monto').value)||0,
      fecha:'Hoy',duplicado:false
    });
    showToast('Necesidad propuesta enviada al Supervisor de Campo','success');
  }
  document.getElementById('modal-necesidad').classList.remove('open');
  if(ROLE==='empleado') renderNecesidades('lista-necesidades-emp',false);
}

// ──────────────────────────────────────────────────
// MODALES ADMIN
// ──────────────────────────────────────────────────
let _solActiva = null;
function abrirModalAprobar(id){
  _solActiva=id;
  document.getElementById('aprob-comentario').value='';
  document.getElementById('aprob-files').innerHTML='';
  document.getElementById('aprob-logistica').value='';
  document.getElementById('modal-aprobar').classList.add('open');
}

function confirmarAprobacion(){
  // Validación con mensaje bajo el campo (el texto escrito se conserva)
  const errores = FormUtils.validar([
    {id:'aprob-comentario', msg:'El comentario de aprobación es obligatorio.'},
    {id:'aprob-logistica',  msg:'Selecciona el equipo de logística que atenderá el despacho.'},
  ]);
  if(errores){ showToast(`Faltan ${errores} campo(s) obligatorio(s) por completar.`,'warning'); return; }
  const com = document.getElementById('aprob-comentario').value.trim();
  const log = document.getElementById('aprob-logistica').value;
  const sol = SOLICITUDES.find(s=>s.id===_solActiva);
  if(sol){
    sol.estado='aprobada';
    sol.equipoNombre = log ? document.getElementById('aprob-logistica').selectedOptions[0].text : null;
    sol.timeline.push(
      {estado:'Aprobada por Gerencia Técnica',actor:sessionStorage.getItem('pron_nombre')||'Gerencia Técnica',fecha:'Ahora',color:'var(--success)',icon:'check_circle',docs:[],comentario:com},
      {estado:'Solicitante notificado por correo (icarranza@pronaders.gob.hn)',actor:'Sistema automático',fecha:'Ahora',color:'var(--gold)',icon:'mark_email_read',docs:[]}
    );
    if(log) sol.timeline.push({estado:`Asignado a ${sol.equipoNombre}`,actor:sessionStorage.getItem('pron_nombre')||'Gerencia Técnica',fecha:'Ahora',color:'#6a1b9a',icon:'local_shipping',docs:[]});
  }
  document.getElementById('modal-aprobar').classList.remove('open');
  renderVistaAdmin();
  showToast(`Solicitud ${_solActiva} aprobada y registrada · El solicitante fue notificado por correo`, 'success');
  _solActiva=null;
}

function abrirModalRechazar(id){
  _solActiva=id;
  document.getElementById('rechazo-motivo').value='';
  document.getElementById('modal-rechazar').classList.add('open');
}

function confirmarRechazo(){
  // Validación: el motivo es obligatorio y se conserva si hay error
  const errores = FormUtils.validar([
    {id:'rechazo-motivo', msg:'Indica claramente el motivo del rechazo.'},
  ]);
  if(errores) return;
  const motivo = document.getElementById('rechazo-motivo').value.trim();
  const sol = SOLICITUDES.find(s=>s.id===_solActiva);
  if(sol){
    sol.estado='rechazada';
    sol.timeline.push(
      {estado:'Rechazada por Gerencia Técnica',actor:sessionStorage.getItem('pron_nombre')||'Gerencia Técnica',fecha:'Ahora',color:'var(--danger)',icon:'cancel',docs:[],motivo},
      {estado:'Solicitante notificado por correo (icarranza@pronaders.gob.hn)',actor:'Sistema automático',fecha:'Ahora',color:'var(--gold)',icon:'mark_email_read',docs:[]}
    );
  }
  document.getElementById('modal-rechazar').classList.remove('open');
  renderVistaAdmin();
  showToast(`Solicitud ${_solActiva} rechazada · El solicitante fue notificado por correo`, 'info');
  _solActiva=null;
}

// ──────────────────────────────────────────────────
// MODALES LOGÍSTICA
// ──────────────────────────────────────────────────
/* Abre el modal de despacho. Acepta:
   - un ID de solicitud ('SOL-2026-047')  → despacho individual
   - un arreglo de IDs (['SOL-...','SOL-...']) → despacho múltiple
   Un mismo número de despacho (DSP) agrupa todas las solicitudes. */
function abrirModalDespacho(ids){
  const lista = Array.isArray(ids) ? ids : [ids];
  // Validar que las solicitudes existan y estén aprobadas
  const validas = lista.filter(id => SOLICITUDES.some(s=>s.id===id && s.estado==='aprobada'));
  if(validas.length === 0){
    const existe = lista.map(id=>SOLICITUDES.find(s=>s.id===id)).find(Boolean);
    showToast(existe
      ? `La solicitud ${existe.id} no está lista para despacho (estado actual: ${existe.estado}).`
      : 'No se encontró ninguna solicitud aprobada pendiente de despacho.','warning');
    return;
  }
  _solActiva = validas;

  const n = SOLICITUDES.filter(s=>['en_despacho','entregada','confirmada'].includes(s.estado)).length + 1;
  document.getElementById('despacho-num').textContent = `DSP-2026-${String(n).padStart(4,'0')}`;

  // Mostrar en el modal qué solicitudes se incluirán en este despacho
  const resumen = document.getElementById('despacho-sols');
  if(resumen){
    resumen.innerHTML = validas.map(id=>{
      const s = SOLICITUDES.find(x=>x.id===id);
      return `<span style="display:inline-flex;align-items:center;gap:5px;background:var(--white);border:1px solid var(--cream-dark);border-radius:6px;padding:4px 9px;font-size:11.5px;color:var(--navy)">
        <span class="material-symbols-rounded" style="font-size:13px">inventory_2</span>${id} · ${s.proyecto}</span>`;
    }).join('');
  }

  // Limpiar el formulario y abrir el modal
  FormUtils.limpiarErrores(document.getElementById('modal-despacho'));
  document.getElementById('despacho-fecha').value='';
  document.getElementById('despacho-responsable').value='';
  document.getElementById('despacho-obs').value='';
  document.getElementById('remision-files').innerHTML='';
  document.getElementById('modal-despacho').classList.add('open');
}

function confirmarDespacho(){
  // Validación con mensajes por campo (los datos NO se borran si hay error)
  let errores = FormUtils.validar([
    {id:'despacho-fecha',       msg:'La fecha de entrega es obligatoria.'},
    {id:'despacho-responsable', msg:'Indica el nombre del responsable de la entrega.'},
  ]);
  const files = document.getElementById('remision-files').querySelectorAll('.file-chip');
  if(!files.length){
    showToast('Debes adjuntar la remisión firmada para registrar el despacho.','warning');
    errores++;
  }
  if(errores){ showToast(`Faltan ${errores} campo(s) obligatorio(s) por completar.`,'warning'); return; }

  const fecha = document.getElementById('despacho-fecha').value;
  const resp  = document.getElementById('despacho-responsable').value.trim();
  const obs   = document.getElementById('despacho-obs').value;
  const ids   = Array.isArray(_solActiva) ? _solActiva : [_solActiva];
  const dsp   = document.getElementById('despacho-num').textContent;

  // Registrar el despacho en TODAS las solicitudes incluidas
  ids.forEach(id=>{
    const sol = SOLICITUDES.find(s=>s.id===id);
    if(!sol) return;
    sol.timeline.push({estado:`Despacho registrado (${dsp})`,actor:resp,fecha,color:'#00695c',icon:'inventory_2',docs:['Remision_firmada.pdf'],obs});
    sol.timeline.push({estado:'Entregada al solicitante',actor:resp,fecha,color:'var(--navy)',icon:'local_shipping',docs:[]});
    sol.estado='entregada';
  });

  document.getElementById('modal-despacho').classList.remove('open');
  renderVistaLogistica();
  // Mensaje de registro exitoso
  showToast(ids.length>1
    ? `Despacho ${dsp} registrado con ${ids.length} solicitudes. Añadido al historial de despachos.`
    : `Despacho ${dsp} registrado para ${ids[0]}. Añadido al historial de despachos.`,'success');
  _solActiva=null;
}

// ──────────────────────────────────────────────────
// MODAL RECEPCIÓN (Campo)
// ──────────────────────────────────────────────────
function abrirModalRecepcion(id){
  _solActiva=id;
  document.getElementById('recep-conformidad').value='total';
  document.getElementById('recep-obs').value='';
  document.getElementById('modal-recepcion').classList.add('open');
}

function confirmarRecepcion(){
  const conf = document.getElementById('recep-conformidad').value;
  const obs  = document.getElementById('recep-obs').value.trim();
  const sol  = SOLICITUDES.find(s=>s.id===_solActiva);
  const confLabel = {total:'Recepción total conforme',parcial:'Recepción parcial con observaciones',problema:'Problemas con la entrega'}[conf];
  if(sol){
    sol.estado='confirmada';
    sol.timeline.push({estado:`Recepción confirmada — ${confLabel}`,actor:sessionStorage.getItem('pron_nombre')||'Isaac Carranza',fecha:'Ahora',color:'var(--navy)',icon:'verified',docs:[],obs:obs||undefined});
  }
  document.getElementById('modal-recepcion').classList.remove('open');
  renderVistaCampo();
  showToast('Recepción confirmada. Solicitud cerrada con evidencia completa.','success');
  _solActiva=null;
}

// ──────────────────────────────────────────────────
// HELPERS: ARCHIVOS, TOAST
// ──────────────────────────────────────────────────
/* Muestra los archivos seleccionados/arrastrados como "chips" con
   nombre, tamaño y botón para quitarlos. Guarda el nombre del archivo
   en data-filename para poder registrarlo al enviar el formulario. */
function mostrarArchivos(containerId, files){
  const c=document.getElementById(containerId);
  if(!c || !files || !files.length) return;
  Array.from(files).forEach(f=>{
    const d=document.createElement('div');
    d.className='file-chip';
    d.dataset.filename=f.name;
    d.style.cssText='display:flex;align-items:center;gap:8px;background:var(--cream);border:1px solid var(--cream-dark);border-radius:8px;padding:6px 10px;font-size:12px';
    d.innerHTML=`<span class="material-symbols-rounded" style="font-size:16px;color:var(--navy)">description</span>
      <span style="flex:1;color:var(--text)">${f.name}</span>
      <span style="color:var(--muted)">${(f.size/1024).toFixed(0)} KB</span>
      <button type="button" onclick="this.parentElement.remove()" style="background:none;border:none;cursor:pointer;color:var(--muted)">✕</button>`;
    c.appendChild(d);
  });
}

/* Adjuntos del formulario de nueva solicitud */
function mostrarArchivosSol(files){ mostrarArchivos('sol-files', files); }

function handleDropAprob(e){
  e.preventDefault();
  mostrarArchivos('aprob-files',e.dataTransfer.files);
}

let _toastTimer;
function showToast(msg, tipo='success'){
  const t=document.getElementById('toast');
  const icons={success:'check_circle',warning:'warning',info:'mail'};
  t.className=`toast ${tipo}`;
  document.getElementById('toast-icon').textContent=icons[tipo]||'check_circle';
  document.getElementById('toast-msg').textContent=msg;
  t.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer=setTimeout(()=>t.classList.remove('show'),4500);
}
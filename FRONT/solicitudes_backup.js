(function(){
  const role     = sessionStorage.getItem('pron_role')     || 'campo';
  const nombre   = sessionStorage.getItem('pron_nombre')   || 'Usuario';
  const initials = sessionStorage.getItem('pron_initials') || 'US';
  const ROLE_LABELS = {admin:'Administrador del Sistema',oficina:'Supervisor de Oficina',campo:'Supervisor de Campo',empleado:'Empleado',logistica:'Equipo de Logística'};
  const u = { name:nombre, initials:initials, roleLabel:ROLE_LABELS[role]||'Empleado' };

  const NAV = {
    campo:[
      {section:'Principal'},
      {label:'Dashboard',icon:'dashboard',href:'dashboard-campo.html'},
      {section:'Mis Módulos'},
      {label:'Reportes de Avance',icon:'bar_chart',href:'reportes.html'},
      {label:'Solicitud de Recursos',icon:'inventory_2',href:'solicitudes.html',badge:'2'},
      {label:'Proyecciones',icon:'timeline',href:'proyecciones.html'},
      {label:'Mensajes',icon:'forum',href:'mensajes.html',badge:'3'},
    ],
    empleado:[
      {section:'Principal'},
      {label:'Dashboard',icon:'dashboard',href:'dashboard-campo.html'},
      {section:'Mis Módulos'},
      {label:'Lista de Necesidades',icon:'checklist',href:'solicitudes.html'},
      {label:'Mensajes',icon:'forum',href:'mensajes.html'},
    ],
    oficina:[
      {section:'Principal'},
      {label:'Dashboard',icon:'dashboard',href:'dashboard-oficina.html'},
      {section:'Gestión'},
      {label:'Proyectos',icon:'folder_open',href:'proyectos.html'},
      {label:'Reportes',icon:'bar_chart',href:'reportes.html',badge:'5'},
      {label:'Solicitudes',icon:'inventory_2',href:'solicitudes.html',badge:'4'},
      {label:'Proyecciones',icon:'timeline',href:'proyecciones.html'},
      {label:'Mensajes',icon:'forum',href:'mensajes.html',badge:'2'},
    ],
    logistica:[
      {section:'Principal'},
      {label:'Dashboard',icon:'dashboard',href:'dashboard-logistica.html'},
      {section:'Operaciones'},
      {label:'Despachos Asignados',icon:'local_shipping',href:'solicitudes.html',badge:'3'},
      {label:'Mensajes',icon:'forum',href:'mensajes.html'},
    ],
    admin:[
      {section:'Principal'},
      {label:'Dashboard',icon:'dashboard',href:'dashboard-admin.html'},
      {section:'Administración'},
      {label:'Gestión de Proyectos',icon:'folder_open',href:'proyectos.html'},
      {label:'Usuarios',icon:'manage_accounts',href:'usuarios.html'},
      {label:'Proyectos Finalizados',icon:'inventory',href:'finalizados.html'},
      {section:'Monitoreo'},
      {label:'Reportes',icon:'bar_chart',href:'reportes.html'},
      {label:'Solicitudes',icon:'inventory_2',href:'solicitudes.html'},
      {label:'Proyecciones',icon:'timeline',href:'proyecciones.html'},
      {label:'Mensajes',icon:'forum',href:'mensajes.html'},
      {section:'Sistema'},
      {label:'Bitácora',icon:'receipt_long',href:'bitacora.html'},
    ],
  };

  const currentPage = window.location.pathname.split('/').pop() || 'solicitudes.html';
  function buildNav(items){
    let h=''; let open=false;
    items.forEach(item=>{
      if(item.section){if(open)h+='</div>';h+=`<div class="sidebar-section"><span class="sidebar-label">${item.section}</span>`;open=true;return;}
      const active=item.href===currentPage?'active':'';
      const badge=item.badge?`<span class="nav-badge">${item.badge}</span>`:'';
      h+=`<a class="nav-item ${active}" href="${item.href}"><span class="material-symbols-rounded">${item.icon}</span>${item.label}${badge}</a>`;
    });
    if(open)h+='</div>';
    return h;
  }

  document.body.insertAdjacentHTML('afterbegin',`
<header class="topbar">
  <div class="page-title">Solicitudes de <span>Recursos</span></div>
  <div class="topbar-right">
    <a class="icon-btn" href="mensajes.html"><span class="material-symbols-rounded">forum</span><span class="notif-dot"></span></a>
    <div class="icon-btn"><span class="material-symbols-rounded">notifications</span><span class="notif-dot"></span></div>
    <div class="topbar-avatar" title="${u.name}">${u.initials}</div>
  </div>
</header>
<aside class="sidebar">
  <div class="sidebar-brand">
    <div class="brand-logo">P</div>
    <div><div class="brand-name">PRONADERS</div><div class="brand-sub">Sistema de Gestión</div></div>
  </div>
  ${buildNav(NAV[role]||NAV.campo)}
  <div class="sidebar-user">
    <div class="user-avatar">${u.initials}</div>
    <div><div class="user-name">${u.name}</div><div class="user-role">${u.roleLabel}</div></div>
    <button class="logout-btn" onclick="logout()"><span class="material-symbols-rounded">logout</span></button>
  </div>
</aside>`);
})();
function logout(){sessionStorage.clear();window.location.href='index.html';}

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
    fecha:'01 abr 2026', estado:'entregada',
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
    fecha:'20 mar 2026', estado:'confirmada',
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

document.addEventListener('DOMContentLoaded', () => { renderVista(); });

function renderVista(){
  if(ROLE === 'campo')     renderVistaCampo();
  else if(ROLE === 'admin') renderVistaAdmin();
  else if(ROLE === 'logistica') renderVistaLogistica();
  else if(ROLE === 'empleado')  renderVistaEmpleado();
  else renderVistaCampo(); // fallback
}

// ──────────────────────────────────────────────────
// VISTA CAMPO
// ──────────────────────────────────────────────────
function renderVistaCampo(){
  const totales = {pendiente:0,aprobada:0,rechazada:0,en_despacho:0,entregada:0,confirmada:0};
  SOLICITUDES.forEach(s=>{ if(totales[s.estado]!==undefined) totales[s.estado]++; });

  document.getElementById('main-content').innerHTML = `
  <div class="flex-between mb-24 fade-up">
    <div class="section-head" style="margin-bottom:0">
      <h2>Mis Solicitudes <em style="font-style:italic">de Recursos</em></h2>
      <p>Historial completo de solicitudes enviadas a la Gerencia Técnica</p>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-outline" onclick="abrirListaNecesidades()">
        <span class="material-symbols-rounded">checklist</span> Lista de necesidades
        <span class="nav-badge" style="background:var(--warning);color:var(--white)">${NECESIDADES.length}</span>
      </button>
      <button class="btn btn-gold" id="btnNuevaSolicitud" onclick="abrirModalSol()">
        <span class="material-symbols-rounded">add</span> Nueva Solicitud
      </button>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:12px;margin-bottom:24px" class="fade-up">
    ${statCard('Pendientes',totales.pendiente,'warning','pending')}
    ${statCard('Aprobadas',totales.aprobada,'success','check_circle')}
    ${statCard('Rechazadas',totales.rechazada,'danger','cancel')}
    ${statCard('En despacho',totales.en_despacho,'dispatch','local_shipping')}
    ${statCard('Entregadas',totales.entregada,'delivered','inventory_2')}
    ${statCard('Confirmadas',totales.confirmada,'confirmed','verified')}
  </div>

  <div class="tabs fade-up" id="tabs-campo">
    <button class="tab active" onclick="filtrarCampo('todas',this)">Todas <span class="nav-badge" style="background:var(--muted);color:var(--white);margin-left:4px">${SOLICITUDES.length}</span></button>
    <button class="tab" onclick="filtrarCampo('pendiente',this)">Pendientes</button>
    <button class="tab" onclick="filtrarCampo('aprobada',this)">Aprobadas</button>
    <button class="tab" onclick="filtrarCampo('rechazada',this)">Rechazadas</button>
    <button class="tab" onclick="filtrarCampo('en_despacho',this)">En despacho</button>
    <button class="tab" onclick="filtrarCampo('entregada',this)">Entregadas</button>
    <button class="tab" onclick="filtrarCampo('confirmada',this)">Confirmadas</button>
  </div>

  <div id="lista-solicitudes-campo" style="display:flex;flex-direction:column;gap:14px" class="fade-up"></div>`;

  filtrarCampo('todas');
}

function filtrarCampo(estado, btn){
  if(btn){ document.querySelectorAll('#tabs-campo .tab').forEach(t=>t.classList.remove('active')); btn.classList.add('active'); }
  const data = estado === 'todas' ? SOLICITUDES : SOLICITUDES.filter(s=>s.estado===estado);
  document.getElementById('lista-solicitudes-campo').innerHTML = data.map(s=>cardSolicitud(s,'campo')).join('');
}

// ──────────────────────────────────────────────────
// VISTA ADMIN
// ──────────────────────────────────────────────────
function renderVistaAdmin(){
  document.getElementById('main-content').innerHTML = `
  <div class="flex-between mb-24 fade-up">
    <div class="section-head" style="margin-bottom:0">
      <h2>Gestión de <em style="font-style:italic">Solicitudes</em></h2>
      <p>Todas las solicitudes recibidas de supervisores de campo · Gerencia Técnica</p>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:12px;margin-bottom:24px" class="fade-up">
    ${statCard('Pendientes',SOLICITUDES.filter(s=>s.estado==='pendiente').length,'warning','pending')}
    ${statCard('Aprobadas',SOLICITUDES.filter(s=>s.estado==='aprobada').length,'success','check_circle')}
    ${statCard('Rechazadas',SOLICITUDES.filter(s=>s.estado==='rechazada').length,'danger','cancel')}
    ${statCard('En despacho',SOLICITUDES.filter(s=>s.estado==='en_despacho').length,'dispatch','local_shipping')}
    ${statCard('Entregadas',SOLICITUDES.filter(s=>s.estado==='entregada').length,'delivered','inventory_2')}
    ${statCard('Confirmadas',SOLICITUDES.filter(s=>s.estado==='confirmada').length,'confirmed','verified')}
  </div>

  <div class="tabs fade-up" id="tabs-admin">
    <button class="tab active" onclick="filtrarAdmin('todas',this)">Todas</button>
    <button class="tab" onclick="filtrarAdmin('pendiente',this)">⏳ Pendientes <span class="nav-badge" style="background:var(--warning);color:var(--white);margin-left:4px">${SOLICITUDES.filter(s=>s.estado==='pendiente').length}</span></button>
    <button class="tab" onclick="filtrarAdmin('aprobada',this)">Aprobadas</button>
    <button class="tab" onclick="filtrarAdmin('rechazada',this)">Rechazadas</button>
    <button class="tab" onclick="filtrarAdmin('en_despacho',this)">En despacho</button>
    <button class="tab" onclick="filtrarAdmin('confirmada',this)">Confirmadas</button>
  </div>

  <div id="lista-solicitudes-admin" style="display:flex;flex-direction:column;gap:14px" class="fade-up"></div>`;

  filtrarAdmin('todas');
}

function filtrarAdmin(estado, btn){
  if(btn){ document.querySelectorAll('#tabs-admin .tab').forEach(t=>t.classList.remove('active')); btn.classList.add('active'); }
  const data = estado === 'todas' ? SOLICITUDES : SOLICITUDES.filter(s=>s.estado===estado);
  document.getElementById('lista-solicitudes-admin').innerHTML = data.map(s=>cardSolicitud(s,'admin')).join('');
}

// ──────────────────────────────────────────────────
// VISTA LOGÍSTICA
// ──────────────────────────────────────────────────
function renderVistaLogistica(){
  const asignadas = SOLICITUDES.filter(s=>['aprobada','en_despacho'].includes(s.estado));
  document.getElementById('main-content').innerHTML = `
  <div class="flex-between mb-24 fade-up">
    <div class="section-head" style="margin-bottom:0">
      <h2>Despachos <em style="font-style:italic">Asignados</em></h2>
      <p>Solicitudes aprobadas por Gerencia Técnica listas para despacho</p>
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

function filtrarLog(estado, btn){
  if(btn){ document.querySelectorAll('#tabs-log .tab').forEach(t=>t.classList.remove('active')); btn.classList.add('active'); }
  const data = estado === 'todas' ? SOLICITUDES.filter(s=>['aprobada','en_despacho','entregada'].includes(s.estado)) : SOLICITUDES.filter(s=>s.estado===estado);
  document.getElementById('lista-solicitudes-log').innerHTML = data.map(s=>cardSolicitud(s,'logistica')).join('');
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

  // Botones de acción según rol y estado
  let acciones = '';
  if(vistaRol === 'admin' && s.estado === 'pendiente'){
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
      <td style="padding:7px 12px;font-size:12.5px;text-align:right">L ${it.monto.toLocaleString('es-HN',{minimumFractionDigits:2})}</td>
    </tr>`).join('');

  // Timeline
  const tlHtml = s.timeline.map(t=>`
    <div class="tl-item">
      <div class="tl-dot" style="background:${t.color}20">
        <span class="material-symbols-rounded" style="font-size:13px;color:${t.color}">${t.icon}</span>
      </div>
      <div class="tl-body">
        <div class="tl-label">${t.estado}</div>
        <div class="tl-meta">${t.actor} · ${t.fecha}</div>
        ${t.comentario?`<div style="font-size:12px;color:var(--text-light);margin-top:3px;background:var(--success-bg);padding:4px 8px;border-radius:6px">💬 ${t.comentario}</div>`:''}
        ${t.motivo?`<div style="font-size:12px;color:var(--danger);margin-top:3px;background:var(--danger-bg);padding:4px 8px;border-radius:6px">⚠ ${t.motivo}</div>`:''}
        ${t.obs?`<div style="font-size:12px;color:var(--text-light);margin-top:3px">📝 ${t.obs}</div>`:''}
        ${t.docs.map(d=>`<span class="tl-doc"><span class="material-symbols-rounded" style="font-size:13px">description</span>${d}</span>`).join('')}
      </div>
    </div>`).join('');

  return `
  <div class="sol-card" id="card-${s.id}">
    <div class="flex-between mb-12">
      <div>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <span style="font-size:11px;font-weight:600;color:var(--muted)">${s.id}</span>
          <span class="badge ${ec.cls}">
            <span class="material-symbols-rounded" style="font-size:12px">${ec.icon}</span>${ec.label}
          </span>
          ${s.equipoNombre?`<span class="badge" style="background:#f3e8ff;color:#6a1b9a;font-size:10.5px"><span class="material-symbols-rounded" style="font-size:11px">local_shipping</span>${s.equipoNombre}</span>`:''}
        </div>
        <div style="font-size:16px;font-weight:600;color:var(--navy);margin-top:6px">${s.proyecto}</div>
        <div class="text-xs text-muted mt-4">${s.solicitante} · ${s.fecha}</div>
      </div>
      <div style="text-align:right">
        <div class="text-xs text-muted">Total estimado</div>
        <div style="font-family:var(--font-serif);font-size:22px;font-weight:300;color:var(--navy)">L ${total.toLocaleString('es-HN',{minimumFractionDigits:2})}</div>
      </div>
    </div>

    <div class="text-sm text-muted mb-12" style="line-height:1.6"><strong>Justificación:</strong> ${s.justificacion}</div>

    <!-- Ítems -->
    <div style="border:1px solid var(--cream-dark);border-radius:var(--radius);overflow:hidden;margin-bottom:12px">
      <table style="width:100%;border-collapse:collapse">
        <thead><tr style="background:var(--cream)">
          <th style="padding:7px 12px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.7px;color:var(--muted);font-weight:600">Tipo</th>
          <th style="padding:7px 12px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.7px;color:var(--muted);font-weight:600">Recurso</th>
          <th style="padding:7px 12px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.7px;color:var(--muted);font-weight:600">Cantidad</th>
          <th style="padding:7px 12px;text-align:right;font-size:10px;text-transform:uppercase;letter-spacing:.7px;color:var(--muted);font-weight:600">Monto</th>
        </tr></thead>
        <tbody style="font-size:12.5px">${itemsHtml}</tbody>
      </table>
    </div>

    <!-- Timeline -->
    <details>
      <summary style="cursor:pointer;font-size:12.5px;font-weight:600;color:var(--navy);padding:8px 0;list-style:none;display:flex;align-items:center;gap:6px">
        <span class="material-symbols-rounded" style="font-size:16px">timeline</span>
        Historial de estados (${s.timeline.length} eventos)
      </summary>
      <div class="timeline">${tlHtml}</div>
    </details>

    ${acciones?`<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px;padding-top:14px;border-top:1px solid var(--cream-dark)">${acciones}</div>`:''}
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
function abrirListaNecesidades(){
  // Crear modal dinámico si no existe
  let m = document.getElementById('modal-lista-nec');
  if(!m){
    m = document.createElement('div');
    m.id = 'modal-lista-nec';
    m.className = 'modal-overlay';
    m.innerHTML = `
    <div class="modal" style="max-width:680px">
      <div class="modal-header">
        <div class="modal-title">Lista de <em style="font-style:italic">Necesidades del Equipo</em></div>
        <button class="close-btn" onclick="document.getElementById('modal-lista-nec').classList.remove('open')"><span class="material-symbols-rounded">close</span></button>
      </div>
      <div style="background:var(--cream);border-radius:var(--radius);padding:10px 14px;margin-bottom:16px;font-size:12.5px;color:var(--text-light)">
        Revisa las propuestas del equipo. Puedes aprobar ítems para la solicitud oficial, editar cantidades o eliminar los que no procedan.
      </div>
      <div id="modal-nec-list" style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px"></div>
      <div style="display:flex;gap:8px;justify-content:flex-end;padding-top:12px;border-top:1px solid var(--cream-dark)">
        <button class="btn btn-outline" onclick="document.getElementById('modal-lista-nec').classList.remove('open')">Cerrar</button>
        <button class="btn btn-gold" onclick="convertirAsolitud()">
          <span class="material-symbols-rounded">send</span> Convertir seleccionados en solicitud
        </button>
      </div>
    </div>`;
    document.body.appendChild(m);
  }
  renderNecesidades('modal-nec-list', true);
  m.classList.add('open');
}

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

function convertirAsolitud(){
  document.getElementById('modal-lista-nec').classList.remove('open');
  abrirModalSol(true);
}

// ──────────────────────────────────────────────────
// MODAL NUEVA SOLICITUD
// ──────────────────────────────────────────────────
let itemCount = 0;
function abrirModalSol(importar){
  cerrarModalSol();
  document.getElementById('modal-sol').classList.add('open');
  agregarItemSol();
  if(importar) importarNecesidades();
}

function importarNecesidades(){
  const seleccionados = NECESIDADES.filter((n,i)=>{
    const chk = document.getElementById(`nec-chk-${i}`);
    return !n.duplicado && (!chk || chk.checked);
  });
  seleccionados.forEach(n=>{
    itemCount++;
    const tbody = document.getElementById('items-sol-tbody');
    const tr = document.createElement('tr');
    tr.id='item-row-'+itemCount;
    tr.style.borderBottom='1px solid var(--cream-dark)';
    tr.innerHTML = filaItem(itemCount, n.tipo, n.desc, n.cantidad, n.monto);
    tbody.appendChild(tr);
  });
  calcularTotal();
  showToast(`${seleccionados.length} ítem(s) importados desde lista de necesidades`, 'success');
}

function agregarItemSol(){
  itemCount++;
  const tbody = document.getElementById('items-sol-tbody');
  const tr = document.createElement('tr');
  tr.id='item-row-'+itemCount;
  tr.style.borderBottom='1px solid var(--cream-dark)';
  tr.innerHTML = filaItem(itemCount,'','','',0);
  tbody.appendChild(tr);
  calcularTotal();
}

function filaItem(n, tipo, desc, cant, monto){
  const tipos = ['Material','Equipo','Financiero'];
  const opts = tipos.map(t=>`<option ${t===tipo?'selected':''}>${t}</option>`).join('');
  return `
    <td style="padding:8px 10px;color:var(--muted);font-size:12px;vertical-align:top;padding-top:12px">${n}</td>
    <td style="padding:6px 8px;vertical-align:top"><select class="form-control" style="font-size:12px;padding:6px 8px">${opts}</select></td>
    <td style="padding:6px 8px;vertical-align:top"><textarea class="form-control" rows="2" style="font-size:12px;padding:6px 8px;resize:vertical;min-height:52px" placeholder="Descripción...">${desc}</textarea></td>
    <td style="padding:6px 8px;vertical-align:top"><input type="text" class="form-control" style="font-size:12px;padding:6px 8px" value="${cant}" placeholder="Ej: 50 bolsas"></td>
    <td style="padding:6px 8px;vertical-align:top"><input type="number" class="form-control item-monto" style="font-size:12px;padding:6px 8px" value="${monto||''}" placeholder="0.00" oninput="calcularTotal()"></td>
    <td style="padding:6px 8px;vertical-align:top;padding-top:10px"><button type="button" onclick="this.closest('tr').remove();calcularTotal()" style="background:none;border:none;cursor:pointer;color:var(--danger)"><span class="material-symbols-rounded" style="font-size:18px">delete</span></button></td>`;
}

function calcularTotal(){
  let t=0; document.querySelectorAll('.item-monto').forEach(i=>t+=parseFloat(i.value)||0);
  document.getElementById('sol-total').textContent='L '+t.toLocaleString('es-HN',{minimumFractionDigits:2});
}

function cerrarModalSol(){
  document.getElementById('modal-sol').classList.remove('open');
  document.getElementById('items-sol-tbody').innerHTML='';
  document.getElementById('sol-total').textContent='L 0.00';
  const p=document.getElementById('sol-proyecto'); if(p) p.value='';
  const j=document.getElementById('sol-justificacion'); if(j) j.value='';
  itemCount=0;
}

function enviarSolicitudOficial(){
  const proy = document.getElementById('sol-proyecto').value;
  const rows = document.querySelectorAll('#items-sol-tbody tr');
  if(!proy){ showToast('Selecciona un proyecto','warning'); return; }
  if(!rows.length){ showToast('Agrega al menos un ítem','warning'); return; }
  cerrarModalSol();
  showToast(`Solicitud enviada · Notificación enviada a Gerencia Técnica (stzuniga@pronaders.gob.hn)`, 'success');
}

// ──────────────────────────────────────────────────
// PROPONER NECESIDAD (empleado)
// ──────────────────────────────────────────────────
function proponerNecesidad(){
  const desc  = document.getElementById('need-desc').value.trim();
  const proy  = document.getElementById('need-proyecto').value;
  if(!desc||!proy){ showToast('Completa todos los campos requeridos','warning'); return; }

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
  const com = document.getElementById('aprob-comentario').value.trim();
  const log = document.getElementById('aprob-logistica').value;
  if(!com){ showToast('El comentario de aprobación es requerido','warning'); return; }
  const sol = SOLICITUDES.find(s=>s.id===_solActiva);
  if(sol){
    sol.estado='aprobada';
    sol.equipoNombre = log ? document.getElementById('aprob-logistica').selectedOptions[0].text : null;
    sol.timeline.push(
      {estado:'Aprobada por Gerencia Técnica',actor:'Silvia Zuniga',fecha:'Ahora',color:'var(--success)',icon:'check_circle',docs:[],comentario:com},
      {estado:'Solicitante notificado por correo (icarranza@pronaders.gob.hn)',actor:'Sistema automático',fecha:'Ahora',color:'var(--gold)',icon:'mark_email_read',docs:[]}
    );
    if(log) sol.timeline.push({estado:`Asignado a ${sol.equipoNombre}`,actor:'Silvia Zuniga',fecha:'Ahora',color:'#6a1b9a',icon:'local_shipping',docs:[]});
  }
  document.getElementById('modal-aprobar').classList.remove('open');
  renderVistaAdmin();
  showToast(`Solicitud ${_solActiva} aprobada · Isaac Carranza notificado por correo`, 'success');
  _solActiva=null;
}

function abrirModalRechazar(id){
  _solActiva=id;
  document.getElementById('rechazo-motivo').value='';
  document.getElementById('modal-rechazar').classList.add('open');
}

function confirmarRechazo(){
  const motivo = document.getElementById('rechazo-motivo').value.trim();
  if(!motivo){ showToast('El motivo del rechazo es requerido','warning'); return; }
  const sol = SOLICITUDES.find(s=>s.id===_solActiva);
  if(sol){
    sol.estado='rechazada';
    sol.timeline.push(
      {estado:'Rechazada por Gerencia Técnica',actor:'Silvia Zuniga',fecha:'Ahora',color:'var(--danger)',icon:'cancel',docs:[],motivo},
      {estado:'Solicitante notificado por correo (icarranza@pronaders.gob.hn)',actor:'Sistema automático',fecha:'Ahora',color:'var(--gold)',icon:'mark_email_read',docs:[]}
    );
  }
  document.getElementById('modal-rechazar').classList.remove('open');
  renderVistaAdmin();
  showToast(`Solicitud ${_solActiva} rechazada · Isaac Carranza notificado por correo`, 'info');
  _solActiva=null;
}

// ──────────────────────────────────────────────────
// MODALES LOGÍSTICA
// ──────────────────────────────────────────────────
function abrirModalDespacho(id){
  _solActiva=id;
  const n=SOLICITUDES.filter(s=>s.estado==='en_despacho').length+1;
  document.getElementById('despacho-num').textContent=`DSP-2026-${String(n).padStart(4,'0')}`;
  document.getElementById('despacho-fecha').value='';
  document.getElementById('despacho-responsable').value='';
  document.getElementById('despacho-obs').value='';
  document.getElementById('remision-files').innerHTML='';
  document.getElementById('modal-despacho').classList.add('open');
}

function confirmarDespacho(){
  const fecha = document.getElementById('despacho-fecha').value;
  const resp  = document.getElementById('despacho-responsable').value.trim();
  const files = document.getElementById('remision-files').querySelectorAll('.file-chip');
  if(!fecha||!resp){ showToast('Fecha y responsable son requeridos','warning'); return; }
  if(!files.length){ showToast('Debes adjuntar la remisión firmada','warning'); return; }
  const sol = SOLICITUDES.find(s=>s.id===_solActiva);
  if(sol){
    sol.estado='en_despacho';
    sol.timeline.push({estado:'Despacho registrado',actor:resp,fecha:fecha,color:'#00695c',icon:'inventory_2',docs:['Remision_firmada.pdf'],obs:document.getElementById('despacho-obs').value});
    sol.timeline.push({estado:'Entregada al solicitante',actor:resp,fecha:fecha,color:'var(--navy)',icon:'local_shipping',docs:[]});
    sol.estado='entregada';
  }
  document.getElementById('modal-despacho').classList.remove('open');
  renderVistaLogistica();
  showToast('Despacho registrado. Remisión adjunta correctamente.','success');
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
function mostrarArchivos(containerId, files){
  const c=document.getElementById(containerId);
  Array.from(files).forEach(f=>{
    const d=document.createElement('div');
    d.className='file-chip';
    d.style.cssText='display:flex;align-items:center;gap:8px;background:var(--cream);border:1px solid var(--cream-dark);border-radius:8px;padding:6px 10px;font-size:12px';
    d.innerHTML=`<span class="material-symbols-rounded" style="font-size:16px;color:var(--navy)">description</span>
      <span style="flex:1;color:var(--text)">${f.name}</span>
      <span style="color:var(--muted)">${(f.size/1024).toFixed(0)} KB</span>
      <button type="button" onclick="this.parentElement.remove()" style="background:none;border:none;cursor:pointer;color:var(--muted)">✕</button>`;
    c.appendChild(d);
  });
}

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
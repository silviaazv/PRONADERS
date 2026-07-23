/* ============================================================
   shared.js — CONTROLADOR COMPARTIDO DEL SISTEMA PRONADERS
   ------------------------------------------------------------
   Responsabilidades:
   1. Inyectar el sidebar y el topbar en todas las páginas.
   2. Construir la navegación según el ROL del usuario en sesión
      (admin_oficina, campo, empleado, logistica).
   3. Funcionalidad del botón de NOTIFICACIONES del topbar.
   4. Utilidades de VALIDACIÓN de formularios (FormUtils):
      - Marcado de campos con error + mensaje bajo el campo.
      - Validación de fechas (fin no puede ser anterior a inicio).
      - Los datos NUNCA se borran cuando hay un error.
   5. Función global de cierre de sesión (logout).
   Este archivo debe cargarse ANTES del script propio de cada página.
   ============================================================ */

(function(){

  /* ──────────────────────────────────────────────
     1. SESIÓN Y ROL DEL USUARIO
     ────────────────────────────────────────────── */
  const pagina = window.location.pathname.split('/').pop();

  // Rol por defecto según la página (solo si no hay sesión activa)
  function rolPorDefecto(){
    if(pagina.startsWith('dashboard-admin') || pagina.startsWith('dashboard-oficina')) return 'admin_oficina';
    if(pagina.startsWith('dashboard-logistica')) return 'logistica';
    return 'campo';
  }

  const role = sessionStorage.getItem('pron_role') || rolPorDefecto();

  const ROLE_LABELS = {
    admin_oficina: 'Admin. de Oficina',
    campo:         'Supervisor de Campo',
    empleado:      'Empleado',
    logistica:     'Log\u00edstica',
  };

  // Datos del usuario en sesión (guardados por index.js al iniciar sesión)
  const u = {
    name:      sessionStorage.getItem('pron_nombre')  || 'Usuario',
    initials:  sessionStorage.getItem('pron_initials')|| 'US',
    roleLabel: ROLE_LABELS[role] || 'Empleado',
  };

  /* ──────────────────────────────────────────────
     2. NAVEGACIÓN POR ROL
     Nota: el rol "empleado" NO incluye "Reportes de
     Avance" (los empleados no ven reportes).
     ────────────────────────────────────────────── */
  const NAV = {
    // Supervisor de Campo: acceso completo a sus módulos
    campo: [
      { section:'Principal' },
      { label:'Dashboard',             icon:'dashboard',    href:'dashboard-campo.html' },
      { section:'Mis M\u00f3dulos' },
      { label:'Mis Proyectos',         icon:'folder_open',  href:'proyectos.html' },
      { label:'Reportes de Avance',    icon:'bar_chart',    href:'reportes.html' },
      { label:'Solicitud de Recursos', icon:'inventory_2',  href:'solicitudes.html', badge:'2' },
      { label:'Proyecciones',          icon:'timeline',     href:'proyecciones.html' },
      { label:'Proyectos Finalizados', icon:'task_alt',     href:'finalizados-campo.html' },
    ],
    // Empleado: igual que campo pero SIN reportes de avance
    empleado: [
      { section:'Principal' },
      { label:'Dashboard',             icon:'dashboard',    href:'dashboard-campo.html' },
      { section:'Mis M\u00f3dulos' },
      { label:'Mis Proyectos',         icon:'folder_open',  href:'proyectos.html' },
      { label:'Solicitud de Recursos', icon:'inventory_2',  href:'solicitudes.html', badge:'2' },
      { label:'Proyecciones',          icon:'timeline',     href:'proyecciones.html' },
      { label:'Proyectos Finalizados', icon:'task_alt',     href:'finalizados-campo.html' },
    ],
    // Administrador de Oficina (Gerencia Técnica)
    admin_oficina: [
      { section:'Principal' },
      { label:'Dashboard',             icon:'dashboard',       href:'dashboard-admin.html' },
      { section:'Administraci\u00f3n' },
      { label:'Gesti\u00f3n de Proyectos', icon:'folder_open', href:'proyectos.html' },
      { label:'Usuarios',              icon:'manage_accounts', href:'usuarios.html' },
      { section:'Monitoreo' },
      { label:'Reportes',              icon:'bar_chart',       href:'reportes.html' },
      { label:'Solicitudes',           icon:'inventory_2',     href:'solicitudes.html' },
      { label:'Proyecciones',          icon:'timeline',        href:'proyecciones.html' },
      { label:'Log\u00edstica',        icon:'local_shipping',  href:'dashboard-logistica.html' },
      { section:'Sistema' },
      { label:'Bit\u00e1cora',         icon:'receipt_long',    href:'bitacora.html' },
    ],
    // Equipo de Logística: solo sus despachos y mensajes
    logistica: [
      { section:'Principal' },
      { label:'Dashboard',             icon:'dashboard',       href:'dashboard-logistica.html' },
      { section:'Operaciones' },
      { label:'Despachos Asignados',   icon:'local_shipping',  href:'solicitudes.html', badge:'2' },
    ],
  };

  /* ──────────────────────────────────────────────
     3. CONSTRUCCIÓN DEL SIDEBAR
     ────────────────────────────────────────────── */
  function buildNav(items){
    let html = '';
    let inSection = false;
    items.forEach(item => {
      if(item.section){
        if(inSection) html += '</div>';
        html += '<div class="sidebar-section"><span class="sidebar-label">'+item.section+'</span>';
        inSection = true;
      } else {
        const active = item.href === pagina ? 'active' : '';
        const badge  = item.badge ? '<span class="nav-badge">'+item.badge+'</span>' : '';
        html += '<a class="nav-item '+active+'" href="'+item.href+'"><span class="material-symbols-rounded">'+item.icon+'</span>'+item.label+badge+'</a>';
      }
    });
    if(inSection) html += '</div>';
    return html;
  }

  const sidebar = '<aside class="sidebar"><div class="sidebar-brand"><div class="brand-logo">P</div><div><div class="brand-name">PRONADERS</div><div class="brand-sub">Sistema de Gesti\u00f3n</div></div></div>'
    + buildNav(NAV[role] || NAV.campo)
    + '<div class="sidebar-user"><div class="user-avatar">'+u.initials+'</div><div><div class="user-name">'+u.name+'</div><div class="user-role">'+u.roleLabel+'</div></div><button class="logout-btn" onclick="logout()" title="Cerrar sesi\u00f3n"><span class="material-symbols-rounded">logout</span></button></div></aside>';

  /* ──────────────────────────────────────────────
     4. TOPBAR (con botón de notificaciones funcional)
     ────────────────────────────────────────────── */
  const pageTitle = document.title.replace('PRONADERS \u2014 ','');
  // El módulo de MENSAJES fue eliminado del sistema: el topbar ya no
  // muestra su icono para ningún rol.
  const topbar = '<header class="topbar"><div class="page-title">'+pageTitle+'</div><div class="topbar-right">'
    + '<div class="icon-btn" id="btn-notificaciones" title="Notificaciones" onclick="toggleNotificaciones(event)"><span class="material-symbols-rounded">notifications</span><span class="notif-dot" id="notif-dot"></span></div>'
    + '<div class="topbar-avatar" title="'+u.name+'">'+u.initials+'</div></div></header>';

  document.body.insertAdjacentHTML('afterbegin', topbar);
  document.body.insertAdjacentHTML('afterbegin', sidebar);

  /* ──────────────────────────────────────────────
     5. ESTILOS COMPARTIDOS INYECTADOS
     (panel de notificaciones + errores de formulario)
     ────────────────────────────────────────────── */
  const css = document.createElement('style');
  css.textContent = `
    /* Panel desplegable de notificaciones */
    .notif-panel{position:fixed;top:62px;right:24px;width:340px;background:var(--white,#fff);
      border:1px solid var(--cream-dark,#E8E3D8);border-radius:12px;box-shadow:0 12px 32px rgba(13,27,62,.14);
      z-index:1200;overflow:hidden;display:none;animation:notifIn .18s ease}
    .notif-panel.open{display:block}
    @keyframes notifIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
    .notif-panel .np-head{padding:12px 16px;border-bottom:1px solid var(--cream-dark,#E8E3D8);
      display:flex;align-items:center;justify-content:space-between;font-size:13px;font-weight:600;color:var(--navy,#0D1B3E)}
    .notif-panel .np-item{display:flex;gap:10px;padding:11px 16px;border-bottom:1px solid var(--cream,#F7F4EE);
      cursor:pointer;transition:background .15s}
    .notif-panel .np-item:hover{background:var(--cream,#F7F4EE)}
    .notif-panel .np-item.leida{opacity:.55}
    .notif-panel .np-ico{width:30px;height:30px;border-radius:8px;display:flex;align-items:center;
      justify-content:center;flex-shrink:0}
    .notif-panel .np-txt{font-size:12.5px;color:var(--text,#2A2A28);line-height:1.4}
    .notif-panel .np-meta{font-size:11px;color:var(--muted,#8A8578);margin-top:2px}
    .notif-panel .np-empty{padding:26px;text-align:center;font-size:12.5px;color:var(--muted,#8A8578)}
    .notif-panel .np-foot{padding:9px 16px;text-align:center}
    .notif-panel .np-foot button{background:none;border:none;color:var(--navy,#0D1B3E);
      font-size:12px;font-weight:600;cursor:pointer}
    /* Errores de validación en formularios */
    .form-control.invalid{border-color:#C0392B !important;background:#FDF3F2}
    .field-error{color:#C0392B;font-size:11.5px;margin-top:4px;display:flex;align-items:center;gap:4px}
  `;
  document.head.appendChild(css);

  /* ──────────────────────────────────────────────
     6. NOTIFICACIONES POR ROL (datos de demostración)
     ────────────────────────────────────────────── */
  const NOTIFS = {
    admin_oficina: [
      {icon:'inventory_2', c:'#B7791F', bg:'#FBF3E4', txt:'Nueva solicitud SOL-2026-047 pendiente de aprobaci\u00f3n', meta:'Puente Choluteca \u00b7 hace 20 min', href:'solicitudes.html'},
      {icon:'bar_chart',   c:'#2C6E9B', bg:'#E6F1FB', txt:'Isaac Carranza envi\u00f3 un reporte de avance (68%)', meta:'Puente Choluteca \u00b7 hace 2 h', href:'reportes.html'},
      {icon:'warning',     c:'#C0392B', bg:'#FBEAE8', txt:'Riego El Para\u00edso acumula 22 d\u00edas de retraso', meta:'Proyecciones \u00b7 hoy', href:'proyecciones.html'},
    ],
    campo: [
      {icon:'check_circle',c:'#2E7D52', bg:'#E7F3EC', txt:'Tu solicitud SOL-2026-044 fue aprobada por Gerencia T\u00e9cnica', meta:'hace 1 h', href:'solicitudes.html'},
      {icon:'forum',       c:'#2C6E9B', bg:'#E6F1FB', txt:'Silvia Z\u00fa\u00f1iga aprob\u00f3 tu reporte de avance', meta:'hace 2 h', href:'reportes.html'},
      {icon:'event',       c:'#B7791F', bg:'#FBF3E4', txt:'Recuerda enviar el reporte semanal del Puente Choluteca', meta:'hoy', href:'reportes.html'},
    ],
    empleado: [
      {icon:'checklist',   c:'#2C6E9B', bg:'#E6F1FB', txt:'Tu propuesta de necesidad fue revisada por el Supervisor', meta:'hace 3 h', href:'solicitudes.html'},
      {icon:'forum',       c:'#2E7D52', bg:'#E7F3EC', txt:'Tu solicitud propuesta fue enviada a Gerencia T\u00e9cnica', meta:'ayer', href:'solicitudes.html'},
    ],
    logistica: [
      {icon:'local_shipping', c:'#6a1b9a', bg:'#f3e8ff', txt:'Despacho SOL-2026-047 asignado a tu equipo', meta:'Alta prioridad \u00b7 hace 30 min', href:'solicitudes.html'},
      {icon:'verified',    c:'#2E7D52', bg:'#E7F3EC', txt:'Isaac Carranza confirm\u00f3 la recepci\u00f3n de SOL-2026-028', meta:'ayer', href:'solicitudes.html'},
    ],
  };
  window._notifs = (NOTIFS[role] || NOTIFS.campo).map(n => ({...n, leida:false}));
})();

/* ──────────────────────────────────────────────
   PANEL DE NOTIFICACIONES (funciones globales)
   ────────────────────────────────────────────── */
function _renderNotifPanel(){
  const lista = window._notifs || [];
  const items = lista.length
    ? lista.map((n,i)=>`
      <div class="np-item ${n.leida?'leida':''}" onclick="abrirNotificacion(${i})">
        <div class="np-ico" style="background:${n.bg}">
          <span class="material-symbols-rounded" style="font-size:16px;color:${n.c}">${n.icon}</span>
        </div>
        <div>
          <div class="np-txt">${n.txt}</div>
          <div class="np-meta">${n.meta}</div>
        </div>
      </div>`).join('')
    : '<div class="np-empty">No tienes notificaciones nuevas.</div>';

  return `
    <div class="np-head">
      <span>Notificaciones</span>
      <span style="font-size:11px;color:var(--muted,#8A8578);font-weight:400">${lista.filter(n=>!n.leida).length} sin leer</span>
    </div>
    ${items}
    <div class="np-foot"><button onclick="marcarNotifsLeidas()">Marcar todas como le\u00eddas</button></div>`;
}

// Abre/cierra el panel de notificaciones del topbar
function toggleNotificaciones(e){
  if(e) e.stopPropagation();
  let panel = document.getElementById('notif-panel');
  if(!panel){
    panel = document.createElement('div');
    panel.id = 'notif-panel';
    panel.className = 'notif-panel';
    document.body.appendChild(panel);
    // Cerrar el panel al hacer clic fuera de él
    document.addEventListener('click', (ev)=>{
      if(panel.classList.contains('open') && !panel.contains(ev.target)) panel.classList.remove('open');
    });
  }
  panel.innerHTML = _renderNotifPanel();
  panel.classList.toggle('open');
}

// Marca una notificación como leída y navega a su módulo
function abrirNotificacion(i){
  const n = (window._notifs||[])[i];
  if(!n) return;
  n.leida = true;
  _actualizarDotNotifs();
  if(n.href) window.location.href = n.href;
}

// Marca todas las notificaciones como leídas
function marcarNotifsLeidas(){
  (window._notifs||[]).forEach(n=>n.leida=true);
  const panel = document.getElementById('notif-panel');
  if(panel) panel.innerHTML = _renderNotifPanel();
  _actualizarDotNotifs();
}

// Oculta el punto rojo cuando ya no hay notificaciones sin leer
function _actualizarDotNotifs(){
  const dot = document.getElementById('notif-dot');
  if(dot && !(window._notifs||[]).some(n=>!n.leida)) dot.style.display='none';
}

/* ──────────────────────────────────────────────
   CIERRE DE SESIÓN
   ────────────────────────────────────────────── */
function logout(){
  sessionStorage.clear();
  window.location.href = 'index.html';
}

/* ============================================================
   FormUtils — UTILIDADES DE VALIDACIÓN DE FORMULARIOS
   ------------------------------------------------------------
   Estrategia adoptada (opción 2 solicitada): el botón GUARDAR
   siempre está habilitado, pero al presionarlo se muestran los
   mensajes de error de todos los campos obligatorios que falten.
   Los valores ya escritos por el usuario NUNCA se borran.
   ============================================================ */
const FormUtils = {

  // Marca un campo como inválido y muestra un mensaje debajo
  marcarInvalido(el, msg){
    if(!el) return;
    el.classList.add('invalid');
    // Evitar mensajes duplicados
    let err = el.parentElement.querySelector('.field-error[data-for="'+el.id+'"]');
    if(!err){
      err = document.createElement('div');
      err.className = 'field-error';
      err.dataset.for = el.id;
      // Insertar el mensaje inmediatamente después del control
      el.insertAdjacentElement('afterend', err);
    }
    err.innerHTML = '<span class="material-symbols-rounded" style="font-size:13px">error</span>' + msg;
    // El error se limpia automáticamente cuando el usuario corrige el campo
    const limpiar = ()=> FormUtils.limpiarInvalido(el);
    el.addEventListener('input', limpiar, {once:true});
    el.addEventListener('change', limpiar, {once:true});
  },

  // Quita la marca de error de un campo
  limpiarInvalido(el){
    if(!el) return;
    el.classList.remove('invalid');
    const err = el.parentElement.querySelector('.field-error[data-for="'+el.id+'"]');
    if(err) err.remove();
  },

  // Limpia todos los errores dentro de un contenedor (modal/formulario)
  limpiarErrores(contenedor){
    const c = typeof contenedor==='string' ? document.getElementById(contenedor) : contenedor;
    if(!c) return;
    c.querySelectorAll('.form-control.invalid').forEach(el=>el.classList.remove('invalid'));
    c.querySelectorAll('.field-error').forEach(el=>el.remove());
  },

  /* Valida una lista de campos: [{id, msg, cond?}]
     - id:   id del elemento a validar
     - msg:  mensaje de error a mostrar si está vacío o cond() falla
     - cond: función opcional que devuelve true si el campo es válido
     Devuelve la cantidad de errores encontrados. */
  validar(campos){
    let errores = 0;
    campos.forEach(({id, msg, cond})=>{
      const el = document.getElementById(id);
      if(!el) return;
      const valor = (el.value||'').trim();
      const ok = cond ? cond(valor, el) : valor !== '';
      if(!ok){ FormUtils.marcarInvalido(el, msg); errores++; }
      else   { FormUtils.limpiarInvalido(el); }
    });
    return errores;
  },

  // true si la fecha final NO es anterior a la fecha inicial
  fechasValidas(inicio, fin){
    if(!inicio || !fin) return true; // la obligatoriedad se valida aparte
    return new Date(fin) >= new Date(inicio);
  },

  // true si el texto tiene formato de correo electrónico válido
  emailValido(txt){
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(txt);
  },
};

// Exponer explícitamente en window para que todos los controladores
// de módulo puedan usar las utilidades sin importar el orden de carga.
window.FormUtils = FormUtils;


/* ============================================================
   VISOR DE EVIDENCIAS (imágenes y documentos)
   ------------------------------------------------------------
   Abre un overlay a pantalla completa con la vista previa del
   archivo y, al pie, la información del reporte/solicitud
   asociado: código y descripción (estilo visor de Facebook).
   Uso: abrirVisor({tipo:'img'|'pdf'|'doc', nombre, codigo, descripcion})
   ============================================================ */
function abrirVisor(archivo){
  let v = document.getElementById('visor-evidencias');
  if(!v){
    v = document.createElement('div');
    v.id = 'visor-evidencias';
    v.innerHTML = `
      <style>
        #visor-evidencias{position:fixed;inset:0;background:rgba(8,14,32,.92);z-index:1500;
          display:none;flex-direction:column;animation:notifIn .18s ease}
        #visor-evidencias.open{display:flex}
        #visor-evidencias .v-top{display:flex;justify-content:flex-end;padding:14px 18px}
        #visor-evidencias .v-close{background:rgba(255,255,255,.12);border:none;color:#fff;width:38px;height:38px;
          border-radius:50%;cursor:pointer;font-size:20px;display:flex;align-items:center;justify-content:center}
        #visor-evidencias .v-close:hover{background:rgba(255,255,255,.25)}
        #visor-evidencias .v-body{flex:1;display:flex;align-items:center;justify-content:center;padding:0 40px;min-height:0}
        #visor-evidencias .v-frame{background:#fff;border-radius:14px;max-width:720px;width:100%;max-height:100%;
          display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;gap:14px;overflow:hidden}
        #visor-evidencias .v-ico{font-size:88px !important;color:var(--cream-dark,#EDE8DF)}
        #visor-evidencias .v-nombre{font-size:14px;font-weight:600;color:var(--navy,#0D1B3E);text-align:center;word-break:break-all}
        #visor-evidencias .v-tag{font-size:11px;color:var(--muted,#8A8FA8);text-transform:uppercase;letter-spacing:1px}
        /* Pie estilo Facebook: código + descripción del elemento asociado */
        #visor-evidencias .v-foot{background:rgba(0,0,0,.55);padding:16px 26px 22px;color:#fff}
        #visor-evidencias .v-cod{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;
          background:rgba(255,255,255,.14);border-radius:20px;padding:3px 12px;margin-bottom:7px}
        #visor-evidencias .v-desc{font-size:13.5px;line-height:1.55;color:rgba(255,255,255,.92);max-width:860px}
      </style>
      <div class="v-top"><button class="v-close" onclick="cerrarVisor()" title="Cerrar">✕</button></div>
      <div class="v-body"><div class="v-frame" id="visor-frame"></div></div>
      <div class="v-foot">
        <div class="v-cod" id="visor-cod"></div>
        <div class="v-desc" id="visor-desc"></div>
      </div>`;
    document.body.appendChild(v);
    // Cerrar con clic fuera del marco o con la tecla Escape
    v.addEventListener('click', e => { if(e.target.id==='visor-evidencias' || e.target.classList.contains('v-body')) cerrarVisor(); });
    document.addEventListener('keydown', e => { if(e.key==='Escape') cerrarVisor(); });
  }

  const iconos = { img:'image', pdf:'picture_as_pdf', doc:'description', xls:'table' };
  const tags   = { img:'Fotografía de evidencia', pdf:'Documento PDF', doc:'Documento adjunto', xls:'Hoja de cálculo' };
  document.getElementById('visor-frame').innerHTML = `
    <span class="material-symbols-rounded v-ico">${iconos[archivo.tipo]||'description'}</span>
    <div class="v-nombre">${archivo.nombre||'Archivo adjunto'}</div>
    <div class="v-tag">${tags[archivo.tipo]||'Adjunto'} · Vista previa</div>`;
  document.getElementById('visor-cod').innerHTML =
    `<span class="material-symbols-rounded" style="font-size:13px">${archivo.tipoCodigo==='solicitud'?'inventory_2':'bar_chart'}</span>${archivo.codigo||''}`;
  document.getElementById('visor-desc').textContent = archivo.descripcion || '';
  v.classList.add('open');
}

function cerrarVisor(){
  const v = document.getElementById('visor-evidencias');
  if(v) v.classList.remove('open');
}

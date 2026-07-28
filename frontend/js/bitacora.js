/* ============================================================
   bitacora.js — MÓDULO: BITÁCORA DEL SISTEMA
   ------------------------------------------------------------
   Ahora carga los registros reales desde /api/bitacora en vez
   de un arreglo de datos de muestra. Como esa tabla solo guarda
   IDs (id_usuario, id_objeto), se hace un cruce en el navegador
   con /api/usuarios y /api/roles para mostrar nombres.

   NOTA IMPORTANTE (limitación real de la base de datos):
   tbl_bitacora NO tiene columna de IP/ubicación. La columna
   "IP / Ubicación" de la tabla original era un dato inventado
   para la maqueta; aquí se muestra "—" porque el dato no existe
   en la BD. Si lo necesitas, hay que agregar esa columna al DDL.
   ============================================================ */

// tipo_accion tal como lo guarda la BD (ver CHECK chk_bitacora_tipo_accion)
const TIPO_CONFIG = {
  INSERT:      { label: 'Creación',    color: 'var(--success)', bg: 'var(--success-bg)', icon: 'add_circle' },
  UPDATE:      { label: 'Edición',     color: 'var(--info)',    bg: 'var(--info-bg)',     icon: 'edit' },
  DELETE:      { label: 'Eliminación', color: 'var(--danger)',  bg: 'var(--danger-bg)',   icon: 'delete' },
  REVISION:    { label: 'Revisión',    color: '#7b1fa2',        bg: '#f3e8ff',            icon: 'fact_check' },
  EMISION:     { label: 'Emisión',     color: 'var(--warning)', bg: 'var(--warning-bg)',  icon: 'send' },
  APROBACION:  { label: 'Aprobación',  color: 'var(--success)', bg: 'var(--success-bg)',  icon: 'check_circle' },
  RECHAZO:     { label: 'Rechazo',     color: 'var(--danger)',  bg: 'var(--danger-bg)',   icon: 'cancel' },
  LOGIN:       { label: 'Sesión',      color: 'var(--muted)',   bg: 'var(--cream)',       icon: 'login' },
  LOGOUT:      { label: 'Sesión',      color: 'var(--muted)',   bg: 'var(--cream)',       icon: 'logout' },
};

// tipo_objeto tal como lo guarda la BD (ver CHECK chk_bitacora_tipo_objeto)
const OBJ_CONFIG = {
  PROYECTO:  { color: 'var(--navy)',    bg: 'rgba(13,27,62,0.08)', icon: 'folder_open', label: 'Proyecto' },
  SOLICITUD: { color: 'var(--warning)', bg: 'var(--warning-bg)',   icon: 'inventory_2', label: 'Solicitud' },
  REPORTE:   { color: 'var(--info)',    bg: 'var(--info-bg)',      icon: 'bar_chart',   label: 'Reporte' },
  USUARIO:   { color: '#7b1fa2',        bg: '#f3e8ff',             icon: 'manage_accounts', label: 'Usuario' },
  ARCHIVO:   { color: '#2E7D52',        bg: '#E7F3EC',             icon: 'attach_file', label: 'Archivo' },
};

let _bitacoraCache = [];   // registros crudos de la API
let _usuariosMap = {};     // id_usuario -> { nombre_usuario, id_rol }
let _rolesMap = {};        // id_rol -> nombre_rol

function iniciales(nombre) {
  return (nombre || '?').split(' ').filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('');
}

function formatearFecha(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleString('es-HN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function renderLog(data) {
  const tbody = document.getElementById('log-tbody');
  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:26px;color:var(--muted)">No hay registros que coincidan con el filtro.</td></tr>`;
    document.getElementById('log-count').textContent = 'Mostrando 0 registros';
    return;
  }

  tbody.innerHTML = data.map(r => {
    const t = TIPO_CONFIG[r.tipo_accion] || TIPO_CONFIG.LOGIN;
    const usuario = _usuariosMap[r.id_usuario];
    const nombreUsuario = usuario ? usuario.nombre_usuario : `Usuario #${r.id_usuario}`;
    const rolLabel = usuario ? (_rolesMap[usuario.id_rol] || '—') : '—';

    const objHtml = r.tipo_objeto
      ? (() => {
          const o = OBJ_CONFIG[r.tipo_objeto] || OBJ_CONFIG.PROYECTO;
          return `<div style="display:flex;align-items:center;gap:8px">
            <span style="display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:20px;font-size:10.5px;font-weight:600;background:${o.bg};color:${o.color};flex-shrink:0">
              <span class="material-symbols-rounded" style="font-size:12px">${o.icon}</span>${o.label}
            </span>
            <span style="font-size:12px;color:var(--text-light)">#${r.id_objeto}</span>
          </div>`;
        })()
      : '<span style="color:var(--muted);font-size:12px">—</span>';

    return `<tr>
      <td style="color:var(--muted);font-size:11.5px">${r.id_registro}</td>
      <td style="font-size:12px;color:var(--text-light);white-space:nowrap">${formatearFecha(r.fecha_accion)}</td>
      <td>
        <div style="display:flex;align-items:center;gap:8px">
          <div style="width:26px;height:26px;border-radius:50%;background:var(--navy-light);display:flex;align-items:center;justify-content:center;font-size:9.5px;font-weight:600;color:var(--gold-light);flex-shrink:0">${iniciales(nombreUsuario)}</div>
          <span style="font-size:12.5px;font-weight:500">${nombreUsuario}</span>
        </div>
      </td>
      <td><span class="badge badge-navy" style="font-size:10px">${rolLabel}</span></td>
      <td>${objHtml}</td>
      <td style="font-size:11.5px;color:var(--muted)" title="La base de datos no almacena IP/ubicación">—</td>
      <td>
        <span style="display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:20px;font-size:10.5px;font-weight:500;background:${t.bg};color:${t.color}">
          <span class="material-symbols-rounded" style="font-size:12px">${t.icon}</span>${t.label}
        </span>
      </td>
    </tr>`;
  }).join('');

  document.getElementById('log-count').textContent = `Mostrando ${data.length} de ${_bitacoraCache.length} registros`;
}

function actualizarEstadisticas(data) {
  const total   = data.length;
  const sesiones= data.filter(r => r.tipo_accion === 'LOGIN' || r.tipo_accion === 'LOGOUT').length;
  const cambios = data.filter(r => ['INSERT','UPDATE','DELETE'].includes(r.tipo_accion)).length;
  const el = document.querySelectorAll('.stat-val');
  if (el[0]) el[0].textContent = total.toLocaleString('es-HN');
  if (el[1]) el[1].textContent = sesiones.toLocaleString('es-HN');
  if (el[2]) el[2].textContent = cambios.toLocaleString('es-HN');
  if (el[3]) el[3].textContent = '0'; // no hay tipo "error" en la BD real
}

function poblarFiltroUsuarios() {
  const select = document.getElementById('f-usuario');
  const actuales = new Set(Array.from(select.options).map(o => o.value));
  Object.values(_usuariosMap).forEach(u => {
    if (!actuales.has(u.nombre_usuario)) {
      const opt = document.createElement('option');
      opt.value = u.nombre_usuario;
      opt.textContent = u.nombre_usuario;
      select.appendChild(opt);
    }
  });
}

function filtrarBitacora(q) {
  const query   = (q || document.querySelector('.search-input')?.value || '').toLowerCase();
  const usuario = document.getElementById('f-usuario').value;
  const tipo    = document.getElementById('f-tipo').value;
  const objeto  = document.getElementById('f-objeto').value;

  const result = _bitacoraCache.filter(r => {
    const u = _usuariosMap[r.id_usuario];
    const nombre = u ? u.nombre_usuario : '';
    const matchQ    = !query   || nombre.toLowerCase().includes(query);
    const matchUser = !usuario || nombre === usuario;
    const matchTipo = !tipo    || r.tipo_accion === tipo;
    const matchObj  = !objeto  || r.tipo_objeto === objeto;
    return matchQ && matchUser && matchTipo && matchObj;
  });
  renderLog(result);
}

async function cargarBitacora() {
  const tbody = document.getElementById('log-tbody');
  tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:26px;color:var(--muted)">Cargando registros…</td></tr>`;
  try {
    const [registros, usuarios, roles] = await Promise.all([
      API.bitacora.listar(),
      API.usuarios.listar(),
      API.roles.listar(),
    ]);

    _rolesMap = Object.fromEntries(roles.map(r => [r.id_rol, r.nombre_rol]));
    _usuariosMap = Object.fromEntries(usuarios.map(u => [u.id_usuario, u]));
    _bitacoraCache = registros;

    poblarFiltroUsuarios();
    actualizarEstadisticas(registros);
    renderLog(registros);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:26px;color:var(--danger)">
      No se pudo cargar la bitácora: ${err.message}</td></tr>`;
  }
}

document.addEventListener('DOMContentLoaded', cargarBitacora);

// Render on load
//renderLog(LOG_DATA);

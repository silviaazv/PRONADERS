/* ============================================================
   bitacora.js — MÓDULO: BITÁCORA DEL SISTEMA
   ------------------------------------------------------------
   Estructura de la tabla (por corrección):
   - Se ELIMINÓ la columna "Acción".
   - Se AGREGÓ la columna "Objeto asociado" (Proyecto / Solicitud /
     Reporte / Usuario), que es NULA (—) en los inicios de sesión.
   - La columna "Tipo" clasifica la acción como: Creación, Edición,
     Revisión, Emisión o Eliminación (más Sesión y Error del sistema).
   El sidebar, topbar y utilidades se cargan desde shared.js.
   ============================================================ */

// ── DATOS DE MUESTRA ───────────────────────────────────────────
// objeto: {clase:'Proyecto|Solicitud|Reporte|Usuario', ref:'texto'} | null
const LOG_DATA = [
  { id:1248, ts:'26 abr 2026 · 10:43:12', user:'Silvia Zuniga',     rol:'admin',    tipo:'sesion',      objeto:null, ip:'192.168.1.10 · Tegucigalpa, FM' },
  { id:1247, ts:'26 abr 2026 · 10:41:05', user:'Andrea Amador',     rol:'oficina',  tipo:'revision',    objeto:{clase:'Solicitud', ref:'SOL-2026-041 · Puente Choluteca'}, ip:'192.168.1.14 · Tegucigalpa, FM' },
  { id:1246, ts:'26 abr 2026 · 10:38:22', user:'Isaac Carranza',    rol:'campo',    tipo:'emision',     objeto:{clase:'Solicitud', ref:'SOL-2026-041 · Puente Choluteca'}, ip:'181.45.23.87 · Valle de Ángeles' },
  { id:1245, ts:'26 abr 2026 · 10:35:00', user:'Isaac Carranza',    rol:'campo',    tipo:'emision',     objeto:{clase:'Reporte',   ref:'REP-2026-032 · Puente Choluteca (71%)'}, ip:'181.45.23.87 · Valle de Ángeles' },
  { id:1244, ts:'26 abr 2026 · 10:30:18', user:'Andrea Amador',     rol:'oficina',  tipo:'sesion',      objeto:null, ip:'192.168.1.14 · Tegucigalpa, FM' },
  { id:1243, ts:'26 abr 2026 · 10:22:47', user:'Isaac Carranza',    rol:'campo',    tipo:'revision',    objeto:{clase:'Solicitud', ref:'SOL-2026-028 · Recepción confirmada'}, ip:'181.45.23.87 · Valle de Ángeles' },
  { id:1242, ts:'26 abr 2026 · 10:15:09', user:'Silvia Zuniga',     rol:'admin',    tipo:'creacion',    objeto:{clase:'Proyecto',  ref:'Escuela Rural Las Vegas · Lempira'}, ip:'192.168.1.10 · Tegucigalpa, FM' },
  { id:1241, ts:'26 abr 2026 · 10:10:33', user:'Silvia Zuniga',     rol:'admin',    tipo:'edicion',     objeto:{clase:'Usuario',   ref:'Isaac Carranza · zona asignada'}, ip:'192.168.1.10 · Tegucigalpa, FM' },
  { id:1240, ts:'26 abr 2026 · 09:58:11', user:'Lamine Yamal',      rol:'empleado', tipo:'sesion',      objeto:null, ip:'181.45.21.44 · Comayagua' },
  { id:1239, ts:'26 abr 2026 · 09:50:55', user:'Carlos Costly',     rol:'empleado', tipo:'error',       objeto:null, ip:'189.210.44.12 · San Pedro Sula' },
  { id:1238, ts:'26 abr 2026 · 09:50:58', user:'Carlos Costly',     rol:'empleado', tipo:'sesion',      objeto:null, ip:'189.210.44.12 · San Pedro Sula' },
  { id:1237, ts:'26 abr 2026 · 09:45:00', user:'Andrea Amador',     rol:'oficina',  tipo:'revision',    objeto:{clase:'Solicitud', ref:'SOL-2026-039 · Rechazada'}, ip:'192.168.1.14 · Tegucigalpa, FM' },
  { id:1236, ts:'26 abr 2026 · 09:38:14', user:'Cristiano Ronaldo', rol:'empleado', tipo:'sesion',      objeto:null, ip:'181.48.66.21 · Santa Rosa de Copán' },
  { id:1235, ts:'26 abr 2026 · 09:30:47', user:'Isaac Carranza',    rol:'campo',    tipo:'sesion',      objeto:null, ip:'181.45.23.87 · Valle de Ángeles' },
  { id:1234, ts:'26 abr 2026 · 09:22:30', user:'Silvia Zuniga',     rol:'admin',    tipo:'edicion',     objeto:{clase:'Proyecto',  ref:'PRY-003 · Centro Comunitario San Pedro'}, ip:'192.168.1.10 · Tegucigalpa, FM' },
  { id:1233, ts:'25 abr 2026 · 18:05:22', user:'Jose Luis Montero', rol:'empleado', tipo:'sesion',      objeto:null, ip:'190.74.90.11 · Choloma, Cortés' },
  { id:1232, ts:'25 abr 2026 · 16:48:10', user:'Josue Vasquez',     rol:'empleado', tipo:'emision',     objeto:{clase:'Reporte',   ref:'REP-2026-025 · Riego El Paraíso'}, ip:'190.74.112.33 · Danlí, El Paraíso' },
  { id:1231, ts:'25 abr 2026 · 15:33:05', user:'Andrea Amador',     rol:'oficina',  tipo:'revision',    objeto:{clase:'Reporte',   ref:'REP-2026-024 · Riego El Paraíso'}, ip:'192.168.1.14 · Tegucigalpa, FM' },
  { id:1230, ts:'25 abr 2026 · 14:20:18', user:'Silvia Zuniga',     rol:'admin',    tipo:'eliminacion', objeto:{clase:'Proyecto',  ref:'Borrador · Camino vecinal La Unión'}, ip:'192.168.1.10 · Tegucigalpa, FM' },
  { id:1229, ts:'25 abr 2026 · 13:10:44', user:'Isaac Carranza',    rol:'campo',    tipo:'edicion',     objeto:{clase:'Proyecto',  ref:'PRY-001 · Avance físico 71%'}, ip:'181.45.23.87 · Valle de Ángeles' },
  { id:1228, ts:'25 abr 2026 · 12:30:00', user:'Equipo Logístico Centro', rol:'logistica', tipo:'sesion', objeto:null, ip:'192.168.2.10 · Tegucigalpa, FM' },
  { id:1227, ts:'25 abr 2026 · 11:45:22', user:'Equipo Logístico Centro', rol:'logistica', tipo:'emision', objeto:{clase:'Solicitud', ref:'DSP-2026-028 · Riego El Paraíso'}, ip:'192.168.2.10 · Tegucigalpa, FM' },
  { id:1226, ts:'25 abr 2026 · 10:12:40', user:'Silvia Zuniga',     rol:'admin',    tipo:'creacion',    objeto:{clase:'Usuario',   ref:'Lamine Yamal · Empleado'}, ip:'192.168.1.10 · Tegucigalpa, FM' },
  { id:1225, ts:'25 abr 2026 · 09:40:02', user:'Silvia Zuniga',     rol:'admin',    tipo:'eliminacion', objeto:{clase:'Usuario',   ref:'Cuenta temporal DEMO-004'}, ip:'192.168.1.10 · Tegucigalpa, FM' },
];

// ── Configuración visual de la columna TIPO (clasificación de la acción) ──
const TIPO_CONFIG = {
  creacion:    { label:'Creación',    color:'var(--success)', bg:'var(--success-bg)',   icon:'add_circle' },
  edicion:     { label:'Edición',     color:'var(--info)',    bg:'var(--info-bg)',      icon:'edit' },
  revision:    { label:'Revisión',    color:'#7b1fa2',        bg:'#f3e8ff',             icon:'fact_check' },
  emision:     { label:'Emisión',     color:'var(--warning)', bg:'var(--warning-bg)',   icon:'send' },
  eliminacion: { label:'Eliminación', color:'var(--danger)',  bg:'var(--danger-bg)',    icon:'delete' },
  sesion:      { label:'Sesión',      color:'var(--muted)',   bg:'var(--cream)',        icon:'login' },
  error:       { label:'Error',       color:'var(--danger)',  bg:'var(--danger-bg)',    icon:'warning' },
};

// ── Configuración visual de la columna OBJETO ASOCIADO ──
const OBJ_CONFIG = {
  Proyecto:  { color:'var(--navy)',    bg:'rgba(13,27,62,0.08)', icon:'folder_open' },
  Solicitud: { color:'var(--warning)', bg:'var(--warning-bg)',   icon:'inventory_2' },
  Reporte:   { color:'var(--info)',    bg:'var(--info-bg)',      icon:'bar_chart' },
  Usuario:   { color:'#7b1fa2',        bg:'#f3e8ff',             icon:'manage_accounts' },
};

const ROL_LABELS = { admin:'Admin', oficina:'Sup. Oficina', campo:'Sup. Campo', empleado:'Empleado', logistica:'Logística' };

function renderLog(data){
  const tbody = document.getElementById('log-tbody');
  tbody.innerHTML = data.map(r => {
    const t = TIPO_CONFIG[r.tipo] || TIPO_CONFIG.sesion;
    // Objeto asociado: nulo (—) en inicios de sesión y errores de acceso
    const objHtml = r.objeto ? (()=>{ const o = OBJ_CONFIG[r.objeto.clase] || OBJ_CONFIG.Proyecto;
      return `<div style="display:flex;align-items:center;gap:8px">
        <span style="display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:20px;font-size:10.5px;font-weight:600;background:${o.bg};color:${o.color};flex-shrink:0">
          <span class="material-symbols-rounded" style="font-size:12px">${o.icon}</span>${r.objeto.clase}
        </span>
        <span style="font-size:12px;color:var(--text-light)">${r.objeto.ref}</span>
      </div>`; })()
      : '<span style="color:var(--muted);font-size:12px">—</span>';

    return `<tr>
      <td style="color:var(--muted);font-size:11.5px">${r.id}</td>
      <td style="font-size:12px;color:var(--text-light);white-space:nowrap">${r.ts}</td>
      <td>
        <div style="display:flex;align-items:center;gap:8px">
          <div style="width:26px;height:26px;border-radius:50%;background:var(--navy-light);display:flex;align-items:center;justify-content:center;font-size:9.5px;font-weight:600;color:var(--gold-light);flex-shrink:0">${r.user.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}</div>
          <span style="font-size:12.5px;font-weight:500">${r.user}</span>
        </div>
      </td>
      <td><span class="badge badge-navy" style="font-size:10px">${ROL_LABELS[r.rol]||r.rol}</span></td>
      <td>${objHtml}</td>
      <td style="font-size:11.5px;color:var(--muted)">${r.ip}</td>
      <td>
        <span style="display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:20px;font-size:10.5px;font-weight:500;background:${t.bg};color:${t.color}">
          <span class="material-symbols-rounded" style="font-size:12px">${t.icon}</span>${t.label}
        </span>
      </td>
    </tr>`;
  }).join('');
  document.getElementById('log-count').textContent = `Mostrando ${data.length} de 1,248 registros`;
}

function filtrarBitacora(q){
  const query   = (q || document.querySelector('.search-input')?.value || '').toLowerCase();
  const usuario = document.getElementById('f-usuario').value.toLowerCase();
  const tipo    = document.getElementById('f-tipo').value.toLowerCase();
  const objeto  = (document.getElementById('f-objeto')||{}).value || '';
  let result = LOG_DATA.filter(r => {
    const refTxt    = r.objeto ? (r.objeto.clase+' '+r.objeto.ref).toLowerCase() : '';
    const matchQ    = !query   || r.user.toLowerCase().includes(query) || refTxt.includes(query) || r.ip.toLowerCase().includes(query);
    const matchUser = !usuario || r.user.toLowerCase().includes(usuario);
    const matchTipo = !tipo    || r.tipo === tipo;
    const matchObj  = !objeto  || (r.objeto && r.objeto.clase === objeto);
    return matchQ && matchUser && matchTipo && matchObj;
  });
  renderLog(result);
}

// Render on load
renderLog(LOG_DATA);

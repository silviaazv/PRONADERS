/* ============================================================
   dashboard-logistica.js — DASHBOARD DEL EQUIPO DE LOGÍSTICA
   ------------------------------------------------------------
   Ahora consume datos reales de /api/solicitudes, /api/equipos,
   /api/proyectos y /api/usuarios en vez de arreglos de muestra.
   ============================================================ */

let _equiposCache = [];
let _solicitudesCache = [];
let _proyectosMap = {};
let _usuariosMap = {};
let _equiposMap = {};
let _filasPorSolicitud = {}; // id_solicitud -> [ [tipo, descripcion, cantidad], ... ]
let _equipoSeleccionado = ''; // '' = todos los equipos
let _solicitudDespacharId = null; // id de la solicitud que se está despachando

function formatearFecha(iso){
  if(!iso) return '—';
  const d = new Date(iso);
  if(isNaN(d)) return iso;
  return d.toLocaleDateString('es-HN', {day:'2-digit', month:'short', year:'numeric'});
}

/* Tabla de ítems (Tipo / Recurso / Cantidad) */
function tablaItems(items){
  if(!items || !items.length) return '';
  return `<div style="border:1px solid var(--cream-dark);border-radius:8px;overflow:hidden;margin-top:8px">
    <table style="width:100%;border-collapse:collapse;font-size:12px">
      <thead><tr style="background:var(--cream)">
        <th style="padding:6px 10px;text-align:left;font-size:9.5px;text-transform:uppercase;color:var(--muted)">Tipo</th>
        <th style="padding:6px 10px;text-align:left;font-size:9.5px;text-transform:uppercase;color:var(--muted)">Recurso</th>
        <th style="padding:6px 10px;text-align:left;font-size:9.5px;text-transform:uppercase;color:var(--muted)">Cantidad</th>
      </tr></thead>
      <tbody>${items.map(i=>`<tr><td style="padding:6px 10px">${i[0]}</td><td style="padding:6px 10px">${i[1]}</td><td style="padding:6px 10px">${i[2]}</td></tr>`).join('')}</tbody>
    </table>
  </div>`;
}

function nombreProyecto(s){ return (_proyectosMap[s.id_proyecto]||{}).nombre_proyecto || `Proyecto #${s.id_proyecto}`; }
function nombreSolicitante(s){ return (_usuariosMap[s.id_usuario]||{}).nombre_usuario || `Usuario #${s.id_usuario}`; }
function nombreEquipo(s){ return s.id_equipo_log ? ((_equiposMap[s.id_equipo_log]||{}).nombre_equipo_log || `Equipo #${s.id_equipo_log}`) : 'Sin equipo asignado'; }
function itemsDe(s){ return (_filasPorSolicitud[s.id_solicitud]||[]).map(f=>[f.tipo_recurso, f.descripcion_recurso, f.cantidad_recurso]); }

/* ── Tarjeta de "Despacho Pendiente" ── */
function cardPendiente(s){
  const codigo = `SOL-${s.id_solicitud}`;
  return `
  <div class="despacho-card">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap">
      <div style="flex:1;min-width:220px">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <span style="font-size:11px;font-weight:600;color:var(--muted)">${codigo}</span>
          <span class="badge badge-dispatch"><span class="material-symbols-rounded" style="font-size:11px">local_shipping</span>Aprobado</span>
          <span class="badge badge-navy" style="font-size:10px">${nombreEquipo(s)}</span>
        </div>
        <div style="font-size:15px;font-weight:600;color:var(--navy);margin-top:5px">${nombreProyecto(s)}</div>
        <div style="font-size:12px;color:var(--muted);margin-top:2px">${nombreSolicitante(s)} · Emitida: ${formatearFecha(s.fecha_solicitud)}</div>
        ${s.justificacion ? `<div style="font-size:12.5px;color:var(--text-light);margin-top:8px"><strong>Justificación:</strong> ${s.justificacion}</div>` : ''}
        ${tablaItems(itemsDe(s))}
      </div>
      <div style="text-align:right;flex-shrink:0">
        <button class="btn btn-info btn-sm" onclick="abrirModalDespacho(${s.id_solicitud})">
          <span class="material-symbols-rounded" style="font-size:14px">local_shipping</span> Despachar
        </button>
      </div>
    </div>
  </div>`;
}

//MODAL DESPACHO
function abrirModalDespacho(id) {
    _solicitudDespacharId = id;
    const s = buscarSolicitud(id);
    if (!s) {
        showToast('Solicitud no encontrada', 'warning');
        return;
    }

    document.getElementById('despacho-solicitud-info').textContent = `SOL-${s.id_solicitud} - ${nombreProyecto(s)}`;
    document.getElementById('despacho-fecha').value = new Date().toISOString().slice(0, 10);
    document.getElementById('despacho-responsable').value = '';
    document.getElementById('despacho-obs').value = '';
    document.getElementById('despacho-remision-files').innerHTML = '';
    document.getElementById('modal-despacho-logistica').classList.add('open');
}

function cerrarModalDespacho() {
    document.getElementById('modal-despacho-logistica').classList.remove('open');
    _solicitudDespacharId = null;
}

async function confirmarDespachoLogistica() {
    const fecha = document.getElementById('despacho-fecha').value;
    const responsable = document.getElementById('despacho-responsable').value.trim();
    const observaciones = document.getElementById('despacho-obs').value.trim();

    if (!fecha) {
        showToast('La fecha de entrega es obligatoria', 'warning');
        return;
    }
    if (!responsable) {
        showToast('El responsable de entrega es obligatorio', 'warning');
        return;
    }

    try {
        const result = await API.solicitudes.despachar(_solicitudDespacharId, {
            id_usuario: parseInt(sessionStorage.getItem('pron_id_usuario')) || 1,
            fecha_despacho: fecha,
            responsable_entrega: responsable,
            observaciones: observaciones || null
        });

        if (result.success) {
            showToast('Despacho registrado exitosamente', 'success');
            cerrarModalDespacho();

            // Recargar datos
            await cargarDatos();

            render();
        }
    } catch (error) {
        console.error('Error registrando despacho:', error);
        showToast(error.message || 'Error al registrar despacho', 'warning');
    }
}

// ── Función para mostrar archivos en el modal ──
function mostrarArchivosLogistica(containerId, files) {
    const c = document.getElementById(containerId);
    if (!c || !files || !files.length) return;

    Array.from(files).forEach(f => {
        const d = document.createElement('div');
        d.className = 'file-chip';
        d.dataset.filename = f.name;
        d.style.cssText = 'display:flex;align-items:center;gap:8px;background:var(--cream);border:1px solid var(--cream-dark);border-radius:8px;padding:6px 10px;font-size:12px';
        d.innerHTML = `
            <span class="material-symbols-rounded" style="font-size:16px;color:var(--navy)">description</span>
            <span style="flex:1;color:var(--text)">${f.name}</span>
            <span style="color:var(--muted)">${(f.size / 1024).toFixed(0)} KB</span>
            <button type="button" onclick="this.parentElement.remove()" style="background:none;border:none;cursor:pointer;color:var(--muted)">✕</button>
        `;
        c.appendChild(d);
    });
}

// ── Toast ──
let _toastTimer;

function showToast(msg, tipo = 'success') {
    const t = document.getElementById('toast');
    if (!t) return;
    const icons = { success: 'check_circle', warning: 'warning', info: 'mail' };
    t.className = `toast ${tipo}`;
    document.getElementById('toast-icon').textContent = icons[tipo] || 'check_circle';
    document.getElementById('toast-msg').textContent = msg;
    t.classList.add('show');
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => t.classList.remove('show'), 4500);
}

/* ── Fila de "Historial de Despachos": clickeable, abre modal ── */
function filaHistorial(s){
  const codigo = `SOL-${s.id_solicitud}`;
  const confirmada = s.estado_solicitud === 'CONFIRMADA';
  const cfg = confirmada
    ? { ico:'verified', bg:'var(--success-bg)', color:'var(--success)' }
    : { ico:'local_shipping', bg:'var(--info-bg)', color:'var(--info)' };
  const badgeHtml = confirmada
    ? `<span class="badge badge-success">Confirmado</span>`
    : `<span class="badge" style="background:var(--info-bg);color:var(--info)">Entregado</span>`;
  return `
  <div onclick="abrirInfoDespacho(${s.id_solicitud})" role="button" tabindex="0"
       onkeydown="if(event.key==='Enter'){abrirInfoDespacho(${s.id_solicitud})}"
       style="cursor:pointer;display:flex;align-items:center;gap:14px;padding:12px 0;border-bottom:1px solid var(--cream-dark);border-radius:8px"
       title="Ver la información de la solicitud ${codigo}"
       onmouseover="this.style.background='rgba(247,244,238,0.7)'" onmouseout="this.style.background=''">
    <div style="width:36px;height:36px;border-radius:9px;background:${cfg.bg};display:flex;align-items:center;justify-content:center;flex-shrink:0">
      <span class="material-symbols-rounded" style="font-size:17px;color:${cfg.color}">${cfg.ico}</span>
    </div>
    <div style="flex:1">
      <div style="font-size:13px;font-weight:500">${codigo} — ${nombreProyecto(s)}</div>
      <div style="font-size:11.5px;color:var(--muted)">${nombreEquipo(s)} · Solicitada ${formatearFecha(s.fecha_solicitud)}</div>
    </div>
    ${badgeHtml}
    <span class="material-symbols-rounded" style="font-size:16px;color:var(--muted)">chevron_right</span>
  </div>`;
}

function buscarSolicitud(id){
  return _solicitudesCache.find(s => s.id_solicitud === id);
}

function abrirInfoDespacho(id){
  const s = buscarSolicitud(id);
  if(!s){ console.error('[PRONADERS] Solicitud no encontrada:', id); return; }
  document.getElementById('mid-titulo').textContent = `SOL-${s.id_solicitud}`;
  document.getElementById('mid-body').innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px">
      <span class="badge badge-navy" style="font-size:10.5px">${nombreEquipo(s)}</span>
      <span class="badge badge-info" style="font-size:10.5px">${s.estado_solicitud}</span>
    </div>
    <div style="font-size:17px;font-weight:600;color:var(--navy)">${nombreProyecto(s)}</div>
    <div class="text-xs" style="color:var(--muted);margin:4px 0 12px">${nombreSolicitante(s)} · Emitida: ${formatearFecha(s.fecha_solicitud)}</div>
    ${s.justificacion ? `<div style="font-size:12.5px;color:var(--text-light)"><strong>Justificación:</strong> ${s.justificacion}</div>` : ''}
    ${tablaItems(itemsDe(s))}`;
  document.getElementById('modal-info-despacho').classList.add('open');
}

function cambiarEquipo(valor){
  _equipoSeleccionado = valor;
  render();
}

/* ── Render principal del dashboard ── */
function render(){
  const filtro = s => !_equipoSeleccionado || String(s.id_equipo_log) === _equipoSeleccionado;
  const pendientes = _solicitudesCache.filter(s => s.estado_solicitud === 'APROBADA').filter(filtro);
  const transito    = _solicitudesCache.filter(s => s.estado_solicitud === 'EN DESPACHO').filter(filtro);
  const historial    = _solicitudesCache.filter(s => ['ENTREGADA','CONFIRMADA'].includes(s.estado_solicitud)).filter(filtro);
  const confirmadas  = historial.filter(h => h.estado_solicitud === 'CONFIRMADA').length;

  const selectorEquipo = `
    <select class="form-control" style="width:auto;padding:8px 32px 8px 12px;font-size:13px" onchange="cambiarEquipo(this.value)">
      <option value="">Todos los equipos</option>
      ${_equiposCache.map(e=>`<option value="${e.id_equipo_log}" ${String(_equipoSeleccionado)===String(e.id_equipo_log)?'selected':''}>${e.nombre_equipo_log}</option>`).join('')}
    </select>`;

  const subtitulo = _equipoSeleccionado
    ? `Equipo: ${(_equiposMap[_equipoSeleccionado]||{}).nombre_equipo_log || ''}`
    : 'Vista de logística: todos los equipos';

  document.getElementById('main-logistica').innerHTML = `
    <div style="margin-bottom:28px;display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap" class="fade-up">
      <div>
        <h1 style="font-family:var(--font-serif);font-size:26px;font-weight:300;color:var(--navy)">
          Panel de <em style="font-style:italic">Logística</em>
        </h1>
        <p style="font-size:13px;color:var(--muted);margin-top:4px">${subtitulo}</p>
      </div>
      ${selectorEquipo}
    </div>

    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:28px" class="fade-up fade-up-1">
      <div class="metric-card">
        <div style="width:36px;height:36px;border-radius:9px;background:#f3e8ff;display:flex;align-items:center;justify-content:center;margin-bottom:12px">
          <span class="material-symbols-rounded" style="font-size:18px;color:#6a1b9a">assignment</span>
        </div>
        <div style="font-family:var(--font-serif);font-size:28px;font-weight:300;color:var(--navy)">${pendientes.length}</div>
        <div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.6px">Despachos pendientes</div>
      </div>
      <div class="metric-card">
        <div style="width:36px;height:36px;border-radius:9px;background:var(--info-bg);display:flex;align-items:center;justify-content:center;margin-bottom:12px">
          <span class="material-symbols-rounded" style="font-size:18px;color:var(--info)">local_shipping</span>
        </div>
        <div style="font-family:var(--font-serif);font-size:28px;font-weight:300;color:var(--navy)">${transito.length}</div>
        <div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.6px">En tránsito ahora</div>
      </div>
      <div class="metric-card">
        <div style="width:36px;height:36px;border-radius:9px;background:var(--success-bg);display:flex;align-items:center;justify-content:center;margin-bottom:12px">
          <span class="material-symbols-rounded" style="font-size:18px;color:var(--success)">inventory_2</span>
        </div>
        <div style="font-family:var(--font-serif);font-size:28px;font-weight:300;color:var(--navy)">${confirmadas}</div>
        <div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.6px">Entregas confirmadas</div>
      </div>
    </div>

    <div class="card fade-up fade-up-2" style="margin-bottom:20px">
      <div class="card-header">
        <div>
          <div class="card-title">Despachos Pendientes</div>
          <div class="card-subtitle">Solicitudes aprobadas por Gerencia Técnica${_equipoSeleccionado?` · ${(_equiposMap[_equipoSeleccionado]||{}).nombre_equipo_log||''}`:' · todos los equipos'}</div>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:12px">
        ${pendientes.length ? pendientes.map(cardPendiente).join('') : `
        <div style="text-align:center;padding:30px;color:var(--muted)">
          <span class="material-symbols-rounded" style="font-size:32px;display:block;margin-bottom:8px;color:var(--cream-dark)">inbox</span>
          No hay despachos pendientes.
        </div>`}
      </div>
    </div>

    <div class="card fade-up fade-up-3">
      <div class="card-header">
        <div>
          <div class="card-title">Historial de Despachos</div>
          <div class="card-subtitle">Entregas y confirmaciones · haz clic en una fila para ver la solicitud</div>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:0">
        ${historial.length ? historial.map(filaHistorial).join('') : `
        <div style="text-align:center;padding:30px;color:var(--muted)">
          <span class="material-symbols-rounded" style="font-size:32px;display:block;margin-bottom:8px;color:var(--cream-dark)">history</span>
          Sin despachos registrados todavía.
        </div>`}
      </div>
    </div>`;
}

/* ── Carga inicial de datos reales ── */
async function cargarDatos(){
  document.getElementById('main-logistica').innerHTML = `<div style="text-align:center;padding:60px;color:var(--muted)">Cargando panel de logística…</div>`;
  try {
    const [equipos, solicitudes, proyectos, usuarios] = await Promise.all([
      API.equipos.listar(),
      API.solicitudes.listar(),
      API.proyectos.listar(),
      API.usuarios.listar(),
    ]);

    _equiposCache = equipos;
    _equiposMap = Object.fromEntries(equipos.map(e => [e.id_equipo_log, e]));
    _proyectosMap = Object.fromEntries(proyectos.map(p => [p.id_proyecto, p]));
    _usuariosMap = Object.fromEntries(usuarios.map(u => [u.id_usuario, u]));

    // Solo nos interesan solicitudes que ya salieron de "pendiente"
    // (aprobadas, en despacho, entregadas o confirmadas)
    _solicitudesCache = solicitudes.filter(s =>
      ['APROBADA','EN DESPACHO','ENTREGADA','CONFIRMADA'].includes(s.estado_solicitud)
    );

    // Cargar los ítems (fila_solicitud) de cada una de esas solicitudes
    const listasDeFilas = await Promise.all(_solicitudesCache.map(s => API.solicitudes.filas(s.id_solicitud)));
    _filasPorSolicitud = Object.fromEntries(_solicitudesCache.map((s, i) => [s.id_solicitud, listasDeFilas[i]]));

    render();
  } catch (err) {
    document.getElementById('main-logistica').innerHTML = `<div style="text-align:center;padding:60px;color:var(--danger)">No se pudo cargar el panel de logística: ${err.message}</div>`;
  }
}

document.addEventListener('DOMContentLoaded', cargarDatos);

window.abrirModalDespacho = abrirModalDespacho;
window.cerrarModalDespacho = cerrarModalDespacho;
window.confirmarDespachoLogistica = confirmarDespachoLogistica;
window.mostrarArchivosLogistica = mostrarArchivosLogistica;
window.showToast = showToast;

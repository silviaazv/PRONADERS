/* ============================================================
   solicitudes.js — MÓDULO: SOLICITUDES DE RECURSOS (FRONTEND)
   Renderiza la interfaz usando datos de la API
   ============================================================ */

// ─────────────────────────────────────────────────────────────
// VARIABLES GLOBALES
// ─────────────────────────────────────────────────────────────

let solicitudesCache = [];
let proyectosCache = [];
let equiposCache = [];
let _solActiva = null;

const ID_USUARIO = parseInt(sessionStorage.getItem('pron_id_usuario')) || null;
const NOMBRE_USUARIO = sessionStorage.getItem('pron_nombre') || 'Usuario';
const ROLE = sessionStorage.getItem('pron_role') || 'campo';

// ─────────────────────────────────────────────────────────────
// INICIALIZACIÓN
// ─────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
    await cargarDatosIniciales();
    renderVista();
});

async function cargarDatosIniciales() {
    try {
        const [solicitudes, proyectos, equipos] = await Promise.all([
            API.solicitudes.listar({ id_usuario: ID_USUARIO }),
            API.proyectos.listar({ id_usuario: ID_USUARIO }),
            API.equipos.listar()
        ]);

        solicitudesCache = solicitudes || [];
        proyectosCache = proyectos || [];
        equiposCache = equipos || [];

    } catch (error) {
        console.error('Error cargando datos:', error);
        showToast('Error al cargar datos del servidor', 'warning');
    }
}

// ─────────────────────────────────────────────────────────────
// SOLICITUDES VISIBLES SEGÚN ROL
// ─────────────────────────────────────────────────────────────

function solicitudesVisibles() {
    const esAdmin = (ROLE === 'admin_oficina' || ROLE === 'admin');
    if (esAdmin) return solicitudesCache;
    return solicitudesCache.filter(s => s.id_usuario === ID_USUARIO);
}

function solicitudesLogistica() {
    const equipoNombre = sessionStorage.getItem('pron_nombre') || '';
    if (ROLE === 'logistica') {
        return solicitudesCache.filter(s => s.equipo_nombre === equipoNombre);
    }
    return solicitudesCache;
}

// ─────────────────────────────────────────────────────────────
// RENDER POR ROL
// ─────────────────────────────────────────────────────────────

function renderVista() {
    if (ROLE === 'logistica') renderVistaLogistica();
    else if (ROLE === 'campo') renderVistaCampo();
    else if (ROLE === 'admin_oficina' || ROLE === 'admin') renderVistaAdmin();
    else renderVistaCampo();
}

// ─────────────────────────────────────────────────────────────
// VISTA CAMPO
// ─────────────────────────────────────────────────────────────

function renderVistaCampo() {
    const proyectos = [...new Set(solicitudesVisibles().map(s => s.proyecto_nombre || 'Sin proyecto'))].sort();

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
    <div class="card mb-16 fade-up" style="padding:12px 18px">
        <div style="display:flex;gap:10px;align-items:center;justify-content:flex-end;flex-wrap:wrap">
            <span class="text-xs text-muted" id="sol-contador" style="margin-right:auto"></span>
            <select class="form-control" id="f-sol-estado" style="width:auto;padding:7px 32px 7px 12px;font-size:13px" onchange="renderListaSolicitudes()">
                <option value="">Todas</option>
                <option value="PENDIENTE">Pendientes</option>
                <option value="APROBADA">Aprobadas</option>
                <option value="RECHAZADA">Rechazadas</option>
                <option value="EN DESPACHO">En despacho</option>
                <option value="ENTREGADA">Entregadas</option>
                <option value="CONFIRMADA">Confirmadas</option>
            </select>
            <select class="form-control" id="f-sol-proyecto" style="width:auto;padding:7px 32px 7px 12px;font-size:13px" onchange="renderListaSolicitudes()">
                <option value="">Todos los proyectos</option>
                ${proyectos.map(p => `<option value="${p}">${p}</option>`).join('')}
            </select>
        </div>
    </div>
    <div id="lista-solicitudes" style="display:flex;flex-direction:column;gap:14px" class="fade-up"></div>`;

    renderListaSolicitudes();
}

function renderListaSolicitudes() {
    const estado = document.getElementById('f-sol-estado')?.value || '';
    const proy = document.getElementById('f-sol-proyecto')?.value || '';

    let data = solicitudesVisibles().filter(s => {
        const matchEstado = !estado || s.estado_solicitud === estado;
        const matchProy = !proy || s.proyecto_nombre === proy;
        return matchEstado && matchProy;
    });

    const cont = document.getElementById('lista-solicitudes');
    if (!cont) return;

    cont.innerHTML = data.length
        ? data.map(s => cardSolicitud(s)).join('')
        : `<div class="card" style="text-align:center;padding:40px;color:var(--muted)">
            <span class="material-symbols-rounded" style="font-size:36px;display:block;margin-bottom:10px;color:var(--cream-dark)">inbox</span>
            No hay solicitudes con los filtros seleccionados.
        </div>`;

    const cc = document.getElementById('sol-contador');
    if (cc) {
        const total = solicitudesVisibles().length;
        const pendientes = solicitudesVisibles().filter(s => s.estado_solicitud === 'PENDIENTE').length;
        cc.textContent = `${data.length} de ${total} solicitudes · ${pendientes} pendientes`;
    }
}

// ─────────────────────────────────────────────────────────────
// VISTA ADMIN
// ─────────────────────────────────────────────────────────────

function renderVistaAdmin() {
    const pendientes = solicitudesCache.filter(s => s.estado_solicitud === 'PENDIENTE').length;
    const proyectos = [...new Set(solicitudesCache.map(s => s.proyecto_nombre || 'Sin proyecto'))].sort();

    document.getElementById('main-content').innerHTML = `
    <div class="flex-between mb-24 fade-up">
        <div class="section-head" style="margin-bottom:0">
            <h2>Solicitudes <em style="font-style:italic">Recibidas</em></h2>
            <p>Revisión y aprobación de solicitudes de recursos de los proyectos</p>
        </div>
    </div>
    <div class="card mb-16 fade-up" style="padding:12px 18px">
        <div style="display:flex;gap:10px;align-items:center;justify-content:flex-end;flex-wrap:wrap">
            <span class="text-xs text-muted" id="sol-contador" style="margin-right:auto"></span>
            <select class="form-control" id="f-sol-estado" style="width:auto;padding:7px 32px 7px 12px;font-size:13px" onchange="renderListaSolicitudes()">
                <option value="">Todas</option>
                <option value="PENDIENTE" selected>Pendientes (${pendientes})</option>
                <option value="APROBADA">Aprobadas</option>
                <option value="RECHAZADA">Rechazadas</option>
                <option value="EN DESPACHO">En despacho</option>
                <option value="ENTREGADA">Entregadas</option>
                <option value="CONFIRMADA">Confirmadas</option>
            </select>
            <select class="form-control" id="f-sol-proyecto" style="width:auto;padding:7px 32px 7px 12px;font-size:13px" onchange="renderListaSolicitudes()">
                <option value="">Todos los proyectos</option>
                ${proyectos.map(p => `<option value="${p}">${p}</option>`).join('')}
            </select>
        </div>
    </div>
    <div id="lista-solicitudes" style="display:flex;flex-direction:column;gap:14px" class="fade-up"></div>`;

    renderListaSolicitudesAdmin();
}

function renderListaSolicitudesAdmin() {
    const estado = document.getElementById('f-sol-estado')?.value || '';
    const proy = document.getElementById('f-sol-proyecto')?.value || '';

    let data = solicitudesCache.filter(s => {
        const matchEstado = !estado || s.estado_solicitud === estado;
        const matchProy = !proy || s.proyecto_nombre === proy;
        return matchEstado && matchProy;
    });

    const cont = document.getElementById('lista-solicitudes');
    if (!cont) return;

    cont.innerHTML = data.length
        ? data.map(s => cardSolicitud(s, 'admin')).join('')
        : `<div class="card" style="text-align:center;padding:40px;color:var(--muted)">No hay solicitudes</div>`;
}

// ─────────────────────────────────────────────────────────────
// VISTA LOGÍSTICA
// ─────────────────────────────────────────────────────────────

function renderVistaLogistica() {
    document.getElementById('main-content').innerHTML = `
    <div class="flex-between mb-24 fade-up">
        <div class="section-head" style="margin-bottom:0">
            <h2>Despachos <em style="font-style:italic">Asignados</em></h2>
            <p>Solicitudes aprobadas asignadas a tu equipo</p>
        </div>
    </div>
    <div class="tabs fade-up" id="tabs-log">
        <button class="tab active" onclick="filtrarLog('APROBADA',this)">Por despachar</button>
        <button class="tab" onclick="filtrarLog('EN DESPACHO',this)">En tránsito</button>
        <button class="tab" onclick="filtrarLog('todas',this)">Todas</button>
    </div>
    <div id="lista-solicitudes-log" style="display:flex;flex-direction:column;gap:14px" class="fade-up"></div>`;

    filtrarLog('APROBADA');
}

function filtrarLog(estado, btn) {
    if (btn) {
        document.querySelectorAll('#tabs-log .tab').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
    }

    const base = solicitudesLogistica();
    const data = estado === 'todas'
        ? base.filter(s => ['APROBADA', 'EN DESPACHO', 'ENTREGADA', 'CONFIRMADA'].includes(s.estado_solicitud))
        : base.filter(s => s.estado_solicitud === estado);

    const c = document.getElementById('lista-solicitudes-log');
    c.innerHTML = data.length
        ? data.map(s => cardSolicitud(s, 'logistica')).join('')
        : `<div class="card" style="text-align:center;padding:40px;color:var(--muted)">No hay despachos</div>`;
}

// ─────────────────────────────────────────────────────────────
// RENDERIZAR CARD DE SOLICITUD
// ─────────────────────────────────────────────────────────────

function cardSolicitud(s, vistaRol = 'campo') {
    const estadoConf = {
        'PENDIENTE': { label: 'Pendiente', cls: 'badge-warning', icon: 'pending' },
        'APROBADA': { label: 'Aprobada', cls: 'badge-success', icon: 'check_circle' },
        'RECHAZADA': { label: 'Rechazada', cls: 'badge-danger', icon: 'cancel' },
        'EN DESPACHO': { label: 'En despacho', cls: 'badge-dispatch', icon: 'local_shipping' },
        'ENTREGADA': { label: 'Entregada', cls: 'badge-delivered', icon: 'inventory_2' },
        'CONFIRMADA': { label: 'Confirmada', cls: 'badge-confirmed', icon: 'verified' },
    };

    const ec = estadoConf[s.estado_solicitud] || estadoConf['PENDIENTE'];
    const fecha = new Date(s.fecha_solicitud).toLocaleDateString('es-HN', { day: '2-digit', month: 'short', year: 'numeric' });

    // Items
    const itemsHtml = (s.items || []).map(it => `
        <tr>
            <td style="padding:7px 12px;font-size:12.5px">${it.tipo_recurso || it.tipo || 'N/A'}</td>
            <td style="padding:7px 12px;font-size:12.5px">${it.descripcion_recurso || it.desc || 'N/A'}</td>
            <td style="padding:7px 12px;font-size:12.5px">${it.cantidad_recurso || it.cantidad || 'N/A'}</td>
        </tr>
    `).join('');

    // Acciones según rol
    let acciones = '';
    if ((vistaRol === 'admin' || vistaRol === 'admin_oficina') && s.estado_solicitud === 'PENDIENTE') {
        acciones = `
            <button class="btn btn-danger btn-sm" onclick="abrirModalRechazar(${s.id_solicitud})">
                <span class="material-symbols-rounded" style="font-size:14px">cancel</span> Rechazar
            </button>
            <button class="btn btn-success btn-sm" onclick="abrirModalAprobar(${s.id_solicitud})">
                <span class="material-symbols-rounded" style="font-size:14px">check_circle</span> Aprobar
            </button>`;
    } else if (vistaRol === 'logistica' && s.estado_solicitud === 'APROBADA') {
        acciones = `
            <button class="btn btn-info btn-sm" onclick="abrirModalDespacho(${s.id_solicitud})">
                <span class="material-symbols-rounded" style="font-size:14px">local_shipping</span> Registrar despacho
            </button>`;
    } else if (vistaRol === 'campo' && s.estado_solicitud === 'ENTREGADA') {
        acciones = `
            <button class="btn btn-success btn-sm" onclick="abrirModalRecepcion(${s.id_solicitud})">
                <span class="material-symbols-rounded" style="font-size:14px">verified</span> Confirmar recepción
            </button>`;
    }

    const motivoRechazo = s.motivo_rechazo ? `
        <div style="background:var(--danger-bg);border-left:3px solid var(--danger);border-radius:var(--radius);padding:10px 14px;margin-bottom:12px">
            <div style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--danger);margin-bottom:3px">
                <span class="material-symbols-rounded" style="font-size:12px;vertical-align:-2px">cancel</span> Motivo del rechazo
            </div>
            <div style="font-size:12.5px;color:var(--text);line-height:1.55">${s.motivo_rechazo}</div>
        </div>
    ` : '';

    return `
    <div class="sol-card" id="card-${s.id_solicitud}">
        <div class="flex-between mb-12">
            <div>
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                    <span style="font-size:11px;font-weight:600;color:var(--muted)">SOL-${String(s.id_solicitud).padStart(4, '0')}</span>
                    <span class="badge ${ec.cls}">
                        <span class="material-symbols-rounded" style="font-size:12px">${ec.icon}</span>${ec.label}
                    </span>
                    ${s.equipo_nombre ? `<span class="badge" style="background:#f3e8ff;color:#6a1b9a;font-size:10.5px"><span class="material-symbols-rounded" style="font-size:11px">local_shipping</span>${s.equipo_nombre}</span>` : ''}
                </div>
                <div style="font-size:16px;font-weight:600;color:var(--navy);margin-top:6px">${s.proyecto_nombre || 'Sin proyecto'}</div>
                <div class="text-xs text-muted mt-4" style="display:flex;gap:14px;flex-wrap:wrap">
                    <span><span class="material-symbols-rounded" style="font-size:12px;vertical-align:-2px">person</span> ${s.solicitante_nombre || 'N/A'}</span>
                    <span><span class="material-symbols-rounded" style="font-size:12px;vertical-align:-2px">calendar_today</span> Emitida: <strong>${fecha}</strong></span>
                </div>
            </div>
        </div>

        ${motivoRechazo}

        <div class="text-sm text-muted mb-12" style="line-height:1.6"><strong>Justificación:</strong> ${s.justificacion || 'Sin justificación'}</div>

        <div style="border:1px solid var(--cream-dark);border-radius:var(--radius);overflow:hidden;margin-bottom:12px">
            <table style="width:100%;border-collapse:collapse">
                <thead><tr style="background:var(--cream)">
                    <th style="padding:7px 12px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.7px;color:var(--muted);font-weight:600">Tipo</th>
                    <th style="padding:7px 12px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.7px;color:var(--muted);font-weight:600">Recurso</th>
                    <th style="padding:7px 12px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.7px;color:var(--muted);font-weight:600">Cantidad</th>
                </tr></thead>
                <tbody style="font-size:12.5px">${itemsHtml || '<tr><td colspan="3" style="padding:12px;text-align:center;color:var(--muted)">Sin recursos</td></tr>'}</tbody>
            </table>
        </div>

        <div style="display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-top:14px;padding-top:14px;border-top:1px solid var(--cream-dark)">
            <span class="text-xs text-muted">${s.id_solicitud ? `ID: ${s.id_solicitud}` : ''}</span>
            ${acciones ? `<div style="display:flex;gap:8px">${acciones}</div>` : ''}
        </div>
    </div>`;
}

// ─────────────────────────────────────────────────────────────
// MODALES
// ─────────────────────────────────────────────────────────────

function abrirModalSol() {
    document.getElementById('modal-sol').classList.add('open');
}

function cerrarModalSol() {
    document.getElementById('modal-sol').classList.remove('open');
}

async function enviarSolicitudOficial() {
    const id_proyecto = parseInt(document.getElementById('sol-proyecto')?.value) || null;
    const justificacion = document.getElementById('sol-justificacion')?.value.trim() || '';

    if (!id_proyecto) {
        showToast('Selecciona un proyecto', 'warning');
        return;
    }
    if (!justificacion) {
        showToast('Escribe una justificación', 'warning');
        return;
    }

    // Recolectar items
    const filas = document.querySelectorAll('#sol-items-body tr');
    const items = [];
    filas.forEach(tr => {
        const tipo = tr.querySelector('.sol-item-tipo')?.value || '';
        const desc = tr.querySelector('.sol-item-recurso')?.value.trim() || '';
        const cantidad = tr.querySelector('.sol-item-cantidad')?.value.trim() || '';
        if (tipo && desc && cantidad) {
            items.push({ tipo, desc, cantidad });
        }
    });

    if (items.length === 0) {
        showToast('Agrega al menos un recurso', 'warning');
        return;
    }

    try {
        const result = await API.solicitudes.crear({
            id_proyecto,
            id_usuario: ID_USUARIO,
            justificacion,
            items
        });

        if (result.success) {
            showToast('Solicitud creada exitosamente', 'success');
            cerrarModalSol();
            await cargarDatosIniciales();
            renderVista();
        }
    } catch (error) {
        showToast(error.message || 'Error al crear la solicitud', 'warning');
    }
}

function abrirModalAprobar(id) {
    _solActiva = id;
    document.getElementById('aprob-comentario').value = '';
    document.getElementById('aprob-files').innerHTML = '';
    document.getElementById('aprob-logistica').value = '';
    document.getElementById('modal-aprobar').classList.add('open');
}

async function confirmarAprobacion() {
    const comentario = document.getElementById('aprob-comentario')?.value.trim() || '';
    const id_equipo_log = parseInt(document.getElementById('aprob-logistica')?.value) || null;

    if (!comentario) {
        showToast('El comentario de aprobación es obligatorio', 'warning');
        return;
    }
    if (!id_equipo_log) {
        showToast('Selecciona un equipo logístico', 'warning');
        return;
    }

    try {
        const result = await API.solicitudes.aprobar(_solActiva, {
            id_usuario: ID_USUARIO,
            comentario,
            id_equipo_log
        });

        if (result.success) {
            showToast('Solicitud aprobada', 'success');
            document.getElementById('modal-aprobar').classList.remove('open');
            await cargarDatosIniciales();
            renderVista();
        }
    } catch (error) {
        showToast(error.message || 'Error al aprobar', 'warning');
    }
}

function abrirModalRechazar(id) {
    _solActiva = id;
    document.getElementById('rechazo-motivo').value = '';
    document.getElementById('modal-rechazar').classList.add('open');
}

async function confirmarRechazo() {
    const motivo = document.getElementById('rechazo-motivo')?.value.trim() || '';

    if (!motivo) {
        showToast('El motivo del rechazo es obligatorio', 'warning');
        return;
    }

    try {
        const result = await API.solicitudes.rechazar(_solActiva, {
            id_usuario: ID_USUARIO,
            motivo
        });

        if (result.success) {
            showToast('Solicitud rechazada', 'info');
            document.getElementById('modal-rechazar').classList.remove('open');
            await cargarDatosIniciales();
            renderVista();
        }
    } catch (error) {
        showToast(error.message || 'Error al rechazar', 'warning');
    }
}

function abrirModalDespacho(id) {
    _solActiva = id;
    document.getElementById('despacho-fecha').value = '';
    document.getElementById('despacho-responsable').value = '';
    document.getElementById('despacho-obs').value = '';
    document.getElementById('modal-despacho').classList.add('open');
}

async function confirmarDespacho() {
    const fecha_despacho = document.getElementById('despacho-fecha')?.value || '';
    const responsable_entrega = document.getElementById('despacho-responsable')?.value.trim() || '';

    if (!fecha_despacho) {
        showToast('La fecha de entrega es obligatoria', 'warning');
        return;
    }
    if (!responsable_entrega) {
        showToast('El responsable de entrega es obligatorio', 'warning');
        return;
    }

    try {
        const result = await API.solicitudes.despachar(_solActiva, {
            id_usuario: ID_USUARIO,
            fecha_despacho,
            responsable_entrega
        });

        if (result.success) {
            showToast('Despacho registrado', 'success');
            document.getElementById('modal-despacho').classList.remove('open');
            await cargarDatosIniciales();
            renderVista();
        }
    } catch (error) {
        showToast(error.message || 'Error al registrar despacho', 'warning');
    }
}

function abrirModalRecepcion(id) {
    _solActiva = id;
    document.getElementById('recep-conformidad').value = 'total';
    document.getElementById('recep-obs').value = '';
    document.getElementById('modal-recepcion').classList.add('open');
}

async function confirmarRecepcion() {
    const observaciones = document.getElementById('recep-obs')?.value.trim() || '';

    try {
        const result = await API.solicitudes.confirmarRecepcion(_solActiva, {
            id_usuario: ID_USUARIO,
            observaciones
        });

        if (result.success) {
            showToast('Recepción confirmada', 'success');
            document.getElementById('modal-recepcion').classList.remove('open');
            await cargarDatosIniciales();
            renderVista();
        }
    } catch (error) {
        showToast(error.message || 'Error al confirmar recepción', 'warning');
    }
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function agregarFilaItem() {
    const tb = document.getElementById('sol-items-body');
    if (!tb) return;
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td style="padding:6px 6px 6px 0">
            <select class="form-control sol-item-tipo" style="font-size:13px;padding:7px 28px 7px 10px">
                <option value="">Tipo...</option>
                <option value="MATERIAL">Material</option>
                <option value="EQUIPO">Equipo</option>
                <option value="FINANCIERO">Financiero</option>
            </select>
        </td>
        <td style="padding:6px"><input type="text" class="form-control sol-item-recurso" style="font-size:13px" placeholder="Ej. Cemento Portland"></td>
        <td style="padding:6px"><input type="text" class="form-control sol-item-cantidad" style="font-size:13px;width:110px" placeholder="150 bolsas"></td>
        <td style="padding:6px 0 6px 6px;text-align:right">
            <button type="button" class="btn btn-outline btn-sm" onclick="this.closest('tr').remove()" style="padding:6px 8px">✕</button>
        </td>
    `;
    tb.appendChild(tr);
    tr.querySelector('.sol-item-tipo')?.focus();
}

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

// ─────────────────────────────────────────────────────────────
// EXPORTAR FUNCIONES PARA EL HTML
// ─────────────────────────────────────────────────────────────

window.abrirModalSol = abrirModalSol;
window.cerrarModalSol = cerrarModalSol;
window.enviarSolicitudOficial = enviarSolicitudOficial;
window.agregarFilaItem = agregarFilaItem;
window.abrirModalAprobar = abrirModalAprobar;
window.confirmarAprobacion = confirmarAprobacion;
window.abrirModalRechazar = abrirModalRechazar;
window.confirmarRechazo = confirmarRechazo;
window.abrirModalDespacho = abrirModalDespacho;
window.confirmarDespacho = confirmarDespacho;
window.abrirModalRecepcion = abrirModalRecepcion;
window.confirmarRecepcion = confirmarRecepcion;
window.filtrarLog = filtrarLog;
window.renderListaSolicitudes = renderListaSolicitudes;
window.showToast = showToast;
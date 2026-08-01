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

   //reportes.js — MÓDULO: REPORTES DE AVANCE

// ─────────────────────────────────────────────────────────────
// VARIABLES GLOBALES
// ─────────────────────────────────────────────────────────────

let reportesCache = [];
let proyectosCache = [];
let usuariosCache = [];
let _reporteRechazarId = null;

const ID_USUARIO = parseInt(sessionStorage.getItem('pron_id_usuario')) || null;
const NOMBRE_USUARIO = sessionStorage.getItem('pron_nombre') || 'Usuario';
const ROLE = sessionStorage.getItem('pron_role') || 'Supervisor de Campo';
const ES_ADMIN = (ROLE === 'Administrador de Oficina');
const ES_CAMPO = (ROLE === 'Supervisor de Campo');
const ES_EMPLEADO = (ROLE === 'empleado');

// ─────────────────────────────────────────────────────────────
// INICIALIZACIÓN
// ─────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
    // Empleado: redirigir
    if (ES_EMPLEADO) {
        window.location.replace('dashboard-campo.html');
        return;
    }

    await cargarDatosIniciales();
    renderPaginaReportes();

    // Deep-link: abrir reporte específico
    const abrir = sessionStorage.getItem('pron_open_reporte');
    if (abrir) {
        sessionStorage.removeItem('pron_open_reporte');
        setTimeout(() => {
            const el = document.getElementById('rep-' + abrir);
            if (el) {
                el.classList.add('destacado');
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 200);
    }
});

async function cargarDatosIniciales() {
    try {
        const [reportes, proyectos, usuarios] = await Promise.all([
            API.reportes.listar(),
            API.proyectos.listar(),
            API.usuarios.listar()
        ]);

        reportesCache = reportes || [];
        proyectosCache = proyectos || [];
        usuariosCache = usuarios || [];

    } catch (error) {
        console.error('Error cargando datos:', error);
        showToast('Error al cargar datos del servidor', 'warning');
    }
}

// ─────────────────────────────────────────────────────────────
// REPORTES VISIBLES SEGÚN ROL
// ─────────────────────────────────────────────────────────────

function reportesVisibles() {
    if (ES_ADMIN) return reportesCache;
    // Campo: solo sus reportes
    return reportesCache.filter(r => r.id_usuario === ID_USUARIO);
}

// ─────────────────────────────────────────────────────────────
// RENDER PRINCIPAL
// ─────────────────────────────────────────────────────────────

function renderPaginaReportes() {
    const container = document.getElementById('reportes-content');
    const visibles = reportesVisibles();
    const puedeCrear = ES_CAMPO;

    // Obtener proyectos únicos para filtro
    const proyectosUnicos = [...new Set(visibles.map(r => r.nombre_proyecto).filter(Boolean))];

    const titulo = ES_ADMIN ? 'Reportes de <em style="font-style:italic">Avance</em>' : 'Mis <em style="font-style:italic">Reportes</em>';
    const subtitulo = ES_ADMIN
        ? 'Revisa y aprueba los reportes de avance de los proyectos'
        : 'Registra el progreso de tus proyectos';

    container.innerHTML = `
        <div class="flex-between mb-24 fade-up fade-up-1">
            <div class="section-head" style="margin-bottom:0">
                <h2>${titulo}</h2>
                <p style="font-size:13px;color:var(--muted);margin-top:4px">${subtitulo}</p>
            </div>
            ${puedeCrear ? `
                <button class="btn btn-gold" onclick="abrirModalReporte()">
                    <span class="material-symbols-rounded">add</span> Nuevo Reporte
                </button>
            ` : ''}
        </div>

        <!-- FILTROS -->
        <div class="card mb-20 fade-up fade-up-1 filtros-sticky" style="padding:12px 18px">
            <div style="display:flex;gap:10px;align-items:center;justify-content:flex-end;flex-wrap:wrap">
                <span class="text-xs text-muted" id="rep-contador" style="margin-right:auto"></span>
                <button class="btn btn-outline btn-sm" id="btn-limpiar-rep" onclick="limpiarFiltrosReportes()" style="display:none;white-space:nowrap">
                    <span class="material-symbols-rounded" style="font-size:13px">clear</span> Limpiar filtros
                </button>
                <select class="form-control" id="f-rep-estado" style="width:auto;padding:7px 32px 7px 12px;font-size:13px" onchange="renderReportes()">
                    <option value="">Todos</option>
                    <option value="0" selected>Pendientes</option>
                    <option value="1">Revisados</option>
                </select>
                <select class="form-control" id="f-rep-proyecto" style="width:auto;padding:7px 32px 7px 12px;font-size:13px" onchange="renderReportes()">
                    <option value="">Todos los proyectos</option>
                    ${proyectosUnicos.map(p => `<option value="${p}">${p}</option>`).join('')}
                </select>
                <select class="form-control" id="f-rep-orden" style="width:auto;padding:7px 32px 7px 12px;font-size:13px" onchange="renderReportes()" title="Orden por fecha de emisión">
                    <option value="desc" selected>Fecha: más recientes</option>
                    <option value="asc">Fecha: más antiguos</option>
                </select>
            </div>
        </div>

        <!-- LISTA DE REPORTES -->
        <div id="lista-reportes" style="display:flex;flex-direction:column;gap:18px" class="fade-up fade-up-2"></div>
    `;

    renderReportes();
}

// ─────────────────────────────────────────────────────────────
// RENDER DE REPORTES
// ─────────────────────────────────────────────────────────────

function renderReportes() {
    const estado = document.getElementById('f-rep-estado')?.value ?? '0';
    const proy = document.getElementById('f-rep-proyecto')?.value || '';
    const orden = document.getElementById('f-rep-orden')?.value || 'desc';

    let data = reportesVisibles().filter(r => {
        const matchEstado = estado === '' || r.estado_reporte === parseInt(estado);
        const matchProy = !proy || r.nombre_proyecto === proy;
        return matchEstado && matchProy;
    });

    // Ordenar por fecha
    data.sort((a, b) => {
        const fechaA = new Date(a.fecha_reporte);
        const fechaB = new Date(b.fecha_reporte);
        return orden === 'desc' ? fechaB - fechaA : fechaA - fechaB;
    });

    const cont = document.getElementById('lista-reportes');
    if (!cont) return;

    cont.innerHTML = data.length
        ? data.map(r => cardReporte(r)).join('')
        : `<div class="card" style="text-align:center;padding:44px;color:var(--muted)">
            <span class="material-symbols-rounded" style="font-size:38px;display:block;margin-bottom:10px;color:var(--cream-dark)">search_off</span>
            No hay reportes con los filtros seleccionados.
        </div>`;

    const cc = document.getElementById('rep-contador');
    if (cc) {
        const pendientes = reportesVisibles().filter(r => r.estado_reporte === 0).length;
        cc.textContent = `${data.length} reporte${data.length !== 1 ? 's' : ''} · ${pendientes} pendiente${pendientes !== 1 ? 's' : ''} de revisión`;
    }

    // Mostrar/ocultar botón limpiar filtros
    const hay = (estado !== '0') || proy || (orden !== 'desc');
    const btn = document.getElementById('btn-limpiar-rep');
    if (btn) btn.style.display = hay ? '' : 'none';
}

// ─────────────────────────────────────────────────────────────
// CARD DE REPORTE
// ─────────────────────────────────────────────────────────────

function cardReporte(r) {
    const esPendiente = r.estado_reporte === 0;
    const esRevisado = r.estado_reporte === 1;
    const esRechazado = r.estado_reporte === 2;
    
    let badge = '';
    if (esPendiente) {
        badge = '<span class="badge badge-warning"><span class="material-symbols-rounded" style="font-size:12px">pending</span>Pendiente</span>';
    } else if (esRechazado) {
        badge = '<span class="badge badge-danger"><span class="material-symbols-rounded" style="font-size:12px">cancel</span>Rechazado</span>';
    } else {
        badge = '<span class="badge badge-success"><span class="material-symbols-rounded" style="font-size:12px">check_circle</span>Aprobado</span>';
    }

    const fechaEmision = r.fecha_reporte ? new Date(r.fecha_reporte).toLocaleDateString('es-HN', {
        day: '2-digit', month: 'short', year: 'numeric'
    }) : 'N/A';

    const fechaRevision = r.fecha_revision_reporte ? new Date(r.fecha_revision_reporte).toLocaleDateString('es-HN', {
        day: '2-digit', month: 'short', year: 'numeric'
    }) : null;

    // Avatar del autor
    const autorNombre = r.autor_nombre || 'Usuario';
    const iniciales = autorNombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    // Acciones según rol
    let acciones = '';

    if (ES_ADMIN && esPendiente) {
        acciones = `
            <button class="btn btn-danger btn-sm" onclick="rechazarReporte(${r.id_reporte})">
                <span class="material-symbols-rounded" style="font-size:14px">cancel</span> Rechazar
            </button>
            <button class="btn btn-success btn-sm" onclick="aprobarReporte(${r.id_reporte})">
                <span class="material-symbols-rounded" style="font-size:14px">check</span> Aprobar
            </button>
        `;
    } else if (ES_CAMPO && esPendiente) {
        acciones = `<span class="text-xs text-muted" style="align-self:center">En revisión por oficina</span>`;
    } else if (esRechazado) {
        acciones = `<span class="text-xs text-muted" style="align-self:center">Reporte rechazado</span>`;
    }

    // Calcular avance desde presupuesto si está disponible
    const avanceFisico = r.avance_fisico || 0;
    const avanceFinanciero = r.avance_financiero || 0;

    const progressColor = avanceFisico >= 75 ? 'success' : avanceFisico >= 40 ? 'gold' : 'danger';

    // Adjuntos
    const adjuntos = r.adjuntos || [];
    const fotos = adjuntos.filter(a => a.tipo_archivo && ['jpg', 'jpeg', 'png'].includes(a.tipo_archivo.toLowerCase()));
    const docs = adjuntos.filter(a => a.tipo_archivo && ['pdf', 'docx', 'xlsx'].includes(a.tipo_archivo.toLowerCase()));

    const thumb = (a) => `
        <div class="evidence-thumb" title="${a.nombre_archivo}"
             onclick='abrirVisor({tipo:"${a.tipo_archivo && ['jpg','jpeg','png'].includes(a.tipo_archivo.toLowerCase()) ? "img" : "pdf"}",nombre:"${a.nombre_archivo}",codigo:"REP-${String(r.id_reporte).padStart(4,'0')}",tipoCodigo:"reporte",descripcion:${JSON.stringify(r.descripcion_reporte || 'Reporte de avance')}})'>
            <span class="material-symbols-rounded">${a.tipo_archivo && ['jpg','jpeg','png'].includes(a.tipo_archivo.toLowerCase()) ? 'image' : 'picture_as_pdf'}</span>
        </div>
    `;

    const footerAdjuntos = adjuntos.length ? `
        <div style="display:flex;gap:22px;flex-wrap:wrap">
            ${fotos.length ? `
                <div>
                    <div style="font-size:10.5px;font-weight:600;text-transform:uppercase;letter-spacing:.6px;color:var(--muted);margin-bottom:6px">Fotografías</div>
                    <div style="display:flex;gap:8px">${fotos.map(thumb).join('')}</div>
                </div>
            ` : ''}
            ${docs.length ? `
                <div>
                    <div style="font-size:10.5px;font-weight:600;text-transform:uppercase;letter-spacing:.6px;color:var(--muted);margin-bottom:6px">Documentos</div>
                    <div style="display:flex;gap:8px">${docs.map(thumb).join('')}</div>
                </div>
            ` : ''}
        </div>
    ` : '<span class="text-xs text-muted">Sin adjuntos</span>';

    return `
        <div class="rep-card" id="rep-${r.id_reporte}">
            <div class="flex-between" style="margin-bottom:6px;flex-wrap:wrap;gap:10px">
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                    <span style="font-size:11px;font-weight:600;color:var(--muted)">REP-${String(r.id_reporte).padStart(4, '0')}</span>
                    ${badge}
                </div>
                <a href="proyectos.html" class="btn btn-primary btn-sm" style="text-decoration:none"
                   onclick="sessionStorage.setItem('pron_open_proyecto','${r.id_proyecto}')" title="Abrir el proyecto asociado">
                    <span class="material-symbols-rounded" style="font-size:14px">folder_open</span> Ver proyecto
                </a>
            </div>

            <div style="font-size:17px;font-weight:600;color:var(--navy);margin-bottom:2px">
                ${r.descripcion_reporte || 'Reporte sin descripción'} — ${r.nombre_proyecto || 'Sin proyecto'}
            </div>
            <div class="text-xs text-muted" style="margin-bottom:14px;display:flex;align-items:center;gap:6px">
                <div class="avatar" style="width:22px;height:22px;font-size:9px;background:var(--cream-dark);color:var(--text-light)">${iniciales}</div>
                ${r.autor_nombre || 'Usuario'}
            </div>

            <!-- Fechas y avances -->
            <div style="display:flex;gap:24px;flex-wrap:wrap;margin-bottom:14px">
                <div class="info-row">
                    <span class="material-symbols-rounded">calendar_today</span>
                    Emitido: <strong>${fechaEmision}</strong>
                </div>
                <div class="info-row">
                    <span class="material-symbols-rounded">event_available</span>
                    Revisado: <strong style="color:${fechaRevision ? 'var(--success)' : 'var(--muted)'}">${fechaRevision || 'Pendiente'}</strong>
                </div>
                <div class="info-row">
                    <span class="material-symbols-rounded">bar_chart</span>
                    Avance físico: <strong>${avanceFisico}%</strong>
                </div>
                <div class="info-row">
                    <span class="material-symbols-rounded">payments</span>
                    Avance financiero: <strong>${avanceFinanciero}%</strong>
                </div>
            </div>

            <div class="progress-bar mb-16" style="max-width:420px">
                <div class="progress-fill ${progressColor}" style="width:${avanceFisico}%"></div>
            </div>

            <!-- Descripción -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px">
                <div>
                    <div style="font-size:10.5px;font-weight:600;text-transform:uppercase;letter-spacing:.6px;color:var(--muted);margin-bottom:4px">Descripción del avance</div>
                    <p style="font-size:13px;line-height:1.65;color:var(--text)">${r.descripcion_reporte || 'Sin descripción'}</p>
                </div>
                <div>
                    <div style="font-size:10.5px;font-weight:600;text-transform:uppercase;letter-spacing:.6px;color:var(--muted);margin-bottom:4px">Observaciones</div>
                    <p style="font-size:13px;line-height:1.65;color:var(--text-light)">${r.observaciones || 'Sin observaciones'}</p>
                </div>
            </div>

            <!-- Footer -->
            <div style="display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:12px;padding-top:14px;border-top:1px solid var(--cream-dark)">
                ${footerAdjuntos}
                <div style="display:flex;gap:8px">${acciones}</div>
            </div>
        </div>
    `;
}

// ─────────────────────────────────────────────────────────────
// FILTROS
// ─────────────────────────────────────────────────────────────

function limpiarFiltrosReportes() {
    document.getElementById('f-rep-estado').value = '0';
    document.getElementById('f-rep-proyecto').value = '';
    document.getElementById('f-rep-orden').value = 'desc';
    renderReportes();
}

// ─────────────────────────────────────────────────────────────
// APROBAR REPORTE (Admin)
// ─────────────────────────────────────────────────────────────

async function aprobarReporte(id) {
    try {
        const result = await API.reportes.aprobar(id, {
            id_usuario: ID_USUARIO
        });

        if (result.success) {
            showToast(`Reporte ${id} aprobado y registrado en la bitácora.`, 'success');
            await cargarDatosIniciales();
            renderPaginaReportes();
        }
    } catch (error) {
        console.error('Error aprobando reporte:', error);
        showToast(error.message || 'Error al aprobar el reporte', 'warning');
    }
}

// ─────────────────────────────────────────────────────────────
// RECHAZAR REPORTE 
// ─────────────────────────────────────────────────────────────

async function rechazarReporte(id) {
    const reporte = reportesCache.find(r => r.id_reporte === id);
    if (!reporte) {
        showToast('Reporte no encontrado', 'warning');
        return;
    }

    const confirmar = confirm(
        `¿Estás seguro de RECHAZAR el reporte?\n\n` +
        `"${reporte.descripcion_reporte || 'Reporte sin descripción'}"\n` +
        `Proyecto: ${reporte.nombre_proyecto || 'Sin proyecto'}`
    );

    if (!confirmar) return;

    try {
        const result = await API.reportes.rechazar(id, {
            id_usuario: parseInt(sessionStorage.getItem('pron_id_usuario')) || 1
        });

        if (result.success) {
            showToast('Reporte rechazado', 'info');
            await cargarDatosIniciales();
            renderReportes();
        }
    } catch (error) {
        console.error('Error rechazando reporte:', error);
        showToast(error.message || 'Error al rechazar el reporte', 'warning');
    }
}
// ─────────────────────────────────────────────────────────────
// MODAL NUEVO REPORTE
// ─────────────────────────────────────────────────────────────

async function abrirModalReporte() {
    FormUtils.limpiarErrores(document.getElementById('modal-reporte'));

    // Cargar proyectos del usuario
    const sel = document.getElementById('rep-proyecto');
    if (sel) {
        sel.innerHTML = '<option value="">— Selecciona un proyecto —</option>';

        try {
            const proyectos = await API.proyectos.listar({ id_usuario: ID_USUARIO });
            if (proyectos && proyectos.length > 0) {
                proyectos.forEach(p => {
                    const o = document.createElement('option');
                    o.value = p.id_proyecto;
                    o.textContent = p.nombre_proyecto;
                    sel.appendChild(o);
                });
            } else {
                const o = document.createElement('option');
                o.value = '';
                o.textContent = 'No tienes proyectos asignados';
                o.disabled = true;
                sel.appendChild(o);
            }
        } catch (error) {
            console.error('Error cargando proyectos:', error);
        }
    }

    // Resetear campos
    document.getElementById('rep-desc').value = '';
    document.getElementById('rep-incidencias').value = '';
    document.getElementById('rep-observaciones').value = '';
    document.getElementById('rep-files').innerHTML = '';
    document.getElementById('val-fisico').textContent = '50%';
    document.getElementById('val-fin').textContent = '40%';

    //Usar querySelectorAll para obtener todos los range inputs
    document.querySelectorAll('#modal-reporte .range-input').forEach(el => {
        el.value = 50;
    });

    document.getElementById('modal-reporte').classList.add('open');
    setTimeout(() => document.getElementById('rep-proyecto')?.focus(), 80);
}

function cerrarModalReporte() {
    FormUtils.limpiarErrores(document.getElementById('modal-reporte'));
    document.getElementById('modal-reporte').classList.remove('open');
}

// ─────────────────────────────────────────────────────────────
// ENVIAR REPORTE
// ─────────────────────────────────────────────────────────────

async function enviarReporte() {
    const id_proyecto = parseInt(document.getElementById('rep-proyecto').value);
    const descripcion = document.getElementById('rep-desc').value.trim();
    const incidencias = document.getElementById('rep-incidencias').value.trim();
    const observaciones = document.getElementById('rep-observaciones').value.trim();
    const avanceFisico = parseInt(document.getElementById('val-fisico').textContent) || 0;
    const avanceFinanciero = parseInt(document.getElementById('val-fin').textContent) || 0;

    let errores = 0;

    if (!id_proyecto) {
        FormUtils.marcarInvalido(document.getElementById('rep-proyecto'), 'Selecciona el proyecto del reporte.');
        errores++;
    } else {
        FormUtils.limpiarInvalido(document.getElementById('rep-proyecto'));
    }

    if (!descripcion) {
        FormUtils.marcarInvalido(document.getElementById('rep-desc'), 'Describe el avance realizado.');
        errores++;
    } else {
        FormUtils.limpiarInvalido(document.getElementById('rep-desc'));
    }

    if (errores) {
        showToast(`Hay ${errores} campo(s) obligatorio(s) por completar.`, 'warning');
        return;
    }

    const datos = {
        id_proyecto,
        id_usuario: ID_USUARIO,
        descripcion_reporte: descripcion,
        avance_fisico: avanceFisico,
        avance_financiero: avanceFinanciero,
        observaciones: observaciones || null,
        incidencias: incidencias || null
    };

    try {
        const result = await API.reportes.crear(datos);

        if (result.success) {
            showToast('Reporte registrado y enviado. El Administrador de Oficina fue notificado.', 'success');
            cerrarModalReporte();
            await cargarDatosIniciales();
            renderPaginaReportes();
        }
    } catch (error) {
        console.error('Error enviando reporte:', error);
        showToast(error.message || 'Error al enviar el reporte', 'warning');
    }
}

// ─────────────────────────────────────────────────────────────
// HELPERS: ARCHIVOS
// ─────────────────────────────────────────────────────────────

function mostrarArchivosRep(files) {
    const c = document.getElementById('rep-files');
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

// ─────────────────────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────────────────────

let _toastTimer;

function showToast(msg, tipo = 'success') {
    const t = document.getElementById('toast');
    if (!t) { alert(msg); return; }
    const icons = { success: 'check_circle', warning: 'warning', info: 'info' };
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

window.abrirModalReporte = abrirModalReporte;
window.cerrarModalReporte = cerrarModalReporte;
window.rechazarReporte = rechazarReporte;
window.enviarReporte = enviarReporte;
window.aprobarReporte = aprobarReporte;
window.limpiarFiltrosReportes = limpiarFiltrosReportes;
window.renderReportes = renderReportes;
window.mostrarArchivosRep = mostrarArchivosRep;
window.showToast = showToast;
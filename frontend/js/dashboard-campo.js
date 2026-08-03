/*
   dashboard-campo.js

   Tablero del Supervisor de Campo. A diferencia del tablero administrativo,
   este muestra únicamente lo del usuario que entró: sus proyectos, sus
   solicitudes y sus reportes. Por eso todas las consultas van filtradas por
   su id.

   El menú lateral, la barra superior, las notificaciones y las validaciones
   los pone shared.js, que se carga antes.
*/

// Todo lo que se descarga y todo lo que se calcula vive en este objeto, para
// no andar pasando los mismos datos de función en función. Los contadores
// arrancan en cero porque la pantalla se dibuja antes de que lleguen las
// respuestas del servidor.
let dashboardData = {
    usuario: null,
    proyectos: [],
    solicitudes: [],
    reportes: [],
    estadisticas: {
        totalProyectos: 0,
        proyectosActivos: 0,
        proyectosRetrasados: 0,
        solicitudesPendientes: 0,
        solicitudesAprobadas: 0,
        solicitudesRechazadas: 0,
        solicitudesEntregadas: 0,
        reportesPendientes: 0,
        reportesAprobados: 0,
        mensajesNoLeidos: 0
    },
    resumenSolicitudes: []
};

const ID_USUARIO = parseInt(sessionStorage.getItem('pron_id_usuario')) || null;
const NOMBRE_USUARIO = sessionStorage.getItem('pron_nombre') || 'Usuario';
const ROLE = sessionStorage.getItem('pron_role') || 'Supervisor de Campo';
const ZONA = sessionStorage.getItem('pron_zona') || 'Zona no especificada';

console.log('[Dashboard Campo] Iniciando...');
console.log('[Dashboard Campo] ID_USUARIO:', ID_USUARIO);
console.log('[Dashboard Campo] NOMBRE_USUARIO:', NOMBRE_USUARIO);
console.log('[Dashboard Campo] ROLE:', ROLE);
console.log('[Dashboard Campo] API disponible?', typeof API !== 'undefined');

// Arranque de la pantalla: descargar, calcular y dibujar, en ese orden.

document.addEventListener('DOMContentLoaded', async () => {
    await cargarDashboard();
});

async function cargarDashboard() {
    try {
        mostrarLoading(true);

        // Las cuatro consultas se lanzan juntas con Promise.all porque ninguna
        // depende de la otra. Las tres primeras van filtradas por ID_USUARIO:
        // el supervisor solo debe ver lo que le toca a él.
        const [proyectos, solicitudes, reportes, resumenSolicitudes] = await Promise.all([
            API.proyectos.listar({ id_usuario: ID_USUARIO }),
            API.solicitudes.listar({ id_usuario: ID_USUARIO }),
            API.reportes.listar({ id_usuario: ID_USUARIO }),
            API.solicitudes.obtenerResumen()
        ]);

        dashboardData.proyectos = proyectos || [];
        dashboardData.solicitudes = solicitudes || [];
        dashboardData.reportes = reportes || [];
        dashboardData.resumenSolicitudes = resumenSolicitudes || [];

        // Primero se sacan los totales y recién después se dibuja, porque las
        // tarjetas de arriba muestran justamente esos números.
        calcularEstadisticas();
        renderizarDashboard();

        mostrarLoading(false);
    } catch (error) {
        console.error('Error cargando dashboard:', error);
        showToast('Error al cargar los datos del dashboard', 'warning');
        mostrarLoading(false);
        mostrarError();
    }
}

/* Saca los totales de las tarjetas contando lo que ya se descargó, sin
   volver a consultarle nada al servidor. */

function calcularEstadisticas() {
    const proyectos = dashboardData.proyectos;
    const solicitudes = dashboardData.solicitudes;
    const reportes = dashboardData.reportes;

    // Proyectos asignados a este supervisor, separados por estado. Los textos
    // tienen que coincidir tal cual con la columna estado_proyecto; si cambian
    // en la base, estos contadores quedan en cero sin avisar.
    dashboardData.estadisticas.totalProyectos = proyectos.length;
    dashboardData.estadisticas.proyectosActivos = proyectos.filter(p => 
        p.estado_proyecto === 'ACTIVO'
    ).length;
    dashboardData.estadisticas.proyectosRetrasados = proyectos.filter(p => 
        p.estado_proyecto === 'RETRASADO'
    ).length;

    // Solicitudes que hizo este supervisor. ENTREGADA y CONFIRMADA se cuentan
    // juntas: para él las dos significan que el material ya llegó, la
    // diferencia es solo si ya firmó la recepción.
    dashboardData.estadisticas.solicitudesPendientes = solicitudes.filter(s => 
        s.estado_solicitud === 'PENDIENTE'
    ).length;
    dashboardData.estadisticas.solicitudesAprobadas = solicitudes.filter(s => 
        s.estado_solicitud === 'APROBADA'
    ).length;
    dashboardData.estadisticas.solicitudesRechazadas = solicitudes.filter(s => 
        s.estado_solicitud === 'RECHAZADA'
    ).length;
    dashboardData.estadisticas.solicitudesEntregadas = solicitudes.filter(s => 
        s.estado_solicitud === 'ENTREGADA' || s.estado_solicitud === 'CONFIRMADA'
    ).length;

    // Reportes de avance. Aquí el estado no es texto sino número: 0 es que
    // todavía está esperando revisión y 1 es que oficina ya lo aprobó.
    dashboardData.estadisticas.reportesPendientes = reportes.filter(r => 
        r.estado_reporte === 0
    ).length;
    dashboardData.estadisticas.reportesAprobados = reportes.filter(r => 
        r.estado_reporte === 1
    ).length;
}

/* Arma toda la pantalla de una sola vez y la mete en el contenedor.

   Se reemplaza el contenido completo en lugar de ir actualizando pedacito por
   pedacito: es más simple de seguir y con esta cantidad de datos ni se nota. */

function renderizarDashboard() {
    const container = document.getElementById('dashboard-content');
    const est = dashboardData.estadisticas;
    const hora = new Date().getHours();
    const saludo = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches';

    container.innerHTML = `
        <!-- WELCOME -->
        <div class="flex-between mb-24 fade-up fade-up-1">
            <div>
                <div class="section-head" style="margin-bottom:4px">
                    <h2>${saludo}, <em style="font-style:italic;color:var(--gold)">${NOMBRE_USUARIO}</em></h2>
                </div>
                <p class="text-muted text-sm">Supervisor de Campo · ${ZONA}</p>
            </div>
            <button class="btn btn-outline btn-sm" onclick="cargarDashboard()">
                <span class="material-symbols-rounded" style="font-size:16px">refresh</span> Actualizar
            </button>
        </div>

        <!-- METRICS -->
        <div class="grid-4 mb-24">
            ${renderMetricCard('Proyectos Activos', est.proyectosActivos, 'folder_open', '#E6F1FB', 'var(--info)')}
            ${renderMetricCard('Reportes Pendientes', est.reportesPendientes, 'pending_actions', 'var(--warning-bg)', 'var(--warning)')}
            ${renderMetricCard('Solicitudes Activas', est.solicitudesPendientes, 'inventory_2', 'var(--danger-bg)', 'var(--danger)')}
            ${renderMetricCard('Proyectos Retrasados', est.proyectosRetrasados, 'warning', 'var(--danger-bg)', 'var(--danger)')}
        </div>

        <!-- MIS PROYECTOS + ACTIVIDAD -->
        <div class="grid-mixed mb-24">
            <!-- PROYECTOS -->
            <div class="card fade-up fade-up-2">
                <div class="card-header">
                    <div>
                        <div class="card-title">Mis Proyectos</div>
                        <div class="card-subtitle">Avance físico actual</div>
                    </div>
                    <a href="proyectos.html" class="btn btn-outline btn-sm">Ver todos</a>
                </div>
                <div style="display:flex;flex-direction:column;gap:18px;">
                    ${renderProyectos()}
                </div>
            </div>

            <!-- ACTIVIDAD RECIENTE -->
            <div style="display:flex;flex-direction:column;gap:18px;">
                <!-- REPORTES RECIENTES -->
                <div class="card fade-up fade-up-3">
                    <div class="card-header">
                        <div class="card-title">Reportes Recientes</div>
                        <a href="reportes.html" class="btn btn-outline btn-sm">Ver todos</a>
                    </div>
                    <div style="display:flex;flex-direction:column;gap:12px;">
                        ${renderReportesRecientes()}
                    </div>
                </div>

                <!-- SOLICITUDES RECIENTES -->
                <div class="card fade-up fade-up-4">
                    <div class="card-header">
                        <div class="card-title">Solicitudes Recientes</div>
                        <a href="solicitudes.html" class="btn btn-outline btn-sm">Gestionar</a>
                    </div>
                    <div style="display:flex;flex-direction:column;gap:10px;">
                        ${renderSolicitudesRecientes()}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Piezas sueltas de la pantalla. Cada una devuelve un pedazo de HTML como
// texto, y la función de arriba las va juntando.

function renderMetricCard(label, value, icon, bgColor, color) {
    return `
        <div class="metric-card fade-up">
            <div class="metric-icon" style="background:${bgColor}">
                <span class="material-symbols-rounded" style="color:${color}">${icon}</span>
            </div>
            <div class="metric-label">${label}</div>
            <div class="metric-value">${value}</div>
            <div class="metric-change"><span class="text-muted">${value > 0 ? 'Activo' : 'Sin registros'}</span></div>
        </div>
    `;
}

function renderProyectos() {
    const proyectos = dashboardData.proyectos.slice(0, 5);

    if (proyectos.length === 0) {
        return `<div class="empty-state">No tienes proyectos asignados</div>`;
    }

    return proyectos.map((p, index) => {
        const estadoBadge = {
            'ACTIVO': 'badge-success',
            'RETRASADO': 'badge-warning',
            'FINALIZADO': 'badge-info',
            'CANCELADO': 'badge-danger'
        }[p.estado_proyecto] || 'badge-info';

        const estadoLabel = p.estado_proyecto || 'Sin estado';
        const avance = p.presupuesto_ejecutado && p.presupuesto_inicial 
            ? Math.min(Math.round((p.presupuesto_ejecutado / p.presupuesto_inicial) * 100), 100)
            : 0;

        const progressClass = avance >= 80 ? 'success' : avance >= 50 ? 'gold' : 'danger';
        const fechaFin = p.fecha_fin ? new Date(p.fecha_fin).toLocaleDateString('es-HN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }) : 'No definida';

        return `
            <div key="${index}">
                <div class="flex-between mb-8">
                    <div>
                        <div class="fw-500" style="font-size:13.5px">${p.nombre_proyecto || 'Sin nombre'}</div>
                        <div class="text-xs text-muted mt-4">${p.tipo_proyecto || 'Sin tipo'} · ${p.nombre_municipio || 'Sin ubicación'} · ${p.usuarios_nombres ? p.usuarios_nombres[0] : 'Sin responsable'}</div>
                    </div>
                    <div style="display:flex;align-items:center;gap:6px">
                        <a href="proyectos.html?detalle=${p.id_proyecto}" 
                           onclick="sessionStorage.setItem('pron_open_proyecto','${p.id_proyecto}')" 
                           title="Ver detalles del proyecto" 
                           style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:7px;background:var(--cream);border:1px solid var(--cream-dark);color:var(--navy);text-decoration:none;transition:var(--transition);flex-shrink:0"
                           onmouseover="this.style.background='var(--navy)';this.style.color='var(--white)'" 
                           onmouseout="this.style.background='var(--cream)';this.style.color='var(--navy)'">
                            <span class="material-symbols-rounded" style="font-size:16px">visibility</span>
                        </a>
                        <span class="badge ${estadoBadge}">${estadoLabel}</span>
                    </div>
                </div>
                <div class="flex-between text-xs text-muted mb-8">
                    <span>Avance físico</span>
                    <span class="fw-600 text-navy">${avance}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill ${progressClass}" style="width:${avance}%"></div>
                </div>
                <div class="flex-between text-xs text-muted mt-8">
                    <span>Fin estimado: ${fechaFin}</span>
                    ${p.estado_proyecto === 'RETRASADO' 
                        ? `<span style="color:var(--danger)">Retrasado</span>`
                        : p.estado_proyecto === 'ACTIVO' 
                            ? `<span style="color:var(--success)">En tiempo</span>`
                            : `<span style="color:var(--muted)">${estadoLabel}</span>`
                    }
                </div>
                ${index < proyectos.length - 1 ? '<hr class="divider" style="margin:4px 0">' : ''}
            </div>
        `;
    }).join('');
}

function renderReportesRecientes() {
    const reportes = dashboardData.reportes
        .sort((a, b) => new Date(b.fecha_reporte) - new Date(a.fecha_reporte))
        .slice(0, 3);

    if (reportes.length === 0) {
        return `<div class="empty-state">No hay reportes recientes</div>`;
    }

    return reportes.map(r => {
        const esPendiente = r.estado_reporte === 0;
        const icon = esPendiente ? 'pending' : 'check_circle';
        const bgColor = esPendiente ? 'var(--warning-bg)' : 'var(--success-bg)';
        const iconColor = esPendiente ? 'var(--warning)' : 'var(--success)';
        const estadoLabel = esPendiente ? 'Pendiente de revisión' : 'Aprobado';
        const fecha = new Date(r.fecha_reporte).toLocaleDateString('es-HN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
        const fechaRevision = r.fecha_revision_reporte 
            ? new Date(r.fecha_revision_reporte).toLocaleDateString('es-HN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            })
            : null;

        return `
            <div>
                <div style="display:flex;gap:10px;align-items:flex-start;">
                    <div style="width:32px;height:32px;border-radius:8px;background:${bgColor};display:flex;align-items:center;justify-content:center;flex-shrink:0">
                        <span class="material-symbols-rounded" style="font-size:16px;color:${iconColor}">${icon}</span>
                    </div>
                    <div style="flex:1">
                        <div class="fw-500 text-sm">${r.descripcion_reporte || 'Reporte sin descripción'}</div>
                        <div class="text-xs text-muted">${r.nombre_proyecto || 'Sin proyecto'} · ${estadoLabel}</div>
                        <div class="text-xs" style="color:var(--muted);margin-top:3px">
                            Emitido: ${fecha}${fechaRevision ? ` · Revisado: ${fechaRevision}` : ''}
                        </div>
                    </div>
                </div>
                <hr class="divider" style="margin:4px 0">
            </div>
        `;
    }).join('');
}

function renderSolicitudesRecientes() {
    const solicitudes = dashboardData.solicitudes
        .sort((a, b) => new Date(b.fecha_solicitud) - new Date(a.fecha_solicitud))
        .slice(0, 2);

    if (solicitudes.length === 0) {
        return `<div class="empty-state">No hay solicitudes recientes</div>`;
    }

    const estadoBadge = {
        'PENDIENTE': 'badge-warning',
        'APROBADA': 'badge-success',
        'RECHAZADA': 'badge-danger',
        'EN DESPACHO': 'badge-dispatch',
        'ENTREGADA': 'badge-delivered',
        'CONFIRMADA': 'badge-confirmed'
    };

    const estadoLabel = {
        'PENDIENTE': 'Pendiente',
        'APROBADA': 'Aprobada',
        'RECHAZADA': 'Rechazada',
        'EN DESPACHO': 'En despacho',
        'ENTREGADA': 'Entregada',
        'CONFIRMADA': 'Confirmada'
    };

    return solicitudes.map(s => {
        const badge = estadoBadge[s.estado_solicitud] || 'badge-warning';
        const label = estadoLabel[s.estado_solicitud] || s.estado_solicitud || 'Pendiente';
        
        // En la lista resumida solo cabe un renglón, así que se muestra el
        // primer recurso de la solicitud y se corta a 30 caracteres. Para ver
        // todo hay que entrar al módulo de solicitudes.
        const descItem = s.items && s.items.length > 0 
            ? s.items[0].descripcion_recurso || s.items[0].desc || 'Sin descripción'
            : 'Sin recursos';

        if (descItem.length > 30) {
            descItem = descItem.substring(0, 30) + '...';
        }

        return `
            <div class="flex-between">
                <div>
                    <div class="text-sm fw-500">${descItem}</div>
                    <div class="text-xs text-muted">${s.proyecto_nombre || 'Sin proyecto'}</div>
                </div>
                <span class="badge ${badge}">${label}</span>
            </div>
        ${
                    s.estado_solicitud === 'EN DESPACHO'
                    ? `
                        <div style="margin-top:10px;text-align:right">
                            <button
                                class="btn btn-success btn-sm"
                                onclick="confirmarRecepcion(${s.id_solicitud})">

                                <span class="material-symbols-rounded">
                                    inventory
                                </span>

                                Confirmar recepción

                            </button>
                        </div>
                    `
                    : ''
                }

            </div>
        `;
    }).join('');
}

async function confirmarRecepcion(idSolicitud){

    if(!confirm('¿Confirmar que la solicitud fue recibida?')){
        return;
    }

    try{

        await API.solicitudes.entregar(idSolicitud);

        showToast('Solicitud marcada como ENTREGADA');

        await cargarDashboard();

    }catch(error){

        console.error(error);

        showToast(error.message,'warning');

    }

}
// Utilidades chicas: el spinner de carga, el formato de fechas y montos, y
// el mensaje de error cuando algo falla.

function mostrarLoading(show) {
    const container = document.getElementById('dashboard-content');
    if (show) {
        container.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Cargando tu dashboard...</p>
            </div>
        `;
    }
}

function mostrarError() {
    const container = document.getElementById('dashboard-content');
    container.innerHTML = `
        <div class="error-container">
            <span class="material-symbols-rounded" style="font-size:48px;color:var(--danger)">error_outline</span>
            <h3>Error al cargar el dashboard</h3>
            <p>No se pudieron obtener los datos. Verifica tu conexión e intenta nuevamente.</p>
            <button class="btn btn-gold" onclick="cargarDashboard()">
                <span class="material-symbols-rounded">refresh</span> Reintentar
            </button>
        </div>
    `;
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

// Se cuelgan en window para que los onclick escritos en el HTML las
// encuentren.

window.cargarDashboard = cargarDashboard;
window.renderSolicitudesRecientes = renderSolicitudesRecientes;
window.confirmarRecepcion = confirmarRecepcion;
window.showToast = showToast;
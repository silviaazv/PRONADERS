/* ============================================================
   dashboard-admin.js — CONTROLADOR: DASHBOARD DEL ADMINISTRADOR DE OFICINA
   El sidebar, topbar, notificaciones y utilidades de
   validación se cargan desde shared.js (incluido antes).
   ============================================================ */

/* ============================================================
   dashboard-admin.js — DASHBOARD ADMINISTRATIVO
   Muestra métricas de proyectos, usuarios y actividades del sistema
   ============================================================ */

// ─────────────────────────────────────────────────────────────
// VARIABLES GLOBALES
// ─────────────────────────────────────────────────────────────

let dashboardData = {
    proyectos: [],
    usuarios: [],
    solicitudes: [],
    reportes: [],
    estadisticas: {
        totalProyectos: 0,
        proyectosActivos: 0,
        proyectosRetrasados: 0,
        proyectosFinalizados: 0,
        totalUsuarios: 0,
        usuariosActivos: 0,
        solicitudesPendientes: 0,
        solicitudesAprobadas: 0,
        solicitudesRechazadas: 0,
        avanceGlobal: 0,
        proyectosRiesgo: 0
    }
};

const NOMBRE_USUARIO = sessionStorage.getItem('pron_nombre') || 'Administrador';

// ─────────────────────────────────────────────────────────────
// INICIALIZACIÓN
// ─────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
    await cargarDashboard();
});

async function cargarDashboard() {
    try {
        mostrarLoading(true);

        // Cargar datos en paralelo
        const [proyectos, usuarios, solicitudes, reportes] = await Promise.all([
            API.proyectos.listar(),
            API.usuarios.listar(),
            API.solicitudes.listar(),
            API.reportes.listar()
        ]);

        dashboardData.proyectos = proyectos || [];
        dashboardData.usuarios = usuarios || [];
        dashboardData.solicitudes = solicitudes || [];
        dashboardData.reportes = reportes || [];

        // Calcular estadísticas
        calcularEstadisticas();

        // Renderizar dashboard
        renderizarDashboard();

        mostrarLoading(false);
    } catch (error) {
        console.error('Error cargando dashboard:', error);
        showToast('Error al cargar los datos', 'warning');
        mostrarLoading(false);
        mostrarError();
    }
}

// ─────────────────────────────────────────────────────────────
// CÁLCULO DE ESTADÍSTICAS
// ─────────────────────────────────────────────────────────────

function calcularEstadisticas() {
    const proyectos = dashboardData.proyectos;
    const usuarios = dashboardData.usuarios;
    const solicitudes = dashboardData.solicitudes;

    // Proyectos
    dashboardData.estadisticas.totalProyectos = proyectos.length;
    dashboardData.estadisticas.proyectosActivos = proyectos.filter(p =>
        p.estado_proyecto === 'ACTIVO'
    ).length;
    dashboardData.estadisticas.proyectosRetrasados = proyectos.filter(p =>
        p.estado_proyecto === 'RETRASADO'
    ).length;
    dashboardData.estadisticas.proyectosFinalizados = proyectos.filter(p =>
        p.estado_proyecto === 'FINALIZADO'
    ).length;

    // Usuarios
    dashboardData.estadisticas.totalUsuarios = usuarios.length;
    dashboardData.estadisticas.usuariosActivos = usuarios.filter(u =>
        u.estado_usuario === 1
    ).length;

    // Solicitudes
    dashboardData.estadisticas.solicitudesPendientes = solicitudes.filter(s =>
        s.estado_solicitud === 'PENDIENTE'
    ).length;
    dashboardData.estadisticas.solicitudesAprobadas = solicitudes.filter(s =>
        s.estado_solicitud === 'APROBADA'
    ).length;
    dashboardData.estadisticas.solicitudesRechazadas = solicitudes.filter(s =>
        s.estado_solicitud === 'RECHAZADA'
    ).length;

    // Avance global (promedio de avance de proyectos activos)
    const proyectosActivos = proyectos.filter(p => p.estado_proyecto === 'ACTIVO');
    if (proyectosActivos.length > 0) {
        const sumaAvance = proyectosActivos.reduce((sum, p) => {
            const avance = p.presupuesto_ejecutado && p.presupuesto_inicial
                ? Math.min((p.presupuesto_ejecutado / p.presupuesto_inicial) * 100, 100)
                : 0;
            return sum + avance;
        }, 0);
        dashboardData.estadisticas.avanceGlobal = Math.round(sumaAvance / proyectosActivos.length);
    } else {
        dashboardData.estadisticas.avanceGlobal = 0;
    }

    // Proyectos en riesgo (retrasados + con avance bajo)
    dashboardData.estadisticas.proyectosRiesgo = proyectos.filter(p =>
        p.estado_proyecto === 'RETRASADO'
    ).length;
}

// ─────────────────────────────────────────────────────────────
// RENDERIZADO DEL DASHBOARD
// ─────────────────────────────────────────────────────────────

function renderizarDashboard() {
    const container = document.getElementById('dashboard-content');
    const est = dashboardData.estadisticas;

    container.innerHTML = `
        <!-- ENCABEZADO -->
        <div class="flex-between mb-24 fade-up fade-up-1">
            <div>
                <div class="section-head" style="margin-bottom:4px">
                    <h2>Panel <em style="font-style:italic;color:var(--gold)">Administrativo</em></h2>
                </div>
                <p class="text-muted text-sm">Administrador de Oficina · ${NOMBRE_USUARIO}</p>
            </div>
            <div style="display:flex;gap:10px;flex-wrap:wrap">
                <a href="usuarios.html" class="btn btn-outline btn-sm" onclick="sessionStorage.setItem('pron_abrir_modal_usuario','1')">
                    <span class="material-symbols-rounded" style="font-size:16px">person_add</span> Nuevo Usuario
                </a>
                <a href="proyectos.html" class="btn btn-gold btn-sm" onclick="sessionStorage.setItem('pron_abrir_modal_proyecto','1')">
                    <span class="material-symbols-rounded" style="font-size:16px">add</span> Nuevo Proyecto
                </a>
                <button class="btn btn-outline btn-sm" onclick="cargarDashboard()">
                    <span class="material-symbols-rounded" style="font-size:16px">refresh</span> Actualizar
                </button>
            </div>
        </div>

        <!-- MÉTRICAS -->
        <div class="grid-4 mb-24">
            ${renderMetricCard('Total Proyectos', est.totalProyectos, 'folder_open', 'var(--info-bg)', 'var(--info)',
                `${est.proyectosActivos} activos · ${est.proyectosFinalizados} finalizados`
            )}
            ${renderMetricCard('Usuarios Activos', est.usuariosActivos, 'manage_accounts', 'var(--success-bg)', 'var(--success)',
                `${est.totalUsuarios} totales · ${est.usuariosActivos} activos`
            )}
            ${renderMetricCard('Avance Global', est.avanceGlobal + '%', 'bar_chart', 'var(--warning-bg)', 'var(--warning)',
                `Promedio de ${est.proyectosActivos} proyectos activos`
            )}
            ${renderMetricCard('Proyectos en Riesgo', est.proyectosRiesgo, 'warning', 'var(--danger-bg)', 'var(--danger)',
                est.proyectosRiesgo > 0 ? 'Requieren atención' : 'Sin proyectos en riesgo'
            )}
        </div>

        <!-- PROYECTOS ACTIVOS + PANEL DERECHO -->
        <div class="grid-mixed mb-24">
            <!-- TABLA DE PROYECTOS ACTIVOS -->
            <div class="card fade-up fade-up-2">
                <div class="card-header">
                    <div>
                        <div class="card-title">Proyectos Activos</div>
                        <div class="card-subtitle">${est.proyectosActivos} proyectos en ejecución</div>
                    </div>
                    <a href="proyectos.html" class="btn btn-outline btn-sm">Gestionar</a>
                </div>
                <div class="table-wrap">
                    ${renderTablaProyectos()}
                </div>
            </div>

            <!-- PANEL DERECHO -->
            <div style="display:flex;flex-direction:column;gap:18px;">

                <!-- USUARIOS RECIENTES -->
                <div class="card fade-up fade-up-3">
                    <div class="card-header">
                        <div class="card-title">Usuarios del Sistema</div>
                        <a href="usuarios.html" class="btn btn-outline btn-sm">Gestionar</a>
                    </div>
                    <div style="display:flex;flex-direction:column;gap:10px;">
                        ${renderUsuariosRecientes()}
                    </div>
                </div>

                <!-- SOLICITUDES PENDIENTES -->
                <div class="card fade-up fade-up-3">
                    <div class="card-header">
                        <div class="card-title">Solicitudes Pendientes</div>
                        <a href="solicitudes.html" class="btn btn-outline btn-sm">Revisar</a>
                    </div>
                    <div style="display:flex;flex-direction:column;gap:10px;">
                        ${renderSolicitudesPendientes()}
                    </div>
                </div>

                <!-- PROYECTOS FINALIZADOS -->
                <div class="card fade-up fade-up-4">
                    <div class="card-title mb-12">Proyectos Finalizados</div>
                    <div style="text-align:center;padding:12px 0">
                        <div style="font-family:var(--font-serif);font-size:42px;font-weight:300;color:var(--navy)">${dashboardData.estadisticas.proyectosFinalizados}</div>
                        <div class="text-xs text-muted">proyectos completados</div>
                        <a href="proyectos.html" class="btn btn-outline btn-sm mt-12" style="width:100%;justify-content:center"
                           onclick="try{ sessionStorage.setItem('pron_filtros_proyectos', JSON.stringify({estado:'FINALIZADO'})); }catch(e){ console.error('Error:', e); }">
                            <span class="material-symbols-rounded" style="font-size:16px">inventory</span> Ver Historial
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ─────────────────────────────────────────────────────────────
// FUNCIONES DE RENDERIZADO AUXILIARES
// ─────────────────────────────────────────────────────────────

function renderMetricCard(label, value, icon, bgColor, color, subtitle) {
    return `
        <div class="metric-card fade-up">
            <div class="metric-icon" style="background:${bgColor}">
                <span class="material-symbols-rounded" style="color:${color}">${icon}</span>
            </div>
            <div class="metric-label">${label}</div>
            <div class="metric-value">${value}</div>
            ${subtitle ? `<div class="metric-change"><span class="text-muted text-xs">${subtitle}</span></div>` : ''}
        </div>
    `;
}

function renderTablaProyectos() {
    const proyectosActivos = dashboardData.proyectos
        .filter(p => p.estado_proyecto === 'ACTIVO')
        .slice(0, 10);

    if (proyectosActivos.length === 0) {
        return `<div class="empty-state">No hay proyectos activos</div>`;
    }

    return `
        <table>
            <thead>
                <tr>
                    <th>Proyecto</th>
                    <th>Departamento</th>
                    <th>Avance</th>
                    <th>Estado</th>
                    <th>Info.</th>
                </tr>
            </thead>
            <tbody>
                ${proyectosActivos.map(p => {
                    const avance = p.presupuesto_ejecutado && p.presupuesto_inicial
                        ? Math.min(Math.round((p.presupuesto_ejecutado / p.presupuesto_inicial) * 100), 100)
                        : 0;
                    const progressClass = avance >= 80 ? 'success' : avance >= 50 ? 'gold' : 'danger';
                    const badgeClass = avance >= 80 ? 'badge-success' : avance >= 50 ? 'badge-info' : 'badge-warning';

                    return `
                        <tr>
                            <td>
                                <div class="fw-500">${p.nombre_proyecto || 'Sin nombre'}</div>
                                <div class="text-xs text-muted">${p.tipo_proyecto || 'Sin tipo'}</div>
                            </td>
                            <td><span class="text-sm">${p.nombre_departamento || 'N/A'}</span></td>
                            <td>
                                <div class="progress-bar" style="width:80px">
                                    <div class="progress-fill ${progressClass}" style="width:${avance}%"></div>
                                </div>
                            </td>
                            <td><span class="badge ${badgeClass}">${avance}%</span></td>
                            <td>
                                <a href="proyectos.html" onclick="sessionStorage.setItem('pron_open_proyecto','${p.id_proyecto}')"
                                   title="Ver detalles del proyecto"
                                   style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:7px;background:var(--cream);border:1px solid var(--cream-dark);color:var(--navy);text-decoration:none"
                                   onmouseover="this.style.background='var(--navy)';this.style.color='var(--white)'"
                                   onmouseout="this.style.background='var(--cream)';this.style.color='var(--navy)'">
                                    <span class="material-symbols-rounded" style="font-size:16px">visibility</span>
                                </a>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

function renderUsuariosRecientes() {
    const usuarios = dashboardData.usuarios.slice(0, 5);

    if (usuarios.length === 0) {
        return `<div class="empty-state">No hay usuarios registrados</div>`;
    }

    return usuarios.map(u => {
        const iniciales = u.nombre_usuario
            ? u.nombre_usuario.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
            : 'U';
        const activo = u.estado_usuario === 1;
        const rol = u.nombre_rol || 'Usuario';

        return `
            <div class="flex-between">
                <div class="flex-center gap-8">
                    <div class="avatar">${iniciales}</div>
                    <div>
                        <div class="text-sm fw-500">${u.nombre_usuario || 'Sin nombre'}</div>
                        <div class="text-xs text-muted">${rol}</div>
                    </div>
                </div>
                <span class="badge ${activo ? 'badge-success' : 'badge-muted'}">${activo ? 'Activo' : 'Inactivo'}</span>
            </div>
        `;
    }).join('');
}

function renderSolicitudesPendientes() {
    const pendientes = dashboardData.solicitudes
        .filter(s => s.estado_solicitud === 'PENDIENTE')
        .slice(0, 5);

    if (pendientes.length === 0) {
        return `<div class="empty-state">No hay solicitudes pendientes</div>`;
    }

    return pendientes.map(s => {
        const fecha = new Date(s.fecha_solicitud).toLocaleDateString('es-HN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });

        return `
            <div class="flex-between" style="padding:6px 0;border-bottom:1px solid var(--cream)">
                <div>
                    <div class="text-sm fw-500">${s.proyecto_nombre || 'Sin proyecto'}</div>
                    <div class="text-xs text-muted">${s.solicitante_nombre || 'N/A'} · ${fecha}</div>
                </div>
                <span class="badge badge-warning">Pendiente</span>
            </div>
        `;
    }).join('');
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function mostrarLoading(show) {
    const container = document.getElementById('dashboard-content');
    if (show) {
        container.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Cargando datos del dashboard...</p>
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

// ─────────────────────────────────────────────────────────────
// EXPORTAR FUNCIONES PARA EL HTML
// ─────────────────────────────────────────────────────────────

window.cargarDashboard = cargarDashboard;
window.showToast = showToast;
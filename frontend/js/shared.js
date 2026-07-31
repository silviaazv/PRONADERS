/* ============================================================
   shared.js — CONTROLADOR COMPARTIDO DEL SISTEMA PRONADERS
      Responsabilidades:
   1. Inyectar el sidebar y el topbar en todas las páginas.
   2. Construir la navegación según el ROL del usuario en sesión.
   3. Funcionalidad del botón de NOTIFICACIONES del topbar.
   4. Utilidades de VALIDACIÓN de formularios (FormUtils).
   5. Función global de cierre de sesión (logout).
   6. Visor de evidencias (imágenes y documentos).
   ============================================================ */

(function() {

    /* ──────────────────────────────────────────────
       1. SESIÓN Y ROL DEL USUARIO
       ────────────────────────────────────────────── */
    const pagina = window.location.pathname.split('/').pop();

    function rolPorDefecto() {
        if (pagina.startsWith('dashboard-admin')) return 'Administrador de Oficina';
        if (pagina.startsWith('dashboard-logistica')) return 'Equipo de Logistica';
        return 'Supervisor de Campo';
    }

    const role = sessionStorage.getItem('pron_role') || rolPorDefecto();
    const idUsuario = parseInt(sessionStorage.getItem('pron_id_usuario')) || null;
    const nombreUsuario = sessionStorage.getItem('pron_nombre') || 'Usuario';
    const iniciales = sessionStorage.getItem('pron_initials') || 'US';

    const ROLE_LABELS = {
        'Administrador de Oficina': 'Administrador de Oficina',
        'Supervisor de Campo': 'Supervisor de Campo',
        'Equipo de Logistica': 'Equipo de Logistica',
    };

    const roleLabel = ROLE_LABELS[role];

    /* ──────────────────────────────────────────────
       2. NAVEGACIÓN POR ROL
       ────────────────────────────────────────────── */
    const NAV = {
        'Supervisor de Campo': [
            { section: 'Principal' },
            { label: 'Dashboard', icon: 'dashboard', href: 'dashboard-campo.html' },
            { section: 'Mis Módulos' },
            { label: 'Mis Proyectos', icon: 'folder_open', href: 'proyectos.html' },
            { label: 'Reportes de Avance', icon: 'bar_chart', href: 'reportes.html' },
            { label: 'Solicitud de Recursos', icon: 'inventory_2', href: 'solicitudes.html' },
            { label: 'Proyecciones', icon: 'timeline', href: 'proyecciones.html' },
        ],
        'Administrador de Oficina': [
            { section: 'Principal' },
            { label: 'Dashboard', icon: 'dashboard', href: 'dashboard-admin.html' },
            { section: 'Administración' },
            { label: 'Gestión de Proyectos', icon: 'folder_open', href: 'proyectos.html' },
            { label: 'Usuarios', icon: 'manage_accounts', href: 'usuarios.html' },
            { section: 'Monitoreo' },
            { label: 'Reportes', icon: 'bar_chart', href: 'reportes.html' },
            { label: 'Solicitudes', icon: 'inventory_2', href: 'solicitudes.html' },
            { label: 'Proyecciones', icon: 'timeline', href: 'proyecciones.html' },
            { label: 'Logística', icon: 'local_shipping', href: 'dashboard-logistica.html' },
            { section: 'Sistema' },
            { label: 'Bitácora', icon: 'receipt_long', href: 'bitacora.html' },
        ],
        'Equipo de Logistica': [
            { section: 'Principal' },
            { label: 'Dashboard', icon: 'dashboard', href: 'dashboard-logistica.html' },
            { section: 'Operaciones' },
            { label: 'Despachos Asignados', icon: 'local_shipping', href: 'solicitudes.html' },
        ],
    };

    /* ──────────────────────────────────────────────
       3. CONSTRUCCIÓN DEL SIDEBAR
       ────────────────────────────────────────────── */
    function buildNav(items) {
        let html = '';
        let inSection = false;
        items.forEach(item => {
            if (item.section) {
                if (inSection) html += '</div>';
                html += '<div class="sidebar-section"><span class="sidebar-label">' + item.section + '</span>';
                inSection = true;
            } else {
                const active = item.href === pagina ? 'active' : '';
                const badge = item.badge ? '<span class="nav-badge">' + item.badge + '</span>' : '';
                html += '<a class="nav-item ' + active + '" href="' + item.href + '"><span class="material-symbols-rounded">' + item.icon + '</span>' + item.label + badge + '</a>';
            }
        });
        if (inSection) html += '</div>';
        return html;
    }

    const navItems = NAV[role] || NAV.campo;

    const sidebar = `
        <aside class="sidebar">
            <div class="sidebar-brand">
                <div class="brand-logo">P</div>
                <div>
                    <div class="brand-name">PRONADERS</div>
                    <div class="brand-sub">Sistema de Gestión</div>
                </div>
            </div>
            ${buildNav(navItems)}
            <div class="sidebar-user">
                <div class="user-avatar">${iniciales}</div>
                <div>
                    <div class="user-name">${nombreUsuario}</div>
                    <div class="user-role">${roleLabel}</div>
                </div>
                <button class="logout-btn" onclick="logout()" title="Cerrar sesión">
                    <span class="material-symbols-rounded">logout</span>
                </button>
            </div>
        </aside>
    `;

    /* ──────────────────────────────────────────────
       4. TOPBAR
       ────────────────────────────────────────────── */
    const pageTitle = document.title.replace('PRONADERS — ', '');

    const topbar = `
        <header class="topbar">
            <div class="page-title">${pageTitle}</div>
            <div class="topbar-right">
                <div class="icon-btn" id="btn-notificaciones" title="Notificaciones" onclick="toggleNotificaciones(event)">
                    <span class="material-symbols-rounded">notifications</span>
                    <span class="notif-dot" id="notif-dot"></span>
                </div>
                <div class="topbar-avatar" title="${nombreUsuario}">${iniciales}</div>
            </div>
        </header>
    `;

    document.body.insertAdjacentHTML('afterbegin', topbar);
    document.body.insertAdjacentHTML('afterbegin', sidebar);

    /* ──────────────────────────────────────────────
       5. ESTILOS COMPARTIDOS
       ────────────────────────────────────────────── */
    const css = document.createElement('style');
    css.textContent = `
        /* ── Sidebar ── */
        .sidebar {
            position: fixed;
            left: 0;
            top: 0;
            bottom: 0;
            width: 240px;
            background: var(--navy, #0D1B3E);
            color: rgba(255,255,255,0.75);
            display: flex;
            flex-direction: column;
            padding: 20px 16px 16px;
            z-index: 1000;
            transition: transform 0.3s ease;
            overflow-y: auto;
        }
        .sidebar-brand {
            display: flex;
            align-items: center;
            gap: 12px;
            padding-bottom: 20px;
            border-bottom: 1px solid rgba(255,255,255,0.08);
            margin-bottom: 16px;
        }
        .brand-logo {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            background: var(--gold, #C9A84C);
            color: var(--navy, #0D1B3E);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            font-weight: 700;
        }
        .brand-name {
            font-size: 16px;
            font-weight: 700;
            color: #fff;
            letter-spacing: 0.5px;
        }
        .brand-sub {
            font-size: 10.5px;
            color: rgba(255,255,255,0.5);
            text-transform: uppercase;
            letter-spacing: 0.8px;
        }
        .sidebar-section {
            margin-bottom: 8px;
        }
        .sidebar-label {
            display: block;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: rgba(255,255,255,0.3);
            padding: 12px 0 6px 12px;
            font-weight: 600;
        }
        .nav-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 12px;
            border-radius: 8px;
            color: rgba(255,255,255,0.65);
            text-decoration: none;
            font-size: 13px;
            transition: all 0.2s ease;
            cursor: pointer;
        }
        .nav-item:hover {
            background: rgba(255,255,255,0.06);
            color: #fff;
        }
        .nav-item.active {
            background: rgba(201,168,76,0.18);
            color: var(--gold, #C9A84C);
        }
        .nav-item .material-symbols-rounded {
            font-size: 20px;
            flex-shrink: 0;
        }
        .nav-badge {
            background: var(--gold, #C9A84C);
            color: var(--navy, #0D1B3E);
            font-size: 10px;
            font-weight: 700;
            padding: 1px 8px;
            border-radius: 12px;
            margin-left: auto;
        }
        .sidebar-user {
            margin-top: auto;
            padding-top: 16px;
            border-top: 1px solid rgba(255,255,255,0.08);
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .user-avatar {
            width: 34px;
            height: 34px;
            border-radius: 50%;
            background: var(--gold, #C9A84C);
            color: var(--navy, #0D1B3E);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 700;
            flex-shrink: 0;
        }
        .user-name {
            font-size: 13px;
            font-weight: 500;
            color: #fff;
            line-height: 1.2;
        }
        .user-role {
            font-size: 10.5px;
            color: rgba(255,255,255,0.5);
        }
        .logout-btn {
            margin-left: auto;
            background: none;
            border: none;
            color: rgba(255,255,255,0.4);
            cursor: pointer;
            padding: 4px;
            border-radius: 6px;
            transition: all 0.2s ease;
        }
        .logout-btn:hover {
            color: #fff;
            background: rgba(255,255,255,0.06);
        }
        .logout-btn .material-symbols-rounded {
            font-size: 20px;
        }

        /* ── Topbar ── */
        .topbar {
            position: fixed;
            left: 240px;
            right: 0;
            top: 0;
            height: 60px;
            background: var(--white, #fff);
            border-bottom: 1px solid var(--cream-dark, #E8E0D4);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 28px;
            z-index: 900;
        }
        .page-title {
            font-family: var(--font-serif, Georgia, serif);
            font-size: 17px;
            font-weight: 400;
            color: var(--navy, #0D1B3E);
        }
        .topbar-right {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .icon-btn {
            position: relative;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: background 0.2s ease;
            border: none;
            background: none;
            color: var(--text-light, #4A4A5A);
        }
        .icon-btn:hover {
            background: var(--cream, #F5F0E8);
        }
        .icon-btn .material-symbols-rounded {
            font-size: 22px;
        }
        .notif-dot {
            position: absolute;
            top: 6px;
            right: 6px;
            width: 8px;
            height: 8px;
            background: #E74C3C;
            border-radius: 50%;
            border: 2px solid var(--white, #fff);
            display: none;
        }
        .notif-dot.visible {
            display: block;
        }
        .topbar-avatar {
            width: 34px;
            height: 34px;
            border-radius: 50%;
            background: var(--cream-dark, #E8E0D4);
            color: var(--text-light, #4A4A5A);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
        }

        /* ── Panel de Notificaciones ── */
        .notif-panel {
            position: fixed;
            top: 66px;
            right: 24px;
            width: 360px;
            background: var(--white, #fff);
            border: 1px solid var(--cream-dark, #E8E0D4);
            border-radius: 12px;
            box-shadow: 0 12px 40px rgba(13,27,62,0.15);
            z-index: 1200;
            overflow: hidden;
            display: none;
            max-height: 480px;
            overflow-y: auto;
        }
        .notif-panel.open {
            display: block;
        }
        .notif-panel .np-head {
            padding: 12px 16px;
            border-bottom: 1px solid var(--cream-dark, #E8E0D4);
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 13px;
            font-weight: 600;
            color: var(--navy, #0D1B3E);
            position: sticky;
            top: 0;
            background: var(--white, #fff);
            z-index: 1;
        }
        .notif-panel .np-item {
            display: flex;
            gap: 10px;
            padding: 11px 16px;
            border-bottom: 1px solid var(--cream, #F5F0E8);
            cursor: pointer;
            transition: background 0.15s ease;
        }
        .notif-panel .np-item:hover {
            background: var(--cream, #F5F0E8);
        }
        .notif-panel .np-item.leida {
            opacity: 0.55;
        }
        .notif-panel .np-ico {
            width: 30px;
            height: 30px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }
        .notif-panel .np-ico .material-symbols-rounded {
            font-size: 16px;
        }
        .notif-panel .np-txt {
            font-size: 12.5px;
            color: var(--text, #1A1A2E);
            line-height: 1.4;
        }
        .notif-panel .np-meta {
            font-size: 11px;
            color: var(--muted, #888899);
            margin-top: 2px;
        }
        .notif-panel .np-empty {
            padding: 26px;
            text-align: center;
            font-size: 12.5px;
            color: var(--muted, #888899);
        }
        .notif-panel .np-foot {
            padding: 9px 16px;
            text-align: center;
            border-top: 1px solid var(--cream, #F5F0E8);
            position: sticky;
            bottom: 0;
            background: var(--white, #fff);
        }
        .notif-panel .np-foot button {
            background: none;
            border: none;
            color: var(--navy, #0D1B3E);
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            padding: 4px 8px;
        }
        .notif-panel .np-foot button:hover {
            color: var(--gold, #C9A84C);
        }

        /* ── Errores de validación ── */
        .form-control.invalid {
            border-color: #C0392B !important;
            background: #FDF3F2;
        }
        .field-error {
            color: #C0392B;
            font-size: 11.5px;
            margin-top: 4px;
            display: flex;
            align-items: center;
            gap: 4px;
        }
        .field-error .material-symbols-rounded {
            font-size: 13px;
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
            .sidebar {
                transform: translateX(-100%);
                width: 260px;
            }
            .sidebar.open {
                transform: translateX(0);
            }
            .topbar {
                left: 0;
                padding: 0 16px;
            }
            .main {
                margin-left: 0 !important;
                padding: 16px;
            }
            .notif-panel {
                right: 8px;
                width: calc(100vw - 16px);
                max-width: 360px;
            }
        }

        /* ── Animaciones ── */
        @keyframes notifIn {
            from { opacity: 0; transform: translateY(-6px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .notif-panel {
            animation: notifIn 0.18s ease;
        }

        /* ── Scrollbar Sidebar ── */
        .sidebar::-webkit-scrollbar {
            width: 4px;
        }
        .sidebar::-webkit-scrollbar-track {
            background: transparent;
        }
        .sidebar::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.15);
            border-radius: 4px;
        }
    `;
    document.head.appendChild(css);

    /* ──────────────────────────────────────────────
       6. NOTIFICACIONES DESDE LA API
       ────────────────────────────────────────────── */
    
    let notificacionesCache = [];
    let notificacionesCargadas = false;

    async function cargarNotificaciones(force = false) {
        if (notificacionesCargadas && !force) return notificacionesCache;

        try {
            if (typeof API === 'undefined' || !API.bitacora) {
                console.warn('[PRONADERS] API no disponible para notificaciones');
                notificacionesCache = [];
                notificacionesCargadas = true;
                return [];
            }

            const params = { id_usuario: idUsuario, limite: 10 };
            const eventos = await API.bitacora.listar(params);

            if (!eventos || eventos.length === 0) {
                notificacionesCache = [];
                notificacionesCargadas = true;
                return [];
            }

            const notificaciones = eventos.map(evento => {
                let icono = 'info';
                let color = '#2C6E9B';
                let fondo = '#E6F1FB';
                let href = '#';

                switch (evento.tipo_accion) {
                    case 'EMISION':
                    case 'INSERT':
                        icono = 'add_circle';
                        color = '#2E7D52';
                        fondo = '#E7F3EC';
                        break;
                    case 'APROBACION':
                    case 'REVISION':
                        icono = 'check_circle';
                        color = '#2E7D52';
                        fondo = '#E7F3EC';
                        break;
                    case 'RECHAZO':
                        icono = 'cancel';
                        color = '#C0392B';
                        fondo = '#FBEAE8';
                        break;
                    case 'UPDATE':
                        icono = 'edit';
                        color = '#B7791F';
                        fondo = '#FBF3E4';
                        break;
                    case 'DELETE':
                        icono = 'delete';
                        color = '#C0392B';
                        fondo = '#FBEAE8';
                        break;
                    case 'LOGIN':
                        icono = 'login';
                        color = '#2C6E9B';
                        fondo = '#E6F1FB';
                        break;
                    case 'LOGOUT':
                        icono = 'logout';
                        color = '#888899';
                        fondo = '#F5F0E8';
                        break;
                    default:
                        icono = 'info';
                        color = '#2C6E9B';
                        fondo = '#E6F1FB';
                }

                if (evento.tipo_objeto === 'SOLICITUD') {
                    href = 'solicitudes.html';
                } else if (evento.tipo_objeto === 'PROYECTO') {
                    href = 'proyectos.html';
                } else if (evento.tipo_objeto === 'REPORTE') {
                    href = 'reportes.html';
                } else if (evento.tipo_objeto === 'USUARIO') {
                    href = 'usuarios.html';
                }

                const fecha = new Date(evento.fecha_accion);
                const ahora = new Date();
                const diffMin = Math.floor((ahora - fecha) / 60000);
                let meta = '';

                if (diffMin < 1) meta = 'hace unos segundos';
                else if (diffMin < 60) meta = `hace ${diffMin} min`;
                else if (diffMin < 1440) meta = `hace ${Math.floor(diffMin / 60)} h`;
                else meta = `hace ${Math.floor(diffMin / 1440)} días`;

                let mensaje = '';
                if (evento.tipo_objeto === 'SOLICITUD') {
                    mensaje = `Solicitud ${evento.id_objeto || ''} ${evento.tipo_accion === 'APROBACION' ? 'aprobada' : evento.tipo_accion === 'RECHAZO' ? 'rechazada' : 'creada'}`;
                } else if (evento.tipo_objeto === 'PROYECTO') {
                    mensaje = `Proyecto ${evento.id_objeto || ''} ${evento.tipo_accion === 'UPDATE' ? 'actualizado' : 'creado'}`;
                } else if (evento.tipo_objeto === 'REPORTE') {
                    mensaje = `Reporte ${evento.id_objeto || ''} ${evento.tipo_accion === 'REVISION' ? 'revisado' : 'creado'}`;
                } else if (evento.tipo_objeto === 'USUARIO') {
                    mensaje = `Usuario ${evento.id_objeto || ''} ${evento.tipo_accion === 'UPDATE' ? 'actualizado' : 'creado'}`;
                } else {
                    mensaje = evento.valor_nuevo || `Acción: ${evento.tipo_accion}`;
                }

                if (evento.campo_modificado) {
                    mensaje += ` (${evento.campo_modificado})`;
                }

                return {
                    id: evento.id_registro,
                    icon: icono,
                    c: color,
                    bg: fondo,
                    txt: mensaje,
                    meta: meta,
                    href: href,
                    leida: false,
                    fecha: evento.fecha_accion,
                    tipo_objeto: evento.tipo_objeto,
                    id_objeto: evento.id_objeto
                };
            });

            notificacionesCache = notificaciones;
            notificacionesCargadas = true;
            _actualizarDotNotifs();

            return notificacionesCache;

        } catch (error) {
            console.error('[PRONADERS] Error cargando notificaciones:', error);
            notificacionesCache = [];
            notificacionesCargadas = true;
            return [];
        }
    }

    window._notifs = notificacionesCache;
    window._notifsCargadas = notificacionesCargadas;

    /* ──────────────────────────────────────────────
       7. FUNCIONES DE NOTIFICACIONES 
       ────────────────────────────────────────────── */

    function _renderNotifPanel() {
        const lista = window._notifs || [];

        if (!window._notifsCargadas) {
            return `
                <div class="np-head">
                    <span>Notificaciones</span>
                    <span style="font-size:11px;color:var(--muted,#888899);font-weight:400">cargando...</span>
                </div>
                <div style="padding:30px;text-align:center;color:var(--muted)">
                    <div style="display:inline-block;width:24px;height:24px;border:2px solid var(--cream-dark);border-top-color:var(--gold);border-radius:50%;animation:spin 0.8s linear infinite;margin-bottom:8px;"></div>
                    <div>Cargando notificaciones...</div>
                </div>
            `;
        }

        if (lista.length === 0) {
            return `
                <div class="np-head">
                    <span>Notificaciones</span>
                    <span style="font-size:11px;color:var(--muted,#888899);font-weight:400">0 sin leer</span>
                </div>
                <div class="np-empty">No hay notificaciones recientes.</div>
            `;
        }

        const noLeidas = lista.filter(n => !n.leida).length;
        const items = lista.map((n, i) => `
            <div class="np-item ${n.leida ? 'leida' : ''}" onclick="abrirNotificacion(${i})">
                <div class="np-ico" style="background:${n.bg}">
                    <span class="material-symbols-rounded" style="color:${n.c}">${n.icon}</span>
                </div>
                <div>
                    <div class="np-txt">${n.txt}</div>
                    <div class="np-meta">${n.meta}</div>
                </div>
            </div>
        `).join('');

        return `
            <div class="np-head">
                <span>Notificaciones</span>
                <span style="font-size:11px;color:var(--muted,#888899);font-weight:400">${noLeidas} sin leer</span>
            </div>
            ${items}
            <div class="np-foot">
                <button onclick="marcarNotifsLeidas()">Marcar todas como leídas</button>
                <button onclick="recargarNotificaciones()" style="margin-left:12px;color:var(--muted)">↻ Actualizar</button>
            </div>
        `;
    }

    function toggleNotificaciones(e) {
        if (e) e.stopPropagation();

        let panel = document.getElementById('notif-panel');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'notif-panel';
            panel.className = 'notif-panel';
            document.body.appendChild(panel);

            document.addEventListener('click', (ev) => {
                if (panel.classList.contains('open') && !panel.contains(ev.target) &&
                    ev.target.id !== 'btn-notificaciones' && !document.getElementById('btn-notificaciones')?.contains(ev.target)) {
                    panel.classList.remove('open');
                }
            });
        }

        if (panel.classList.contains('open')) {
            panel.classList.remove('open');
            return;
        }

        if (!window._notifsCargadas) {
            panel.innerHTML = _renderNotifPanel();
            panel.classList.add('open');
            cargarNotificaciones(true).then(() => {
                if (panel.classList.contains('open')) {
                    panel.innerHTML = _renderNotifPanel();
                }
            });
        } else {
            cargarNotificaciones(true).then(() => {
                if (panel.classList.contains('open')) {
                    panel.innerHTML = _renderNotifPanel();
                }
            });
            panel.innerHTML = _renderNotifPanel();
            panel.classList.add('open');
        }
    }

    function abrirNotificacion(i) {
        const lista = window._notifs || [];
        const n = lista[i];
        if (!n) return;

        n.leida = true;
        _actualizarDotNotifs();

        if (n.tipo_objeto && n.id_objeto) {
            if (n.tipo_objeto === 'SOLICITUD') {
                sessionStorage.setItem('pron_open_solicitud', n.id_objeto);
            } else if (n.tipo_objeto === 'PROYECTO') {
                sessionStorage.setItem('pron_open_proyecto', n.id_objeto);
            } else if (n.tipo_objeto === 'REPORTE') {
                sessionStorage.setItem('pron_open_reporte', n.id_objeto);
            }
        }

        const panel = document.getElementById('notif-panel');
        if (panel) panel.classList.remove('open');

        if (n.href) {
            window.location.href = n.href;
        }
    }

    function marcarNotifsLeidas() {
        (window._notifs || []).forEach(n => n.leida = true);
        const panel = document.getElementById('notif-panel');
        if (panel) panel.innerHTML = _renderNotifPanel();
        _actualizarDotNotifs();
    }

    async function recargarNotificaciones() {
        const panel = document.getElementById('notif-panel');
        if (panel) {
            panel.innerHTML = `
                <div class="np-head">
                    <span>Notificaciones</span>
                    <span style="font-size:11px;color:var(--muted,#888899);font-weight:400">actualizando...</span>
                </div>
                <div style="padding:30px;text-align:center;color:var(--muted)">
                    <div style="display:inline-block;width:24px;height:24px;border:2px solid var(--cream-dark);border-top-color:var(--gold);border-radius:50%;animation:spin 0.8s linear infinite;margin-bottom:8px;"></div>
                    <div>Actualizando notificaciones...</div>
                </div>
            `;
        }
        await cargarNotificaciones(true);
        if (panel) panel.innerHTML = _renderNotifPanel();
        _actualizarDotNotifs();
    }

    function _actualizarDotNotifs() {
        const dot = document.getElementById('notif-dot');
        if (dot) {
            const tieneNoLeidas = (window._notifs || []).some(n => !n.leida);
            if (tieneNoLeidas) {
                dot.classList.add('visible');
            } else {
                dot.classList.remove('visible');
            }
        }
    }

    // Cargar notificaciones al iniciar
    document.addEventListener('DOMContentLoaded', async () => {
        await cargarNotificaciones();
    });

    // Exponer funciones al window
    window.toggleNotificaciones = toggleNotificaciones;
    window.abrirNotificacion = abrirNotificacion;
    window.marcarNotifsLeidas = marcarNotifsLeidas;
    window.recargarNotificaciones = recargarNotificaciones;
    window._renderNotifPanel = _renderNotifPanel;
    window._actualizarDotNotifs = _actualizarDotNotifs;
    window._cargarNotificaciones = cargarNotificaciones;

    /* ──────────────────────────────────────────────
       8. CIERRE 
       ────────────────────────────────────────────── */
})();  

/* ============================================================
   FUNCIONES GLOBALES
   ============================================================ */

/**
 * Cierre de Sesión
 */
function logout() {
    if (typeof API !== 'undefined' && API.auth) {
        try {
            API.auth.logout().catch(() => {});
        } catch (e) {}
    }
    sessionStorage.clear();
    window.location.href = 'index.html';
}

/* ============================================================
   FormUtils — VALIDACIÓN DE FORMULARIOS
   ============================================================ */
const FormUtils = {
    marcarInvalido(el, msg) {
        if (!el) return;
        el.classList.add('invalid');
        let err = el.parentElement.querySelector('.field-error[data-for="' + el.id + '"]');
        if (!err) {
            err = document.createElement('div');
            err.className = 'field-error';
            err.dataset.for = el.id;
            el.insertAdjacentElement('afterend', err);
        }
        err.innerHTML = '<span class="material-symbols-rounded" style="font-size:13px">error</span>' + msg;
        const limpiar = () => FormUtils.limpiarInvalido(el);
        el.addEventListener('input', limpiar, { once: true });
        el.addEventListener('change', limpiar, { once: true });
    },

    limpiarInvalido(el) {
        if (!el) return;
        el.classList.remove('invalid');
        const err = el.parentElement.querySelector('.field-error[data-for="' + el.id + '"]');
        if (err) err.remove();
    },

    limpiarErrores(contenedor) {
        const c = typeof contenedor === 'string' ? document.getElementById(contenedor) : contenedor;
        if (!c) return;
        c.querySelectorAll('.form-control.invalid').forEach(el => el.classList.remove('invalid'));
        c.querySelectorAll('.field-error').forEach(el => el.remove());
    },

    validar(campos) {
        let errores = 0;
        campos.forEach(({ id, msg, cond }) => {
            const el = document.getElementById(id);
            if (!el) return;
            const valor = (el.value || '').trim();
            const ok = cond ? cond(valor, el) : valor !== '';
            if (!ok) {
                FormUtils.marcarInvalido(el, msg);
                errores++;
            } else {
                FormUtils.limpiarInvalido(el);
            }
        });
        return errores;
    },

    fechasValidas(inicio, fin) {
        if (!inicio || !fin) return true;
        return new Date(fin) >= new Date(inicio);
    },

    emailValido(txt) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(txt);
    },
};

window.FormUtils = FormUtils;

/* ============================================================
   VISOR DE EVIDENCIAS
   ============================================================ */
function abrirVisor(archivo) {
    let v = document.getElementById('visor-evidencias');
    if (!v) {
        v = document.createElement('div');
        v.id = 'visor-evidencias';
        v.innerHTML = `
            <style>
                #visor-evidencias {
                    position: fixed;
                    inset: 0;
                    background: rgba(8,14,32,0.92);
                    z-index: 1500;
                    display: none;
                    flex-direction: column;
                    animation: notifIn 0.18s ease;
                }
                #visor-evidencias.open { display: flex; }
                #visor-evidencias .v-top { display: flex; justify-content: flex-end; padding: 14px 18px; }
                #visor-evidencias .v-close {
                    background: rgba(255,255,255,0.12);
                    border: none;
                    color: #fff;
                    width: 38px;
                    height: 38px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.2s ease;
                }
                #visor-evidencias .v-close:hover { background: rgba(255,255,255,0.25); }
                #visor-evidencias .v-body {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0 40px;
                    min-height: 0;
                }
                #visor-evidencias .v-frame {
                    background: #fff;
                    border-radius: 14px;
                    max-width: 720px;
                    width: 100%;
                    max-height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 40px;
                    gap: 14px;
                    overflow: hidden;
                }
                #visor-evidencias .v-ico {
                    font-size: 88px !important;
                    color: var(--cream-dark, #E8E0D4);
                }
                #visor-evidencias .v-nombre {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--navy, #0D1B3E);
                    text-align: center;
                    word-break: break-all;
                }
                #visor-evidencias .v-tag {
                    font-size: 11px;
                    color: var(--muted, #888899);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                #visor-evidencias .v-foot {
                    background: rgba(0,0,0,0.55);
                    padding: 16px 26px 22px;
                    color: #fff;
                }
                #visor-evidencias .v-cod {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    font-weight: 600;
                    background: rgba(255,255,255,0.14);
                    border-radius: 20px;
                    padding: 3px 12px;
                    margin-bottom: 7px;
                }
                #visor-evidencias .v-desc {
                    font-size: 13.5px;
                    line-height: 1.55;
                    color: rgba(255,255,255,0.92);
                    max-width: 860px;
                }
                #visor-evidencias .v-cod .material-symbols-rounded { font-size: 13px; }
                @media (max-width: 600px) {
                    #visor-evidencias .v-frame { padding: 24px; }
                    #visor-evidencias .v-ico { font-size: 56px !important; }
                    #visor-evidencias .v-body { padding: 0 16px; }
                }
            </style>
            <div class="v-top">
                <button class="v-close" onclick="cerrarVisor()" title="Cerrar">✕</button>
            </div>
            <div class="v-body">
                <div class="v-frame" id="visor-frame"></div>
            </div>
            <div class="v-foot">
                <div class="v-cod" id="visor-cod"></div>
                <div class="v-desc" id="visor-desc"></div>
            </div>
        `;
        document.body.appendChild(v);

        v.addEventListener('click', e => {
            if (e.target.id === 'visor-evidencias' || e.target.classList.contains('v-body')) {
                cerrarVisor();
            }
        });
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') cerrarVisor();
        });
    }

    const iconos = { img: 'image', pdf: 'picture_as_pdf', doc: 'description', xls: 'table' };
    const tags = { img: 'Fotografía de evidencia', pdf: 'Documento PDF', doc: 'Documento adjunto', xls: 'Hoja de cálculo' };

    document.getElementById('visor-frame').innerHTML = `
        <span class="material-symbols-rounded v-ico">${iconos[archivo.tipo] || 'description'}</span>
        <div class="v-nombre">${archivo.nombre || 'Archivo adjunto'}</div>
        <div class="v-tag">${tags[archivo.tipo] || 'Adjunto'} · Vista previa</div>
    `;

    document.getElementById('visor-cod').innerHTML = `
        <span class="material-symbols-rounded">${archivo.tipoCodigo === 'solicitud' ? 'inventory_2' : 'bar_chart'}</span>
        ${archivo.codigo || ''}
    `;
    document.getElementById('visor-desc').textContent = archivo.descripcion || '';
    v.classList.add('open');
}

function cerrarVisor() {
    const v = document.getElementById('visor-evidencias');
    if (v) v.classList.remove('open');
}

/* ============================================================
   MANEJO GLOBAL DE ERRORES
   ============================================================ */
window.addEventListener('error', function(ev) {
    try {
        console.error('[PRONADERS] Error no controlado:', ev.message, '·',
            (ev.filename || '').split('/').pop() + ':' + ev.lineno);
        if (typeof showToast === 'function') {
            showToast('Ocurrió un error inesperado. Si persiste, contacta al administrador.', 'warning');
        }
    } catch (e) { /* silencioso */ }
});

window.addEventListener('unhandledrejection', function(ev) {
    try {
        console.error('[PRONADERS] Promesa rechazada sin manejar:', ev.reason);
    } catch (e) { /* silencioso */ }
});

// Exponer funciones globales
window.logout = logout;
window.abrirVisor = abrirVisor;
window.cerrarVisor = cerrarVisor;
window.FormUtils = FormUtils;
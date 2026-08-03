/*
   shared.js

   Todo lo que se repite en cada pantalla del sistema vive aquí, para no
   tenerlo copiado en diez archivos. En concreto:

   1. Arma el menú lateral y la barra superior y los mete en la página.
   2. Decide qué opciones del menú se muestran según el rol de quien entró.
   3. Maneja la campana de notificaciones.
   4. Ofrece FormUtils, las validaciones de formularios que usan todos los
      módulos.
   5. Define logout(), el cierre de sesión.
   6. Define el visor para ver fotos y documentos adjuntos.

   Se carga después de api.js y antes del script propio de cada página.
*/

(function() {

    /* Quién está usando el sistema.

       Los datos se guardaron en sessionStorage al iniciar sesión. Si por lo
       que sea no están (por ejemplo alguien abrió la página directo desde la
       barra de direcciones), se adivina el rol a partir del nombre del
       archivo para que el menú no salga vacío. */
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

    /* Las opciones del menú, una lista por rol.

       Las entradas que solo traen 'section' no son enlaces, son los títulos
       que agrupan las opciones de abajo. Se nota la diferencia entre roles:
       el supervisor de campo ve "Mis Proyectos" (solo los suyos) mientras
       que el administrador ve "Gestión de Proyectos" (todos), y el equipo de
       logística solo tiene su tablero.

       Ojo: esto decide qué se ve en el menú, no a qué se puede entrar. Quien
       escriba la dirección a mano igual llega, así que los permisos de verdad
       tienen que estar en el servidor. */
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
        ]
    };

    /* Convierte la lista de opciones de arriba en el HTML del menú.

       Va abriendo un bloque cada vez que encuentra un título de sección y
       cerrando el anterior, por eso lleva la bandera inSection. La opción
       que corresponde a la página actual se marca como activa comparando el
       href con el nombre del archivo abierto. */
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
                <img class="brand-logo" src="/img/imagen-Escudo.png" alt="Escudo de Honduras">
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

    /* La barra superior. El título se saca del <title> de la página quitándole
       el prefijo "PRONADERS — ", así cada pantalla no tiene que repetir su
       nombre en dos lugares.

       Los dos bloques se insertan con afterbegin y en orden invertido (primero
       la barra, después el menú) porque cada inserción empuja a la anterior;
       de esta forma el menú termina quedando primero en el HTML. */
    const pageTitle = document.title.replace('PRONADERS — ', '');

    const topbar = `
        <header class="topbar">
            <div class="page-title">${pageTitle}</div>
            <div class="topbar-right">
                <div class="topbar-avatar" title="${nombreUsuario}">${iniciales}</div>
            </div>
        </header>
    `;

    document.body.insertAdjacentHTML('afterbegin', topbar);
    document.body.insertAdjacentHTML('afterbegin', sidebar);

    /* Los estilos del menú y la barra superior se inyectan desde acá, en vez
       de estar en cada hoja .css, porque el HTML de esos dos bloques también
       se genera acá: así el estilo y el marcado no se pueden desincronizar.

       Los var() llevan valor de respaldo por si la hoja de la página no
       definió esa variable. */
    const css = document.createElement('style');
    css.textContent = `
        /* Menú lateral */
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
        /* El escudo es un PNG vertical de 140x170 con fondo transparente. Se
           deja la caja cuadrada de 40x40 que tenía el logo anterior para no
           mover el resto del menú, y object-fit:contain acomoda la imagen
           dentro sin estirarla. */
        img.brand-logo {
            width: 40px;
            height: 40px;
            object-fit: contain;
            flex-shrink: 0;
            background: none;
            border-radius: 0;
            display: block;
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

        /* Barra superior. El left de 240px es el ancho del menú lateral: si
           ese ancho cambia arriba, hay que cambiarlo aquí también. */
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

        /* Panel de notificaciones que baja de la campana */
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

        /* Campos con error. FormUtils les agrega la clase invalid y debajo
           inserta un .field-error con el mensaje. */
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

        /* En pantallas chicas el menú se sale de vista y aparece al abrirlo,
           en lugar de comerse la mitad del ancho. */
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

        /* Animaciones */
        @keyframes notifIn {
            from { opacity: 0; transform: translateY(-6px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .notif-panel {
            animation: notifIn 0.18s ease;
        }

        /* Barra de desplazamiento propia del menú: más delgada y clara, para
           que no rompa el fondo azul cuando hay muchas opciones. */
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

    /* Notificaciones.

       Se descargan una sola vez al abrir la página y se guardan en
       notificacionesCache, así abrir y cerrar el panel no vuelve a pegarle al
       servidor. Para forzar una recarga hay que pasar force = true. */
    
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

    /* Armado del panel de notificaciones y lo que pasa al hacer clic en cada
       una. El panel se vuelve a dibujar completo cada vez que se abre, en vez
       de ir modificando lo que ya estaba: son pocas notificaciones y así no
       hay riesgo de que la pantalla quede mostrando algo viejo. */

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

    // Se piden apenas la página termina de cargar, para que el puntito rojo
    // de la campana ya aparezca sin que el usuario tenga que hacer nada.
    document.addEventListener('DOMContentLoaded', async () => {
        await cargarNotificaciones();
    });

    // Todo esto vive dentro de una función anónima, así que no se ve desde
    // fuera. Lo que necesitan los onclick del HTML y los scripts de cada
    // página hay que colgarlo a mano en window.
    window.toggleNotificaciones = toggleNotificaciones;
    window.abrirNotificacion = abrirNotificacion;
    window.marcarNotifsLeidas = marcarNotifsLeidas;
    window.recargarNotificaciones = recargarNotificaciones;
    window._renderNotifPanel = _renderNotifPanel;
    window._actualizarDotNotifs = _actualizarDotNotifs;
    window._cargarNotificaciones = cargarNotificaciones;

    /* Fin de la función anónima. Está envuelto así para que las variables de
       adentro (role, NAV, notificacionesCache…) no se mezclen con las de los
       scripts de cada página. */
})();

/*
   De aquí en adelante van las funciones globales: las que se llaman desde los
   onclick del HTML o desde el script de cualquier página.
*/

/* Cierra la sesión. Le avisa al servidor para que quede el registro en la
   bitácora, pero no espera la respuesta ni se detiene si falla: lo importante
   es borrar los datos de esta máquina y sacar al usuario de las pantallas
   internas, y eso tiene que pasar aunque el servidor no conteste. */
function logout() {
    if (typeof API !== 'undefined' && API.auth) {
        try {
            API.auth.logout().catch(() => {});
        } catch (e) {}
    }
    sessionStorage.clear();
    window.location.href = 'index.html';
}

/*
   FormUtils: las validaciones de formularios que comparten todos los módulos.

   La idea es marcar el campo que está mal y poner el mensaje justo debajo, en
   vez de sacar una alerta: así el usuario ve de una sola pasada todo lo que le
   falta corregir en un formulario largo.

   Esto no reemplaza la validación del servidor, solo evita el viaje de ida y
   vuelta cuando el error es evidente.
*/
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

    /* Deja un campo aceptando solamente números. Filtra en cada tecleo, y
       también cuando se pega texto o lo llena el autocompletado, así que la
       letra nunca alcanza a quedar escrita y no hay que esperar a enviar el
       formulario para avisar del error.

       maxLen cuenta dígitos, no caracteres. La cuenta de 'descartados' es para
       devolver el cursor a donde estaba: sin eso, corregir un dígito en medio
       del número manda el cursor al final y se vuelve insoportable de usar. */
    soloDigitos(el, maxLen) {
        if (!el) return;
        el.setAttribute('inputmode', 'numeric');
        el.addEventListener('input', () => {
            const original = el.value;
            let limpio = original.replace(/\D/g, '');
            if (maxLen) limpio = limpio.slice(0, maxLen);
            if (limpio === original) return;

            const cursor = el.selectionStart;
            const descartados = (original.slice(0, cursor).match(/\D/g) || []).length;
            el.value = limpio;
            const pos = Math.min(Math.max(cursor - descartados, 0), limpio.length);
            el.setSelectionRange(pos, pos);
        });
    },
};

window.FormUtils = FormUtils;

/*
   Visor de evidencias: abre a pantalla completa las fotos y documentos
   adjuntos a solicitudes y reportes.

   El visor no está en el HTML de ninguna página: se crea la primera vez que
   se necesita y después se reutiliza siempre el mismo, para no repetir el
   marcado en las siete pantallas que lo usan.
*/
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
                /* Cuando sí hay un archivo que mostrar, el marco se agranda
                   para aprovechar la pantalla; sin archivo se queda chico,
                   con solo el ícono y el nombre. */
                #visor-evidencias .v-frame.v-con-archivo {
                    max-width: 980px;
                    height: 100%;
                    padding: 0;
                    justify-content: stretch;
                }
                #visor-evidencias .v-doc {
                    width: 100%;
                    height: 100%;
                    border: none;
                    border-radius: 14px;
                }
                #visor-evidencias .v-img {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                    border-radius: 14px;
                }
                #visor-evidencias .v-abrir {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12.5px;
                    font-weight: 600;
                    color: var(--navy, #0D1B3E);
                    text-decoration: none;
                }
                #visor-evidencias .v-abrir:hover { text-decoration: underline; }
                @media (max-width: 600px) {
                    #visor-evidencias .v-frame { padding: 24px; }
                    #visor-evidencias .v-frame.v-con-archivo { padding: 0; }
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

    const marco = document.getElementById('visor-frame');
    const nombre = archivo.nombre || 'Archivo adjunto';
    const url = archivo.url || '';

    if (url && archivo.tipo === 'img') {
        // Las fotos se muestran tal cual, que es el caso más común: casi toda
        // la evidencia de campo son fotografías.
        marco.className = 'v-frame v-con-archivo';
        marco.innerHTML = `<img class="v-img" src="${url}" alt="${nombre}">`;

    } else if (url && archivo.tipo === 'pdf') {
        // Los PDF se meten en un iframe y los dibuja el visor que ya trae el
        // navegador, así no hay que cargar ninguna librería extra.
        marco.className = 'v-frame v-con-archivo';
        marco.innerHTML = `<iframe class="v-doc" src="${url}" title="${nombre}"></iframe>`;

    } else if (url) {
        // Word, Excel y compañía no los puede mostrar el navegador, así que en
        // lugar de una vista previa se ofrece el botón de descarga.
        marco.className = 'v-frame';
        marco.innerHTML = `
            <span class="material-symbols-rounded v-ico">${iconos[archivo.tipo] || 'description'}</span>
            <div class="v-nombre">${nombre}</div>
            <div class="v-tag">${tags[archivo.tipo] || 'Adjunto'}</div>
            <a class="v-abrir" href="${url}" target="_blank" rel="noopener" download="${nombre}">
                <span class="material-symbols-rounded" style="font-size:16px">download</span> Descargar archivo
            </a>
        `;

    } else {
        // Sin ruta guardada no hay nada que abrir. Pasa con los registros
        // viejos, de antes de que se guardaran los adjuntos: se muestra la
        // ficha con el ícono y el nombre para que al menos se sepa qué se
        // había adjuntado.
        marco.className = 'v-frame';
        marco.innerHTML = `
            <span class="material-symbols-rounded v-ico">${iconos[archivo.tipo] || 'description'}</span>
            <div class="v-nombre">${nombre}</div>
            <div class="v-tag">${tags[archivo.tipo] || 'Adjunto'} · Vista previa</div>
        `;
    }

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

/*
   Encierra el tabulador dentro de los modales.

   Los modales se dibujan encima de la página, pero para el navegador la
   página de atrás sigue estando ahí. Sin esto, dar Tab dentro de un modal
   termina moviendo el foco al menú lateral y a la tabla del fondo, que ni
   siquiera se ven, y el usuario que trabaja con teclado queda perdido.

   Lo que hace:
     - al abrirse el modal, pone el foco en su primer campo;
     - Tab y Shift+Tab dan la vuelta dentro del modal en vez de salirse;
     - al cerrarse, devuelve el foco al botón que lo abrió.

   Funciona vigilando la clase .open, así que agarra todos los modales de
   todas las pantallas sin tener que tocarlos uno por uno.
*/
(function () {
    const CONTENEDORES = '.modal-overlay, .confirm-dialog, #visor-evidencias';
    const ABIERTOS = '.modal-overlay.open, .confirm-dialog.open, #visor-evidencias.open';
    const FOCUSABLES = 'a[href], button, input, select, textarea, [tabindex]';

    let disparador = null;   // quién abrió el modal, para devolverle el foco

    function modalActivo() {
        const abiertos = document.querySelectorAll(ABIERTOS);
        return abiertos.length ? abiertos[abiertos.length - 1] : null;
    }

    function camposEnfocables(modal) {
        return Array.from(modal.querySelectorAll(FOCUSABLES)).filter(el =>
            !el.disabled &&
            el.tabIndex !== -1 &&
            el.getClientRects().length > 0   // descarta lo oculto
        );
    }

    new MutationObserver(cambios => {
        cambios.forEach(c => {
            const el = c.target;
            if (!el.matches || !el.matches(CONTENEDORES)) return;

            const abierto = el.classList.contains('open');
            const estaba = (c.oldValue || '').split(/\s+/).includes('open');
            if (abierto === estaba) return;

            if (abierto) {
                if (!el.contains(document.activeElement)) disparador = document.activeElement;
                const campos = camposEnfocables(el);
                if (campos.length) campos[0].focus();
            } else if (disparador && document.body.contains(disparador)) {
                disparador.focus();
                disparador = null;
            }
        });
    }).observe(document.body, {
        subtree: true,
        attributes: true,
        attributeFilter: ['class'],
        attributeOldValue: true
    });

    document.addEventListener('keydown', ev => {
        if (ev.key !== 'Tab') return;
        const modal = modalActivo();
        if (!modal) return;

        const campos = camposEnfocables(modal);
        if (!campos.length) return;

        const primero = campos[0];
        const ultimo = campos[campos.length - 1];

        // Si el foco quedó fuera del modal (pasa cuando se hace clic en el
        // fondo oscuro), se lo trae de vuelta al primer o último campo según
        // hacia dónde se estaba tabulando.
        if (!modal.contains(document.activeElement)) {
            ev.preventDefault();
            (ev.shiftKey ? ultimo : primero).focus();
            return;
        }
        if (ev.shiftKey && document.activeElement === primero) {
            ev.preventDefault();
            ultimo.focus();
        } else if (!ev.shiftKey && document.activeElement === ultimo) {
            ev.preventDefault();
            primero.focus();
        }
    });
})();

/*
   Red de seguridad para los errores que nadie atrapó.

   Sin esto, un error suelto deja la pantalla congelada sin decir nada y el
   usuario se queda esperando. Aquí al menos se le avisa que algo salió mal y
   el detalle técnico queda en la consola para poder revisarlo después.
*/
window.addEventListener('error', function(ev) {
    try {
        console.error('[PRONADERS] Error no controlado:', ev.message, '·',
            (ev.filename || '').split('/').pop() + ':' + ev.lineno);
        if (typeof showToast === 'function') {
            showToast('Ocurrió un error inesperado. Si persiste, contacta al administrador.', 'warning');
        }
    // Si hasta el propio aviso de error falla, se calla: ponerse a lanzar
    // errores desde el manejador de errores no ayuda a nadie.
    } catch (e) { }
});

// Lo mismo pero para las promesas: una llamada a la API sin catch cae acá.
// Solo se anota en la consola, sin molestar al usuario, porque muchas veces
// es una carga secundaria que igual no rompe la pantalla.
window.addEventListener('unhandledrejection', function(ev) {
    try {
        console.error('[PRONADERS] Promesa rechazada sin manejar:', ev.reason);
    } catch (e) { }
});

// Se cuelgan en window para que los onclick del HTML y los scripts de cada
// página puedan usarlas.
window.logout = logout;
window.abrirVisor = abrirVisor;
window.cerrarVisor = cerrarVisor;
window.FormUtils = FormUtils;
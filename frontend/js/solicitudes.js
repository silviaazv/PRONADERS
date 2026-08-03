/*
   solicitudes.js

   Solicitudes de recursos: el pedido de materiales, equipo o dinero para un
   proyecto, desde que se hace hasta que llega a la obra.

   El recorrido completo es este:
     1. El técnico de campo propone una necesidad (paso opcional).
     2. El supervisor de campo arma la solicitud oficial y la envía.
     3. Gerencia técnica la aprueba (y le asigna un equipo de logística) o la
        rechaza con un motivo.
     4. Logística registra el despacho con su remisión firmada.
     5. Campo confirma que recibió y la solicitud se cierra.

   Esta es la pantalla que más cambia según quién entre, porque cada rol tiene
   su propio paso en ese recorrido; por eso hay una función de dibujado
   distinta para campo, para administración y para logística.
*/

// Lo que se descarga al abrir la pantalla. Filtrar y cambiar de pestaña se
// resuelve sobre estos arreglos, sin volver a consultar el servidor.
// _solActiva guarda la solicitud sobre la que se está trabajando mientras hay
// un modal abierto, porque los botones del HTML no reciben parámetros.

let solicitudesCache = [];
let proyectosCache = [];
let equiposCache = [];
let _solActiva = null;

const ID_USUARIO = parseInt(sessionStorage.getItem('pron_id_usuario')) || null;
const NOMBRE_USUARIO = sessionStorage.getItem('pron_nombre') || 'Usuario';
const ROLE = sessionStorage.getItem('pron_role') || 'campo';

// Arranque de la pantalla: descargar todo y dibujar la vista que corresponda
// al rol.

document.addEventListener('DOMContentLoaded', async () => {
    await cargarDatosIniciales();
    renderVista();
});

async function cargarDatosIniciales() {
    try {
        const [solicitudes, proyectos, equipos] = await Promise.all([
            API.solicitudes.listar(),
            API.proyectos.listar(),
            API.equipos.listar()
        ]);

        solicitudesCache = solicitudes || [];
        proyectosCache = proyectos || [];
        equiposCache = equipos || [];

        // La lista de equipos de logística se deja lista desde ahora, aunque
        // el modal de aprobar todavía no se haya abierto: así cuando el
        // administrador lo abra ya está llena y no tiene que esperar.
        const selectEquipo = document.getElementById('aprob-logistica');
        if (selectEquipo && equiposCache.length > 0) {
            selectEquipo.innerHTML = '<option value="">— Seleccionar equipo —</option>';
            equiposCache.forEach(e => {
                const opt = document.createElement('option');
                opt.value = e.id_equipo_log;
                opt.textContent = e.nombre_equipo_log;
                selectEquipo.appendChild(opt);
            });
        }

    } catch (error) {
        console.error('Error cargando datos:', error);
        showToast('Error al cargar datos del servidor', 'warning');
    }
}

// Qué solicitudes le tocan a cada quien.
//
// Se comparan varias formas de escribir el rol ('admin', 'admin_oficina',
// 'Administrador de Oficina') porque quedaron distintas maneras de guardarlo
// según por dónde se haya iniciado sesión. Convendría unificarlas en un solo
// valor, pero mientras eso no pase hay que aceptar las tres o el
// administrador termina sin ver nada.

function solicitudesVisibles() {
    const esAdmin = (ROLE === 'admin_oficina' || ROLE === 'Administrador de Oficina' || ROLE === 'admin');
    if (esAdmin) return solicitudesCache;
    return solicitudesCache.filter(s => {
        const proyecto = proyectosCache.find(p => p.id_proyecto === s.id_proyecto);
        // Un supervisor ve las solicitudes de los proyectos que tiene a cargo,
        // no solo las que él mismo pidió: la solicitud pertenece al proyecto,
        // no a la persona.
        return proyecto && proyecto.id_supervisor === ID_USUARIO;
    });
}

// Las solicitudes que le tocan a un equipo de logística: las que le fueron
// asignadas al aprobarlas.
//
// Ojo: la comparación se hace por el nombre del equipo, no por su id. Es
// frágil, porque si a un equipo le cambian el nombre estas solicitudes dejan
// de aparecerle. Debería compararse por id_equipo_log.
function solicitudesLogistica() {
    const equipoNombre = sessionStorage.getItem('pron_nombre') || '';
    if (ROLE === 'logistica') {
        return solicitudesCache.filter(s => s.equipo_nombre === equipoNombre);
    }
    return solicitudesCache;
}

// Punto de reparto: manda a dibujar la vista que le toca al rol de quien
// entró. Cada una muestra cosas distintas porque cada rol tiene un paso
// distinto del recorrido.

function renderVista() {
    if (ROLE === 'logistica') renderVistaLogistica();
    else if (ROLE === 'campo') renderVistaCampo();
    else if (ROLE === 'admin_oficina' || ROLE === 'admin' || ROLE === 'Administrador de Oficina') renderVistaAdmin();
    else renderVistaCampo();
}

/* Vista del Supervisor de Campo: sus solicitudes y el botón para crear una
   nueva. Es el único rol que puede pedir recursos. */

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

    // De la más reciente a la más vieja: lo que se acaba de pedir es lo que
    // interesa ver primero.
    data.sort((a, b) => {
        const fechaA = new Date(a.fecha_solicitud);
        const fechaB = new Date(b.fecha_solicitud);
        return fechaB - fechaA;
    });

    const cont = document.getElementById('lista-solicitudes');
    if (!cont) return;

    cont.innerHTML = data.length
        ? data.map(s => cardSolicitud(s, 'campo')).join('')
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

/* Vista del Administrador de Oficina: ve las solicitudes de todos los
   proyectos y es quien las aprueba o las rechaza. No tiene botón para crear,
   porque él no pide recursos. */

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
            <select class="form-control" id="f-sol-estado" style="width:auto;padding:7px 32px 7px 12px;font-size:13px" onchange="renderListaSolicitudesAdmin()">
                <option value="">Todas</option>
                <option value="PENDIENTE" selected>Pendientes (${pendientes})</option>
                <option value="APROBADA">Aprobadas</option>
                <option value="RECHAZADA">Rechazadas</option>
                <option value="EN DESPACHO">En despacho</option>
                <option value="ENTREGADA">Entregadas</option>
                <option value="CONFIRMADA">Confirmadas</option>
            </select>
            <select class="form-control" id="f-sol-proyecto" style="width:auto;padding:7px 32px 7px 12px;font-size:13px" onchange="renderListaSolicitudesAdmin()">
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

/* Vista del Equipo de Logística: solo las solicitudes que le asignaron y que
   ya están aprobadas. No aprueba ni rechaza, únicamente despacha. */

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

/* Arma la tarjeta de una solicitud. Es la misma para las tres vistas; lo
   único que cambia son los botones del pie, que dependen del rol y del estado
   en que esté la solicitud. */

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

    // La tabla de recursos pedidos. Cada campo se lee de dos formas posibles
    // porque el nombre cambia según de dónde venga el dato: la API usa
    // tipo_recurso y compañía, mientras que lo que se acaba de armar en el
    // formulario todavía usa los nombres cortos.
    const itemsHtml = (s.items || []).map(it => `
        <tr>
            <td style="padding:7px 12px;font-size:12.5px">${it.tipo_recurso || it.tipo || 'N/A'}</td>
            <td style="padding:7px 12px;font-size:12.5px">${it.descripcion_recurso || it.desc || 'N/A'}</td>
            <td style="padding:7px 12px;font-size:12.5px">${it.cantidad_recurso || it.cantidad || 'N/A'}</td>
        </tr>
    `).join('');

    // Los botones del pie de la tarjeta. Cada rol solo ve los de su propio
    // paso, y únicamente cuando la solicitud está en el estado correcto: el
    // administrador aprueba o rechaza si está PENDIENTE, logística despacha si
    // ya fue APROBADA, y campo confirma la recepción si está ENTREGADA. En
    // cualquier otro caso la tarjeta se muestra sin botones.
    let acciones = '';
    const esAdmin = (vistaRol === 'admin' || vistaRol === 'admin_oficina' || ROLE === 'admin_oficina' || ROLE === 'Administrador de Oficina');

    if (esAdmin && s.estado_solicitud === 'PENDIENTE') {

    acciones = `
        <button class="btn btn-danger btn-sm"
            onclick="abrirModalRechazar(${s.id_solicitud})">
            <span class="material-symbols-rounded"
                style="font-size:14px">cancel</span>
            Rechazar
        </button>

        <button class="btn btn-success btn-sm"
            onclick="abrirModalAprobar(${s.id_solicitud})">
            <span class="material-symbols-rounded"
                style="font-size:14px">check_circle</span>
            Aprobar
        </button>
    `;

}
else if (vistaRol === 'logistica' && s.estado_solicitud === 'APROBADA') {

    acciones = `
        <button class="btn btn-info btn-sm"
            onclick="abrirModalDespacho(${s.id_solicitud})">
            <span class="material-symbols-rounded"
                style="font-size:14px">local_shipping</span>
            Registrar despacho
        </button>
    `;

}
else if (vistaRol === 'campo' && s.estado_solicitud === 'EN DESPACHO') {

    acciones = `
        <button class="btn btn-info btn-sm"
            onclick="marcarEntregada(${s.id_solicitud})">
            <span class="material-symbols-rounded"
                style="font-size:14px">inventory_2</span>
            Marcar como entregada
        </button>
    `;

}
else if (vistaRol === 'campo' && s.estado_solicitud === 'ENTREGADA') {

    acciones = `
        <button class="btn btn-success btn-sm"
            onclick="abrirModalRecepcion(${s.id_solicitud})">
            <span class="material-symbols-rounded"
                style="font-size:14px">verified</span>
            Confirmar recepción
        </button>
    `;

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

/* El formulario de nueva solicitud, con su tabla de recursos que crece a
   medida que se agregan filas. */

async function abrirModalSol() {
    try {
        FormUtils.limpiarErrores(document.getElementById('modal-sol'));

        const selectProyecto = document.getElementById('sol-proyecto');
        selectProyecto.innerHTML = '<option value="">— Selecciona el proyecto —</option>';

        const id_usuario = parseInt(sessionStorage.getItem('pron_id_usuario'));
        const proyectos = await API.proyectos.listar({ id_usuario: id_usuario });

        if (proyectos.length === 0) {
            const opt = document.createElement('option');
            opt.value = '';
            opt.textContent = '⚠ No tienes proyectos asignados';
            opt.disabled = true;
            selectProyecto.appendChild(opt);
        } else {
            proyectos.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.id_proyecto;
                opt.textContent = p.nombre_proyecto;
                selectProyecto.appendChild(opt);
            });
        }

        if (!document.querySelectorAll('#sol-items-body tr').length) {
            agregarFilaItem();
        }

        document.getElementById('modal-sol').classList.add('open');
        setTimeout(() => document.getElementById('sol-proyecto').focus(), 80);

    } catch (error) {
        console.error('Error abriendo modal solicitud:', error);
        showToast('Error al cargar los proyectos', 'warning');
    }
}

function cerrarModalSol() {
    FormUtils.limpiarErrores(document.getElementById('modal-sol'));
    document.getElementById('modal-sol').classList.remove('open');
}

async function enviarSolicitudOficial() {
    let errores = FormUtils.validar([
        { id: 'sol-proyecto', msg: 'Selecciona el proyecto de la solicitud.' },
        { id: 'sol-justificacion', msg: 'Escribe la justificación de la solicitud.' },
    ]);

    const filas = document.querySelectorAll('#sol-items-body tr');
    const items = [];

    filas.forEach(tr => {
        const tipo = tr.querySelector('.sol-item-tipo')?.value || '';
        const rec = tr.querySelector('.sol-item-recurso')?.value.trim() || '';
        const cant = tr.querySelector('.sol-item-cantidad')?.value.trim() || '';

        if (tipo && rec && cant) {
            items.push({ tipo, desc: rec, cantidad: cant });
        } else if (tipo || rec || cant) {
            if (!tipo) FormUtils.marcarInvalido(tr.querySelector('.sol-item-tipo'), 'Selecciona el tipo.');
            if (!rec) FormUtils.marcarInvalido(tr.querySelector('.sol-item-recurso'), 'Describe el recurso.');
            if (!cant) FormUtils.marcarInvalido(tr.querySelector('.sol-item-cantidad'), 'Indica la cantidad.');
            errores++;
        }
    });

    if (items.length === 0 && !errores) {
        showToast('Agrega al menos un recurso a la lista.', 'warning');
        return;
    }

    if (errores) {
        showToast(`Hay ${errores} campo(s) por completar.`, 'warning');
        return;
    }

    const id_proyecto = parseInt(document.getElementById('sol-proyecto').value);
    const justificacion = document.getElementById('sol-justificacion').value.trim();

    // Los adjuntos se leen de las etiquetas que quedaron en pantalla al
    // elegirlos.
    //
    // Pendiente: acá solo se guarda el nombre y una ruta inventada; el archivo
    // en sí no se está subiendo a ningún lado, a diferencia de lo que hace el
    // módulo de reportes. Queda por conectar la subida real.
    const fileChips = document.querySelectorAll('#sol-files .file-chip');
    const documentos = [];
    fileChips.forEach(chip => {
        const nombre = chip.dataset.filename || 'adjunto';
        documentos.push({
            nombre: nombre,
            tipo: nombre.split('.').pop() || 'pdf',
            // Ruta armada a mano; todavía no corresponde a un archivo real
            // guardado en el servidor.
            ruta: `/uploads/solicitudes/${nombre}`
        });
    });

    const datos = {
        id_proyecto: id_proyecto,
        id_usuario: ID_USUARIO,
        justificacion: justificacion,
        items: items,
        documentos: documentos
    };

    try {
        const result = await API.solicitudes.crear(datos);

        if (result.success) {
            showToast('Solicitud creada exitosamente', 'success');
            cerrarModalSol();

            // El modal está una sola vez en el HTML y conserva lo que se
            // escribió, así que hay que vaciarlo a mano o la próxima solicitud
            // aparece con los datos de la anterior.
            document.getElementById('sol-proyecto').value = '';
            document.getElementById('sol-justificacion').value = '';
            document.getElementById('sol-items-body').innerHTML = '';
            document.getElementById('sol-files').innerHTML = '';

            await cargarDatosIniciales();
            renderVista();
        }
    } catch (error) {
        showToast(error.message || 'Error al crear la solicitud', 'warning');
    }
}

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

/* Los modales de los pasos 2, 3 y 4 del recorrido: aprobar, rechazar,
   registrar el despacho y confirmar la recepción.

   Todos siguen el mismo patrón: al abrirlos guardan la solicitud en
   _solActiva, al confirmar le pegan a la API y después vuelven a descargar
   todo y redibujan, en vez de mover la solicitud de lista a mano. Sale más
   simple y la pantalla queda siempre igual a lo que quedó en la base. */

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

async function marcarEntregada(idSolicitud) {

    if (!confirm('¿Desea marcar esta solicitud como ENTREGADA?')) {
        return;
    }

    try {

        const result = await API.solicitudes.entregar(idSolicitud, {
            id_usuario: ID_USUARIO
        });

        if (result.success) {

            showToast('Solicitud marcada como entregada', 'success');

            await cargarDatosIniciales();
            renderVista();
        }

    } catch (error) {

        showToast(error.message || 'Error al actualizar la solicitud', 'warning');

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

/* Propuestas de necesidad, el paso previo para los técnicos de campo.

   El técnico no puede solicitar recursos por su cuenta, así que deja anotado
   lo que hace falta y el supervisor decide si lo convierte en una solicitud
   oficial. Así la obra puede avisar de lo que necesita sin saltarse la
   cadena de aprobación. */

function proponerNecesidad() {
    const errores = FormUtils.validar([
        { id: 'need-proyecto', msg: 'Selecciona el proyecto.' },
        { id: 'need-desc', msg: 'Describe el recurso que necesitas.' },
        { id: 'need-cantidad', msg: 'Indica la cantidad requerida.' },
        { id: 'need-monto', msg: 'Indica un monto estimado mayor a cero.', cond: v => parseFloat(v) > 0 },
    ]);

    if (errores) {
        showToast(`Faltan ${errores} campo(s) obligatorio(s) por completar.`, 'warning');
        return;
    }

    showToast('Necesidad propuesta enviada al Supervisor de Campo', 'success');
    document.getElementById('modal-necesidad').classList.remove('open');

    // Se vacían los campos para que la siguiente propuesta arranque limpia.
    document.getElementById('need-proyecto').value = '';
    document.getElementById('need-desc').value = '';
    document.getElementById('need-cantidad').value = '';
    document.getElementById('need-monto').value = '';
    document.getElementById('need-justif').value = '';
}

// Muestra los archivos que el usuario acaba de elegir, con su nombre y
// tamaño, para que vea qué va a mandar antes de confirmar.

function mostrarArchivos(containerId, files) {
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

function mostrarArchivosSol(files) {
    mostrarArchivos('sol-files', files);
}

function handleDropAprob(e) {
    e.preventDefault();
    mostrarArchivos('aprob-files', e.dataTransfer.files);
}

// Aviso emergente de la esquina. El temporizador se guarda aparte para poder
// cancelarlo: si salen dos mensajes seguidos, el segundo reinicia la cuenta y
// no se va a medio leer.

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
window.proponerNecesidad = proponerNecesidad;
window.mostrarArchivos = mostrarArchivos;
window.mostrarArchivosSol = mostrarArchivosSol;
window.handleDropAprob = handleDropAprob;
window.marcarEntregada = marcarEntregada;
window.showToast = showToast;
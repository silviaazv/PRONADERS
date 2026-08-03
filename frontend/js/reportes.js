/*
   reportes.js

   Reportes de avance de obra. Cada reporte se muestra como una tarjeta larga
   con toda la información: los porcentajes de avance, las fechas de emisión y
   de revisión, las incidencias, y al pie las fotos y documentos adjuntos.

   Se puede filtrar por estado y por proyecto, y por defecto se ordenan del
   más nuevo al más viejo, que es como se necesitan leer.

   Quién puede hacer qué:
   - Supervisor de Campo: crea reportes y consulta los suyos, pero no los
     aprueba (nadie se aprueba su propio trabajo).
   - Administrador de Oficina: revisa, aprueba y rechaza los de todos, pero no
     crea, así que no le sale el botón de "Nuevo Reporte".
   - Empleado: no tiene nada que hacer aquí y se le redirige a su tablero.

   El menú lateral, la barra superior y las utilidades vienen de shared.js.
*/

// Lo que se descarga al abrir la pantalla. Filtrar y ordenar se hace sobre
// estos arreglos, sin volver a consultar el servidor.

let reportesCache = [];
let proyectosCache = [];
let usuariosCache = [];
let _reporteRechazarId = null;

// Archivos que el usuario eligió en el modal de "Nuevo Reporte". Se guardan
// acá y no se suben todavía, porque el servidor necesita saber a qué reporte
// pertenecen: primero se crea el reporte, se recibe su id_reporte, y recién
// entonces se mandan los archivos.
// _repArchivoSeq es solo un contador para poder identificar cada archivo de la
// lista y poder quitarlo si el usuario se arrepiente.
let _repArchivos = [];
let _repArchivoSeq = 0;

// Quién está usando la pantalla. El rol se consulta muchas veces para decidir
// qué botones mostrar, así que se resuelve una sola vez acá en banderas.
const ID_USUARIO = parseInt(sessionStorage.getItem('pron_id_usuario')) || null;
const NOMBRE_USUARIO = sessionStorage.getItem('pron_nombre') || 'Usuario';
const ROLE = sessionStorage.getItem('pron_role') || 'Supervisor de Campo';
const ES_ADMIN = (ROLE === 'Administrador de Oficina');
const ES_CAMPO = (ROLE === 'Supervisor de Campo');
const ES_EMPLEADO = (ROLE === 'empleado');

// Arranque de la pantalla.

document.addEventListener('DOMContentLoaded', async () => {
    // El empleado no tiene nada que ver aquí. Se usa replace() y no href para
    // que la pantalla de reportes no le quede en el historial y no vuelva
    // a caer acá con el botón de atrás.
    // Aviso: esto solo esconde la pantalla; quien escriba la dirección desde
    // otro navegador igual llegaría, así que el permiso de verdad tiene que
    // estar en el servidor.
    if (ES_EMPLEADO) {
        window.location.replace('dashboard-campo.html');
        return;
    }

    await cargarDatosIniciales();
    renderPaginaReportes();

    // Cuando se llega desde una notificación, ahí quedó anotado a qué reporte
    // hay que ir. Se busca su tarjeta y se desplaza la página hasta ella; la
    // marca se borra de una vez para que no vuelva a saltar en la próxima
    // visita.
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

// Qué reportes le tocan a cada quien: el administrador los ve todos porque su
// trabajo es revisarlos; el supervisor de campo solamente los que él escribió.

function reportesVisibles() {
    if (ES_ADMIN) return reportesCache;
    // Campo: únicamente los que hizo él.
    return reportesCache.filter(r => r.id_usuario === ID_USUARIO);
}

/* Arma el armazón de la pantalla: el encabezado, la barra de filtros y el
   contenedor de la lista. La lista en sí la llena renderReportes(), que se
   vuelve a llamar cada vez que cambia un filtro sin tener que redibujar todo
   esto de nuevo. */

function renderPaginaReportes() {
    const container = document.getElementById('reportes-content');
    const visibles = reportesVisibles();
    const puedeCrear = ES_CAMPO;

    // La lista del filtro se arma con los proyectos que realmente aparecen en
    // los reportes visibles, no con todos los del sistema: filtrar por un
    // proyecto sin reportes solo dejaría la pantalla vacía. El Set es para
    // que cada nombre salga una sola vez.
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

/* Dibuja la lista de tarjetas aplicando los filtros que estén puestos. Es lo
   único que se redibuja al cambiar un filtro. */

function renderReportes() {
    const estado = document.getElementById('f-rep-estado')?.value ?? '0';
    const proy = document.getElementById('f-rep-proyecto')?.value || '';
    const orden = document.getElementById('f-rep-orden')?.value || 'desc';

    let data = reportesVisibles().filter(r => {
        const matchEstado = estado === '' || r.estado_reporte === parseInt(estado);
        const matchProy = !proy || r.nombre_proyecto === proy;
        return matchEstado && matchProy;
    });

    // Por defecto van del más reciente al más viejo, que es lo que se quiere
    // al entrar a revisar; el orden inverso queda disponible por si se busca
    // el histórico de un proyecto desde el principio.
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

    // El botón de limpiar solo aparece si hay algo que limpiar, o sea si algún
    // filtro está distinto de su valor por defecto.
    const hay = (estado !== '0') || proy || (orden !== 'desc');
    const btn = document.getElementById('btn-limpiar-rep');
    if (btn) btn.style.display = hay ? '' : 'none';
}

// La tabla de archivos no guarda el tipo, solo el nombre, así que hay que
// deducirlo de la extensión para saber qué ícono poner y si se puede mostrar
// una vista previa. No es infalible (alguien puede renombrar un archivo), pero
// para elegir un ícono alcanza.

function extensionArchivo(a) {
    return (a && a.nombre_archivo ? a.nombre_archivo : '').split('.').pop().toLowerCase();
}

function esImagenArchivo(a) {
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extensionArchivo(a));
}

function iconoArchivo(a) {
    if (esImagenArchivo(a)) return 'image';
    return extensionArchivo(a) === 'pdf' ? 'picture_as_pdf' : 'description';
}

// Abre el visor a pantalla completa con el adjunto. El archivo se busca en lo
// que ya está en memoria, así que no hay que volver a pedírselo al servidor.
function abrirVisorAdjunto(idReporte, idArchivo) {
    const reporte = reportesCache.find(r => r.id_reporte === idReporte);
    const archivo = (reporte && reporte.adjuntos || []).find(a => a.id_archivo === idArchivo);

    if (!archivo) {
        showToast('No se encontró el archivo adjunto', 'warning');
        return;
    }

    const extension = extensionArchivo(archivo);
    const tipo = esImagenArchivo(archivo) ? 'img' : (extension === 'pdf' ? 'pdf' : 'doc');

    abrirVisor({
        tipo,
        nombre: archivo.nombre_archivo,
        url: archivo.ruta_archivo || '',
        codigo: `REP-${String(idReporte).padStart(4, '0')}`,
        tipoCodigo: 'reporte',
        descripcion: reporte.descripcion_reporte || 'Reporte de avance'
    });
}

/* Arma la tarjeta de un reporte. Es la función más larga del archivo porque
   la tarjeta cambia bastante: los botones dependen del rol y del estado, y el
   pie con los adjuntos solo aparece si hay alguno. */

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

    // Iniciales del autor para el circulito de la tarjeta.
    const autorNombre = r.autor_nombre || 'Usuario';
    const iniciales = autorNombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    // Los botones dependen de quién mira y de cómo está el reporte. Solo el
    // administrador puede aprobar o rechazar, y solo mientras el reporte siga
    // pendiente; a los demás casos les toca un texto informativo, para que la
    // tarjeta no quede coja sin nada del lado derecho.
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

    // Los dos avances vienen del reporte. El color de la barra sigue al avance
    // físico: verde de 75% para arriba, dorado entre 40 y 75, rojo abajo de 40.
    const avanceFisico = r.avance_fisico || 0;
    const avanceFinanciero = r.avance_financiero || 0;

    const progressColor = avanceFisico >= 75 ? 'success' : avanceFisico >= 40 ? 'gold' : 'danger';

    // Los adjuntos se separan en dos grupos porque se muestran distinto: las
    // fotos con su miniatura y los documentos con un ícono y su nombre.
    const adjuntos = r.adjuntos || [];
    const fotos = adjuntos.filter(esImagenArchivo);
    const docs = adjuntos.filter(a => !esImagenArchivo(a));

    const thumb = (a) => `
        <div class="evidence-thumb" title="${a.nombre_archivo}"
             onclick="abrirVisorAdjunto(${r.id_reporte}, ${a.id_archivo})">
            <span class="material-symbols-rounded">${iconoArchivo(a)}</span>
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

            <!-- Descripción, incidencias y observaciones del reporte -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px">
                <div>
                    <div style="font-size:10.5px;font-weight:600;text-transform:uppercase;letter-spacing:.6px;color:var(--muted);margin-bottom:4px">Descripción del avance</div>
                    <p style="font-size:13px;line-height:1.65;color:var(--text);white-space:pre-line">${r.descripcion_reporte || 'Sin descripción'}</p>
                </div>
                <div>
                    <div style="font-size:10.5px;font-weight:600;text-transform:uppercase;letter-spacing:.6px;color:var(--muted);margin-bottom:4px">Observaciones técnicas</div>
                    <p style="font-size:13px;line-height:1.65;color:var(--text-light);white-space:pre-line">${r.observaciones || 'Sin observaciones'}</p>
                </div>
                <div>
                    <div style="font-size:10.5px;font-weight:600;text-transform:uppercase;letter-spacing:.6px;color:var(--muted);margin-bottom:4px">Incidencias</div>
                    <p style="font-size:13px;line-height:1.65;color:var(--text-light);white-space:pre-line">${r.incidencias || 'Sin incidencias'}</p>
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

// Deja los tres filtros como estaban al entrar y vuelve a dibujar la lista.

function limpiarFiltrosReportes() {
    document.getElementById('f-rep-estado').value = '0';
    document.getElementById('f-rep-proyecto').value = '';
    document.getElementById('f-rep-orden').value = 'desc';
    renderReportes();
}

/* Aprobar un reporte. Solo lo hace el Administrador de Oficina. Después de
   aprobarlo se recargan los datos para que la tarjeta muestre el estado y la
   fecha de revisión que quedaron guardados. */

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

/* Rechazar un reporte. El reporte no se borra: queda marcado como rechazado,
   para que el supervisor vea qué pasó y quede el antecedente. */

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
/* El formulario de nuevo reporte. Se limpia entero cada vez que se abre,
   porque el modal está una sola vez en el HTML y conserva lo que se escribió
   la vez anterior. */

async function abrirModalReporte() {
    FormUtils.limpiarErrores(document.getElementById('modal-reporte'));

    // La lista se llena solo con los proyectos de este supervisor: no tendría
    // sentido dejarlo reportar avance de una obra que no es suya.
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

    // Se borra todo lo que haya quedado del reporte anterior: los textos, los
    // archivos elegidos y el input de archivos.
    document.getElementById('rep-desc').value = '';
    document.getElementById('rep-incidencias').value = '';
    document.getElementById('rep-observaciones').value = '';
    document.getElementById('rep-files').innerHTML = '';
    _repArchivos = [];
    const inputArchivos = document.getElementById('rep-file-input');
    if (inputArchivos) inputArchivos.value = '';
    document.getElementById('val-fisico').textContent = '50%';
    document.getElementById('val-fin').textContent = '40%';

    // Las dos barras deslizantes no tienen id, así que se buscan por su clase
    // y se devuelven a su posición inicial.
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

/* Valida el formulario y guarda el reporte. Va en dos pasos: primero se crea
   el reporte y después se le suben los adjuntos, porque hasta que el reporte
   no existe no hay id al cual amarrarlos. */

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
            // Segundo paso: ahora sí, con el id_reporte en la mano, se suben
            // los archivos. Si alguno falla, el reporte igual quedó guardado;
            // por eso se cuenta cuántos se subieron y se avisa si no fueron
            // todos, en vez de dar por perdido el reporte completo.
            const id_reporte = result.reporte && result.reporte.id_reporte;
            let adjuntados = 0;
            if (id_reporte && _repArchivos.length) {
                adjuntados = await subirAdjuntosReporte(id_reporte);
            }

            const detalleAdjuntos = adjuntados
                ? ` Se adjuntó ${adjuntados} archivo${adjuntados !== 1 ? 's' : ''}.`
                : '';

            showToast(`Reporte registrado y enviado. El Administrador de Oficina fue notificado.${detalleAdjuntos}`, 'success');
            cerrarModalReporte();
            await cargarDatosIniciales();
            renderPaginaReportes();
        }
    } catch (error) {
        console.error('Error enviando reporte:', error);
        showToast(error.message || 'Error al enviar el reporte', 'warning');
    }
}

// Manejo de los adjuntos del formulario: mostrarlos, quitarlos y subirlos.

// Agrega a la lista los archivos que el usuario acaba de elegir y muestra una
// etiqueta por cada uno con su nombre y tamaño. Todavía no se sube nada; esto
// es solo para que vea qué va a mandar y pueda quitar lo que no quería.
function mostrarArchivosRep(files) {
    const c = document.getElementById('rep-files');
    if (!c || !files || !files.length) return;

    Array.from(files).forEach(f => {
        const id = ++_repArchivoSeq;
        _repArchivos.push({ id, file: f });

        const d = document.createElement('div');
        d.className = 'file-chip';
        d.dataset.filename = f.name;
        d.dataset.archivoId = id;
        d.style.cssText = 'display:flex;align-items:center;gap:8px;background:var(--cream);border:1px solid var(--cream-dark);border-radius:8px;padding:6px 10px;font-size:12px';
        d.innerHTML = `
            <span class="material-symbols-rounded" style="font-size:16px;color:var(--navy)">description</span>
            <span style="flex:1;color:var(--text)">${f.name}</span>
            <span style="color:var(--muted)">${(f.size / 1024).toFixed(0)} KB</span>
            <button type="button" onclick="quitarArchivoRep(${id})" style="background:none;border:none;cursor:pointer;color:var(--muted)">✕</button>
        `;
        c.appendChild(d);
    });

    // El input se vacía a propósito: si no, el navegador considera que el
    // archivo "no cambió" y no vuelve a avisar cuando se elige el mismo otra
    // vez, que es justo lo que pasa si alguien lo quita y se arrepiente.
    const input = document.getElementById('rep-file-input');
    if (input) input.value = '';
}

// Quita un archivo de la lista y borra su etiqueta de la pantalla.
function quitarArchivoRep(id) {
    _repArchivos = _repArchivos.filter(a => a.id !== id);
    const chip = document.querySelector(`#rep-files [data-archivo-id="${id}"]`);
    if (chip) chip.remove();
}

// Lee el archivo del disco y lo devuelve como texto base64 ("data:…;base64,…"),
// que es la forma en que la API espera recibirlo. FileReader trabaja con
// eventos, así que se envuelve en una promesa para poder usarlo con await.
function leerArchivoBase64(file) {
    return new Promise((resolve, reject) => {
        const lector = new FileReader();
        lector.onload = () => resolve(lector.result);
        lector.onerror = () => reject(new Error(`No se pudo leer ${file.name}`));
        lector.readAsDataURL(file);
    });
}

// Sube los adjuntos y los deja amarrados al reporte. Devuelve cuántos se
// guardaron bien.
//
// Van de uno en uno y cada uno con su propio try, para que un archivo dañado o
// demasiado pesado no tumbe la subida de los demás: se avisa cuál falló y se
// sigue con el siguiente.
async function subirAdjuntosReporte(id_reporte) {
    let guardados = 0;

    for (const { file } of _repArchivos) {
        try {
            const contenido_base64 = await leerArchivoBase64(file);
            await API.archivos.subir({
                id_usuario: ID_USUARIO,
                id_reporte,
                nombre_archivo: file.name,
                contenido_base64
            });
            guardados++;
        } catch (error) {
            console.error('Error subiendo adjunto:', file.name, error);
            showToast(`No se pudo adjuntar "${file.name}": ${error.message}`, 'warning');
        }
    }

    return guardados;
}

// Aviso emergente de la esquina. Si por alguna razón el elemento no está en la
// página se cae de vuelta al alert(), para no perder el mensaje.
//
// El temporizador se guarda aparte para poder cancelarlo: si salen dos avisos
// seguidos, el segundo reinicia la cuenta y no se va a medio leer.
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

// Se cuelgan en window para que los onclick escritos en el HTML las
// encuentren.

window.abrirModalReporte = abrirModalReporte;
window.cerrarModalReporte = cerrarModalReporte;
window.rechazarReporte = rechazarReporte;
window.enviarReporte = enviarReporte;
window.aprobarReporte = aprobarReporte;
window.limpiarFiltrosReportes = limpiarFiltrosReportes;
window.renderReportes = renderReportes;
window.mostrarArchivosRep = mostrarArchivosRep;
window.quitarArchivoRep = quitarArchivoRep;
window.abrirVisorAdjunto = abrirVisorAdjunto;
window.showToast = showToast;
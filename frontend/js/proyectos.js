/*
   proyectos.js

   Proyectos: crearlos, editarlos, consultarlos, finalizarlos y cancelarlos.

   La misma pantalla sirve para dos roles con permisos muy distintos. El
   Administrador de Oficina ve todos los proyectos y es el único que puede
   crear, editar, finalizar y cancelar. El Supervisor de Campo solo ve los
   proyectos que tiene asignados y únicamente los consulta.

   Un detalle importante de todo este archivo: cuando un proyecto llega a
   FINALIZADO o CANCELADO su expediente queda cerrado y ya no se puede tocar
   ni reactivar. Eso se controla en varios lugares (los botones de la tarjeta,
   el modo solo lectura del modal y la validación al guardar), así que hay que
   tenerlo presente antes de cambiar algo.

   El menú lateral, la barra superior, las notificaciones y las validaciones
   los pone shared.js.
*/

// Los datos descargados. proyectosCache es sobre lo que se filtra y se
// ordena, sin volver a consultar el servidor.
// _proyectoEnEdicion es la bandera que distingue crear de editar: si tiene un
// id, el formulario está modificando ese proyecto.
// _proyectoFinalizarId cumple lo mismo para el modal de finalizar.


let proyectosCache = [];
let usuariosCache = [];
let departamentosCache = [];
let municipiosCache = [];
let _proyectoEnEdicion = null;
let colabsSeleccionados = new Set();
let _proyectoFinalizarId = null;

// Quién está usando la pantalla. Se aceptan dos formas de escribir el rol de
// administrador porque quedaron guardadas distinto según por dónde se haya
// iniciado sesión; convendría unificarlas, pero mientras tanto hay que
// contemplar las dos o el administrador se queda sin sus botones.
const ID_USUARIO = parseInt(sessionStorage.getItem('pron_id_usuario')) || null;
const NOMBRE_USUARIO = sessionStorage.getItem('pron_nombre') || 'Usuario';
const ROLE = sessionStorage.getItem('pron_role') || 'Supervisor de Campo';
const esAdmin = (ROLE === 'admin_oficina' || ROLE === 'Administrador de Oficina');

/* Los campos del formulario de proyecto, listados en un solo lugar para poder
   bloquearlos o desbloquearlos todos juntos desde setModoSoloLectura().

   Si se agrega un campo nuevo al modal, hay que sumarlo también a esta lista;
   si no, ese campo va a quedar editable en los proyectos cerrados. */
const CAMPOS_MODAL_PROYECTO = [
    'np-nombre', 'np-tipo', 'sel-depto', 'sel-municipio',
    'np-inicio', 'np-fin', 'np-presupuesto', 'np-supervisor', 'np-desc'
];

/* Los dos estados de los que un proyecto ya no sale. Al llegar a cualquiera
   de ellos el expediente queda cerrado: se puede consultar, pero no editar, y
   no hay manera de devolverlo a ACTIVO desde la pantalla.

   El servidor aplica la misma regla en routes/proyectos.js. Lo de acá es solo
   la primera capa, para que el usuario no llegue a intentarlo; la que de
   verdad protege los datos es la del servidor. */
const ESTADOS_CERRADOS = ['CANCELADO', 'FINALIZADO'];

/* Dice si un proyecto ya está cerrado y por lo tanto es de solo lectura.

   Recibe el valor de estado_proyecto (ACTIVO, RETRASADO, FINALIZADO,
   CANCELADO) y devuelve true para los dos últimos. */
function esProyectoCerrado(estado) {
    return ESTADOS_CERRADOS.includes(estado);
}


// Arranque de la pantalla.


document.addEventListener('DOMContentLoaded', async () => {
    await cargarDatosIniciales();
    renderPaginaProyectos();

    // Cuando se llega desde el tablero o desde una notificación, ahí quedó
    // anotado qué proyecto abrir. La marca se borra de una vez para que no
    // vuelva a saltar en la próxima visita, y la pequeña espera es para que la
    // lista termine de dibujarse antes de que aparezca el modal encima.
    const autoOpen = sessionStorage.getItem('pron_open_proyecto');
    if (autoOpen) {
        sessionStorage.removeItem('pron_open_proyecto');
        setTimeout(() => abrirDetalle(parseInt(autoOpen)), 200);
    }

    // Lo mismo pero para el botón de "Nuevo Proyecto" del tablero: allá se
    // deja la marca y acá se abre el formulario al llegar.
    if (sessionStorage.getItem('pron_abrir_modal_proyecto') === '1') {
        sessionStorage.removeItem('pron_abrir_modal_proyecto');
        setTimeout(() => abrirModalNuevoProyecto(), 200);
    }

    // Los filtros quedan guardados en la sesión, así que si el usuario entra a
    // un proyecto y regresa, la lista se ve tal como la dejó en vez de
    // reiniciarse.
    const filtros = leerFiltrosGuardados();
    if (filtros.estado) {
        const sel = document.getElementById('f-estado');
        if (sel) sel.value = filtros.estado;
    }
});

async function cargarDatosIniciales() {
    try {
        const [proyectos, usuarios, departamentos] = await Promise.all([
            API.proyectos.listar(),
            API.usuarios.listar(),
            API.departamentos.listar(),
            API.municipios.listar() 
        ]);

        proyectosCache = proyectos || [];
        usuariosCache = usuarios || [];
        departamentosCache = departamentos || [];

        // Se precargan los municipios de un solo departamento y no de todos:
        // son cientos y no tiene sentido traerlos si el usuario a lo mejor ni
        // abre el formulario. El resto se pide cuando elige un departamento.
        if (departamentosCache.length > 0) {
            const municipios = await API.municipios.listar({ id_departamento: departamentosCache[0].id_departamento });
            municipiosCache = municipios || [];
        }


    } catch (error) {
        console.error('Error cargando datos:', error);
        showToast('Error al cargar datos del servidor', 'warning');
    }

}


/* Llena la lista de supervisores del formulario. Si no hay ninguno registrado
   deja una opción deshabilitada avisándolo, en lugar de una lista vacía donde
   el usuario no entendería qué pasó. */
async function cargarSupervisores() {
    try {
        const select = document.getElementById('np-supervisor');
        if (!select) {
            console.warn('Select #np-supervisor no encontrado');
            return [];
        }

        // Se piden todos los usuarios porque la API no tiene una consulta por
        // rol; el filtrado se hace acá abajo.
        let usuarios = [];
        try {
            usuarios = await API.usuarios.listar();
        } catch (error) {
            console.error('Error obteniendo usuarios:', error);
            return [];
        }

        // El rol 2 es Supervisor de Campo. El número está escrito directo
        // porque los roles son un catálogo fijo, pero si algún día se
        // reordenan hay que acordarse de este lugar.
        const supervisores = usuarios.filter(u => u.id_rol === 2);

        select.innerHTML = '<option value="">— Selecciona un supervisor —</option>';
        
        if (supervisores.length === 0) {
            // Sin supervisores registrados se deja una opción deshabilitada
            // que lo explica, para que no parezca que la lista falló.
            const opt = document.createElement('option');
            opt.value = '';
            opt.textContent = 'No hay supervisores registrados';
            opt.disabled = true;
            select.appendChild(opt);
        } else {
            supervisores.forEach(u => {
                const opt = document.createElement('option');
                opt.value = u.id_usuario;
                opt.textContent = u.nombre_usuario + ' (' + (u.nombre_rol || 'Supervisor') + ')';
                select.appendChild(opt);
            });
        }

        return supervisores;

    } catch (error) {
        console.error('Error en cargarSupervisores:', error);
        return [];
    }
}

// Llena la lista de departamentos del formulario.
async function cargarDepartamentos() {
    try {
        const selDepto = document.getElementById('sel-depto');
        if (!selDepto) {
            console.warn('Select #sel-depto no encontrado');
            return;
        }

        selDepto.innerHTML = '<option value="">— Selecciona un departamento —</option>';

        if (departamentosCache && departamentosCache.length > 0) {
            departamentosCache.forEach(d => {
                const o = document.createElement('option');
                o.value = d.id_departamento;
                o.textContent = d.nombre_departamento;
                selDepto.appendChild(o);
            });
        } else {
            
            const deptos = await API.departamentos.listar();
            departamentosCache = deptos;
            deptos.forEach(d => {
                const o = document.createElement('option');
                o.value = d.id_departamento;
                o.textContent = d.nombre_departamento;
                selDepto.appendChild(o);
            });
        }

    } catch (error) {
        console.error('Error cargando departamentos:', error);
    }
}

// Llena la lista de municipios con los del departamento elegido. Se llama
// desde el onchange del select de departamento: los municipios de Honduras
// son demasiados para traerlos todos de una vez, así que se piden recién
// cuando ya se sabe cuáles hacen falta.
//
// Ojo: esta función deja habilitado el select de municipio, así que si se la
// llama con el modal en solo lectura hay que volver a bloquearlo después.
async function cargarMunicipios() {
    const id_departamento = document.getElementById('sel-depto')?.value;
    const selMun = document.getElementById('sel-municipio');

    if (!id_departamento || !selMun) {
        selMun.innerHTML = '<option value="">— Primero selecciona departamento —</option>';
        selMun.disabled = true;
        return;
    }

    try {
        const municipios = await API.municipios.listar({ id_departamento: parseInt(id_departamento) });
        
        selMun.innerHTML = '<option value="">— Selecciona un municipio —</option>';
        municipios.forEach(m => {
            const o = document.createElement('option');
            o.value = m.id_municipio;
            o.textContent = m.nombre_municipio;
            selMun.appendChild(o);
        });
        selMun.disabled = false;
    } catch (error) {
        console.error('Error cargando municipios:', error);
        selMun.innerHTML = '<option value="">— Error al cargar municipios —</option>';
        selMun.disabled = true;
    }
}


// Qué proyectos le tocan a cada quien: el administrador los ve todos y el
// supervisor de campo solo aquellos donde figura como responsable.

function proyectosVisibles() {
    if (esAdmin) return proyectosCache;
    // Campo: únicamente los proyectos que tiene a cargo.
    return proyectosCache.filter(p => p.id_supervisor === ID_USUARIO );
}

/* Arma el armazón de la pantalla: el encabezado, la barra de filtros y el
   contenedor de las tarjetas. Las tarjetas en sí las dibuja renderProyectos(),
   que se vuelve a llamar cada vez que cambia un filtro sin tener que rehacer
   todo esto. */


function renderPaginaProyectos() {
    const container = document.getElementById('proyectos-content');
    const visibles = proyectosVisibles();
    const puedeCrear = esAdmin;
    const titulo = esAdmin ? 'Gestión de <em style="font-style:italic">Proyectos</em>' : 'Mis <em style="font-style:italic">Proyectos</em>';
    const subtitulo = esAdmin
        ? 'Haga clic en la tarjeta del proyecto para ver detalles'
        : `Proyectos en los que participas · ${visibles.length} asignado${visibles.length !== 1 ? 's' : ''}`;

    const base = esAdmin ? proyectosCache : visibles;
    const statsHtml = `
        <div class="grid-4 mb-24 fade-up fade-up-1">
            <div class="card" style="padding:16px 20px;display:flex;align-items:center;gap:14px">
                <div style="width:36px;height:36px;background:var(--info-bg);border-radius:8px;display:flex;align-items:center;justify-content:center">
                    <span class="material-symbols-rounded" style="color:var(--info);font-size:18px">folder_open</span>
                </div>
                <div>
                    <div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px">Activos</div>
                    <div style="font-family:var(--font-serif);font-size:22px;color:var(--navy)">${base.filter(p => p.estado_proyecto === 'ACTIVO').length}</div>
                </div>
            </div>
            <div class="card" style="padding:16px 20px;display:flex;align-items:center;gap:14px">
                <div style="width:36px;height:36px;background:var(--danger-bg);border-radius:8px;display:flex;align-items:center;justify-content:center">
                    <span class="material-symbols-rounded" style="color:var(--danger);font-size:18px">warning</span>
                </div>
                <div>
                    <div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px">Retrasados</div>
                    <div style="font-family:var(--font-serif);font-size:22px;color:var(--navy)">${base.filter(p => p.estado_proyecto === 'RETRASADO').length}</div>
                </div>
            </div>
            <div class="card" style="padding:16px 20px;display:flex;align-items:center;gap:14px">
                <div style="width:36px;height:36px;background:var(--success-bg);border-radius:8px;display:flex;align-items:center;justify-content:center">
                    <span class="material-symbols-rounded" style="color:var(--success);font-size:18px">check_circle</span>
                </div>
                <div>
                    <div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px">Finalizados</div>
                    <div style="font-family:var(--font-serif);font-size:22px;color:var(--navy)">${base.filter(p => p.estado_proyecto === 'FINALIZADO').length}</div>
                </div>
            </div>
            <div class="card" style="padding:16px 20px;display:flex;align-items:center;gap:14px">
                <div style="width:36px;height:36px;background:rgba(201,168,76,0.15);border-radius:8px;display:flex;align-items:center;justify-content:center">
                    <span class="material-symbols-rounded" style="color:var(--gold-dim);font-size:18px">inventory</span>
                </div>
                <div>
                    <div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px">Cancelados</div>
                    <div style="font-family:var(--font-serif);font-size:22px;color:var(--navy)">${base.filter(p => p.estado_proyecto === 'CANCELADO').length}</div>
                </div>
            </div>
        </div>
    `;

    // Las listas de tipo y de departamento se arman con los valores que
    // realmente aparecen en los proyectos visibles, no con los catálogos
    // completos: ofrecer un filtro que no va a devolver nada solo confunde.
    const tipos = [...new Set(visibles.map(p => p.tipo_proyecto).filter(Boolean))];
    const deptos = [...new Set(visibles.map(p => p.nombre_departamento).filter(Boolean))];

    const filtrosHtml = `
        <div class="filtros-row" style="display:flex;gap:10px;align-items:center;justify-content:flex-end;flex-wrap:wrap;padding:0 0 18px;border-bottom:1px solid var(--cream-dark);margin-bottom:20px">
            <button class="btn btn-outline btn-sm" id="btn-limpiar-filtros" onclick="limpiarFiltros()" style="white-space:nowrap;display:none">
                <span class="material-symbols-rounded" style="font-size:13px">clear</span> Limpiar filtros
            </button>
            <div class="search-wrap" style="width:210px;flex:0 0 auto">
                <span class="material-symbols-rounded">search</span>
                <input type="text" class="search-input form-control" id="f-buscar" style="padding-left:36px"
                       placeholder="Buscar proyecto..." oninput="aplicarFiltros()">
            </div>
            <select class="form-control" id="f-tipo" style="width:auto;padding:7px 32px 7px 12px;font-size:13px" onchange="aplicarFiltros()">
                <option value="">Todos los tipos</option>
                ${tipos.map(t => `<option value="${t}">${t}</option>`).join('')}
            </select>
            <select class="form-control" id="f-estado" style="width:auto;padding:7px 32px 7px 12px;font-size:13px" onchange="aplicarFiltros()">
                <option value="">Todos los estados</option>
                <option value="ACTIVO">Activo</option>
                <option value="RETRASADO">Retrasado</option>
                <option value="FINALIZADO">Finalizado</option>
                <option value="CANCELADO">Cancelado</option>
            </select>
            <select class="form-control" id="f-depto" style="width:auto;padding:7px 32px 7px 12px;font-size:13px" onchange="aplicarFiltros()">
                <option value="">Todos los departamentos</option>
                <!-- Pendiente de revisar: el filtro por departamento no está
                     funcionando. Las opciones se arman con nombre_departamento
                     pero aplicarFiltros() no está comparando contra el mismo
                     campo. -->
                ${deptos.map(d => `<option value="${d}">${d}</option>`).join('')}
            </select>
        </div>
    `;

    container.innerHTML = `
        <div class="flex-between mb-24 fade-up sticky-head">
            <div class="section-head" style="margin-bottom:0">
                <h2>${titulo}</h2>
                <p style="font-size:13px;color:var(--muted);margin-top:4px">${subtitulo}</p>
            </div>
            ${puedeCrear ? `<button class="btn btn-gold" onclick="abrirModalNuevoProyecto()">
                <span class="material-symbols-rounded">add</span> Nuevo Proyecto
            </button>` : ''}
        </div>
        ${statsHtml}
        <div class="card fade-up fade-up-2">
            <div class="card-header" style="margin-bottom:14px">
                <div>
                    <div class="card-title">${esAdmin ? "Directorio de Proyectos" : "Mis Proyectos"}</div>
                    <div class="card-subtitle" id="proy-contador"></div>
                </div>
            </div>
            ${filtrosHtml}
            <div class="grid-3" id="galeria-proyectos"></div>
        </div>
    `;

    // Se vuelven a poner los filtros que el usuario tenía antes de salir de la
    // pantalla, para que la lista se vea igual a como la dejó.
    const filtros = leerFiltrosGuardados();
    document.getElementById('f-buscar').value = filtros.q || '';
    document.getElementById('f-tipo').value = filtros.tipo || '';
    document.getElementById('f-estado').value = filtros.estado || '';
    document.getElementById('f-depto').value = filtros.depto || '';

    renderGaleria();
}

function renderGaleria() {
    const filtros = leerFiltrosGuardados();
    const data = filtrarProyectos(proyectosVisibles(), filtros);

    const cont = document.getElementById('galeria-proyectos');
    if (!cont) return;

    cont.innerHTML = data.length
        ? data.map(p => tarjetaProyecto(p)).join('')
        : `<div style="grid-column:1/-1;text-align:center;padding:44px;color:var(--muted)">
            <span class="material-symbols-rounded" style="font-size:38px;display:block;margin-bottom:10px;color:var(--cream-dark)">search_off</span>
            No se encontraron proyectos con los filtros aplicados.
        </div>`;

    const total = proyectosVisibles().length;
    const cc = document.getElementById('proy-contador');
    if (cc) {
        cc.textContent = esAdmin
            ? `${data.length} de ${total} proyectos registrados`
            : `${data.length} de ${total} proyectos en los que participas`;
    }

    const btn = document.getElementById('btn-limpiar-filtros');
    if (btn) btn.style.display = hayFiltrosActivos(filtros) ? '' : 'none';
}

/* Los filtros de la lista. Se guardan en sessionStorage para que sobrevivan a
   ir y volver de otra pantalla, y se pierden al cerrar el navegador.

   La lectura va dentro de un try porque si lo guardado quedó corrupto,
   JSON.parse revienta y dejaría la pantalla en blanco; ante la duda se
   arranca sin filtros. */

function leerFiltrosGuardados() {
    try { return JSON.parse(sessionStorage.getItem('pron_filtros_proyectos')) || {}; } catch (e) { return {}; }
}

function guardarFiltros(f) {
    sessionStorage.setItem('pron_filtros_proyectos', JSON.stringify(f));
}

function hayFiltrosActivos(f) {
    return !!((f.q || '').trim() || f.tipo || f.estado || f.depto);
}

function aplicarFiltros() {
    const f = leerFiltrosGuardados();
    f.q = document.getElementById('f-buscar')?.value || '';
    f.tipo = document.getElementById('f-tipo')?.value || '';
    f.estado = document.getElementById('f-estado')?.value || '';
    f.depto = document.getElementById('f-depto')?.value || '';
    guardarFiltros(f);
    renderGaleria();
}

function limpiarFiltros() {
    sessionStorage.removeItem('pron_filtros_proyectos');
    ['f-buscar', 'f-tipo', 'f-estado', 'f-depto'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    renderGaleria();
}

function filtrarProyectos(lista, f) {
    if (!f) return lista;
    const q = (f.q || '').toLowerCase().trim();
    return lista.filter(p => {
        const matchQ = !q || [p.nombre_proyecto, p.nombre_municipio, p.nombre_departamento].join(' ').toLowerCase().includes(q);
        const matchTipo = !f.tipo || p.tipo_proyecto === f.tipo;
        const matchEstado = !f.estado || p.estado_proyecto === f.estado;
        const matchDepto = !f.depto || p.nombre_departamento === f.depto;
        return matchQ && matchTipo && matchEstado && matchDepto;
    });
}

/* Arma la tarjeta de un proyecto: nombre, ubicación, avance, presupuesto y,
   si quien mira es el administrador, los botones de acción. */

function tarjetaProyecto(p) {

    console.log('Proyecto detalle:', p);
    console.log('Supervisor:', p.supervisor_nombre);
    console.log('Ubicación:', p.nombre_municipio, p.nombre_departamento);

    const avance = p.presupuesto_ejecutado && p.presupuesto_inicial
        ? Math.min(Math.round((p.presupuesto_ejecutado / p.presupuesto_inicial) * 100), 100)
        : 0;

    const progressColor = avance >= 75 ? 'success' : avance >= 40 ? 'gold' : 'danger';

    const estadoBadge = {
        'ACTIVO': 'badge-success',
        'RETRASADO': 'badge-danger',
        'FINALIZADO': 'badge-success',
        'CANCELADO': 'badge-muted'
    }[p.estado_proyecto] || 'badge-info';

    const estadoLabel = p.estado_proyecto || 'Sin estado';
    const fechaInicio = p.fecha_inicio ? new Date(p.fecha_inicio).toLocaleDateString('es-HN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';
    const fechaFin = p.fecha_fin ? new Date(p.fecha_fin).toLocaleDateString('es-HN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';

    const supervisorNombre = p.supervisor_nombre || 'Sin supervisor';

    const ubicacion = p.nombre_municipio || p.municipio || 'Sin ubicación';
    const departamento = p.nombre_departamento || p.departamento || '';
    const ubicacionCompleta = departamento ? `${ubicacion}, ${departamento}` : ubicacion;

    /* Botones de acción, solo para el administrador. Finalizar y Cancelar
       aparecen únicamente en los proyectos abiertos: los que ya están
       cerrados no tienen a dónde ir, así que en su lugar se muestra solamente
       su estado. */
    let accionesAdmin = '';
    if (esAdmin) {
        if (p.estado_proyecto === 'ACTIVO' || p.estado_proyecto === 'RETRASADO') {
            accionesAdmin = `
                <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">
                    <button class="btn btn-success btn-sm" onclick="abrirModalFinalizar(${p.id_proyecto})" title="Finalizar proyecto">
                        <span class="material-symbols-rounded" style="font-size:14px">check_circle</span> Finalizar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="cancelarProyecto(${p.id_proyecto})" title="Cancelar proyecto">
                        <span class="material-symbols-rounded" style="font-size:14px">block</span> Cancelar
                    </button>
                </div>
            `;
        } else if (p.estado_proyecto === 'FINALIZADO') {
            accionesAdmin = `
                <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">
                    <span class="badge badge-success" style="font-size:11px">
                        <span class="material-symbols-rounded" style="font-size:12px">check_circle</span> Finalizado
                    </span>
                </div>
            `;
        } else if (p.estado_proyecto === 'CANCELADO') {
            accionesAdmin = `
                <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">
                    <span class="badge badge-danger" style="font-size:11px">
                        <span class="material-symbols-rounded" style="font-size:12px">block</span> Cancelado
                    </span>
                </div>
            `;
        }
    }

    return `
        <div class="project-card" role="button" tabindex="0" style="cursor:pointer"
             onclick="abrirDetalle(${p.id_proyecto})"
             onkeydown="if(event.key==='Enter'){abrirDetalle(${p.id_proyecto})}">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:4px">
                <div class="project-type" style="color:var(--info)">${p.tipo_proyecto || 'Sin tipo'}</div>
                <span class="badge ${estadoBadge}" style="font-size:10.5px">${estadoLabel}</span>
            </div>
            <div class="fw-600" style="font-size:15px;margin-bottom:3px;color:var(--navy)">${p.nombre_proyecto || 'Sin nombre'}</div>
            <div style="font-size:11.5px;color:var(--muted);margin-bottom:14px;display:flex;align-items:center;gap:4px">
                <span class="material-symbols-rounded" style="font-size:13px">location_on</span>
                ${ubicacionCompleta}
            </div>
            <div class="flex-between" style="font-size:12px;margin-bottom:6px">
                <span style="color:var(--muted)">Avance físico</span>
                <span class="fw-600">${avance}%</span>
            </div>
            <div class="progress-bar mb-14">
                <div class="progress-fill ${progressColor}" style="width:${avance}%"></div>
            </div>
            <div class="flex-between" style="margin-bottom:12px">
    <div style="display:flex;align-items:center;gap:8px">
        <div class="avatar" style="width:24px;height:24px;font-size:9px;background:var(--gold);color:var(--white);border:2px solid var(--white)">
            ${p.supervisor_nombre 
                ? p.supervisor_nombre.split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2)
                : '??'}
        </div>
        <span style="font-size:12px;color:var(--text-light)">Supervisor:</span>
        <span style="font-size:12px;font-weight:500;color:var(--navy)">
            ${p.supervisor_nombre || 'Sin supervisor asignado'}
        </span>
    </div>
                <div style="font-size:11px;color:var(--muted)">L ${(p.presupuesto_inicial || 0).toLocaleString('es-HN')}</div>
            </div>
            <hr class="divider">
            <div class="flex-between">
                <div style="font-size:11px;color:var(--muted);display:flex;align-items:center;gap:3px">
                    <span class="material-symbols-rounded" style="font-size:12px">calendar_today</span>
                    ${fechaInicio} — ${fechaFin}
                </div>
            </div>
        </div>
    `;
}

/* Ficha completa del proyecto, en modo lectura.

   Los datos se piden de nuevo a la API en vez de sacarlos del caché, porque
   este modal muestra información que la tarjeta no trae y además así se ve el
   estado actualizado si alguien más lo modificó mientras tanto. */

async function abrirDetalle(id) {
    try {
        const p = await API.proyectos.obtener(id);
        if (!p) {
            showToast('Proyecto no encontrado', 'warning');
            return;
        }

        const avance = p.presupuesto_ejecutado && p.presupuesto_inicial
            ? Math.min(Math.round((p.presupuesto_ejecutado / p.presupuesto_inicial) * 100), 100)
            : 0;

        const progressColor = avance >= 75 ? 'success' : avance >= 40 ? 'gold' : 'danger';

        const estadoBadge = {
            'ACTIVO': 'badge-success',
            'RETRASADO': 'badge-danger',
            'FINALIZADO': 'badge-success',
            'CANCELADO': 'badge-muted'
        }[p.estado_proyecto] || 'badge-info';

        const estadoLabel = p.estado_proyecto || 'Sin estado';
        const fechaInicio = p.fecha_inicio ? new Date(p.fecha_inicio).toLocaleDateString('es-HN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';
        const fechaFin = p.fecha_fin ? new Date(p.fecha_fin).toLocaleDateString('es-HN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';

        const supervisorNombre = p.supervisor_nombre || 'Sin supervisor';

        const ubicacion = p.nombre_municipio || p.municipio || 'Sin ubicación';
        const departamento = p.nombre_departamento || p.departamento || '';
        const ubicacionCompleta = departamento ? `${ubicacion}, ${departamento}` : ubicacion;

        document.getElementById('detalle-tipo').textContent = p.tipo_proyecto || 'Sin tipo';
        document.getElementById('detalle-tipo').style.color = 'var(--info)';
        document.getElementById('detalle-nombre').textContent = p.nombre_proyecto || 'Sin nombre';
        document.getElementById('detalle-ubicacion').innerHTML =
            `<span class="material-symbols-rounded" style="font-size:14px">location_on</span>${ubicacionCompleta}`;

        const badge = document.getElementById('detalle-badge');
        badge.className = `badge ${estadoBadge}`;
        badge.textContent = estadoLabel;

        // Bloque del supervisor asignado. Si el proyecto no tiene ninguno, el
        // bloque simplemente no se muestra.
        const supervisorHtml = p.supervisor_nombre ? `
            <div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--cream);border-radius:var(--radius)">
                <div style="width:32px;height:32px;border-radius:50%;background:var(--gold);color:var(--white);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;flex-shrink:0">
                    ${p.supervisor_nombre.split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div style="flex:1">
                    <div style="font-size:13px;font-weight:500;color:var(--navy)">${p.supervisor_nombre}</div>
                    <div style="font-size:11.5px;color:var(--muted)">Supervisor de Campo</div>
                </div>
            </div>
        ` : '<div class="text-muted text-sm">Sin supervisor asignado</div>';

        document.getElementById('detalle-body').innerHTML = `
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px">
                <div style="background:var(--cream);border-radius:var(--radius);padding:14px 16px;text-align:center">
                    <div style="font-family:var(--font-serif);font-size:26px;font-weight:300;color:var(--navy)">${avance}%</div>
                    <div style="font-size:10.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px">Avance físico</div>
                    <div style="height:4px;background:var(--cream-dark);border-radius:4px;margin-top:8px">
                        <div style="height:4px;border-radius:4px;width:${avance}%;background:${avance >= 75 ? 'var(--success)' : avance >= 40 ? 'var(--gold)' : 'var(--danger)'}"></div>
                    </div>
                </div>
                <div style="background:var(--cream);border-radius:var(--radius);padding:14px 16px;text-align:center">
                    <div style="font-family:var(--font-serif);font-size:22px;font-weight:300;color:var(--navy)">L ${(p.presupuesto_inicial || 0).toLocaleString('es-HN')}</div>
                    <div style="font-size:10.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px">Presupuesto inicial</div>
                </div>
                <div style="background:var(--cream);border-radius:var(--radius);padding:14px 16px;text-align:center">
                    <div style="font-family:var(--font-serif);font-size:22px;font-weight:300;color:var(--navy)">L ${(p.presupuesto_ejecutado || 0).toLocaleString('es-HN')}</div>
                    <div style="font-size:10.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px">Presupuesto ejecutado</div>
                </div>
                <div style="background:var(--cream);border-radius:var(--radius);padding:14px 16px;text-align:center">
                    <div style="font-family:var(--font-serif);font-size:22px;font-weight:300;color:var(--navy)">${p.id_supervisor ? 1 : 0}</div>
                    <div style="font-size:10.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px">Supervisor asignado</div>
                </div>
                </div>
            </div>

            <div style="margin-bottom:22px">
                <div style="font-size:11.5px;font-weight:600;text-transform:uppercase;letter-spacing:.7px;color:var(--muted);margin-bottom:8px">Descripción del proyecto</div>
                <p style="font-size:13.5px;color:var(--text);line-height:1.75">${p.descripcion_proyecto || 'Sin descripción'}</p>
            </div>

            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:22px">
                <div style="background:var(--cream);border-radius:var(--radius);padding:12px 16px;display:flex;align-items:center;gap:10px">
                    <span class="material-symbols-rounded" style="color:var(--info);font-size:20px">event</span>
                    <div>
                        <div style="font-size:10.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px">Fecha de inicio</div>
                        <div style="font-size:13.5px;font-weight:500">${fechaInicio}</div>
                    </div>
                </div>
                <div style="background:var(--cream);border-radius:var(--radius);padding:12px 16px;display:flex;align-items:center;gap:10px">
                    <span class="material-symbols-rounded" style="color:var(--warning);font-size:20px">event_busy</span>
                    <div>
                        <div style="font-size:10.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px">Fecha estimada fin</div>
                        <div style="font-size:13.5px;font-weight:500">${fechaFin}</div>
                    </div>
                </div>
            </div>

            <div style="margin-bottom:22px">
                <div style="font-size:11.5px;font-weight:600;text-transform:uppercase;letter-spacing:.7px;color:var(--muted);margin-bottom:10px">Supervisor de Campo</div>
                <div style="display:flex;flex-direction:column;gap:8px">
                    ${supervisorHtml}
                </div>
            </div>

            <!-- Acciones del administrador. En un proyecto cerrado el botón
                 pasa a ser "Ver datos" y desaparecen Finalizar y Cancelar,
                 porque su estado ya es definitivo. -->
            ${esAdmin ? `
            <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:24px;padding-top:16px;border-top:1px solid var(--cream-dark)">
                <button class="btn btn-outline btn-sm" onclick="abrirEditarProyecto(${p.id_proyecto})">
                <span class="material-symbols-rounded" style="font-size:14px">${esProyectoCerrado(p.estado_proyecto) ? 'visibility' : 'edit'}</span> ${esProyectoCerrado(p.estado_proyecto) ? 'Ver datos' : 'Editar'}
                </button>
                ${!esProyectoCerrado(p.estado_proyecto) ? `
                <button class="btn btn-success btn-sm" onclick="abrirModalFinalizar(${p.id_proyecto})">
                <span class="material-symbols-rounded" style="font-size:14px">check_circle</span> Finalizar
                </button>
                <button class="btn btn-danger btn-sm" onclick="cancelarProyecto(${p.id_proyecto})">
                <span class="material-symbols-rounded" style="font-size:14px">block</span> Cancelar
                </button>` : ''}
            </div>` : ''}
        `;

        document.getElementById('modal-detalle').classList.add('open');

    } catch (error) {
        console.error('Error cargando detalle:', error);
        showToast('Error al cargar los detalles del proyecto', 'warning');
    }
}

/* Pone el modal en modo consulta o lo devuelve a editable.

   El mismo modal sirve para crear, para editar y para consultar un proyecto
   cerrado, y como está una sola vez en el HTML conserva el estado en que quedó
   la última vez. Por eso toda apertura del modal tiene que llamar a esta
   función, incluso para dejarlo editable: si no, un proyecto cerrado que se
   consultó antes deja el formulario bloqueado para el siguiente que se abra.

   Con activo en true bloquea los campos, esconde el botón de guardar y muestra
   el aviso de arriba; con false revierte las tres cosas.

   El segundo parámetro es el estado del proyecto y solo se usa cuando activo
   es true: define el texto y el color del aviso, verde si está FINALIZADO y
   rojo si está CANCELADO. */
function setModoSoloLectura(activo, estado) {
    // 1) Los campos, todos de una vez a partir de la lista de arriba.
    CAMPOS_MODAL_PROYECTO.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = activo;
    });

    // 2) El botón de guardar. Bloquear los campos no basta: sin esconder el
    //    botón, el formulario todavía se podría enviar.
    const btnGuardar = document.getElementById('btn-guardar-proyecto');
    if (btnGuardar) btnGuardar.style.display = activo ? 'none' : '';

    // 3) El aviso de arriba, que le explica al usuario por qué está todo
    //    bloqueado. Sin esto parecería que la pantalla se dañó.
    const aviso = document.getElementById('np-aviso-cerrado');
    if (!aviso) return;

    aviso.style.display = activo ? 'flex' : 'none';
    if (!activo) return;

    const finalizado = estado === 'FINALIZADO';
    aviso.style.background = finalizado ? 'var(--success-bg)' : 'var(--danger-bg)';
    aviso.style.color = finalizado ? 'var(--success)' : 'var(--danger)';
    document.getElementById('np-aviso-icono').textContent = finalizado ? 'check_circle' : 'block';
    document.getElementById('np-aviso-texto').textContent = finalizado
        ? 'Este proyecto está FINALIZADO. Sus datos son de solo lectura y ya no puede modificarse.'
        : 'Este proyecto está CANCELADO. Sus datos son de solo lectura y no puede reactivarse.';
}

/* Abre el formulario para crear un proyecto nuevo. */
async function abrirModalNuevoProyecto() {

    try {

        console.log('Cargando datos para nuevo proyecto...');

    _proyectoEnEdicion = null;
    // El modal es el mismo de siempre y conserva cómo quedó la última vez, así
    // que si antes se consultó un proyecto cerrado hay que devolverlo a modo
    // editable o el formulario nuevo aparecería bloqueado.
    setModoSoloLectura(false);
    document.querySelector('#modal-nuevo .modal-title').innerHTML = 'Nuevo <em style="font-style:italic">Proyecto</em>';
    FormUtils.limpiarErrores(document.getElementById('modal-nuevo'));

        // Se comprueba que estén todos los campos antes de intentar llenarlos:
        // si falta alguno conviene avisarlo claro en la consola, en lugar de
        // fallar más adelante con un error de null.
        const elementos = [
            'sel-depto', 'sel-municipio', 'np-nombre', 'np-tipo',
            'np-inicio', 'np-fin', 'np-presupuesto', 'np-desc',
            'np-supervisor'
        ];

        for (const id of elementos) {
            if (!document.getElementById(id)) {
                console.warn('[Frontend] Elemento no encontrado:', id);
            }
        }

            // La lista de supervisores se pide cada vez que se abre el modal,
            // no una sola vez al inicio, por si dieron de alta a alguien nuevo
            // mientras esta pestaña estaba abierta.
        try {
            await cargarSupervisores();
            console.log('[Frontend] Supervisores cargados');
        } catch (error) {
            console.error('[Frontend] Error cargando supervisores:', error);
        }


    await cargarDepartamentos();

    await cargarMunicipios(); 

    document.getElementById('sel-municipio').innerHTML = '<option value="">— Primero selecciona departamento —</option>';
    document.getElementById('sel-municipio').disabled = true;

    // Se borra lo que haya quedado del proyecto anterior y la fecha de inicio
    // se limita de hoy en adelante, porque un proyecto nuevo no puede empezar
    // en el pasado.
    ['np-nombre', 'np-inicio', 'np-fin', 'np-presupuesto', 'np-desc'].forEach(id => {
        document.getElementById(id).value = '';
    });

    const hoy = new Date().toISOString().slice(0, 10);
    document.getElementById('np-inicio').min = hoy;

    document.getElementById('modal-nuevo').classList.add('open');
    setTimeout(() => document.getElementById('np-nombre').focus(), 80);

    // Ya con todo cargado se muestra el modal y el cursor va al primer campo.
    // La espera corta es para que el foco se aplique cuando la animación de
    // apertura ya arrancó; si se hace antes, el navegador la ignora.
        const modal = document.getElementById('modal-nuevo');
        if (modal) {
            modal.classList.add('open');
            console.log('[Frontend] Modal abierto');
            setTimeout(() => {
                const nombre = document.getElementById('np-nombre');
                if (nombre) nombre.focus();
            }, 80);
        } else {
            console.error('[Frontend] Modal #modal-nuevo no encontrado');
        }

    } catch (error) {
        console.error('[Frontend] Error en abrirModalNuevoProyecto:', error);
        showToast('Error al abrir el formulario: ' + error.message, 'warning');
    }
}

function cerrarModalNuevo() {
    FormUtils.limpiarErrores(document.getElementById('modal-nuevo'));
    document.getElementById('modal-nuevo').classList.remove('open');
}

/* Abre el modal con los datos de un proyecto ya existente.

   Si el proyecto está CANCELADO o FINALIZADO se abre igual, pero en modo
   consulta: los campos se llenan como siempre y después quedan bloqueados y
   sin botón de guardar.

   El estado se lee de la API y no del caché a propósito. El caché puede tener
   varios minutos y, si alguien más finalizó el proyecto mientras tanto, se
   estaría abriendo editable algo que ya no se debe tocar.

   Recibe el id del proyecto.
 */
async function abrirEditarProyecto(id) {
    try {
        const p = await API.proyectos.obtener(id);
        if (!p) {
            showToast('Proyecto no encontrado', 'warning');
            return;
        }

        const cerrado = esProyectoCerrado(p.estado_proyecto);

        _proyectoEnEdicion = id;
        FormUtils.limpiarErrores(document.getElementById('modal-nuevo'));
        // Se arranca siempre con el modal editable y el bloqueo se deja para el
        // final. El orden importa: cargarMunicipios() vuelve a habilitar el
        // select de municipio, así que si se bloqueara antes ese campo
        // quedaría editable en un proyecto cerrado.
        setModoSoloLectura(false);
        document.querySelector('#modal-nuevo .modal-title').innerHTML = cerrado
            ? `Proyecto <em style="font-style:italic">${p.estado_proyecto === 'FINALIZADO' ? 'Finalizado' : 'Cancelado'}</em> <span style="font-size:12px;color:var(--muted)">· ID: ${id} · solo lectura</span>`
            : `Editar <em style="font-style:italic">Proyecto</em> <span style="font-size:12px;color:var(--muted)">· ID: ${id}</span>`;

        // Las listas se llenan antes de asignarles el valor guardado: un select
        // no acepta un valor cuya opción todavía no existe.
        await cargarSupervisores();

        // Cargar departamentos
        const selDepto = document.getElementById('sel-depto');
        selDepto.innerHTML = '<option value="">— Selecciona un departamento —</option>';
        departamentosCache.forEach(d => {
            const o = document.createElement('option');
            o.value = d.id_departamento;
            o.textContent = d.nombre_departamento;
            if (d.nombre_departamento === p.nombre_departamento) o.selected = true;
            selDepto.appendChild(o);
        });

        await cargarMunicipios();

        // Cargar municipios
        const selMun = document.getElementById('sel-municipio');
        if (p.id_ubicacion) {
            const mun = await API.municipios.listar({ id_municipio: p.id_ubicacion });
            if (mun && mun.length > 0) {
                selMun.value = p.id_ubicacion;
            }
        }

        document.getElementById('np-nombre').value = p.nombre_proyecto || '';
        document.getElementById('np-tipo').value = p.tipo_proyecto || 'INFRAESTRUCTURA';
        document.getElementById('np-inicio').value = p.fecha_inicio ? p.fecha_inicio.slice(0, 10) : '';
        document.getElementById('np-fin').value = p.fecha_fin ? p.fecha_fin.slice(0, 10) : '';
        document.getElementById('np-presupuesto').value = p.presupuesto_inicial || '';
        document.getElementById('np-desc').value = p.descripcion_proyecto || '';
        if (p.id_supervisor) {
            document.getElementById('np-supervisor').value = p.id_supervisor; }

        // Recién ahora, con todos los campos llenos, se decide si el modal
        // queda editable o en solo lectura según el estado del proyecto.
        setModoSoloLectura(cerrado, p.estado_proyecto);

        document.getElementById('modal-detalle').classList.remove('open');
        document.getElementById('modal-nuevo').classList.add('open');

    } catch (error) {
        console.error('Error cargando proyecto para editar:', error);
        showToast('Error al cargar los datos del proyecto', 'warning');
    }
}

/* Valida el formulario y guarda: crea el proyecto o actualiza el existente,
   según si _proyectoEnEdicion tiene un id o está en null. */
async function guardarProyecto() {
    /* Un proyecto cerrado no se guarda, aunque de alguna forma se llegue hasta
       acá. El modal ya viene bloqueado, así que en el uso normal esto nunca se
       cumple; queda por si alguien llama a la función desde la consola o si un
       cambio futuro rompe el bloqueo del formulario. */
    if (_proyectoEnEdicion) {
        const actual = proyectosCache.find(p => p.id_proyecto === _proyectoEnEdicion);
        if (actual && esProyectoCerrado(actual.estado_proyecto)) {
            showToast(`El proyecto está ${actual.estado_proyecto.toLowerCase()} y no se puede modificar`, 'warning');
            return;
        }
    }

    let errores = FormUtils.validar([
        { id: 'np-nombre', msg: 'El nombre del proyecto es obligatorio.' },
        { id: 'np-tipo', msg: 'Selecciona el tipo de proyecto.' },
        { id: 'sel-depto', msg: 'Selecciona el departamento.' },
        { id: 'sel-municipio', msg: 'Selecciona el municipio.' },
        { id: 'np-inicio', msg: 'La fecha de inicio es obligatoria.' },
        { id: 'np-fin', msg: 'La fecha estimada de fin es obligatoria.' },
        { id: 'np-presupuesto', msg: 'Indica un presupuesto mayor a cero.', cond: v => parseFloat(v) > 0 },
    ]);

    const ini = document.getElementById('np-inicio').value;
    const fin = document.getElementById('np-fin').value;
    const supervisor = document.getElementById('np-supervisor').value;
    
    const usuarioActual = parseInt(sessionStorage.getItem('pron_id_usuario')) || 1;


    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (!_proyectoEnEdicion && ini && new Date(ini + 'T00:00:00') < hoy) {
        FormUtils.marcarInvalido(document.getElementById('np-inicio'), 'La fecha de inicio debe ser de hoy en adelante.');
        errores++;
    }

    if (ini && fin && new Date(fin + 'T00:00:00') < new Date(ini + 'T00:00:00')) {
        FormUtils.marcarInvalido(document.getElementById('np-fin'), 'La fecha final no puede ser anterior a la fecha de inicio.');
        errores++;
    }

    if (errores) {
        showToast(`Hay ${errores} campo(s) obligatorio(s) con error.`, 'warning');
        return;
    }

    const datos = {
        tipo_proyecto: document.getElementById('np-tipo').value,
        nombre_proyecto: document.getElementById('np-nombre').value.trim(),
        descripcion_proyecto: document.getElementById('np-desc').value.trim(),
        id_ubicacion: parseInt(document.getElementById('sel-municipio').value),
        fecha_inicio: ini,
        fecha_fin: fin || null,
        presupuesto_inicial: parseFloat(document.getElementById('np-presupuesto').value),
        id_usuario: usuarioActual,
        id_supervisor: supervisor ? parseInt(supervisor) : null,
    };

    /* El estado solo se manda al crear, nunca al editar.

       No es un olvido: antes se enviaba siempre en 'ACTIVO' y eso revivía los
       proyectos cancelados o finalizados con solo guardarles un cambio
       cualquiera. Omitiéndolo, el servidor conserva el estado que el proyecto
       ya tenía. */
    if (!_proyectoEnEdicion) {
        datos.estado_proyecto = 'ACTIVO';
    }

    try {
        let result;
        if (_proyectoEnEdicion) {
            result = await API.proyectos.actualizar(_proyectoEnEdicion, datos);
            if (result.success) {
                showToast(`Proyecto "${datos.nombre_proyecto}" actualizado correctamente`, 'success');
            }
        } else {
            result = await API.proyectos.crear(datos);
            if (result.success) {
                showToast(`Proyecto "${datos.nombre_proyecto}" registrado correctamente`, 'success');
            }
        }

        cerrarModalNuevo();
        await cargarDatosIniciales();
        renderPaginaProyectos();

    } catch (error) {
        console.error('Error guardando proyecto:', error);
        showToast(error.message || 'Error al guardar el proyecto', 'warning');
    }
}

/* Abre el modal para cerrar un proyecto. Se pide aparte el monto realmente
   ejecutado porque casi nunca coincide con el presupuesto aprobado; el campo
   viene precargado con lo que se llevaba gastado, para no tener que
   escribirlo desde cero. */

function abrirModalFinalizar(id) {
    const proyecto = proyectosCache.find(p => p.id_proyecto === id);
    if (!proyecto) {
        showToast('Proyecto no encontrado', 'warning');
        return;
    }

    _proyectoFinalizarId = id;
    document.getElementById('modal-finalizar-nombre').textContent = `Proyecto: ${proyecto.nombre_proyecto}`;
    document.getElementById('finalizar-monto').value = proyecto.presupuesto_ejecutado || '';
    document.getElementById('modal-finalizar').classList.add('open');
    setTimeout(() => document.getElementById('finalizar-monto').focus(), 80);
}

// Cierra el modal y limpia los errores y el id guardado, para que la próxima
// vez que se abra arranque en blanco.

function cerrarModalFinalizar() {
    FormUtils.limpiarErrores(document.getElementById('modal-finalizar'));
    document.getElementById('modal-finalizar').classList.remove('open');
    _proyectoFinalizarId = null;
}

/* Finaliza el proyecto. Es una acción sin vuelta atrás: una vez finalizado
   queda cerrado para siempre y no se puede reactivar. */

async function confirmarFinalizar() {
    const monto = document.getElementById('finalizar-monto').value.trim();

    // El monto es obligatorio y no puede ser negativo. Se valida acá antes de
    // mandar nada, para marcarle el campo al usuario en vez de que le rebote
    // un error del servidor.
    if (!monto) {
        FormUtils.marcarInvalido(document.getElementById('finalizar-monto'), 'El monto ejecutado es obligatorio.');
        return;
    }

    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum < 0) {
        FormUtils.marcarInvalido(document.getElementById('finalizar-monto'), 'Ingresa un monto válido mayor o igual a 0.');
        return;
    }

    try {
        const result = await API.proyectos.finalizar(_proyectoFinalizarId, {
            id_usuario: parseInt(sessionStorage.getItem('pron_id_usuario')) || 1,
            presupuesto_ejecutado: montoNum
        });

        if (result.success) {
            showToast('Proyecto finalizado exitosamente', 'success');
            cerrarModalFinalizar();
            await cargarDatosIniciales();
            renderPaginaProyectos();
        }
    } catch (error) {
        console.error('Error finalizando proyecto:', error);
        showToast(error.message || 'Error al finalizar el proyecto', 'warning');
    }
}

/* Cancela un proyecto, con confirmación de por medio.

   Igual que finalizar, no tiene vuelta atrás: un proyecto cancelado no se
   puede reactivar. Solo aplica a los proyectos abiertos; si ya está cerrado se
   rechaza la operación y conserva el estado que tenía.

   Recibe el id del proyecto. */
async function cancelarProyecto(id) {
    const proyecto = proyectosCache.find(p => p.id_proyecto === id);
    if (!proyecto) {
        showToast('Proyecto no encontrado', 'warning');
        return;
    }

    if (proyecto.estado_proyecto === 'CANCELADO') {
        showToast('El proyecto ya está cancelado', 'info');
        return;
    }

    if (proyecto.estado_proyecto === 'FINALIZADO') {
        showToast('El proyecto ya está finalizado y no se puede cancelar', 'warning');
        return;
    }

    const confirmar = confirm(
        `¿Estás seguro de CANCELAR el proyecto "${proyecto.nombre_proyecto}"?\n\n` +
        `Esta acción cambiará el estado a CANCELADO. El proyecto permanecerá visible pero con estado CANCELADO.`
    );

    if (!confirmar) return;

    try {
        const result = await API.proyectos.cancelar(id, {
            id_usuario: parseInt(sessionStorage.getItem('pron_id_usuario')) || 1
        });

        if (result.success) {
            showToast(`Proyecto "${proyecto.nombre_proyecto}" cancelado`, 'info');
            await cargarDatosIniciales();
            renderPaginaProyectos();
        }
    } catch (error) {
        console.error('Error cancelando proyecto:', error);
        showToast(error.message || 'Error al cancelar el proyecto', 'warning');
    }
}

/* Versión anterior de cargarMunicipios(), reemplazada por la de más arriba.
   Se dejó comentada mientras se confirma que la nueva funciona bien en todos
   los casos; una vez confirmado se puede borrar sin problema. */

/*async function cargarMunicipios() {
    const id_departamento = document.getElementById('sel-depto').value;
    const selMun = document.getElementById('sel-municipio');

    if (!id_departamento) {
        selMun.innerHTML = '<option value="">— Primero selecciona departamento —</option>';
        selMun.disabled = true;
        return;
    }

    try {
        const municipios = await API.municipios.listar({ id_departamento: parseInt(id_departamento) });
        selMun.innerHTML = '<option value="">— Selecciona un municipio —</option>';
        municipios.forEach(m => {
            const o = document.createElement('option');
            o.value = m.id_municipio;
            o.textContent = m.nombre_municipio;
            selMun.appendChild(o);
        });
        selMun.disabled = false;
    } catch (error) {
        console.error('Error cargando municipios:', error);
        selMun.innerHTML = '<option value="">— Error al cargar municipios —</option>';
        selMun.disabled = true;
    }
}*/

/* Revisa que las dos fechas del formulario tengan sentido: que la de inicio no
   quede en el pasado y que la de fin no sea anterior a la de inicio.

   La comprobación del pasado se salta al editar, porque un proyecto que ya
   está andando obviamente empezó antes de hoy y no habría forma de guardarle
   ningún cambio.

   Se le pega 'T00:00:00' a las fechas para que el navegador las lea como hora
   local; sin eso las interpreta como UTC y, con el huso de Honduras, el día se
   corre uno hacia atrás. */
function validarRangoFechas() {
    const ini = document.getElementById('np-inicio');
    const fin = document.getElementById('np-fin');

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (ini.value && new Date(ini.value + 'T00:00:00') < hoy && !_proyectoEnEdicion) {
        FormUtils.marcarInvalido(ini, 'La fecha de inicio debe ser de hoy en adelante.');
    } else {
        FormUtils.limpiarInvalido(ini);
    }

    if (ini.value) fin.min = ini.value;
    if (ini.value && fin.value && new Date(fin.value + 'T00:00:00') < new Date(ini.value + 'T00:00:00')) {
        FormUtils.marcarInvalido(fin, 'La fecha final no puede ser anterior a la fecha de inicio.');
    } else {
        FormUtils.limpiarInvalido(fin);
    }
}

// Aviso emergente de la esquina. El temporizador se guarda aparte para poder
// cancelarlo: si salen dos mensajes seguidos, el segundo reinicia la cuenta y
// no se va a medio leer.
let _tt;

function showToast(msg, tipo = 'success') {
    const t = document.getElementById('toast');
    if (!t) return;
    const icons = { success: 'check_circle', warning: 'warning', info: 'mail' };
    t.className = `toast ${tipo}`;
    document.getElementById('toast-icon').textContent = icons[tipo] || 'check_circle';
    document.getElementById('toast-msg').textContent = msg;
    t.classList.add('show');
    clearTimeout(_tt);
    _tt = setTimeout(() => t.classList.remove('show'), 4000);
}

// Se cuelgan en window para que los onclick escritos en el HTML las
// encuentren.

window.abrirModalNuevoProyecto = abrirModalNuevoProyecto;
window.cerrarModalNuevo = cerrarModalNuevo;
window.guardarProyecto = guardarProyecto;
window.abrirModalFinalizar = abrirModalFinalizar;
window.cerrarModalFinalizar = cerrarModalFinalizar;
window.confirmarFinalizar = confirmarFinalizar;
window.cancelarProyecto = cancelarProyecto;
window.cargarMunicipios = cargarMunicipios;
window.validarRangoFechas = validarRangoFechas;
window.abrirDetalle = abrirDetalle;
window.abrirEditarProyecto = abrirEditarProyecto;
window.aplicarFiltros = aplicarFiltros;
window.limpiarFiltros = limpiarFiltros;
window.abrirModalFinalizar = abrirModalFinalizar;
window.cerrarModalFinalizar = cerrarModalFinalizar;
window.confirmarFinalizar = confirmarFinalizar;
window.cancelarProyecto = cancelarProyecto;
window.showToast = showToast;
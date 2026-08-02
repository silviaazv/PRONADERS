/* ============================================================
   bitacora.js — MÓDULO: BITÁCORA DEL SISTEMA
   ------------------------------------------------------------
   Ahora carga los registros reales desde /api/bitacora en vez
   de un arreglo de datos de muestra. Como esa tabla solo guarda
   IDs (id_usuario, id_objeto), se hace un cruce en el navegador
   con /api/usuarios y /api/roles para mostrar nombres.

   NOTA IMPORTANTE (limitación real de la base de datos):
   tbl_bitacora NO tiene columna de IP/ubicación. La columna
   "IP / Ubicación" de la tabla original era un dato inventado
   para la maqueta; aquí se muestra "—" porque el dato no existe
   en la BD. Si lo necesitas, hay que agregar esa columna al DDL.
   ============================================================ */

// tipo_accion tal como lo guarda la BD (ver CHECK chk_bitacora_tipo_accion)
const TIPO_CONFIG = {
  INSERT:      { label: 'Creación',    color: 'var(--success)', bg: 'var(--success-bg)', icon: 'add_circle' },
  UPDATE:      { label: 'Edición',     color: 'var(--info)',    bg: 'var(--info-bg)',     icon: 'edit' },
  DELETE:      { label: 'Eliminación', color: 'var(--danger)',  bg: 'var(--danger-bg)',   icon: 'delete' },
  REVISION:    { label: 'Revisión',    color: '#7b1fa2',        bg: '#f3e8ff',            icon: 'fact_check' },
  EMISION:     { label: 'Emisión',     color: 'var(--warning)', bg: 'var(--warning-bg)',  icon: 'send' },
  APROBACION:  { label: 'Aprobación',  color: 'var(--success)', bg: 'var(--success-bg)',  icon: 'check_circle' },
  RECHAZO:     { label: 'Rechazo',     color: 'var(--danger)',  bg: 'var(--danger-bg)',   icon: 'cancel' },
  LOGIN:       { label: 'Sesión',      color: 'var(--muted)',   bg: 'var(--cream)',       icon: 'login' },
  LOGOUT:      { label: 'Sesión',      color: 'var(--muted)',   bg: 'var(--cream)',       icon: 'logout' },
};

// tipo_objeto tal como lo guarda la BD (ver CHECK chk_bitacora_tipo_objeto)
const OBJ_CONFIG = {
  PROYECTO:  { color: 'var(--navy)',    bg: 'rgba(13,27,62,0.08)', icon: 'folder_open', label: 'Proyecto' },
  SOLICITUD: { color: 'var(--warning)', bg: 'var(--warning-bg)',   icon: 'inventory_2', label: 'Solicitud' },
  REPORTE:   { color: 'var(--info)',    bg: 'var(--info-bg)',      icon: 'bar_chart',   label: 'Reporte' },
  USUARIO:   { color: '#7b1fa2',        bg: '#f3e8ff',             icon: 'manage_accounts', label: 'Usuario' },
  ARCHIVO:   { color: '#2E7D52',        bg: '#E7F3EC',             icon: 'attach_file', label: 'Archivo' },
};

let _bitacoraCache = [];   // registros crudos de la API
let _usuariosMap = {};     // id_usuario -> { nombre_usuario, id_rol }
let _rolesMap = {};        // id_rol -> nombre_rol
let _paginaActual = 1;
let _registrosPorPagina = 20;
let _datosFiltrados = [];    // registros filtrados según búsqueda y filtros

function iniciales(nombre) {
  return (nombre || '?').split(' ').filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('');
}

function formatearFecha(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleString('es-HN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function renderLog(data) {
  const tbody = document.getElementById('log-tbody');

  _datosFiltrados = data; // Guardar los datos filtrados para exportación
  _paginaActual = 1; // Reiniciar a la primera página al renderizar nuevos datos

  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:26px;color:var(--muted)">No hay registros que coincidan con el filtro.</td></tr>`;
    document.getElementById('log-count').textContent = 'Mostrando 0 registros';
    return;

  }

  renderPagina();

  tbody.innerHTML = data.map(r => {
    const t = TIPO_CONFIG[r.tipo_accion] || TIPO_CONFIG.LOGIN;
    const usuario = _usuariosMap[r.id_usuario];
    const nombreUsuario = usuario ? usuario.nombre_usuario : `Usuario #${r.id_usuario}`;
    const rolLabel = usuario ? (_rolesMap[usuario.id_rol] || '—') : '—';

    const objHtml = r.tipo_objeto
      ? (() => {
          const o = OBJ_CONFIG[r.tipo_objeto] || OBJ_CONFIG.PROYECTO;
          return `<div style="display:flex;align-items:center;gap:8px">
            <span style="display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:20px;font-size:10.5px;font-weight:600;background:${o.bg};color:${o.color};flex-shrink:0">
              <span class="material-symbols-rounded" style="font-size:12px">${o.icon}</span>${o.label}
            </span>
            <span style="font-size:12px;color:var(--text-light)">#${r.id_objeto}</span>
          </div>`;
        })()
      : '<span style="color:var(--muted);font-size:12px">—</span>';

    return `<tr>
      <td style="color:var(--muted);font-size:11.5px">${r.id_registro}</td>
      <td style="font-size:12px;color:var(--text-light);white-space:nowrap">${formatearFecha(r.fecha_accion)}</td>
      <td>
        <div style="display:flex;align-items:center;gap:8px">
          <div style="width:26px;height:26px;border-radius:50%;background:var(--navy-light);display:flex;align-items:center;justify-content:center;font-size:9.5px;font-weight:600;color:var(--gold-light);flex-shrink:0">${iniciales(nombreUsuario)}</div>
          <span style="font-size:12.5px;font-weight:500">${nombreUsuario}</span>
        </div>
      </td>
      <td><span class="badge badge-navy" style="font-size:10px">${rolLabel}</span></td>
      <td>${objHtml}</td>
      <td>
        <span style="display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:20px;font-size:10.5px;font-weight:500;background:${t.bg};color:${t.color}">
          <span class="material-symbols-rounded" style="font-size:12px">${t.icon}</span>${t.label}
        </span>
      </td>
    </tr>`;
  }).join('');

  document.getElementById('log-count').textContent = `Mostrando ${data.length} de ${_bitacoraCache.length} registros`;
}

function renderPagina() {
  const tbody = document.getElementById('log-tbody');
  const total = _datosFiltrados.length;
  const totalPaginas = Math.ceil(total / _registrosPorPagina) || 1;
  
  // Asegurar que la página actual sea válida
  if (_paginaActual < 1) _paginaActual = 1;
  if (_paginaActual > totalPaginas) _paginaActual = totalPaginas;
  
  const inicio = (_paginaActual - 1) * _registrosPorPagina;
  const fin = Math.min(inicio + _registrosPorPagina, total);
  const paginaData = _datosFiltrados.slice(inicio, fin);

  if (!paginaData.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:26px;color:var(--muted)">No hay registros que coincidan con el filtro.</td></tr>`;
    document.getElementById('log-count').textContent = 'Mostrando 0 registros';
    actualizarPaginacion(total, totalPaginas);
    return;
  }

  tbody.innerHTML = paginaData.map(r => {
    const t = TIPO_CONFIG[r.tipo_accion] || TIPO_CONFIG.LOGIN;
    const usuario = _usuariosMap[r.id_usuario];
    const nombreUsuario = usuario ? usuario.nombre_usuario : `Usuario #${r.id_usuario}`;
    const rolLabel = usuario ? (_rolesMap[usuario.id_rol] || '—') : '—';

    const objHtml = r.tipo_objeto
      ? (() => {
          const o = OBJ_CONFIG[r.tipo_objeto] || OBJ_CONFIG.PROYECTO;
          return `<div style="display:flex;align-items:center;gap:8px">
            <span style="display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:20px;font-size:10.5px;font-weight:600;background:${o.bg};color:${o.color};flex-shrink:0">
              <span class="material-symbols-rounded" style="font-size:12px">${o.icon}</span>${o.label}
            </span>
          </div>`;
        })()
      : '<span style="color:var(--muted);font-size:12px">—</span>';

    return `<tr>
      <td style="color:var(--muted);font-size:11.5px">${r.id_registro}</td>
      <td style="font-size:12px;color:var(--text-light);white-space:nowrap">${formatearFecha(r.fecha_accion)}</td>
      <td>
        <div style="display:flex;align-items:center;gap:8px">
          <div style="width:26px;height:26px;border-radius:50%;background:var(--navy-light);display:flex;align-items:center;justify-content:center;font-size:9.5px;font-weight:600;color:var(--gold-light);flex-shrink:0">${iniciales(nombreUsuario)}</div>
          <span style="font-size:12.5px;font-weight:500">${nombreUsuario}</span>
        </div>
      </td>
      <td><span class="badge badge-navy" style="font-size:10px">${rolLabel}</span></td>
      <td>${objHtml}</td>
      <td>
        <span style="display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:20px;font-size:10.5px;font-weight:500;background:${t.bg};color:${t.color}">
          <span class="material-symbols-rounded" style="font-size:12px">${t.icon}</span>${t.label}
        </span>
      </td>
    </tr>`;
  }).join('');

  document.getElementById('log-count').textContent = `Mostrando ${inicio + 1} - ${fin} de ${total} registros`;
  actualizarPaginacion(total, totalPaginas);
}

function actualizarPaginacion(total, totalPaginas) {
  const infoPagina = document.getElementById('info-pagina');
  const btnAnterior = document.getElementById('btn-anterior');
  const btnSiguiente = document.getElementById('btn-siguiente');
  const btnPrimera = document.getElementById('btn-primera');
  const btnUltima = document.getElementById('btn-ultima');

  if (infoPagina) {
    infoPagina.textContent = `Página ${_paginaActual} de ${totalPaginas}`;
  }

  if (btnAnterior) {
    btnAnterior.disabled = _paginaActual <= 1;
    btnAnterior.style.opacity = _paginaActual <= 1 ? '0.5' : '1';
  }

  if (btnSiguiente) {
    btnSiguiente.disabled = _paginaActual >= totalPaginas;
    btnSiguiente.style.opacity = _paginaActual >= totalPaginas ? '0.5' : '1';
  }

  if (btnPrimera) {
    btnPrimera.disabled = _paginaActual <= 1;
    btnPrimera.style.opacity = _paginaActual <= 1 ? '0.5' : '1';
  }

  if (btnUltima) {
    btnUltima.disabled = _paginaActual >= totalPaginas;
    btnUltima.style.opacity = _paginaActual >= totalPaginas ? '0.5' : '1';
  }
}

// ── FUNCIONES DE NAVEGACIÓN ──

function irPagina(pagina) {
  const totalPaginas = Math.ceil(_datosFiltrados.length / _registrosPorPagina) || 1;
  if (pagina < 1 || pagina > totalPaginas) return;
  _paginaActual = pagina;
  renderPagina();
}

function paginaAnterior() {
  if (_paginaActual > 1) {
    _paginaActual--;
    renderPagina();
  }
}

function paginaSiguiente() {
  const totalPaginas = Math.ceil(_datosFiltrados.length / _registrosPorPagina) || 1;
  if (_paginaActual < totalPaginas) {
    _paginaActual++;
    renderPagina();
  }
}

function actualizarEstadisticas(data) {
  const total   = data.length;
  const sesiones= data.filter(r => r.tipo_accion === 'LOGIN' || r.tipo_accion === 'LOGOUT').length;
  const cambios = data.filter(r => ['INSERT','UPDATE','DELETE'].includes(r.tipo_accion)).length;
  const el = document.querySelectorAll('.stat-val');
  if (el[0]) el[0].textContent = total.toLocaleString('es-HN');
  if (el[1]) el[1].textContent = sesiones.toLocaleString('es-HN');
  if (el[2]) el[2].textContent = cambios.toLocaleString('es-HN');
  if (el[3]) el[3].textContent = '0'; // no hay tipo "error" en la BD real
}

function poblarFiltroUsuarios() {
  const select = document.getElementById('f-usuario');
  const actuales = new Set(Array.from(select.options).map(o => o.value));
  Object.values(_usuariosMap).forEach(u => {
    if (!actuales.has(u.nombre_usuario)) {
      const opt = document.createElement('option');
      opt.value = u.nombre_usuario;
      opt.textContent = u.nombre_usuario;
      select.appendChild(opt);
    }
  });
}

function filtrarBitacora(q) {
  const query   = (q || document.querySelector('.search-input')?.value || '').toLowerCase();
  const usuario = document.getElementById('f-usuario').value;
  const tipo    = document.getElementById('f-tipo').value;
  const objeto  = document.getElementById('f-objeto').value;
  const fecha   = document.getElementById('f-fecha')?.value || '';

  const result = _bitacoraCache.filter(r => {
    const u = _usuariosMap[r.id_usuario];
    const nombre = u ? u.nombre_usuario : '';
    const matchQ    = !query   || nombre.toLowerCase().includes(query);
    const matchUser = !usuario || nombre === usuario;
    const matchTipo = !tipo    || r.tipo_accion === tipo;
    const matchObj  = !objeto  || r.tipo_objeto === objeto;
    return matchQ && matchUser && matchTipo && matchObj;

    let matchFecha = true;
    if (fecha) {
      const fechaRegistro = r.fecha_accion ? r.fecha_accion.slice(0, 10) : '';
      matchFecha = fechaRegistro === fecha;
    }

    return matchQ && matchUser && matchTipo && matchObj && matchFecha;

  });

  _datosFiltrados = result; // Guardar los datos filtrados para exportación
  _paginaActual = 1; // Reiniciar a la primera página al filtrar

  renderPagina();

  renderLog(result);
}

async function cargarBitacora() {
  const tbody = document.getElementById('log-tbody');
  tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:26px;color:var(--muted)">Cargando registros…</td></tr>`;
  try {
    const [registros, usuarios, roles] = await Promise.all([
      API.bitacora.listar(),
      API.usuarios.listar(),
      API.roles.listar(),
    ]);

    _rolesMap = Object.fromEntries(roles.map(r => [r.id_rol, r.nombre_rol]));
    _usuariosMap = Object.fromEntries(usuarios.map(u => [u.id_usuario, u]));
    _bitacoraCache = registros;

    poblarFiltroUsuarios();
    actualizarEstadisticas(registros);
    renderLog(registros);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:26px;color:var(--danger)">
      No se pudo cargar la bitácora: ${err.message}</td></tr>`;
  }
}

function exportarBitacoraPDF() {
    // Obtener datos visibles actualmente (filtrados)
    const data = _bitacoraCache.filter(r => {
        // Aplicar los mismos filtros que en filtrarBitacora()
        const query = document.querySelector('.search-input')?.value?.toLowerCase() || '';
        const usuario = document.getElementById('f-usuario').value;
        const tipo = document.getElementById('f-tipo').value;
        const objeto = document.getElementById('f-objeto').value;
        const fecha = document.getElementById('f-fecha')?.value || '';

        const u = _usuariosMap[r.id_usuario];
        const nombre = u ? u.nombre_usuario : '';

        let matchFecha = true;
        if (fecha) {
            const fechaRegistro = r.fecha_accion ? r.fecha_accion.slice(0, 10) : '';
            matchFecha = fechaRegistro === fecha;
        }

        const matchQ = !query || nombre.toLowerCase().includes(query);
        const matchUser = !usuario || nombre === usuario;
        const matchTipo = !tipo || r.tipo_accion === tipo;
        const matchObj = !objeto || r.tipo_objeto === objeto;

        return matchQ && matchUser && matchTipo && matchObj && matchFecha;
    });

    if (data.length === 0) {
        showToast('No hay registros para exportar con los filtros actuales', 'warning');
        return;
    }

    const fecha = new Date().toLocaleDateString('es-HN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
    const hora = new Date().toLocaleTimeString('es-HN', {
        hour: '2-digit',
        minute: '2-digit'
    });

    // Construir filas de la tabla
    const filas = data.map(r => {
        const t = TIPO_CONFIG[r.tipo_accion] || TIPO_CONFIG.LOGIN;
        const usuario = _usuariosMap[r.id_usuario];
        const nombreUsuario = usuario ? usuario.nombre_usuario : `Usuario #${r.id_usuario}`;
        const rolLabel = usuario ? (_rolesMap[usuario.id_rol] || '—') : '—';
        const objetoLabel = r.tipo_objeto ? (OBJ_CONFIG[r.tipo_objeto]?.label || r.tipo_objeto) : '—';
        const fechaFormateada = formatearFecha(r.fecha_accion);

        return `
            <tr>
                <td>${r.id_registro}</td>
                <td>${fechaFormateada}</td>
                <td>${nombreUsuario}</td>
                <td>${rolLabel}</td>
                <td>${objetoLabel}</td>
                <td>${t.label}</td>
            </tr>
        `;
    }).join('');

    const total = data.length;

    // Crear ventana para PDF
    const win = window.open('', '_blank');
    if (!win) {
        showToast('Habilita las ventanas emergentes para exportar el PDF', 'warning');
        return;
    }

    win.document.write(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>PRONADERS — Bitácora del Sistema</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: 'Segoe UI', Arial, sans-serif; 
                    color: #1A1F35; 
                    margin: 40px; 
                    font-size: 12px;
                    line-height: 1.5;
                }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    border-bottom: 3px solid #0D1B3E;
                    padding-bottom: 14px;
                    margin-bottom: 20px;
                }
                .brand {
                    font-size: 22px;
                    font-weight: 700;
                    color: #0D1B3E;
                    letter-spacing: 1px;
                }
                .brand-sub {
                    font-size: 11px;
                    color: #666;
                    margin-top: 2px;
                }
                .meta {
                    text-align: right;
                    font-size: 11px;
                    color: #666;
                }
                h1 {
                    font-size: 16px;
                    color: #0D1B3E;
                    margin-bottom: 4px;
                }
                .subtitle {
                    font-size: 12px;
                    color: #666;
                    margin-bottom: 16px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 11px;
                }
                thead th {
                    background: #0D1B3E;
                    color: #fff;
                    text-align: left;
                    padding: 7px 10px;
                    font-weight: 600;
                    font-size: 10px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                tbody td {
                    padding: 6px 10px;
                    border-bottom: 1px solid #E8E3D8;
                }
                tbody tr:nth-child(even) td {
                    background: #F7F4EE;
                }
                .badge {
                    display: inline-block;
                    padding: 1px 8px;
                    border-radius: 12px;
                    font-size: 10px;
                    font-weight: 600;
                }
                .badge-success { background: #E1F5EE; color: #0a6e4c; }
                .badge-info { background: #E6F1FB; color: #185FA5; }
                .badge-danger { background: #FCEBEB; color: #A32D2D; }
                .badge-warning { background: #FAEEDA; color: #BA7517; }
                .badge-muted { background: #EDE8DF; color: #4A5068; }
                .footer {
                    margin-top: 24px;
                    padding-top: 12px;
                    border-top: 1px solid #EDE8DF;
                    font-size: 10px;
                    color: #888;
                    display: flex;
                    justify-content: space-between;
                }
                @media print {
                    body { margin: 20px; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div>
                    <div class="brand">PRONADERS</div>
                    <div class="brand-sub">Programa Nacional de Desarrollo Rural y Economía Social</div>
                </div>
                <div class="meta">
                    Bitácora del Sistema<br>
                    Generado: ${fecha} - ${hora}
                </div>
            </div>

            <h1>Bitácora del Sistema</h1>
            <div class="subtitle">
                Total de registros: ${total} · ${fecha}
                ${document.querySelector('.search-input')?.value ? ` · Filtro: "${document.querySelector('.search-input').value}"` : ''}
            </div>

            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th style="min-width:140px;">Fecha / Hora</th>
                        <th style="min-width:130px;">Usuario</th>
                        <th style="min-width:80px;">Rol</th>
                        <th>Objeto</th>
                        <th style="min-width:100px;">Tipo</th>
                    </tr>
                </thead>
                <tbody>
                    ${filas}
                </tbody>
            </table>

            <div class="footer">
                <span>Documento generado automáticamente por el Sistema PRONADERS</span>
                <span>Página 1 de 1</span>
            </div>

            <script>
                // Imprimir automáticamente al cargar
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                    }, 500);
                };
            <\/script>
        </body>
        </html>
    `);

    win.document.close();
    showToast(`Exportando ${total} registros de bitácora...`, 'info');
}



document.addEventListener('DOMContentLoaded', cargarBitacora);

window.filtrarBitacora = filtrarBitacora;
window.exportarBitacoraPDF = exportarBitacoraPDF;
window.paginaAnterior = paginaAnterior;
window.paginaSiguiente = paginaSiguiente;
window.irPagina = irPagina;


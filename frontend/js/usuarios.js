/* ============================================================
   usuarios.js — MÓDULO: GESTIÓN DE USUARIOS (Admin de Oficina)
   ------------------------------------------------------------
   Ahora consume la API real (/api/usuarios, /api/roles,
   /api/proyectos-usuarios) en vez de datos de muestra.

   CAMBIOS respecto a la maqueta original (por límites reales
   del esquema de base de datos, tbl_usuarios):
   - Se quitó "Número de cuenta" y "Zona/Cargo": esas columnas
     no existen en la BD. Si las necesitas, hay que agregarlas
     al DDL (columna `cuenta` y `zona_cargo`, por ejemplo).
   - Se quitó "Foto de identificación": no hay endpoint de carga
     de archivos conectado a este formulario todavía.
   - "Último acceso" se reemplazó por "Registrado" (fecha_registro),
     porque la BD no guarda el último inicio de sesión por usuario
     (sí queda el histórico completo en la Bitácora).
   ============================================================ */

let _usuariosCache = [];
let _rolesCache = [];
let _rolesMap = {};        // id_rol -> nombre_rol
let _proyectosUsuarioCache = null; // se carga bajo demanda (verProyectos)
let _modoEdicion = false;
let _usuarioEditandoId = null;

/* ── Toast (reemplaza los alert() nativos) ── */
let _toastTimer;
function showToast(msg, tipo='success'){
  const t=document.getElementById('toast');
  if(!t){ alert(msg); return; }
  const icons={success:'check_circle',warning:'warning',info:'info'};
  t.className=`toast ${tipo}`;
  document.getElementById('toast-icon').textContent=icons[tipo]||'check_circle';
  document.getElementById('toast-msg').textContent=msg;
  t.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer=setTimeout(()=>t.classList.remove('show'),4500);
}

function iniciales(nombre){
  return (nombre||'?').split(' ').filter(Boolean).slice(0,2).map(p=>p[0].toUpperCase()).join('');
}
function formatearFecha(iso){
  if(!iso) return '—';
  const d = new Date(iso);
  if(isNaN(d)) return iso;
  return d.toLocaleDateString('es-HN', {day:'2-digit', month:'short', year:'numeric'});
}

/* ──────────────────────────────────────────────
   CARGA INICIAL: usuarios + roles
   ────────────────────────────────────────────── */
async function cargarUsuarios(){
  const tbody = document.getElementById('tabla-usuarios');
  tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:26px;color:var(--muted)">Cargando usuarios…</td></tr>`;
  try {
    const [usuarios, roles] = await Promise.all([API.usuarios.listar(), API.roles.listar()]);
    _usuariosCache = usuarios;
    _rolesCache = roles;
    _rolesMap = Object.fromEntries(roles.map(r => [r.id_rol, r.nombre_rol]));

    poblarSelectRoles();
    poblarFiltroRoles();
    renderTabla(_usuariosCache);
    actualizarStats(_usuariosCache);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:26px;color:var(--danger)">No se pudo cargar la lista de usuarios: ${err.message}</td></tr>`;
  }
}

function poblarSelectRoles(){
  const sel = document.getElementById('u-rol');
  sel.innerHTML = _rolesCache.map(r => `<option value="${r.id_rol}">${r.nombre_rol}</option>`).join('');
}
function poblarFiltroRoles(){
  const sel = document.getElementById('filtro-rol');
  const actuales = new Set(Array.from(sel.options).map(o=>o.value));
  _rolesCache.forEach(r=>{
    if(!actuales.has(String(r.id_rol))){
      const opt = document.createElement('option');
      opt.value = r.id_rol;
      opt.textContent = r.nombre_rol;
      sel.appendChild(opt);
    }
  });
}

function avatarColor(id){
  const paletas = [
    {bg:'#f3e8ff', c:'#7b1fa2'}, {bg:'var(--success-bg)', c:'var(--success)'},
    {bg:'var(--info-bg)', c:'var(--info)'}, {bg:'var(--warning-bg)', c:'var(--warning)'},
    {bg:'rgba(201,168,76,0.15)', c:'var(--gold-dim)'},
  ];
  return paletas[id % paletas.length];
}

function renderTabla(usuarios){
  const tbody = document.getElementById('tabla-usuarios');
  if(!usuarios.length){
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:26px;color:var(--muted)">No hay usuarios registrados todavía.</td></tr>`;
    return;
  }
  tbody.innerHTML = usuarios.map(u => {
    const activo = u.estado_usuario === 1;
    const col = avatarColor(u.id_usuario);
    return `<tr data-id="${u.id_usuario}">
      <td><div style="display:flex;align-items:center;gap:10px">
        <div class="avatar" style="background:${col.bg};color:${col.c}">${iniciales(u.nombre_usuario)}</div>
        <div><div class="fw-500">${u.nombre_usuario}</div><div class="text-xs text-muted">${u.telefono || ''}</div></div>
      </div></td>
      <td class="text-sm">${u.correo}</td>
      <td><span class="role-tag">${_rolesMap[u.id_rol] || '—'}</span></td>
      <td class="text-sm text-muted">${formatearFecha(u.fecha_registro)}</td>
      <td><span class="badge ${activo?'badge-success':'badge-danger'}">${activo?'Activo':'Inactivo'}</span></td>
      <td><div style="display:flex;gap:6px">
        <button class="btn btn-outline btn-sm" onclick="editarUsuario(${u.id_usuario})" title="Editar"><span class="material-symbols-rounded" style="font-size:13px">edit</span></button>
        <button class="btn btn-outline btn-sm" onclick="verProyectos(${u.id_usuario})" title="Ver proyectos vinculados"><span class="material-symbols-rounded" style="font-size:13px">folder_open</span></button>
        <button class="btn btn-outline btn-sm" onclick="generarPDFUsuario(${u.id_usuario})" title="Generar PDF de proyectos del usuario"><span class="material-symbols-rounded" style="font-size:13px">picture_as_pdf</span></button>
        <button class="btn ${activo?'btn-danger':'btn-outline'} btn-sm" onclick="confirmarDesactivar(${u.id_usuario})" title="${activo?'Desactivar':'Reactivar'}"><span class="material-symbols-rounded" style="font-size:13px">${activo?'block':'check_circle'}</span></button>
      </div></td>
    </tr>`;
  }).join('');
}

function actualizarStats(usuarios){
  const total = usuarios.length;
  const activos = usuarios.filter(u=>u.estado_usuario===1).length;
  const inactivos = total - activos;
  const adminRolId = _rolesCache.find(r=>r.nombre_rol==='Administrador de Oficina')?.id_rol;
  const admins = usuarios.filter(u=>u.id_rol===adminRolId).length;
  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-activos').textContent = activos;
  document.getElementById('stat-inactivos').textContent = inactivos;
  document.getElementById('stat-admins').textContent = admins;
  document.getElementById('usuarios-subtitle').textContent = `${total} usuarios registrados en el sistema`;
}

/* ──────────────────────────────────────────────
   DESACTIVAR / REACTIVAR USUARIO
   ────────────────────────────────────────────── */
let _idAAlternar = null;
function confirmarDesactivar(id){
  const u = _usuariosCache.find(x=>x.id_usuario===id);
  if(!u) return;
  _idAAlternar = id;
  const activo = u.estado_usuario === 1;
  document.querySelector('#confirm-dialog .confirm-box div[style*="font-family"]').textContent =
    activo ? '¿Desactivar usuario?' : '¿Reactivar usuario?';
  document.getElementById('confirm-txt').textContent = activo
    ? `"${u.nombre_usuario}" perderá acceso al sistema. Podrás reactivar la cuenta en cualquier momento.`
    : `"${u.nombre_usuario}" recuperará acceso al sistema.`;
  document.querySelector('#confirm-dialog .btn-danger').textContent = activo ? 'Sí, desactivar' : 'Sí, reactivar';
  document.getElementById('confirm-dialog').classList.add('open');
}

async function confirmar(){
  document.getElementById('confirm-dialog').classList.remove('open');
  const u = _usuariosCache.find(x=>x.id_usuario===_idAAlternar);
  if(!u) return;
  const nuevoEstado = u.estado_usuario === 1 ? 0 : 1;
  try {
    await API.usuarios.actualizar(_idAAlternar, { estado_usuario: nuevoEstado });
    showToast(`Usuario "${u.nombre_usuario}" ${nuevoEstado?'reactivado':'desactivado'} correctamente.`, 'info');
    await cargarUsuarios();
  } catch (err) {
    showToast(`No se pudo actualizar el estado: ${err.message}`, 'warning');
  }
}

/* ──────────────────────────────────────────────
   MODAL NUEVO / EDITAR USUARIO
   ────────────────────────────────────────────── */
function abrirModalNuevoUsuario(){
  _modoEdicion = false;
  _usuarioEditandoId = null;
  FormUtils.limpiarErrores(document.getElementById('modal-usuario'));
  document.getElementById('modal-u-title').innerHTML = 'Nuevo <em style="font-style:italic">Usuario</em>';
  document.getElementById('u-pass-label').textContent = 'Contraseña temporal';
  document.getElementById('u-pass-hint').textContent = 'Esta contraseña temporal debe entregarse manualmente al usuario (el sistema aún no envía correos automáticos).';
  document.getElementById('modal-usuario').classList.add('open');
  setTimeout(()=>document.getElementById('u-nombre').focus(), 80);
}

function editarUsuario(id){
  const u = _usuariosCache.find(x=>x.id_usuario===id);
  if(!u) return;
  _modoEdicion = true;
  _usuarioEditandoId = id;
  FormUtils.limpiarErrores(document.getElementById('modal-usuario'));
  document.getElementById('modal-u-title').innerHTML = 'Editar <em style="font-style:italic">Usuario</em>';
  document.getElementById('u-nombre').value = u.nombre_usuario;
  document.getElementById('u-telefono').value = u.telefono || '';
  document.getElementById('u-email').value = u.correo;
  document.getElementById('u-rol').value = u.id_rol;
  document.getElementById('u-pass').value = '';
  document.getElementById('u-pass-label').textContent = 'Nueva contraseña (opcional)';
  document.getElementById('u-pass-hint').textContent = 'Deja este campo vacío si no quieres cambiar la contraseña actual.';
  document.getElementById('modal-usuario').classList.add('open');
}

function cerrarModal(){
  document.getElementById('modal-usuario').classList.remove('open');
  FormUtils.limpiarErrores(document.getElementById('modal-usuario'));
  document.getElementById('modal-u-title').innerHTML = 'Nuevo <em style="font-style:italic">Usuario</em>';
  document.getElementById('u-nombre').value='';
  document.getElementById('u-telefono').value='';
  document.getElementById('u-email').value='';
  document.getElementById('u-pass').value='';
  _modoEdicion = false;
  _usuarioEditandoId = null;
}

async function guardarUsuario(){
  const campos = [
    {id:'u-nombre', msg:'El nombre completo es obligatorio.'},
    {id:'u-email',  msg:'Ingresa un correo institucional válido (ej. usuario@pronaders.gob.hn).', cond:v=>FormUtils.emailValido(v)},
  ];
  if(!_modoEdicion) campos.push({id:'u-pass', msg:'Define una contraseña temporal para el usuario.'});

  let errores = FormUtils.validar(campos);
  if(errores){
    showToast(`No se pudo guardar: hay ${errores} campo(s) obligatorio(s) con errores.`,'warning');
    return;
  }

  const nombre_usuario = document.getElementById('u-nombre').value.trim();
  const correo         = document.getElementById('u-email').value.trim();
  const telefono        = document.getElementById('u-telefono').value.trim() || null;
  const id_rol          = Number(document.getElementById('u-rol').value);
  const contrasena       = document.getElementById('u-pass').value;

  try {
    if(_modoEdicion){
      const payload = { nombre_usuario, correo, telefono, id_rol };
      if(contrasena) payload.contrasena = contrasena;
      await API.usuarios.actualizar(_usuarioEditandoId, payload);
      showToast(`Usuario "${nombre_usuario}" actualizado correctamente.`,'success');
    } else {
      await API.usuarios.crear({ nombre_usuario, correo, telefono, id_rol, contrasena, estado_usuario: 1 });
      showToast(`Usuario "${nombre_usuario}" registrado exitosamente.`,'success');
    }
    cerrarModal();
    await cargarUsuarios();
  } catch (err) {
    showToast(`No se pudo guardar el usuario: ${err.message}`,'warning');
  }
}

/* ──────────────────────────────────────────────
   VER PROYECTOS VINCULADOS A UN USUARIO
   ────────────────────────────────────────────── */
async function obtenerProyectosDeUsuario(id) {
    try {
        const todosLosProyectos = await API.proyectos.listar();
        return todosLosProyectos.filter(p => p.id_supervisor === id);
    } catch (error) {
        console.error('Error obteniendo proyectos del usuario:', error);
        return [];
    }
}

async function verProyectos(id){
  const u = _usuariosCache.find(x=>x.id_usuario===id);
  if(!u) return;

  let m = document.getElementById('modal-proyectos-usuario');
  if(!m){
    m = document.createElement('div');
    m.id = 'modal-proyectos-usuario';
    m.className = 'modal-overlay';
    m.innerHTML = `
    <div class="modal" style="max-width:620px">
      <div class="modal-header">
        <div class="modal-title" id="mpu-title">Proyectos del <em style="font-style:italic">Usuario</em></div>
        <button class="close-btn" onclick="document.getElementById('modal-proyectos-usuario').classList.remove('open')">
          <span class="material-symbols-rounded">close</span>
        </button>
      </div>
      <div id="mpu-lista" style="display:flex;flex-direction:column;gap:8px;max-height:52vh;overflow-y:auto"></div>
      <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:18px;padding-top:14px;border-top:1px solid var(--cream-dark)">
        <button class="btn btn-outline" onclick="document.getElementById('modal-proyectos-usuario').classList.remove('open')">Cerrar</button>
        <button class="btn btn-gold" id="mpu-pdf">
          <span class="material-symbols-rounded">picture_as_pdf</span> Generar PDF
        </button>
      </div>
    </div>`;
    document.body.appendChild(m);
  }

  document.getElementById('mpu-title').innerHTML = `Proyectos de <em style="font-style:italic">${u.nombre_usuario}</em>`;
  document.getElementById('mpu-lista').innerHTML = `<div style="text-align:center;padding:26px;color:var(--muted);font-size:13px">Cargando proyectos…</div>`;
  m.classList.add('open');

  try {
    const proyectos = await obtenerProyectosDeUsuario(id);
    document.getElementById('mpu-lista').innerHTML = proyectos.length
      ? proyectos.map(p=>`
        <div style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:var(--cream);border-radius:var(--radius)">
          <span class="material-symbols-rounded" style="font-size:20px;color:var(--navy)">folder_open</span>
          <div style="flex:1">
            <div style="font-size:13.5px;font-weight:500;color:var(--navy)">${p.nombre_proyecto}</div>
            <div class="text-xs text-muted">#${p.id_proyecto} · ${p.tipo_proyecto} · desde ${formatearFecha(p.fecha_inicio)}</div>
          </div>
          <span class="badge badge-info" style="font-size:10.5px">${p.estado_proyecto}</span>
        </div>`).join('')
      : `<div style="text-align:center;padding:26px;color:var(--muted);font-size:13px">Este usuario no está vinculado a ningún proyecto actualmente.</div>`;
    document.getElementById('mpu-pdf').onclick = ()=> generarPDFUsuario(id, proyectos);
  } catch (err) {
    document.getElementById('mpu-lista').innerHTML = `<div style="text-align:center;padding:26px;color:var(--danger);font-size:13px">No se pudieron cargar los proyectos: ${err.message}</div>`;
  }
}

/* ──────────────────────────────────────────────
   GENERAR PDF DE PROYECTOS DE UN USUARIO
   ────────────────────────────────────────────── */
async function generarPDFUsuario(id, proyectosPrecargados){
  const u = _usuariosCache.find(x=>x.id_usuario===id);
  if(!u) return;
  const proyectos = proyectosPrecargados || await obtenerProyectosDeUsuario(id);
  const fecha = new Date().toLocaleDateString('es-HN',{day:'2-digit',month:'long',year:'numeric'});

  const filas = proyectos.length
    ? proyectos.map(p=>`
      <tr>
        <td>#${p.id_proyecto}</td><td>${p.nombre_proyecto}</td><td>${p.tipo_proyecto}</td>
        <td>${formatearFecha(p.fecha_inicio)}</td><td>${p.estado_proyecto}</td>
      </tr>`).join('')
    : '<tr><td colspan="5" style="text-align:center;color:#888">Sin proyectos vinculados</td></tr>';

  const win = window.open('', '_blank');
  if(!win){
    showToast('El navegador bloqueó la ventana del PDF. Permite las ventanas emergentes e inténtalo de nuevo.','warning');
    return;
  }
  win.document.write(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
  <title>PRONADERS — Proyectos de ${u.nombre_usuario}</title>
  <style>
    body{font-family:Georgia,'Times New Roman',serif;color:#1a1a1a;margin:48px;line-height:1.5}
    .head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #0D1B3E;padding-bottom:14px;margin-bottom:22px}
    .brand{font-size:22px;font-weight:bold;color:#0D1B3E;letter-spacing:1px}
    .sub{font-size:11px;color:#666}
    h1{font-size:17px;color:#0D1B3E;margin:0 0 4px}
    .meta{font-size:12px;color:#555;margin-bottom:20px}
    table{width:100%;border-collapse:collapse;font-size:12.5px}
    th{background:#0D1B3E;color:#fff;text-align:left;padding:8px 10px;font-weight:600}
    td{border-bottom:1px solid #ddd;padding:8px 10px}
    tr:nth-child(even) td{background:#F7F4EE}
    .foot{margin-top:28px;font-size:10.5px;color:#888;border-top:1px solid #ddd;padding-top:10px}
  </style></head><body>
    <div class="head">
      <div><div class="brand">PRONADERS</div><div class="sub">Programa Nacional de Desarrollo Rural y Economía Social</div></div>
      <div class="sub" style="text-align:right">Generado: ${fecha}<br>Sistema de Gestión de Proyectos</div>
    </div>
    <h1>Ficha de proyectos — ${u.nombre_usuario}</h1>
    <div class="meta">Detalle de todos los proyectos en los que el usuario está o estuvo vinculado (${proyectos.length} en total).</div>
    <table>
      <thead><tr><th>Código</th><th>Proyecto</th><th>Tipo</th><th>Inicio</th><th>Estado</th></tr></thead>
      <tbody>${filas}</tbody>
    </table>
    <div class="foot">Documento generado automáticamente por el Sistema PRONADERS. Uso interno institucional.</div>
    <script>window.onload = () => { window.print(); };<\/script>
  </body></html>`);
  win.document.close();
  showToast(`Generando PDF de proyectos de ${u.nombre_usuario}...`,'info');
}

/* ──────────────────────────────────────────────
   FILTROS DE LA TABLA (ahora filtran sobre el arreglo,
   no sobre filas del DOM, y vuelven a renderizar)
   ────────────────────────────────────────────── */
function aplicarFiltros() {
  const busqueda = document.getElementById('search-usuario')?.value.toLowerCase() || '';
  const rolFiltro = document.getElementById('filtro-rol')?.value || '';
  const estadoFiltro = document.getElementById('filtro-estado')?.value || '';

  const hayFiltros = !!(busqueda || rolFiltro || estadoFiltro);
  const btnLimpiar = document.getElementById('btn-limpiar-filtros');
  if(btnLimpiar) btnLimpiar.style.display = hayFiltros ? '' : 'none';

  const filtrados = _usuariosCache.filter(u => {
    if(busqueda){
      const texto = `${u.nombre_usuario} ${u.correo}`.toLowerCase();
      if(!texto.includes(busqueda)) return false;
    }
    if(rolFiltro && String(u.id_rol) !== rolFiltro) return false;
    if(estadoFiltro === 'Activo' && u.estado_usuario !== 1) return false;
    if(estadoFiltro === 'Inactivo' && u.estado_usuario !== 0) return false;
    return true;
  });

  renderTabla(filtrados);
  const contador = document.querySelector('.card-subtitle');
  if(contador) contador.textContent = `${filtrados.length} de ${_usuariosCache.length} usuarios registrados en el sistema`;
}

function limpiarFiltros() {
  document.getElementById('search-usuario').value = '';
  document.getElementById('filtro-rol').value = '';
  document.getElementById('filtro-estado').value = '';
  aplicarFiltros();
}

/* ──────────────────────────────────────────────
   INICIALIZACIÓN
   ────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  await cargarUsuarios();
  if(sessionStorage.getItem('pron_abrir_modal_usuario') === '1'){
    sessionStorage.removeItem('pron_abrir_modal_usuario');
    setTimeout(() => abrirModalNuevoUsuario(), 150);
  }
});

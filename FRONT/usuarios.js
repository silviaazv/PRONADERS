/* ============================================================
   usuarios.js — MÓDULO: GESTIÓN DE USUARIOS (Admin de Oficina)
   Funcionalidades:
   - Filtros de la tabla (búsqueda, rol, zona, estado).
   - Modal de creación/edición con validación campo a campo y
     foto de identificación OBLIGATORIA al crear.
   - "Ver proyectos": modal con los proyectos en que el usuario
     está o estuvo vinculado.
   - "Generar PDF": ficha imprimible con todos los proyectos
     del usuario (ventana de impresión → Guardar como PDF).
   El sidebar, topbar, notificaciones y utilidades de validación
   se cargan desde shared.js (incluido antes).
   ============================================================ */

/* ──────────────────────────────────────────────
   PROYECTOS VINCULADOS POR USUARIO (datos demo)
   Incluye proyectos activos e históricos (finalizados)
   ────────────────────────────────────────────── */
const USUARIO_PROYECTOS = {
  'Silvia Alejandra Velasquez Zúñiga': [
    {id:'PRY-003', nombre:'Centro Comunitario San Pedro', rol:'Administradora',       estado:'Por finalizar', badge:'badge-info',    periodo:'nov 2025 — actual'},
    {id:'FIN-002', nombre:'Puente Peatonal Yoro',         rol:'Administradora',       estado:'Finalizado',    badge:'badge-success', periodo:'mar — oct 2025'},
  ],
  'Andrea María Amador Canales': [
    {id:'PRY-002', nombre:'Riego Comunitario El Paraíso', rol:'Supervisora',          estado:'Retrasado',     badge:'badge-danger',  periodo:'feb 2026 — actual'},
    {id:'FIN-003', nombre:'Sistema de Agua Potable Tocoa',rol:'Supervisora',          estado:'Finalizado',    badge:'badge-success', periodo:'abr — dic 2024'},
  ],
  'Isaac Abisahi Carranza Posadas': [
    {id:'PRY-001', nombre:'Puente Choluteca',             rol:'Supervisor de Campo',  estado:'Activo',        badge:'badge-success', periodo:'ene 2026 — actual'},
    {id:'PRY-002', nombre:'Riego Comunitario El Paraíso', rol:'Supervisor de Campo',  estado:'Retrasado',     badge:'badge-danger',  periodo:'feb 2026 — actual'},
    {id:'FIN-002', nombre:'Puente Peatonal Yoro',         rol:'Supervisor de Campo',  estado:'Finalizado',    badge:'badge-success', periodo:'mar — oct 2025'},
  ],
  'Josué Lenoel Vásquez': [
    {id:'PRY-001', nombre:'Puente Choluteca',             rol:'Empleado',             estado:'Activo',        badge:'badge-success', periodo:'ene 2026 — actual'},
    {id:'PRY-004', nombre:'Escuela Rural Comayagua',      rol:'Supervisor asignado',  estado:'En revisión',   badge:'badge-warning', periodo:'mar 2026 — actual'},
    {id:'FIN-001', nombre:'Escuela Primaria La Esperanza',rol:'Supervisor',           estado:'Finalizado',    badge:'badge-success', periodo:'ene — ago 2025'},
  ],
  'José Luis Montero': [
    {id:'PRY-005', nombre:'Camino Rural Copán',           rol:'Supervisor asignado',  estado:'Activo',        badge:'badge-success', periodo:'ene 2026 — actual'},
    {id:'PRY-003', nombre:'Centro Comunitario San Pedro', rol:'Empleado',             estado:'Por finalizar', badge:'badge-info',    periodo:'nov 2025 — actual'},
  ],
  'Isaac Carranza': [
    {id:'—', nombre:'Cuenta administrativa del sistema',  rol:'Admin principal',      estado:'N/A',           badge:'badge-muted',   periodo:'—'},
  ],
};

/* ──────────────────────────────────────────────
   MENSAJES (toast) — reemplaza los alert() nativos
   ────────────────────────────────────────────── */
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

/* ──────────────────────────────────────────────
   DESACTIVAR USUARIO (con diálogo de confirmación)
   ────────────────────────────────────────────── */
let userToDeactivate = '';
function confirmarDesactivar(name){
  userToDeactivate = name;
  document.getElementById('confirm-txt').textContent = `"${name}" perderá acceso al sistema. Podrás reactivar la cuenta en cualquier momento.`;
  document.getElementById('confirm-dialog').classList.add('open');
}
function confirmar(){
  document.getElementById('confirm-dialog').classList.remove('open');
  // Mensaje de registro de la acción
  showToast(`Usuario "${userToDeactivate}" desactivado correctamente. La acción quedó registrada en la bitácora.`,'info');
}

/* ──────────────────────────────────────────────
   MODAL NUEVO / EDITAR USUARIO
   ────────────────────────────────────────────── */
let _modoEdicion = false; // en edición la foto es opcional (ya existe)

/* Abre el modal en modo CREACIÓN: limpia errores previos y enfoca
   el primer campo para poder llenar el formulario con el tabulador. */
function abrirModalNuevoUsuario(){
  _modoEdicion = false;
  FormUtils.limpiarErrores(document.getElementById('modal-usuario'));
  document.getElementById('modal-u-title').innerHTML = 'Nuevo <em style="font-style:italic">Usuario</em>';
  document.getElementById('modal-usuario').classList.add('open');
  setTimeout(()=>document.getElementById('u-nombre').focus(), 80);
}

function editarUsuario(nombre, email, rol, zona){
  _modoEdicion = true;
  FormUtils.limpiarErrores(document.getElementById('modal-usuario'));
  document.getElementById('modal-u-title').innerHTML = 'Editar <em style="font-style:italic">Usuario</em>';
  document.getElementById('u-nombre').value = nombre;
  document.getElementById('u-email').value = email;
  document.getElementById('u-rol').value = rol;
  document.getElementById('u-zona').value = zona;
  document.getElementById('modal-usuario').classList.add('open');
}

function cerrarModal(){
  document.getElementById('modal-usuario').classList.remove('open');
  FormUtils.limpiarErrores(document.getElementById('modal-usuario'));
  document.getElementById('modal-u-title').innerHTML = 'Nuevo <em style="font-style:italic">Usuario</em>';
  // Los campos se limpian al CERRAR el modal, nunca por un error de validación
  document.getElementById('u-nombre').value='';
  document.getElementById('u-cuenta').value='';
  document.getElementById('u-email').value='';
  document.getElementById('u-zona').value='';
  quitarFotoId();
  _modoEdicion = false;
}

/* Vista previa de la foto de identificación del usuario.
   Sirve como comprobación visual de que la cuenta corresponde
   a la persona real. Obligatoria al crear un usuario nuevo. */
function previsualizarFotoId(input){
  const file = input.files && input.files[0];
  if(!file) return;
  if(!file.type.startsWith('image/')){
    showToast('La foto de identificación debe ser una imagen (JPG o PNG).','warning');
    input.value='';
    return;
  }
  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById('foto-id-img').src = e.target.result;
    document.getElementById('foto-id-wrap').style.display='flex';
    document.getElementById('foto-id-drop').style.display='none';
    const err = document.getElementById('foto-id-error');
    if(err) err.style.display='none';
  };
  reader.readAsDataURL(file);
}

function quitarFotoId(){
  const input = document.getElementById('u-foto');
  if(input) input.value='';
  const wrap = document.getElementById('foto-id-wrap');
  if(wrap) wrap.style.display='none';
  const drop = document.getElementById('foto-id-drop');
  if(drop) drop.style.display='block';
}

/* Guarda el usuario. El botón siempre está habilitado (opción 2):
   al presionarlo se muestran los errores de los campos obligatorios
   que falten y los datos escritos se conservan. */
function guardarUsuario(){
  let errores = FormUtils.validar([
    {id:'u-nombre', msg:'El nombre completo es obligatorio.'},
    {id:'u-cuenta', msg:'El número de cuenta es obligatorio.'},
    {id:'u-email',  msg:'Ingresa un correo institucional válido (ej. usuario@pronaders.gob.hn).', cond:v=>FormUtils.emailValido(v)},
    {id:'u-zona',   msg:'Indica la zona o cargo del usuario.'},
  ]);

  // Foto de identificación obligatoria al CREAR (opcional al editar)
  const tieneFoto = document.getElementById('u-foto').files.length > 0;
  if(!_modoEdicion && !tieneFoto){
    const err = document.getElementById('foto-id-error');
    if(err) err.style.display='flex';
    errores++;
  }

  if(errores){
    showToast(`No se pudo guardar: hay ${errores} campo(s) obligatorio(s) con errores.`,'warning');
    return; // Los datos permanecen para su corrección
  }

  const nombre = document.getElementById('u-nombre').value.trim();
  // Mensaje de registro exitoso
  showToast(_modoEdicion
    ? `Usuario "${nombre}" actualizado correctamente.`
    : `Usuario "${nombre}" registrado exitosamente. Se enviaron las credenciales a su correo institucional.`,'success');
  cerrarModal();
}

/* ──────────────────────────────────────────────
   VER PROYECTOS VINCULADOS A UN USUARIO
   ────────────────────────────────────────────── */
function verProyectos(nombreUsuario){
  const proyectos = USUARIO_PROYECTOS[nombreUsuario] || [];

  // Crear el modal dinámicamente si aún no existe
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

  document.getElementById('mpu-title').innerHTML =
    `Proyectos de <em style="font-style:italic">${nombreUsuario}</em>`;

  document.getElementById('mpu-lista').innerHTML = proyectos.length
    ? proyectos.map(p=>`
      <div style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:var(--cream);border-radius:var(--radius)">
        <span class="material-symbols-rounded" style="font-size:20px;color:var(--navy)">folder_open</span>
        <div style="flex:1">
          <div style="font-size:13.5px;font-weight:500;color:var(--navy)">${p.nombre}</div>
          <div class="text-xs text-muted">${p.id} · ${p.rol} · ${p.periodo}</div>
        </div>
        <span class="badge ${p.badge}" style="font-size:10.5px">${p.estado}</span>
      </div>`).join('')
    : `<div style="text-align:center;padding:26px;color:var(--muted);font-size:13px">
        Este usuario no está vinculado a ningún proyecto actualmente.
       </div>`;

  document.getElementById('mpu-pdf').onclick = ()=> generarPDFUsuario(nombreUsuario);
  m.classList.add('open');
}

/* ──────────────────────────────────────────────
   GENERAR PDF DE PROYECTOS DE UN USUARIO
   Abre una ventana de impresión con la ficha del usuario y todos
   los proyectos en los que está o estuvo (el navegador permite
   "Guardar como PDF").
   ────────────────────────────────────────────── */
function generarPDFUsuario(nombreUsuario){
  const proyectos = USUARIO_PROYECTOS[nombreUsuario] || [];
  const fecha = new Date().toLocaleDateString('es-HN',{day:'2-digit',month:'long',year:'numeric'});

  const filas = proyectos.length
    ? proyectos.map(p=>`
      <tr>
        <td>${p.id}</td><td>${p.nombre}</td><td>${p.rol}</td>
        <td>${p.periodo}</td><td>${p.estado}</td>
      </tr>`).join('')
    : '<tr><td colspan="5" style="text-align:center;color:#888">Sin proyectos vinculados</td></tr>';

  const win = window.open('', '_blank');
  if(!win){
    showToast('El navegador bloqueó la ventana del PDF. Permite las ventanas emergentes e inténtalo de nuevo.','warning');
    return;
  }
  win.document.write(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
  <title>PRONADERS — Proyectos de ${nombreUsuario}</title>
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
    <h1>Ficha de proyectos — ${nombreUsuario}</h1>
    <div class="meta">Detalle de todos los proyectos en los que el usuario está o estuvo vinculado (${proyectos.length} en total).</div>
    <table>
      <thead><tr><th>Código</th><th>Proyecto</th><th>Rol en el proyecto</th><th>Período</th><th>Estado</th></tr></thead>
      <tbody>${filas}</tbody>
    </table>
    <div class="foot">Documento generado automáticamente por el Sistema PRONADERS. Uso interno institucional.</div>
    <script>window.onload = () => { window.print(); };<\/script>
  </body></html>`);
  win.document.close();
  showToast(`Generando PDF de proyectos de ${nombreUsuario}...`,'info');
}

/* ──────────────────────────────────────────────
   FILTROS DE LA TABLA DE USUARIOS
   ────────────────────────────────────────────── */
function aplicarFiltros() {
  const busqueda = document.getElementById('search-usuario')?.value.toLowerCase() || '';
  const rolFiltro = document.getElementById('filtro-rol')?.value || '';
  const zonaFiltro = document.getElementById('filtro-zona')?.value || '';
  const estadoFiltro = document.getElementById('filtro-estado')?.value || '';

  // El botón "Limpiar filtros" solo aparece cuando hay algún filtro aplicado
  const hayFiltros = !!(busqueda || rolFiltro || zonaFiltro || estadoFiltro);
  const btnLimpiar = document.getElementById('btn-limpiar-filtros');
  if(btnLimpiar) btnLimpiar.style.display = hayFiltros ? '' : 'none';

  const filas = document.querySelectorAll('#tabla-usuarios tr');
  let contadorVisibles = 0;

  filas.forEach(fila => {
    let mostrar = true;

    // Filtrar por búsqueda (nombre, cuenta o correo)
    if (busqueda) {
      const textoFila = fila.textContent.toLowerCase();
      if (!textoFila.includes(busqueda)) mostrar = false;
    }

    // Filtrar por rol
    if (mostrar && rolFiltro) {
      const celdaRol = fila.querySelector('td:nth-child(3)');
      if (celdaRol) {
        const textoRol = celdaRol.textContent.toLowerCase();
        if (rolFiltro === 'campo' && !textoRol.includes('sup. campo')) mostrar = false;
        if (rolFiltro === 'admin_oficina' && !textoRol.includes('admin. oficina')) mostrar = false;
      }
    }

    // Filtrar por zona
    if (mostrar && zonaFiltro) {
      const celdaZona = fila.querySelector('td:nth-child(4)');
      if (celdaZona && celdaZona.textContent.trim() !== zonaFiltro) mostrar = false;
    }

    // Filtrar por estado
    if (mostrar && estadoFiltro) {
      const celdaEstado = fila.querySelector('td:nth-child(6)');
      if (celdaEstado) {
        const textoEstado = celdaEstado.textContent.trim();
        if (estadoFiltro === 'Activo' && !textoEstado.includes('Activo')) mostrar = false;
        if (estadoFiltro === 'Inactivo' && textoEstado.includes('Activo')) mostrar = false;
      }
    }

    fila.style.display = mostrar ? '' : 'none';
    if (mostrar) contadorVisibles++;
  });

  actualizarContadorResultados(contadorVisibles);
}

// Restablece todos los filtros de la tabla
function limpiarFiltros() {
  document.getElementById('search-usuario').value = '';
  document.getElementById('filtro-rol').value = '';
  document.getElementById('filtro-zona').value = '';
  document.getElementById('filtro-estado').value = '';
  aplicarFiltros();
}

// Actualiza el texto "X de Y usuarios registrados"
function actualizarContadorResultados(visibles) {
  let contadorElemento = document.querySelector('.card-subtitle');
  if (contadorElemento) {
    const total = document.querySelectorAll('#tabla-usuarios tr').length;
    contadorElemento.textContent = `${visibles} de ${total} usuarios registrados en el sistema`;
  }
}


/* ──────────────────────────────────────────────
   ACCESO DIRECTO DESDE EL DASHBOARD
   Si el admin llegó con el botón "Nuevo Usuario" del panel,
   se abre el modal de creación directamente.
   ────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  if(sessionStorage.getItem('pron_abrir_modal_usuario') === '1'){
    sessionStorage.removeItem('pron_abrir_modal_usuario');
    setTimeout(() => abrirModalNuevoUsuario(), 150);
  }
});

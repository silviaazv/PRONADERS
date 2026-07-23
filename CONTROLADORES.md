# PRONADERS — Lista de Controladores del Sistema

Documento de referencia de los controladores (archivos JavaScript) utilizados por el
prototipo, su responsabilidad y sus funciones principales.

## Controlador compartido

| Controlador | Responsabilidad | Funciones principales |
|---|---|---|
| `shared.js` | Se carga en **todas** las páginas antes del controlador propio de cada módulo. Inyecta el sidebar y el topbar, construye la navegación según el rol en sesión (`admin_oficina`, `campo`, `empleado`, `logistica`), implementa el panel de **notificaciones** del topbar y expone las utilidades de **validación de formularios** (`FormUtils`). | `toggleNotificaciones()`, `abrirNotificacion()`, `marcarNotifsLeidas()`, `logout()`, `FormUtils.validar()`, `FormUtils.marcarInvalido()`, `FormUtils.limpiarInvalido()`, `FormUtils.limpiarErrores()`, `FormUtils.fechasValidas()`, `FormUtils.emailValido()` |

## Controladores por módulo

| Controlador | Módulo / Vista | Roles que lo usan | Funciones principales |
|---|---|---|---|
| `index.js` | Inicio de sesión | Todos | `doLogin()`, `togglePw()`, base de usuarios `USUARIOS`, envío con tecla Enter |
| `dashboard-admin.js` | Dashboard administrativo | Admin. de Oficina | (vista estática; layout desde `shared.js`) |
| `dashboard-campo.js` | Dashboard de campo | Supervisor de Campo, Empleado | Oculta accesos a reportes para el rol Empleado |
| `dashboard-logistica.js` | Dashboard de logística | Logística, Admin (acceso) | Marca `pron_vista_logistica` para abrir la vista de despachos correcta |
| `dashboard-oficina.js` | Dashboard de oficina (heredado) | — | Redirige a `dashboard-admin.html` |
| `proyectos.js` | Gestión de Proyectos / Mis Proyectos | Admin, Campo, Empleado | `renderPaginaProyectos()`, `tarjetaProyecto()`, `abrirDetalle()` (incluye **Reportes asociados**), `aplicarFiltros()`, `filtrarColabs()` (búsqueda por nombre **o rol**), `agregarColab()`, `quitarColab()`, `abrirModalNuevoProyecto()`, `validarRangoFechas()`, `mostrarEvidencia()` (evidencia de presupuesto obligatoria), `guardarProyecto()`, `cargarMunicipios()`, `showToast()` |
| `usuarios.js` | Gestión de Usuarios | Admin. de Oficina | `aplicarFiltros()`, `limpiarFiltros()`, `abrirModalNuevoUsuario()`, `editarUsuario()`, `previsualizarFotoId()` / `quitarFotoId()` (foto de identificación), `guardarUsuario()`, `confirmarDesactivar()`, `confirmar()`, `verProyectos()` (proyectos vinculados), `generarPDFUsuario()` (PDF del historial de proyectos), `showToast()` |
| `solicitudes.js` | Solicitudes de Recursos | Campo, Admin, Logística, Empleado | `renderVista()`, `renderVistaCampo()`, `renderVistaAdmin()`, `renderVistaLogistica()` (filtrada por centro de logística), `renderVistaEmpleado()`, `cardSolicitud()`, `abrirModalSol()`, `cargarProductosProveedor()`, `toggleProducto()`, `renderCarrito()`, `enviarSolicitudOficial()` (con documentos adjuntos), `proponerNecesidad()`, `abrirModalAprobar()`, `confirmarAprobacion()`, `abrirModalRechazar()`, `confirmarRechazo()`, `abrirModalDespacho()` (individual **o múltiple**), `confirmarDespacho()`, `despachosSeleccionados()`, `abrirDespachoSeleccionadas()`, `abrirModalRecepcion()`, `confirmarRecepcion()`, `mostrarArchivos()`, `showToast()` |
| `reportes.js` | Reportes de Avance | Admin (aprueba), Campo (crea) | `initReportesTabs()` (reglas por rol: empleado sin acceso, campo no aprueba, admin sin botón "Nuevo Reporte" ni ojito), `switchTab()`, `aprobar()`, `enviarReporte()`, `showToast()` |
| `proyecciones.js` | Proyecciones de Finalización | Admin, Campo, Empleado | (vista estática; layout desde `shared.js`) |
| `finalizados.js` | Proyectos Finalizados (admin) | Admin. de Oficina | `verDetalle()`, `generarPDF()` |
| `finalizados-campo.js` | Proyectos Finalizados (campo) | Campo, Empleado | `verDetalle()`, filtros de la vista |
| `bitacora.js` | Bitácora del sistema | Admin. de Oficina | Filtros y render del registro de acciones |

## Convenciones

- **Sesión:** los datos del usuario se guardan en `sessionStorage` con las claves
  `pron_role`, `pron_nombre`, `pron_cuenta`, `pron_initials`.
- **Navegación con contexto:** `pron_open_proyecto` (abrir detalle de un proyecto),
  `pron_vista_logistica` (forzar vista de despachos) y `pron_despachar`
  (abrir el modal de despacho de una solicitud específica).
- **Validación:** todos los formularios usan `FormUtils` (opción 2 acordada:
  el botón Guardar siempre está habilitado y muestra los errores de los campos
  obligatorios pendientes, sin borrar los datos ya escritos).
- **Mensajes:** cada registro exitoso (proyecto, solicitud, usuario, despacho,
  reporte) muestra un mensaje de confirmación mediante `showToast()`; los errores
  se muestran como mensajes bajo cada campo y un resumen en el toast.

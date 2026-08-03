/*
   api.js

   Único lugar del frontend que habla con el servidor. Todas las pantallas
   llaman a este objeto API en vez de usar fetch por su cuenta, así que si
   cambia una ruta o la forma de manejar los errores, se arregla aquí y no
   en diez archivos distintos.

   Este archivo debe cargarse antes que cualquier otro script de la página,
   porque los demás lo dan por hecho.
*/

const API_BASE = '/api';

// Envoltorio de fetch que hace lo aburrido siempre igual: arma la URL con el
// prefijo /api, manda el JSON y, si el servidor responde con error, lanza una
// excepción con el mensaje que él mismo envió. Gracias a eso, quien llama
// puede usar un try/catch normal en vez de andar revisando resp.ok.
async function _apiRequest(path, options = {}) {
    const resp = await fetch(API_BASE + path, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });
    let data = null;
    // Un DELETE exitoso responde 204 sin cuerpo, así que el .json() truena.
    // No es un problema: simplemente no hay nada que devolver.
    try { data = await resp.json(); } catch (e) { }
    if (!resp.ok) {
        const msg = (data && data.error) ? data.error : `Error HTTP ${resp.status}`;
        throw new Error(msg);
    }
    return data;
}

// Convierte un objeto en la cadena de consulta de la URL (?a=1&b=2). Descarta
// los valores vacíos, que es justo lo que llega cuando el usuario no eligió
// nada en un filtro; si se mandaran, el servidor filtraría por cadena vacía y
// no devolvería nada.
function _qs(params) {
    if (!params) return '';
    const entradas = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
    if (!entradas.length) return '';
    return '?' + entradas.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
}

// El objeto que usan las demás pantallas. Arriba están los cuatro verbos
// sueltos, por si hace falta pegarle a una ruta que no esté contemplada, y
// más abajo un grupo por módulo con las llamadas ya armadas.
const API = {
    get(path) { return _apiRequest(path); },
    post(path, body) { return _apiRequest(path, { method: 'POST', body: JSON.stringify(body) }); },
    put(path, body) { return _apiRequest(path, { method: 'PUT', body: JSON.stringify(body) }); },
    patch(path, body) { return _apiRequest(path, { method: 'PATCH', body: JSON.stringify(body || {}) }); },
    del(path) { return _apiRequest(path, { method: 'DELETE' }); },

    // Solicitudes de recursos. Los métodos que van con PATCH son los pasos del
    // flujo y solo se pueden dar en orden: aprobar, despachar, entregar y por
    // último confirmar la recepción.
    solicitudes: {
        listar: (params) => API.get('/solicitudes' + _qs(params)),
        filas: (id) => API.get(`/solicitudes/${id}/filas`),
        obtener: (id) => API.get(`/solicitudes/${id}`),
        crear: (datos) => API.post('/solicitudes', datos),
        aprobar: (id, datos) => API.patch(`/solicitudes/${id}/aprobar`, datos),
        rechazar: (id, datos) => API.patch(`/solicitudes/${id}/rechazar`, datos),
        despachar: (id, datos) => API.patch(`/solicitudes/${id}/despachar`, datos),
        entregar: (id, datos) => API.patch(`/solicitudes/${id}/entregar`, datos),
        confirmarRecepcion: (id, datos) => API.patch(`/solicitudes/${id}/confirmar-recepcion`, datos),
        obtenerFilas: (id) => API.get(`/solicitudes/${id}/filas`),
        obtenerEstados: () => API.get('/solicitudes/estados'),
        obtenerResumen: () => API.get('/solicitudes/resumen'),
        eliminar: (id) => API.del(`/solicitudes/${id}`),
    },

    // Cuentas del sistema. Ojo con eliminar(): en la práctica el sistema no
    // borra usuarios, los deja inactivos, para que sus registros en la bitácora
    // sigan teniendo a quién apuntar.
    usuarios: {
        listar: (params) => API.get('/usuarios' + _qs(params)),
        obtener: (id) => API.get(`/usuarios/${id}`),
        crear: (datos) => API.post('/usuarios', datos),
        actualizar: (id, datos) => API.put(`/usuarios/${id}`, datos),
        eliminar: (id) => API.del(`/usuarios/${id}`),
    },

    // Proyectos. finalizar() y cancelar() son definitivos: una vez que un
    // proyecto pasa por cualquiera de los dos, ya no se puede volver a editar
    // ni reactivar.
    proyectos: {
        listar: (params) => API.get('/proyectos' + _qs(params)),
        obtener: (id) => API.get(`/proyectos/${id}`),
        crear: (datos) => API.post('/proyectos', datos),
        actualizar: (id, datos) => API.put(`/proyectos/${id}`, datos),
        finalizar: (id, datos) => API.patch(`/proyectos/${id}/finalizar`, datos),  
        cancelar: (id, datos) => API.patch(`/proyectos/${id}/cancelar`, datos),
        eliminar: (id) => API.del(`/proyectos/${id}`),
        obtenerEstados: () => API.get('/proyectos/estados'),
        obtenerResumen: () => API.get('/proyectos/resumen'),
    },

    // Quién trabaja en qué proyecto. Es la tabla intermedia entre proyectos y
    // usuarios, y es la que decide qué proyectos ve cada supervisor de campo
    // cuando entra al sistema.
    proyectosUsuarios: {
        listar: (params) => API.get('/proyectos-usuarios' + _qs(params)),
        asignar: (datos) => API.post('/proyectos-usuarios', datos),
        desasignar: (params) => API.del('/proyectos-usuarios' + _qs(params)),
    },

    // Reportes de avance que manda campo y revisa oficina. Un reporte
    // rechazado no se borra: se queda con ese estado para que quede el
    // antecedente de por qué no pasó.
    reportes: {
        listar: (params) => API.get('/reportes' + _qs(params)),
        obtener: (id) => API.get(`/reportes/${id}`),
        crear: (datos) => API.post('/reportes', datos),
        aprobar: (id, datos) => API.patch(`/reportes/${id}/aprobar`, datos),
        rechazar: (id, datos) => API.patch(`/reportes/${id}/rechazar`, datos),
        eliminar: (id) => API.del(`/reportes/${id}`),
    },

    // Equipos de logística. A cada solicitud aprobada se le asigna uno, y ese
    // equipo es el que después la ve en su bandeja de despachos pendientes.
    equipos: {
        listar: () => API.get('/equipos'),
        obtener: (id) => API.get(`/equipos/${id}`),
        crear: (datos) => API.post('/equipos', datos),
        actualizar: (id, datos) => API.put(`/equipos/${id}`, datos),
        eliminar: (id) => API.del(`/equipos/${id}`),
    },

    // Roles del sistema. Definen qué opciones del menú ve cada quien y a qué
    // pantallas puede entrar.
    roles: {
        listar: () => API.get('/roles'),
        obtener: (id) => API.get(`/roles/${id}`),
        crear: (datos) => API.post('/roles', datos),
        actualizar: (id, datos) => API.put(`/roles/${id}`, datos),
        eliminar: (id) => API.del(`/roles/${id}`),
    },

    // Departamentos de Honduras. Es un catálogo fijo que casi no cambia; se
    // usa para armar la lista desplegable de ubicación de los proyectos.
    departamentos: {
        listar: () => API.get('/departamentos'),
        obtener: (id) => API.get(`/departamentos/${id}`),
        crear: (datos) => API.post('/departamentos', datos),
        actualizar: (id, datos) => API.put(`/departamentos/${id}`, datos),
        eliminar: (id) => API.del(`/departamentos/${id}`),
    },

    // Municipios. listar() acepta el id del departamento como parámetro,
    // porque la lista se carga recién cuando el usuario elige uno: son
    // demasiados para traerlos todos de una vez.
    municipios: {
        listar: (params) => API.get('/municipios' + _qs(params)),
        obtener: (id) => API.get(`/municipios/${id}`),
        crear: (datos) => API.post('/municipios', datos),
        actualizar: (id, datos) => API.put(`/municipios/${id}`, datos),
        eliminar: (id) => API.del(`/municipios/${id}`),
    },

    // Bitácora. Es solo de lectura a propósito: los registros los escribe el
    // servidor solo cuando ocurre una acción, y nadie puede modificarlos ni
    // borrarlos desde el frontend.
    bitacora: {
        listar: (params) => API.get('/bitacora' + _qs(params)),
        obtener: (id) => API.get(`/bitacora/${id}`),
        filtrar: (params) => API.get('/bitacora/filtrar' + _qs(params)),
        exportar: (params) => API.get('/bitacora/exportar' + _qs(params)),
    },

    // Documentos y fotos que respaldan solicitudes y reportes.
    archivos: {
        listar: (params) => API.get('/archivos' + _qs(params)),
        // El archivo viaja convertido a base64 dentro del JSON, en el campo
        // 'contenido_base64'. Es más simple que armar un multipart, pero infla
        // el peso alrededor de un tercio, así que no sirve para archivos grandes.
        subir: (datos) => API.post('/archivos', datos),
        descargar: (id) => API.get(`/archivos/${id}/descargar`),
        eliminar: (id) => API.del(`/archivos/${id}`),
    },

    // Números ya sumados para las tarjetas de los tableros. Se calculan en el
    // servidor para no tener que descargar todos los registros solo para
    // contarlos aquí.
    dashboard: {
        resumen: () => API.get('/dashboard/resumen'),
        metricas: () => API.get('/dashboard/metricas'),
        actividadReciente: () => API.get('/dashboard/actividad-reciente'),
    },

    // Inicio y cierre de sesión. Aviso: la pantalla de login todavía no usa
    // esto, llama directo a /api/usuarios/login desde index.js.
    auth: {
        login: (credenciales) => API.post('/auth/login', credenciales),
        logout: () => API.post('/auth/logout'),
        verificar: () => API.get('/auth/verificar'),
        cambiarContrasena: (datos) => API.post('/auth/cambiar-contrasena', datos),
        recuperarContrasena: (email) => API.post('/auth/recuperar-contrasena', { email }),
    },

    // Estimación de cuándo terminaría cada proyecto según el ritmo que trae.
    // El cálculo lo hace el servidor.
    proyecciones: {
        calcular: (params) => API.get('/proyecciones/calcular' + _qs(params)),
        proyecto: (id) => API.get(`/proyecciones/proyecto/${id}`),
    },
};

// Se cuelga en window para que el resto de los scripts lo tengan disponible
// sin importar en qué orden se carguen después de este.
// Se cuelga en window para que el resto de los scripts lo tengan disponible
// sin importar en qué orden se carguen después de este.
window.API = API;
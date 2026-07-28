/* ============================================================
   api.js — CAPA COMPARTIDA DE ACCESO A LA API 
   ============================================================ */

const API_BASE = '/api';

async function _apiRequest(path, options = {}) {
    const resp = await fetch(API_BASE + path, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });
    let data = null;
    try { data = await resp.json(); } catch (e) { /* respuestas 204 no traen body */ }
    if (!resp.ok) {
        const msg = (data && data.error) ? data.error : `Error HTTP ${resp.status}`;
        throw new Error(msg);
    }
    return data;
}

function _qs(params) {
    if (!params) return '';
    const entradas = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
    if (!entradas.length) return '';
    return '?' + entradas.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
}

const API = {
    get(path) { return _apiRequest(path); },
    post(path, body) { return _apiRequest(path, { method: 'POST', body: JSON.stringify(body) }); },
    put(path, body) { return _apiRequest(path, { method: 'PUT', body: JSON.stringify(body) }); },
    patch(path, body) { return _apiRequest(path, { method: 'PATCH', body: JSON.stringify(body || {}) }); },
    del(path) { return _apiRequest(path, { method: 'DELETE' }); },

    // ============================================================
    // MÓDULO: SOLICITUDES
    // ============================================================
    solicitudes: {
        listar: (params) => API.get('/solicitudes' + _qs(params)),
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

    // ============================================================
    // MÓDULO: USUARIOS
    // ============================================================
    usuarios: {
        listar: (params) => API.get('/usuarios' + _qs(params)),
        obtener: (id) => API.get(`/usuarios/${id}`),
        crear: (datos) => API.post('/usuarios', datos),
        actualizar: (id, datos) => API.put(`/usuarios/${id}`, datos),
        eliminar: (id) => API.del(`/usuarios/${id}`),
    },

    // ============================================================
    // MÓDULO: PROYECTOS
    // ============================================================
    proyectos: {
        listar: (params) => API.get('/proyectos' + _qs(params)),
        obtener: (id) => API.get(`/proyectos/${id}`),
        crear: (datos) => API.post('/proyectos', datos),
        actualizar: (id, datos) => API.put(`/proyectos/${id}`, datos),
        eliminar: (id) => API.del(`/proyectos/${id}`),
        obtenerEstados: () => API.get('/proyectos/estados'),
        obtenerResumen: () => API.get('/proyectos/resumen'),
    },

    // ============================================================
    // MÓDULO: PROYECTOS-USUARIOS (relación)
    // ============================================================
    proyectosUsuarios: {
        listar: (params) => API.get('/proyectos-usuarios' + _qs(params)),
        asignar: (datos) => API.post('/proyectos-usuarios', datos),
        desasignar: (params) => API.del('/proyectos-usuarios' + _qs(params)),
    },

    // ============================================================
    // MÓDULO: REPORTES
    // ============================================================
    reportes: {
        listar: (params) => API.get('/reportes' + _qs(params)),
        obtener: (id) => API.get(`/reportes/${id}`),
        crear: (datos) => API.post('/reportes', datos),
        aprobar: (id, datos) => API.patch(`/reportes/${id}/aprobar`, datos),
        eliminar: (id) => API.del(`/reportes/${id}`),
    },

    // ============================================================
    // MÓDULO: EQUIPOS LOGÍSTICOS
    // ============================================================
    equipos: {
        listar: () => API.get('/equipos'),
        obtener: (id) => API.get(`/equipos/${id}`),
        crear: (datos) => API.post('/equipos', datos),
        actualizar: (id, datos) => API.put(`/equipos/${id}`, datos),
        eliminar: (id) => API.del(`/equipos/${id}`),
    },

    // ============================================================
    // MÓDULO: ROLES
    // ============================================================
    roles: {
        listar: () => API.get('/roles'),
        obtener: (id) => API.get(`/roles/${id}`),
        crear: (datos) => API.post('/roles', datos),
        actualizar: (id, datos) => API.put(`/roles/${id}`, datos),
        eliminar: (id) => API.del(`/roles/${id}`),
    },

    // ============================================================
    // MÓDULO: DEPARTAMENTOS
    // ============================================================
    departamentos: {
        listar: () => API.get('/departamentos'),
        obtener: (id) => API.get(`/departamentos/${id}`),
        crear: (datos) => API.post('/departamentos', datos),
        actualizar: (id, datos) => API.put(`/departamentos/${id}`, datos),
        eliminar: (id) => API.del(`/departamentos/${id}`),
    },

    // ============================================================
    // MÓDULO: MUNICIPIOS
    // ============================================================
    municipios: {
        listar: (params) => API.get('/municipios' + _qs(params)),
        obtener: (id) => API.get(`/municipios/${id}`),
        crear: (datos) => API.post('/municipios', datos),
        actualizar: (id, datos) => API.put(`/municipios/${id}`, datos),
        eliminar: (id) => API.del(`/municipios/${id}`),
    },

    // ============================================================
    // MÓDULO: BITÁCORA / AUDITORÍA
    // ============================================================
    bitacora: {
        listar: (params) => API.get('/bitacora' + _qs(params)),
        obtener: (id) => API.get(`/bitacora/${id}`),
        filtrar: (params) => API.get('/bitacora/filtrar' + _qs(params)),
        exportar: (params) => API.get('/bitacora/exportar' + _qs(params)),
    },

    // ============================================================
    // MÓDULO: ARCHIVOS (evidencias)
    // ============================================================
    archivos: {
        listar: (params) => API.get('/archivos' + _qs(params)),
        subir: (formData) => {
            return fetch(API_BASE + '/archivos', {
                method: 'POST',
                body: formData,
            }).then(resp => resp.json());
        },
        descargar: (id) => API.get(`/archivos/${id}/descargar`),
        eliminar: (id) => API.del(`/archivos/${id}`),
    },

    // ============================================================
    // MÓDULO: DASHBOARD (resúmenes)
    // ============================================================
    dashboard: {
        resumen: () => API.get('/dashboard/resumen'),
        metricas: () => API.get('/dashboard/metricas'),
        actividadReciente: () => API.get('/dashboard/actividad-reciente'),
    },

    // ============================================================
    // MÓDULO: AUTENTICACIÓN
    // ============================================================
    auth: {
        login: (credenciales) => API.post('/auth/login', credenciales),
        logout: () => API.post('/auth/logout'),
        verificar: () => API.get('/auth/verificar'),
        cambiarContrasena: (datos) => API.post('/auth/cambiar-contrasena', datos),
        recuperarContrasena: (email) => API.post('/auth/recuperar-contrasena', { email }),
    },

    // ============================================================
    // MÓDULO: PROYECCIONES (cálculos en backend)
    // ============================================================
    proyecciones: {
        calcular: (params) => API.get('/proyecciones/calcular' + _qs(params)),
        proyecto: (id) => API.get(`/proyecciones/proyecto/${id}`),
    },
};

window.API = API;
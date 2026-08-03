/*
   proyecciones.js

   Estima cuándo va a terminar cada proyecto según el ritmo que trae, y avisa
   cuáles se están atrasando respecto a la fecha planificada.

   El cálculo se hace en el navegador con los proyectos y los reportes de
   avance que ya se descargaron. Es una regla de tres simple: si en tantos
   días se llegó a tanto por ciento, a ese mismo ritmo el 100% cae en tal
   fecha. No pretende ser exacto, sirve para detectar a tiempo los proyectos
   que se están quedando atrás.

   El menú lateral, la barra superior, las notificaciones y las validaciones
   los pone shared.js, que se carga antes.
*/

// Los datos descargados y el resultado del cálculo. Se guardan acá para que
// ordenar o filtrar la lista no obligue a rehacer las cuentas.

let proyectosCache = [];
let reportesCache = [];
let usuariosCache = [];
let usuariosMap = {};
let proyeccionesData = [];

// Datos de quien está usando la pantalla. El rol decide cuánto se ve: el
// administrador ve todos los proyectos y el supervisor de campo solamente los
// suyos (ver el filtro en renderizarProyecciones).
const ID_USUARIO = parseInt(sessionStorage.getItem('pron_id_usuario')) || null;
const NOMBRE_USUARIO = sessionStorage.getItem('pron_nombre') || 'Usuario';
const ROLE = sessionStorage.getItem('pron_role') || 'campo';
const ES_ADMIN = (ROLE === 'Administrador de Oficina');
// Arranque de la pantalla.

document.addEventListener('DOMContentLoaded', async () => {
    await cargarDatosYCalcular();
});

async function cargarDatosYCalcular() {
    try {
        mostrarLoading(true);

        // Las tres consultas van juntas porque ninguna depende de la otra.
        // Los usuarios se piden solo para poder mostrar el nombre del
        // supervisor, ya que el proyecto trae únicamente su id.
        const [proyectos, reportes, usuarios] = await Promise.all([
            API.proyectos.listar(),
            API.reportes.listar(),
            API.usuarios.listar()
        ]);

        proyectosCache = proyectos || [];
        reportesCache = reportes || [];
        usuariosCache = usuarios || [];
        usuariosMap = Object.fromEntries(usuariosCache.map(u => [u.id_usuario, u]));

        // Recién ahora se puede calcular: sin los reportes no hay forma de
        // saber a qué ritmo va cada proyecto.
        calcularProyecciones();
        renderizarProyecciones();

        mostrarLoading(false);
    } catch (error) {
        console.error('Error cargando datos:', error);
        showToast('Error al cargar los datos', 'warning');
        mostrarLoading(false);
        mostrarError();
    }
}

/* El cálculo de la proyección, proyecto por proyecto.

   La idea es sencilla: se mira cuánto se avanzó desde que empezó el proyecto,
   se saca cuánto se avanza por día y con eso se estima cuántos días faltan
   para llegar al 100%. Después se compara esa fecha con la que estaba
   planificada para saber si va adelantado, a tiempo o atrasado.

   Es una estimación lineal, o sea que da por hecho que el ritmo se mantiene
   igual hasta el final. En la realidad casi nunca es así (las lluvias, la
   falta de material), pero alcanza de sobra para prender la alerta temprano. */

function calcularProyecciones() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Solo tiene sentido proyectar lo que sigue en marcha. Los finalizados y
    // los cancelados ya no van a avanzar más, así que se dejan afuera.
    const proyectosActivos = proyectosCache.filter(p =>
        p.estado_proyecto === 'ACTIVO' 
        || p.estado_proyecto === 'RETRASADO' 
    );

    proyeccionesData = proyectosActivos.map(p => {
        // Los reportes del proyecto, ordenados del más viejo al más nuevo,
        // para poder quedarse con el último.
        const reportesProyecto = reportesCache.filter(r => r.id_proyecto === p.id_proyecto)
            .sort((a, b) => new Date(a.fecha_reporte) - new Date(b.fecha_reporte));

        // Solo interesa el último reporte: ahí está el avance más actualizado.
        const ultimoReporte = reportesProyecto.length > 0
            ? reportesProyecto[reportesProyecto.length - 1]
            : null;

        // El avance sale del último reporte de campo, que es el dato más
        // confiable porque lo mide alguien parado en la obra.
        let avanceActual = 0;
        if (ultimoReporte) {
            avanceActual = ultimoReporte.avance_fisico || 0;
        } else {
            // Proyecto recién arrancado, sin ningún reporte todavía. Se usa
            // como aproximación cuánto se lleva gastado del presupuesto. No
            // es lo mismo (se puede haber gastado sin construir nada), pero es
            // mejor que mostrar cero.
            if (p.presupuesto_inicial > 0) {
                avanceActual = Math.min(Math.round((p.presupuesto_ejecutado / p.presupuesto_inicial) * 100), 100);
            }
        }

        // Se le pega 'T00:00:00' a la fecha para que el navegador la lea como
        // hora local. Sin eso la interpreta como UTC y, con el huso de
        // Honduras, el día se corre uno hacia atrás.
        const fechaInicio = p.fecha_inicio ? new Date(p.fecha_inicio + 'T00:00:00') : hoy;

        // Días desde que arrancó. El mínimo de 1 evita dividir entre cero en
        // los proyectos que empezaron hoy mismo.
        const diasTranscurridos = Math.max(1, Math.round((hoy - fechaInicio) / (1000 * 60 * 60 * 24)));

        // Cuántos puntos porcentuales se avanzan por día. Este es el número
        // del que sale toda la proyección.
        const tasaDiaria = avanceActual / diasTranscurridos;

        // Cuánto falta para el 100% a ese mismo ritmo.
        let diasRestantes = 0;
        if (tasaDiaria > 0) {
            diasRestantes = Math.max(0, (100 - avanceActual) / tasaDiaria);
        } else {
            // Sin nada de avance no se puede proyectar: a ritmo cero el
            // proyecto no termina nunca. Se pone 999 días como valor tope para
            // que la tarjeta muestre algo y quede claro que está detenido.
            diasRestantes = 999;
        }

        // Fecha fin proyectada
        const fechaFinProyectada = new Date(hoy);
        fechaFinProyectada.setDate(fechaFinProyectada.getDate() + Math.round(diasRestantes));

        // Fecha fin planificada
        const fechaFinPlanificada = p.fecha_fin ? new Date(p.fecha_fin + 'T00:00:00') : null;

        // Comparación con lo planificado. La variación en positivo son días de
        // retraso y en negativo días de adelanto. Se deja un margen de cinco
        // días para cada lado antes de dar la alerta, porque con una
        // estimación así de simple una diferencia de dos o tres días no
        // significa nada.
        let variacionDias = null;
        let estadoProyeccion = 'on_time';
        let mensajeProyeccion = '';

        if (fechaFinPlanificada) {
            variacionDias = Math.round((fechaFinProyectada - fechaFinPlanificada) / (1000 * 60 * 60 * 24));

            if (variacionDias > 5) {
                estadoProyeccion = 'retraso';
                mensajeProyeccion = `Retraso estimado de ${variacionDias} días. Se recomienda revisar el ritmo de trabajo.`;
            } else if (variacionDias < -5) {
                estadoProyeccion = 'adelanto';
                mensajeProyeccion = `El proyecto avanza a buen ritmo. Se estima finalización ${Math.abs(variacionDias)} días antes de lo planificado.`;
            } else if (variacionDias >= -5 && variacionDias <= 5) {
                estadoProyeccion = 'on_time';
                mensajeProyeccion = `Proyecto dentro del tiempo estimado. Quedan aprox. ${Math.round(diasRestantes)} días de trabajo.`;
            }

            // Pasado el 95% la proyección deja de ser útil: lo que queda son
            // detalles de cierre que no siguen el ritmo del resto de la obra.
            // Se muestra un estado propio en vez de un retraso que asuste sin
            // motivo.
            if (avanceActual >= 95) {
                mensajeProyeccion = 'Proyecto muy cerca de su finalización. ¡Últimos detalles!';
                estadoProyeccion = 'finalizando';
            }
        } else {
            mensajeProyeccion = `No hay fecha de fin planificada. Estimación: ${Math.round(diasRestantes)} días restantes.`;
        }

        // Las fechas se dejan ya formateadas acá para que la parte que dibuja
        // las tarjetas no tenga que preocuparse por eso.
        const fechaInicioStr = fechaInicio.toLocaleDateString('es-HN', {
            day: '2-digit', month: 'short', year: 'numeric'
        });

        const fechaFinPlanStr = fechaFinPlanificada
            ? fechaFinPlanificada.toLocaleDateString('es-HN', {
                day: '2-digit', month: 'short', year: 'numeric'
            })
            : 'No definida';

        const fechaFinProyStr = fechaFinProyectada.toLocaleDateString('es-HN', {
            day: '2-digit', month: 'short', year: 'numeric'
        });

        // Cada tipo de proyecto lleva su color de etiqueta. Si aparece uno que
        // no está en la lista se usa el gris neutro.
        const tipoColor = {
            'INFRAESTRUCTURA': 'badge-info',
            'AGRICOLA': 'badge-success',
            'SOCIAL': 'badge-warning'
        }[p.tipo_proyecto] || 'badge-muted';

        return {
            id: p.id_proyecto,
            idSupervisor: p.id_supervisor,
            nombre: p.nombre_proyecto || 'Sin nombre',
            tipo: p.tipo_proyecto || 'Sin tipo',
            tipoBadge: tipoColor,
            supervisor: usuariosMap[p.id_supervisor]?.nombre_usuario || 'Sin supervisor',
            fechaInicio: fechaInicioStr,
            fechaFinPlan: fechaFinPlanStr,
            fechaFinProy: fechaFinProyStr,
            avanceActual: avanceActual,
            diasTranscurridos: diasTranscurridos,
            tasaDiaria: tasaDiaria,
            diasRestantes: Math.round(diasRestantes),
            variacionDias: variacionDias,
            estado: estadoProyeccion,
            mensaje: mensajeProyeccion,
            ultimoReporte: ultimoReporte,
            totalReportes: reportesProyecto.length
        };
    });
}

// Dibujado de la pantalla a partir de las proyecciones ya calculadas.

function renderizarProyecciones() {
    const container = document.getElementById('proyecciones-content');
    const hoy = new Date().toLocaleDateString('es-HN', {
        day: '2-digit', month: 'short', year: 'numeric'
    });

    // El administrador ve todo; los demás solo los proyectos donde figuran
    // como supervisor.
    let data = proyeccionesData;
    if (!ES_ADMIN) {
    data = data.filter(p => p.idSupervisor === ID_USUARIO);
    }   

    // Los atrasados salen primero porque son los que necesitan que alguien
    // haga algo; los que van bien pueden esperar hasta el final de la lista.
    const ordenEstado = { 'retraso': 0, 'on_time': 1, 'adelanto': 2, 'finalizando': 3 };
    data.sort((a, b) => (ordenEstado[a.estado] || 99) - (ordenEstado[b.estado] || 99));

    if (data.length === 0) {
        container.innerHTML = `
            <div class="flex-between mb-24 fade-up fade-up-1">
                <div class="section-head" style="margin-bottom:0">
                    <h2>Proyecciones de <em style="font-style:italic">Finalización</em></h2>
                    <p>Estimaciones automáticas basadas en el ritmo de avance registrado</p>
                </div>
            </div>
            <div class="card" style="text-align:center;padding:60px;color:var(--muted)">
                <span class="material-symbols-rounded" style="font-size:48px;display:block;margin-bottom:16px;color:var(--cream-dark)">query_stats</span>
                <h3 style="font-weight:400;margin-bottom:8px">No hay proyectos con proyecciones</h3>
                <p style="font-size:13px">Los proyectos necesitan al menos un reporte de avance para generar proyecciones.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="flex-between mb-24 fade-up fade-up-1">
            <div class="section-head" style="margin-bottom:0">
                <h2>Proyecciones de <em style="font-style:italic">Finalización</em></h2>
                <p>Estimaciones automáticas basadas en el ritmo de avance registrado</p>
            </div>
            <div style="background:var(--info-bg);border-radius:var(--radius);padding:10px 16px;font-size:12.5px;color:var(--info);display:flex;align-items:center;gap:8px;">
                <span class="material-symbols-rounded" style="font-size:16px">info</span>
                Calculado al: ${hoy}
            </div>
        </div>

        <!-- FÓRMULA -->
        <div class="card mb-24 fade-up fade-up-1" style="border-left:3px solid var(--gold);background:linear-gradient(135deg,#fffdf8,var(--white))">
            <div class="flex-between">
                <div>
                    <div class="card-title">Fórmula de Proyección Automática</div>
                    <div class="card-subtitle">Aplicada a cada reporte de avance registrado</div>
                </div>
                <span class="material-symbols-rounded" style="font-size:32px;color:var(--cream-dark)">functions</span>
            </div>
            <div style="margin-top:14px;display:flex;gap:24px;flex-wrap:wrap">
                <div style="font-family:monospace;background:var(--cream);border-radius:8px;padding:12px 18px;font-size:13px;color:var(--navy)">
                    <span style="color:var(--muted)">tasa_diaria</span> = % avance / días transcurridos<br>
                    <span style="color:var(--muted)">días_restantes</span> = (100 − % avance) / tasa_diaria<br>
                    <span style="color:var(--muted)">fecha_fin_proyectada</span> = hoy + días_restantes<br>
                    <span style="color:var(--muted)">variación</span> = fecha_fin_proyectada − fecha_fin_plan
                </div>
            </div>
        </div>

        <!-- PROYECCIONES -->
        <div style="display:flex;flex-direction:column;gap:20px;">
            ${data.map(p => renderCardProyeccion(p)).join('')}
        </div>
    `;
}

// Tarjeta de un proyecto: avance, fechas y el mensaje de la proyección.

function renderCardProyeccion(p) {
    const estadoConfig = {
        'retraso': {
            bg: 'var(--danger-bg)',
            color: 'var(--danger)',
            icon: 'trending_down',
            label: 'Retraso'
        },
        'adelanto': {
            bg: 'var(--success-bg)',
            color: 'var(--success)',
            icon: 'trending_up',
            label: 'Adelanto'
        },
        'on_time': {
            bg: 'var(--info-bg)',
            color: 'var(--info)',
            icon: 'check_circle',
            label: 'En tiempo'
        },
        'finalizando': {
            bg: 'var(--success-bg)',
            color: 'var(--success)',
            icon: 'celebration',
            label: 'Finalizando'
        }
    };

    const estado = estadoConfig[p.estado] || estadoConfig['on_time'];

    // La barra cambia de color según lo avanzado: verde de 75% para arriba,
    // dorado entre 40 y 75, y rojo abajo de 40.
    const progressColor = p.avanceActual >= 75 ? 'success' : p.avanceActual >= 40 ? 'gold' : 'danger';

    // Renglón con los días de adelanto o retraso. Se omite cuando el proyecto
    // no tiene fecha de fin planificada, porque en ese caso no hay contra qué
    // comparar.
    let variacionHtml = '';
    if (p.variacionDias !== null) {
        if (p.variacionDias > 5) {
            variacionHtml = `
                <div style="color:var(--danger);font-size:12px;margin-top:2px;display:flex;align-items:center;gap:4px;justify-content:flex-end">
                    <span class="material-symbols-rounded" style="font-size:14px">trending_down</span>
                    ${p.variacionDias} días de retraso
                </div>
            `;
        } else if (p.variacionDias < -5) {
            variacionHtml = `
                <div style="color:var(--success);font-size:12px;margin-top:2px;display:flex;align-items:center;gap:4px;justify-content:flex-end">
                    <span class="material-symbols-rounded" style="font-size:14px">trending_up</span>
                    ${Math.abs(p.variacionDias)} días de adelanto
                </div>
            `;
        } else {
            variacionHtml = `
                <div style="color:var(--gold);font-size:12px;margin-top:2px;display:flex;align-items:center;gap:4px;justify-content:flex-end">
                    <span class="material-symbols-rounded" style="font-size:14px">check</span>
                    En tiempo estimado
                </div>
            `;
        }
    }

    return `
        <div class="proj-card fade-up">
            <div class="flex-between mb-16">
                <div>
                    <span class="badge ${p.tipoBadge} mb-8" style="display:inline-flex">${p.tipo}</span>
                    <div style="font-size:16px;font-weight:600;">${p.nombre}</div>
                    <div class="text-xs text-muted mt-4">
                        Supervisor: ${p.supervisor} · Inicio: ${p.fechaInicio}
                        ${p.totalReportes > 0 ? ` · ${p.totalReportes} reporte${p.totalReportes > 1 ? 's' : ''}` : ' · Sin reportes'}
                    </div>
                </div>
                <div style="text-align:right">
                    <div class="text-xs text-muted">Fecha fin planificada</div>
                    <div class="fw-600" style="font-size:15px">${p.fechaFinPlan}</div>
                    ${variacionHtml}
                </div>
            </div>

            <div class="stat-grid">
                <div class="stat-box">
                    <div class="val">${p.avanceActual}%</div>
                    <div class="lbl">Avance actual</div>
                </div>
                <div class="stat-box">
                    <div class="val">${p.diasTranscurridos}</div>
                    <div class="lbl">Días transcurridos</div>
                </div>
                <div class="stat-box">
                    <div class="val">${p.tasaDiaria.toFixed(2)}%</div>
                    <div class="lbl">Tasa diaria</div>
                </div>
                <div class="stat-box">
                    <div class="val">${p.diasRestantes}</div>
                    <div class="lbl">Días restantes estimados</div>
                </div>
            </div>

            <div class="timeline-bar">
                <div class="tl-fill" style="width:${Math.min(p.avanceActual, 100)}%;background:linear-gradient(90deg, ${p.avanceActual >= 75 ? 'var(--success)' : p.avanceActual >= 40 ? 'var(--gold)' : 'var(--danger)'}, ${p.avanceActual >= 75 ? '#52c4a0' : p.avanceActual >= 40 ? 'var(--gold-light)' : '#e88080'})">
                    <div class="tl-marker" style="right:0;border-color:${p.avanceActual >= 75 ? 'var(--success)' : p.avanceActual >= 40 ? 'var(--gold)' : 'var(--danger)'}"></div>
                </div>
            </div>

            <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-top:4px">
                <span>${p.fechaInicio}</span>
                <span style="font-weight:600;color:var(--navy)">Proyección: ${p.fechaFinProy}</span>
                <span>${p.fechaFinPlan}</span>
            </div>

            <div style="margin-top:14px;background:${estado.bg};border-radius:8px;padding:10px 14px;font-size:12.5px;color:${estado.color};display:flex;align-items:center;gap:8px;">
                <span class="material-symbols-rounded" style="font-size:16px">${estado.icon}</span>
                ${p.mensaje}
            </div>
        </div>
    `;
}

// Utilidades chicas: el spinner de carga y el mensaje de error.

function mostrarLoading(show) {
    const container = document.getElementById('proyecciones-content');
    if (show) {
        container.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Calculando proyecciones...</p>
            </div>
        `;
    }
}

function mostrarError() {
    const container = document.getElementById('proyecciones-content');
    container.innerHTML = `
        <div class="error-container">
            <span class="material-symbols-rounded" style="font-size:48px;color:var(--danger)">error_outline</span>
            <h3>Error al cargar las proyecciones</h3>
            <p>No se pudieron obtener los datos. Verifica tu conexión e intenta nuevamente.</p>
            <button class="btn btn-gold" onclick="cargarDatosYCalcular()">
                <span class="material-symbols-rounded">refresh</span> Reintentar
            </button>
        </div>
    `;
}

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

window.cargarDatosYCalcular = cargarDatosYCalcular;
window.showToast = showToast;
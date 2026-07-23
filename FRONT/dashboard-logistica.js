/* ============================================================
   dashboard-logistica.js — DASHBOARD DEL EQUIPO DE LOGÍSTICA
   ------------------------------------------------------------
   Antes esta página era HTML estático fijo al Equipo Logístico
   Centro. Por corrección, ahora es data-driven:
   - El Admin de Oficina puede ver la logística de TODOS los
     equipos por zona (Norte/Centro/Sur/Occidente), con un
     selector de zona y métricas agregadas o filtradas.
   - El rol Logística queda bloqueado a su propio equipo (no ve
     el selector).
   - "Despachos Pendientes" muestra la información de la solicitud
     igual que en el módulo de Solicitudes (proyecto, solicitante,
     fecha, justificación, ítems Tipo/Recurso/Cantidad), pero SIN
     la sección de documentos adjuntos.
   - "Historial de Despachos" es clickeable: al hacer clic se abre
     la información de la solicitud en una TARJETA/MODAL dentro de
     esta misma página, sin cambiar de módulo.
   El sidebar, topbar y notificaciones se inyectan desde shared.js.
   ============================================================ */

// ─────────────────────────────────────────────────────────────
// DATOS DE MUESTRA — equipos de logística por zona y sus despachos
// (los IDs de solicitud coinciden con los del módulo de Solicitudes
// para mantener consistencia entre ambas vistas del sistema)
// ─────────────────────────────────────────────────────────────
const EQUIPOS_ZONA = [
  { codigo:'EQL-01', nombre:'Equipo Logístico Norte',     zona:'Zona Norte · Atlántida / Colón' },
  { codigo:'EQL-02', nombre:'Equipo Logístico Centro',    zona:'Zona Centro · Francisco Morazán / Comayagua' },
  { codigo:'EQL-03', nombre:'Equipo Logístico Sur',       zona:'Zona Sur · Choluteca / Valle' },
  { codigo:'EQL-04', nombre:'Equipo Logístico Occidente', zona:'Zona Occidente · Copán / Lempira' },
];

// Despachos APROBADOS pendientes de registrar el despacho, por equipo
const DESPACHOS_PENDIENTES = [
  { id:'SOL-2026-046', equipo:'Equipo Logístico Centro', proyecto:'Puente Choluteca', solicitante:'Isaac Carranza',
    fecha:'25 abr 2026', prioridad:'alta', justificacion:'Equipo de altura para montaje de estructura metálica.',
    items:[['Equipo','Andamio metálico 2m','6 unidades'],['Equipo','Taladro percutor 1/2"','2 unidades']],
    destino:'Puente Choluteca, Choluteca · ~180 km' },
  { id:'SOL-2026-044', equipo:'Equipo Logístico Centro', proyecto:'Riego El Paraíso', solicitante:'Isaac Carranza',
    fecha:'22 abr 2026', prioridad:'media', justificacion:'Tubería para el tramo B de la red principal.',
    items:[['Material','Tubería PVC 4" x 6m','80 unidades'],['Material','Lote de accesorios PVC','1 lote']],
    destino:'El Paraíso, El Paraíso · ~120 km' },
  { id:'SOL-2026-051', equipo:'Equipo Logístico Norte', proyecto:'Centro de Acopio La Ceiba', solicitante:'Jose Luis Montero',
    fecha:'24 abr 2026', prioridad:'media', justificacion:'Estructura metálica para el techado del centro de acopio.',
    items:[['Material','Lámina de zinc calibre 26','120 unidades'],['Material','Costanera metálica 4"','40 unidades']],
    destino:'La Ceiba, Atlántida · ~220 km' },
  { id:'SOL-2026-052', equipo:'Equipo Logístico Sur', proyecto:'Sistema de Riego Choluteca Sur', solicitante:'Carlos Costly',
    fecha:'21 abr 2026', prioridad:'baja', justificacion:'Válvulas y accesorios para la ampliación del sistema.',
    items:[['Material','Válvula de compuerta 4"','10 unidades']],
    destino:'Choluteca, Choluteca · ~15 km' },
  { id:'SOL-2026-053', equipo:'Equipo Logístico Occidente', proyecto:'Escuela Rural Copán Ruinas', solicitante:'Cristiano Ronaldo',
    fecha:'20 abr 2026', prioridad:'alta', justificacion:'Materiales de acabado final previos a la entrega del proyecto.',
    items:[['Material','Pintura acrílica blanca','30 galones'],['Material','Cerámica para piso','200 m²']],
    destino:'Copán Ruinas, Copán · ~40 km' },
];

// Despachos EN TRÁNSITO (ya registrados, pendientes de confirmación)
const EN_TRANSITO = [
  { id:'SOL-2026-035', equipo:'Equipo Logístico Occidente', proyecto:'Camino Copán', solicitante:'Jose Luis Montero',
    fecha:'10 abr 2026', fechaEntrega:'14 abr 2026', justificacion:'Material de base para pavimentación del km 0 al 4.',
    items:[['Material','Material selecto de base','120 m³']], destino:'Copán Ruinas, Copán' },
];

// Historial de despachos ya entregados/confirmados, por equipo
const HISTORIAL_DESPACHOS = [
  { id:'SOL-2026-028', equipo:'Equipo Logístico Centro', proyecto:'Riego El Paraíso', solicitante:'Isaac Carranza',
    fecha:'01 abr 2026', fechaEntrega:'05 abr 2026', estado:'confirmada',
    justificacion:'Herramientas manuales para mantenimiento del sistema de riego.',
    items:[['Equipo','Machetes','10 unidades'],['Equipo','Palas','10 unidades']] },
  { id:'SOL-2026-020', equipo:'Equipo Logístico Centro', proyecto:'Puente Choluteca', solicitante:'Isaac Carranza',
    fecha:'18 mar 2026', fechaEntrega:'25 mar 2026', estado:'confirmada',
    justificacion:'Materiales iniciales para inicio de obra.',
    items:[['Material','Bloques de concreto','500 unidades'],['Material','Arena selecta','12 m³']] },
  { id:'SOL-2026-035', equipo:'Equipo Logístico Occidente', proyecto:'Camino Copán', solicitante:'Jose Luis Montero',
    fecha:'10 abr 2026', fechaEntrega:'14 abr 2026', estado:'en_despacho',
    justificacion:'Material de base para pavimentación del km 0 al 4.',
    items:[['Material','Material selecto de base','120 m³']] },
  { id:'SOL-2026-051', equipo:'Equipo Logístico Norte', proyecto:'Centro de Acopio La Ceiba', solicitante:'Jose Luis Montero',
    fecha:'12 mar 2026', fechaEntrega:'16 mar 2026', estado:'confirmada',
    justificacion:'Primer lote de materiales para cimentación.',
    items:[['Material','Cemento Portland','80 bolsas']] },
  { id:'SOL-2026-052', equipo:'Equipo Logístico Sur', proyecto:'Sistema de Riego Choluteca Sur', solicitante:'Carlos Costly',
    fecha:'02 mar 2026', fechaEntrega:'06 mar 2026', estado:'confirmada',
    justificacion:'Tubería para la primera fase del sistema.',
    items:[['Material','Tubería PVC 3"','60 unidades']] },
];

// ─────────────────────────────────────────────────────────────
// ROL Y ZONA EN SESIÓN
// ─────────────────────────────────────────────────────────────
const ROLE_LOG = sessionStorage.getItem('pron_role') || 'logistica';
// Si el usuario es del equipo de logística, queda bloqueado a SU equipo;
// el Admin de Oficina puede ver todas las zonas (con selector).
const EQUIPO_SESION = ROLE_LOG === 'logistica'
  ? (sessionStorage.getItem('pron_nombre') || 'Equipo Logístico Centro')
  : null;

let _zonaSeleccionada = EQUIPO_SESION || ''; // '' = todas las zonas (solo admin)

/* Devuelve el badge de prioridad correspondiente */
function badgePrioridad(p){
  if(p==='alta')  return '<span style="font-size:11px;color:var(--danger);font-weight:600;display:flex;align-items:center;gap:3px"><span class="material-symbols-rounded" style="font-size:13px">priority_high</span>Alta prioridad</span>';
  if(p==='media') return '<span style="font-size:11px;color:var(--warning);font-weight:600">Prioridad media</span>';
  return '<span style="font-size:11px;color:var(--success);font-weight:600">Prioridad baja</span>';
}

/* Tabla de ítems (Tipo / Recurso / Cantidad) — igual que en Solicitudes,
   sin montos (corrección previa) y sin documentos adjuntos. */
function tablaItems(items){
  return `<div style="border:1px solid var(--cream-dark);border-radius:8px;overflow:hidden;margin-top:8px">
    <table style="width:100%;border-collapse:collapse;font-size:12px">
      <thead><tr style="background:var(--cream)">
        <th style="padding:6px 10px;text-align:left;font-size:9.5px;text-transform:uppercase;color:var(--muted)">Tipo</th>
        <th style="padding:6px 10px;text-align:left;font-size:9.5px;text-transform:uppercase;color:var(--muted)">Recurso</th>
        <th style="padding:6px 10px;text-align:left;font-size:9.5px;text-transform:uppercase;color:var(--muted)">Cantidad</th>
      </tr></thead>
      <tbody>${items.map(i=>`<tr><td style="padding:6px 10px">${i[0]}</td><td style="padding:6px 10px">${i[1]}</td><td style="padding:6px 10px">${i[2]}</td></tr>`).join('')}</tbody>
    </table>
  </div>`;
}

/* ── Tarjeta de "Despacho Pendiente": misma información que se ve en
      el módulo de Solicitudes (proyecto, solicitante, fecha, equipo,
      justificación e ítems), pero SIN documentos adjuntos. ── */
function cardPendiente(d){
  const prClase = d.prioridad==='alta' ? 'priority-high' : d.prioridad==='media' ? 'priority-med' : 'priority-low';
  return `
  <div class="despacho-card ${prClase}">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap">
      <div style="flex:1;min-width:220px">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <span style="font-size:11px;font-weight:600;color:var(--muted)">${d.id}</span>
          <span class="badge badge-dispatch"><span class="material-symbols-rounded" style="font-size:11px">local_shipping</span>Aprobado</span>
          <span class="badge badge-navy" style="font-size:10px">${d.equipo}</span>
          ${badgePrioridad(d.prioridad)}
        </div>
        <div style="font-size:15px;font-weight:600;color:var(--navy);margin-top:5px">${d.proyecto}</div>
        <div style="font-size:12px;color:var(--muted);margin-top:2px">${d.solicitante} · Emitida: ${d.fecha}</div>
        <div style="font-size:12.5px;color:var(--text-light);margin-top:8px"><strong>Justificación:</strong> ${d.justificacion}</div>
        ${tablaItems(d.items)}
        <div style="font-size:12px;color:var(--text-light);margin-top:10px;display:flex;align-items:center;gap:6px">
          <span class="material-symbols-rounded" style="font-size:14px">location_on</span>Destino: ${d.destino}
        </div>
      </div>
      <div style="text-align:right;flex-shrink:0">
        <!-- Despacha esta solicitud: abre el registro de despacho en
             el módulo de Solicitudes (acción que requiere ese flujo) -->
        <a href="solicitudes.html" class="btn btn-info btn-sm" style="text-decoration:none"
           onclick="sessionStorage.setItem('pron_vista_logistica','1');sessionStorage.setItem('pron_despachar','${d.id}')">
          <span class="material-symbols-rounded" style="font-size:14px">local_shipping</span> Despachar
        </a>
      </div>
    </div>
  </div>`;
}

/* ── Fila de "Historial de Despachos": clickeable, abre la información
      de la solicitud en un MODAL de esta misma página (sin navegar). ── */
function filaHistorial(h){
  const iconos = { confirmada:{ico:'verified',bg:'var(--success-bg)',color:'var(--success)',badge:'badge-success',label:'Confirmado'},
                   en_despacho:{ico:'local_shipping',bg:'var(--info-bg)',color:'var(--info)',badge:'',label:'En tránsito'} };
  const cfg = iconos[h.estado] || iconos.confirmada;
  const badgeHtml = h.estado==='confirmada'
    ? `<span class="badge badge-success">Confirmado</span>`
    : `<span class="badge" style="background:var(--info-bg);color:var(--info)">En tránsito</span>`;
  return `
  <div onclick="abrirInfoDespacho('${h.id}','historial')" role="button" tabindex="0"
       onkeydown="if(event.key==='Enter'){abrirInfoDespacho('${h.id}','historial')}"
       style="cursor:pointer;display:flex;align-items:center;gap:14px;padding:12px 0;border-bottom:1px solid var(--cream-dark);border-radius:8px"
       title="Ver la información de la solicitud ${h.id}"
       onmouseover="this.style.background='rgba(247,244,238,0.7)'" onmouseout="this.style.background=''">
    <div style="width:36px;height:36px;border-radius:9px;background:${cfg.bg};display:flex;align-items:center;justify-content:center;flex-shrink:0">
      <span class="material-symbols-rounded" style="font-size:17px;color:${cfg.color}">${cfg.ico}</span>
    </div>
    <div style="flex:1">
      <div style="font-size:13px;font-weight:500">${h.id} — ${h.proyecto}</div>
      <div style="font-size:11.5px;color:var(--muted)">${h.equipo} · ${h.estado==='confirmada'?'Entregado':'Despachado'} ${h.fechaEntrega}</div>
    </div>
    ${badgeHtml}
    <span class="material-symbols-rounded" style="font-size:16px;color:var(--muted)">chevron_right</span>
  </div>`;
}

/* Busca un despacho por ID en cualquiera de los tres conjuntos de datos */
function buscarDespacho(id){
  return DESPACHOS_PENDIENTES.find(x=>x.id===id)
      || EN_TRANSITO.find(x=>x.id===id)
      || HISTORIAL_DESPACHOS.find(x=>x.id===id);
}

/* Abre el modal con la información completa de la solicitud/despacho,
   SIN cambiar de módulo (permanece en el dashboard de logística). */
function abrirInfoDespacho(id){
  try {
    const d = buscarDespacho(id);
    if(!d){ console.error('[PRONADERS] Despacho no encontrado:', id); return; }
    document.getElementById('mid-titulo').textContent = d.id;
    document.getElementById('mid-body').innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px">
        <span class="badge badge-navy" style="font-size:10.5px">${d.equipo}</span>
        ${d.estado ? `<span class="badge ${d.estado==='confirmada'?'badge-success':'badge-info'}" style="font-size:10.5px">${d.estado==='confirmada'?'Confirmado':'En tránsito'}</span>` : ''}
      </div>
      <div style="font-size:17px;font-weight:600;color:var(--navy)">${d.proyecto}</div>
      <div class="text-xs" style="color:var(--muted);margin:4px 0 12px">${d.solicitante} · Emitida: ${d.fecha}${d.fechaEntrega?` · Entrega: ${d.fechaEntrega}`:''}</div>
      <div style="font-size:12.5px;color:var(--text-light)"><strong>Justificación:</strong> ${d.justificacion}</div>
      ${tablaItems(d.items)}
      ${d.destino?`<div style="font-size:12px;color:var(--text-light);margin-top:10px;display:flex;align-items:center;gap:6px">
        <span class="material-symbols-rounded" style="font-size:14px">location_on</span>Destino: ${d.destino}
      </div>`:''}`;
    document.getElementById('modal-info-despacho').classList.add('open');
  } catch(err){
    console.error('[PRONADERS] Error al abrir la información del despacho:', err);
  }
}

/* Cambia la zona seleccionada (solo disponible para el Admin de Oficina) */
function cambiarZona(valor){
  _zonaSeleccionada = valor;
  render();
}

/* ── Render principal del dashboard ── */
function render(){
  try {
    const filtro = e => !_zonaSeleccionada || e.equipo === _zonaSeleccionada;
    const pendientes = DESPACHOS_PENDIENTES.filter(filtro);
    const transito    = EN_TRANSITO.filter(filtro);
    const historial    = HISTORIAL_DESPACHOS.filter(filtro);
    const entregasMes  = historial.filter(h=>h.estado==='confirmada').length;

    const equipoInfo = EQUIPOS_ZONA.find(z=>z.nombre===_zonaSeleccionada);
    const subtitulo = EQUIPO_SESION
      ? `${EQUIPO_SESION} — ${(equipoInfo||{}).zona||''}`
      : (_zonaSeleccionada ? `${_zonaSeleccionada} — ${(equipoInfo||{}).zona||''}` : 'Vista administrativa: logística de todos los equipos, por zonas');

    // Selector de zona: visible SOLO para el Admin de Oficina (el
    // rol logística está bloqueado a su propio equipo)
    const selectorZona = EQUIPO_SESION ? '' : `
      <select class="form-control" style="width:auto;padding:8px 32px 8px 12px;font-size:13px" onchange="cambiarZona(this.value)">
        <option value="">Todos los equipos (todas las zonas)</option>
        ${EQUIPOS_ZONA.map(z=>`<option value="${z.nombre}" ${_zonaSeleccionada===z.nombre?'selected':''}>${z.codigo} — ${z.zona}</option>`).join('')}
      </select>`;

    document.getElementById('main-logistica').innerHTML = `
      <!-- HEADER -->
      <div style="margin-bottom:28px;display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap" class="fade-up">
        <div>
          <h1 style="font-family:var(--font-serif);font-size:26px;font-weight:300;color:var(--navy)">
            Panel de <em style="font-style:italic">Logística</em>
          </h1>
          <p style="font-size:13px;color:var(--muted);margin-top:4px">${subtitulo}</p>
        </div>
        ${selectorZona}
      </div>

      <!-- MÉTRICAS -->
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:28px" class="fade-up fade-up-1">
        <div class="metric-card">
          <div style="width:36px;height:36px;border-radius:9px;background:#f3e8ff;display:flex;align-items:center;justify-content:center;margin-bottom:12px">
            <span class="material-symbols-rounded" style="font-size:18px;color:#6a1b9a">assignment</span>
          </div>
          <div style="font-family:var(--font-serif);font-size:28px;font-weight:300;color:var(--navy)">${pendientes.length}</div>
          <div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.6px">Despachos pendientes</div>
        </div>
        <div class="metric-card">
          <div style="width:36px;height:36px;border-radius:9px;background:var(--info-bg);display:flex;align-items:center;justify-content:center;margin-bottom:12px">
            <span class="material-symbols-rounded" style="font-size:18px;color:var(--info)">local_shipping</span>
          </div>
          <div style="font-family:var(--font-serif);font-size:28px;font-weight:300;color:var(--navy)">${transito.length}</div>
          <div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.6px">En tránsito ahora</div>
        </div>
        <div class="metric-card">
          <div style="width:36px;height:36px;border-radius:9px;background:var(--success-bg);display:flex;align-items:center;justify-content:center;margin-bottom:12px">
            <span class="material-symbols-rounded" style="font-size:18px;color:var(--success)">inventory_2</span>
          </div>
          <div style="font-family:var(--font-serif);font-size:28px;font-weight:300;color:var(--navy)">${entregasMes}</div>
          <div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.6px">Entregas este mes</div>
        </div>
        <div class="metric-card">
          <div style="width:36px;height:36px;border-radius:9px;background:var(--warning-bg);display:flex;align-items:center;justify-content:center;margin-bottom:12px">
            <span class="material-symbols-rounded" style="font-size:18px;color:var(--warning)">schedule</span>
          </div>
          <div style="font-family:var(--font-serif);font-size:28px;font-weight:300;color:var(--navy)">1.4<span style="font-size:14px">d</span></div>
          <div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.6px">Tiempo promedio entrega</div>
        </div>
      </div>

      <!-- DESPACHOS PENDIENTES: misma información que en Solicitudes, sin adjuntos -->
      <div class="card fade-up fade-up-2" style="margin-bottom:20px">
        <div class="card-header">
          <div>
            <div class="card-title">Despachos Pendientes</div>
            <div class="card-subtitle">Solicitudes aprobadas por Gerencia Técnica${_zonaSeleccionada?` · ${_zonaSeleccionada}`:' · todas las zonas'}</div>
          </div>
          <a href="solicitudes.html" class="btn btn-info btn-sm" onclick="sessionStorage.setItem('pron_vista_logistica','1')">
            <span class="material-symbols-rounded" style="font-size:14px">open_in_new</span> Ver todas
          </a>
        </div>
        <div style="display:flex;flex-direction:column;gap:12px">
          ${pendientes.length ? pendientes.map(cardPendiente).join('') : `
          <div style="text-align:center;padding:30px;color:var(--muted)">
            <span class="material-symbols-rounded" style="font-size:32px;display:block;margin-bottom:8px;color:var(--cream-dark)">inbox</span>
            No hay despachos pendientes en esta zona.
          </div>`}
        </div>
      </div>

      <!-- HISTORIAL DE DESPACHOS: clic abre la información SIN cambiar de módulo -->
      <div class="card fade-up fade-up-3">
        <div class="card-header">
          <div>
            <div class="card-title">Historial de Despachos</div>
            <div class="card-subtitle">Últimas entregas registradas · haz clic en una fila para ver la solicitud</div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:0">
          ${historial.length ? historial.map(filaHistorial).join('') : `
          <div style="text-align:center;padding:30px;color:var(--muted)">
            <span class="material-symbols-rounded" style="font-size:32px;display:block;margin-bottom:8px;color:var(--cream-dark)">history</span>
            Sin despachos registrados en esta zona.
          </div>`}
        </div>
      </div>`;
  } catch(err){
    console.error('[PRONADERS] Error al renderizar el dashboard de logística:', err);
  }
}

// ─────────────────────────────────────────────────────────────
// INICIALIZACIÓN
// ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  try { render(); }
  catch(err){ console.error('[PRONADERS] Error al inicializar el dashboard de logística:', err); }
});

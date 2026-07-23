/* ============================================================
   proyectos.js — MÓDULO: GESTIÓN DE PROYECTOS (Admin de Oficina) / Mis Proyectos (Campo)
   El sidebar, topbar, notificaciones y utilidades de
   validación se cargan desde shared.js (incluido antes).
   ============================================================ */

const PROYECTOS = [
  {
    id:'PRY-001', nombre:'Puente Choluteca', tipo:'Infraestructura', tipoColor:'var(--info)',
    estado:'activo', estadoLabel:'Activo', estadoBadge:'badge-success',
    depto:'Choluteca', municipio:'Choluteca', presupuesto:2800000,
    presupuestoEjecutado:1708000, avance:68, inicio:'10 ene 2026', fin:'12 jul 2026',
    descripcion:'Construcción de puente vehicular de 45 metros de longitud sobre el Río Choluteca, con capacidad para 20 toneladas. Incluye obras de encauzamiento y caminos de acceso de 200 metros cada extremo.',
    supervisor:'Isaac Carranza', supervisorInitials:'IC',
    colaboradores:[
      {nombre:'Isaac Carranza',initials:'IC',rol:'Supervisor de Campo',color:'var(--info-bg)',text:'var(--info)'},
      {nombre:'Josue Vasquez',initials:'JV',rol:'Empleado',color:'var(--warning-bg)',text:'var(--warning)'},
      {nombre:'Carlos Costly',initials:'CC',rol:'Empleado',color:'var(--cream-dark)',text:'var(--text-light)'},
      {nombre:'Lamine Yamal',initials:'LY',rol:'Empleado',color:'#e8f5e9',text:'#2e7d32'},
    ],
    solicitudes:['SOL-2026-047','SOL-2026-020'],
    reportes:[
      {id:'REP-2026-031',titulo:'Avance semana 14',fecha:'13 abr 2026',fechaRevision:null,avance:68,estado:'Pendiente',badge:'badge-warning',autor:'Isaac Carranza',descripcion:'Montaje del 60% de la estructura metálica del claro principal. Se concluyó la soldadura de vigas en el estribo norte.',adjuntos:[{tipo:'img',nombre:'estructura_norte.jpg'},{tipo:'pdf',nombre:'bitacora_semana14.pdf'}]},
      {id:'REP-2026-027',titulo:'Avance semana 13',fecha:'06 abr 2026',fechaRevision:'07 abr 2026',avance:62,estado:'Aprobado',badge:'badge-success',autor:'Isaac Carranza',descripcion:'Colado de columnas del estribo sur finalizado. Curado en proceso según especificación técnica.',adjuntos:[{tipo:'img',nombre:'columnas_sur.jpg'}]},
      {id:'REP-2026-023',titulo:'Avance semana 12',fecha:'30 mar 2026',fechaRevision:'31 mar 2026',avance:57,estado:'Aprobado',badge:'badge-success',autor:'Isaac Carranza',descripcion:'Cimentación completada al 100%. Inicia armado de estructura metálica.',adjuntos:[]},
    ],
    hitos:[
      {label:'Estudios y diseño',pct:100,done:true},
      {label:'Cimentación y columnas',pct:100,done:true},
      {label:'Estructura metálica',pct:60,done:false},
      {label:'Tablero y acabados',pct:0,done:false},
      {label:'Obras complementarias',pct:0,done:false},
    ],
    miembros:['IC','JV','CC','LY'],
  },
  {
    id:'PRY-002', nombre:'Riego Comunitario El Paraíso', tipo:'Agrícola', tipoColor:'var(--success)',
    estado:'retrasado', estadoLabel:'Retrasado', estadoBadge:'badge-danger',
    depto:'El Paraíso', municipio:'El Paraíso', presupuesto:1450000,
    presupuestoEjecutado:565500, avance:41, inicio:'05 feb 2026', fin:'30 sep 2026',
    descripcion:'Sistema de riego por goteo para 120 hectáreas de cultivos de maíz y frijol. Incluye red de tuberías de 8 km, estación de bombeo solar y capacitación a 45 familias beneficiarias.',
    supervisor:'Isaac Carranza', supervisorInitials:'IC',
    colaboradores:[
      {nombre:'Isaac Carranza',initials:'IC',rol:'Supervisor de Campo',color:'var(--info-bg)',text:'var(--info)'},
      {nombre:'Josue Vasquez',initials:'JV',rol:'Empleado',color:'var(--warning-bg)',text:'var(--warning)'},
      {nombre:'Cristiano Ronaldo',initials:'CR',rol:'Empleado',color:'#fff3e0',text:'#e65100'},
    ],
    solicitudes:['SOL-2026-044','SOL-2026-028'],
    reportes:[
      {id:'REP-2026-030',titulo:'Incidencia pluvial',fecha:'12 abr 2026',fechaRevision:null,avance:41,estado:'Pendiente',badge:'badge-warning',autor:'Silvia Zuniga',descripcion:'Lluvias intensas interrumpieron la excavación del tramo B durante 5 días. Se reprograma el cronograma de la red principal.',adjuntos:[{tipo:'img',nombre:'zanja_inundada.jpg'},{tipo:'img',nombre:'tramo_b.jpg'}]},
      {id:'REP-2026-024',titulo:'Avance mensual marzo',fecha:'31 mar 2026',fechaRevision:'02 abr 2026',avance:38,estado:'Aprobado',badge:'badge-success',autor:'Silvia Zuniga',descripcion:'Tramo A de la red principal instalado y probado a presión. 62 familias capacitadas en el módulo 1.',adjuntos:[{tipo:'pdf',nombre:'informe_marzo.pdf'}]},
    ],
    hitos:[
      {label:'Diseño hidráulico',pct:100,done:true},
      {label:'Red principal (tramo A)',pct:100,done:true},
      {label:'Red principal (tramo B)',pct:20,done:false},
      {label:'Estación de bombeo',pct:0,done:false},
      {label:'Capacitación beneficiarios',pct:0,done:false},
    ],
    miembros:['IC','JV','CR'],
  },
  {
    id:'PRY-003', nombre:'Centro Comunitario San Pedro', tipo:'Social', tipoColor:'var(--gold)',
    estado:'por_finalizar', estadoLabel:'Por finalizar', estadoBadge:'badge-info',
    depto:'Santa Bárbara', municipio:'Santa Bárbara', presupuesto:980000,
    presupuestoEjecutado:784000, avance:85, inicio:'15 nov 2025', fin:'28 may 2026',
    descripcion:'Construcción de centro comunitario de 600 m² con salón multiuso, cocina, servicios sanitarios y área verde. Capacidad para 200 personas. Incluye instalaciones eléctricas y sistema de recolección de agua de lluvia.',
    supervisor:'Silvia Zuniga', supervisorInitials:'SZ',
    colaboradores:[
      {nombre:'Silvia Zuniga',initials:'SZ',rol:'Administradora',color:'#f3e8ff',text:'#7b1fa2'},
      {nombre:'Jose Luis Montero',initials:'JM',rol:'Empleado',color:'var(--cream-dark)',text:'var(--text-light)'},
      {nombre:'Lamine Yamal',initials:'LY',rol:'Empleado',color:'#e8f5e9',text:'#2e7d32'},
    ],
    solicitudes:['SOL-2026-039'],
    reportes:[
      {id:'REP-2026-029',titulo:'Reporte mensual',fecha:'10 abr 2026',fechaRevision:null,avance:85,estado:'Pendiente',badge:'badge-warning',autor:'Andrea Amador',descripcion:'Techumbre instalada en su totalidad. Trabajos eléctricos iniciados en salón multiuso y cocina.',adjuntos:[{tipo:'img',nombre:'techumbre.jpg'},{tipo:'doc',nombre:'acta_avance.docx'}]},
      {id:'REP-2026-022',titulo:'Reporte semana 10',fecha:'28 mar 2026',fechaRevision:'29 mar 2026',avance:78,estado:'Aprobado',badge:'badge-success',autor:'Andrea Amador',descripcion:'Paredes y estructura de techo concluidas. Se recibió el material eléctrico solicitado.',adjuntos:[]},
    ],
    hitos:[
      {label:'Estructura y paredes',pct:100,done:true},
      {label:'Cubierta y techo',pct:100,done:true},
      {label:'Instalaciones eléctricas',pct:70,done:false},
      {label:'Acabados interiores',pct:80,done:false},
      {label:'Área verde y entrega',pct:0,done:false},
    ],
    miembros:['SZ','JM','LY'],
  },
  {
    id:'PRY-004', nombre:'Escuela Rural Comayagua', tipo:'Social', tipoColor:'var(--gold)',
    estado:'en_revision', estadoLabel:'En revisión', estadoBadge:'badge-warning',
    depto:'Comayagua', municipio:'Siguatepeque', presupuesto:1200000,
    presupuestoEjecutado:288000, avance:29, inicio:'20 mar 2026', fin:'15 dic 2026',
    descripcion:'Construcción de escuela de 4 aulas, dirección, servicios sanitarios y área deportiva para 160 estudiantes en la comunidad rural de El Volcán, municipio de Siguatepeque.',
    supervisor:'Josue Vasquez', supervisorInitials:'JV',
    colaboradores:[
      {nombre:'Josue Vasquez',initials:'JV',rol:'Empleado',color:'var(--warning-bg)',text:'var(--warning)'},
      {nombre:'Cristiano Ronaldo',initials:'CR',rol:'Empleado',color:'#fff3e0',text:'#e65100'},
    ],
    solicitudes:[],
    reportes:[
      {id:'REP-2026-028',titulo:'Reporte inicial',fecha:'08 abr 2026',fechaRevision:null,avance:29,estado:'Pendiente',badge:'badge-warning',autor:'Jose Luis Montero',descripcion:'Limpieza de terreno completada. Fundaciones de las primeras dos aulas en proceso.',adjuntos:[{tipo:'img',nombre:'terreno_limpio.jpg'}]},
    ],
    hitos:[
      {label:'Trazo y fundaciones',pct:100,done:true},
      {label:'Levantado de paredes',pct:40,done:false},
      {label:'Estructura de techo',pct:0,done:false},
      {label:'Instalaciones y acabados',pct:0,done:false},
      {label:'Área deportiva',pct:0,done:false},
    ],
    miembros:['JV','CR'],
  },
  {
    id:'PRY-005', nombre:'Camino Rural Copán', tipo:'Infraestructura', tipoColor:'var(--info)',
    estado:'activo', estadoLabel:'Activo', estadoBadge:'badge-success',
    depto:'Copán', municipio:'Santa Rosa de Copán', presupuesto:3400000,
    presupuestoEjecutado:1700000, avance:55, inicio:'01 ene 2026', fin:'30 oct 2026',
    descripcion:'Mejoramiento y pavimentación de 12 km de camino rural que conecta 6 comunidades con la cabecera municipal. Incluye cunetas, alcantarillas y señalización vial.',
    supervisor:'Jose Luis Montero', supervisorInitials:'JM',
    colaboradores:[
      {nombre:'Jose Luis Montero',initials:'JM',rol:'Empleado',color:'var(--cream-dark)',text:'var(--text-light)'},
      {nombre:'Carlos Costly',initials:'CC',rol:'Empleado',color:'var(--cream-dark)',text:'var(--text-light)'},
    ],
    solicitudes:['SOL-2026-035'],
    reportes:[
      {id:'REP-2026-026',titulo:'Avance quincenal',fecha:'05 abr 2026',fechaRevision:null,avance:55,estado:'Pendiente',badge:'badge-warning',autor:'Jose Luis Montero',descripcion:'Tramo norte (km 0-4) completado con cunetas. Apertura del tramo sur iniciada.',adjuntos:[{tipo:'img',nombre:'tramo_norte.jpg'},{tipo:'pdf',nombre:'medicion_topografica.pdf'}]},
      {id:'REP-2026-021',titulo:'Avance quincenal',fecha:'20 mar 2026',fechaRevision:'21 mar 2026',avance:46,estado:'Aprobado',badge:'badge-success',autor:'Jose Luis Montero',descripcion:'Movimiento de tierra del km 0 al 4 finalizado. Material de base colocado.',adjuntos:[]},
    ],
    hitos:[
      {label:'Topografía y diseño',pct:100,done:true},
      {label:'Movimiento de tierra (km 0-4)',pct:100,done:true},
      {label:'Movimiento de tierra (km 4-8)',pct:60,done:false},
      {label:'Pavimentación (km 0-4)',pct:20,done:false},
      {label:'Obras de drenaje y señalización',pct:0,done:false},
    ],
    miembros:['JM','CC'],
  },
  // ── Proyectos FINALIZADOS: se muestran en un contenedor al final ──
  {
    id:'FIN-001', nombre:'Escuela Primaria La Esperanza', tipo:'Social', tipoColor:'var(--gold)',
    estado:'finalizado', estadoLabel:'Finalizado', estadoBadge:'badge-success',
    depto:'Santa Bárbara', municipio:'Santa Bárbara', presupuesto:380000, presupuestoFinal:368500,
    avance:100, inicio:'10 ene 2025', fin:'15 ago 2025', finReal:'08 ago 2025',
    descripcion:'Escuela de 3 aulas con mobiliario, servicios sanitarios y cerco perimetral para 90 estudiantes. Entregada 7 días antes de lo planificado.',
    supervisor:'Josue Vasquez', supervisorInitials:'JV',
    colaboradores:[
      {nombre:'Josue Vasquez',initials:'JV',rol:'Supervisor',color:'var(--warning-bg)',text:'var(--warning)'},
      {nombre:'Carlos Costly',initials:'CC',rol:'Empleado',color:'var(--cream-dark)',text:'var(--text-light)'},
    ],
    solicitudes:[], reportes:[
      {id:'REP-2025-089',titulo:'Informe de cierre',fecha:'08 ago 2025',fechaRevision:'10 ago 2025',avance:100,estado:'Aprobado',badge:'badge-success',autor:'Josue Vasquez',descripcion:'Entrega final de la obra con acta firmada por la comunidad educativa.',adjuntos:[{tipo:'pdf',nombre:'acta_entrega.pdf'},{tipo:'img',nombre:'fachada_final.jpg'}]},
    ],
    hitos:[{label:'Obra completa entregada',pct:100,done:true}],
    miembros:['JV','CC'],
  },
  {
    id:'FIN-002', nombre:'Puente Peatonal Yoro', tipo:'Infraestructura', tipoColor:'var(--info)',
    estado:'finalizado', estadoLabel:'Finalizado', estadoBadge:'badge-success',
    depto:'Yoro', municipio:'Yoro', presupuesto:520000, presupuestoFinal:541200,
    avance:100, inicio:'03 mar 2025', fin:'30 sep 2025', finReal:'22 oct 2025',
    descripcion:'Puente peatonal colgante de 38 metros sobre el río Aguán. Finalizado con 22 días de retraso por crecidas del río en septiembre.',
    supervisor:'Isaac Carranza', supervisorInitials:'IC',
    colaboradores:[
      {nombre:'Isaac Carranza',initials:'IC',rol:'Supervisor de Campo',color:'var(--info-bg)',text:'var(--info)'},
      {nombre:'Silvia Zuniga',initials:'SZ',rol:'Administradora',color:'#f3e8ff',text:'#7b1fa2'},
    ],
    solicitudes:[], reportes:[
      {id:'REP-2025-102',titulo:'Informe de cierre',fecha:'22 oct 2025',fechaRevision:'25 oct 2025',avance:100,estado:'Aprobado',badge:'badge-success',autor:'Isaac Carranza',descripcion:'Puente entregado con pruebas de carga satisfactorias.',adjuntos:[{tipo:'img',nombre:'puente_final.jpg'}]},
    ],
    hitos:[{label:'Obra completa entregada',pct:100,done:true}],
    miembros:['IC'],
  },
  {
    id:'FIN-003', nombre:'Sistema de Agua Potable Tocoa', tipo:'Infraestructura', tipoColor:'var(--info)',
    estado:'finalizado', estadoLabel:'Finalizado', estadoBadge:'badge-success',
    depto:'Colón', municipio:'Tocoa', presupuesto:760000, presupuestoFinal:752300,
    avance:100, inicio:'14 abr 2024', fin:'20 dic 2024', finReal:'18 dic 2024',
    descripcion:'Red de agua potable de 5.2 km con tanque de almacenamiento de 40 m³ que beneficia a 320 familias de 4 comunidades.',
    supervisor:'Andrea Amador', supervisorInitials:'AA',
    colaboradores:[
      {nombre:'Andrea Amador',initials:'AA',rol:'Supervisora',color:'var(--success-bg)',text:'var(--success)'},
      {nombre:'Lamine Yamal',initials:'LY',rol:'Empleado',color:'#e8f5e9',text:'#2e7d32'},
    ],
    solicitudes:[], reportes:[
      {id:'REP-2024-140',titulo:'Informe de cierre',fecha:'18 dic 2024',fechaRevision:'20 dic 2024',avance:100,estado:'Aprobado',badge:'badge-success',autor:'Andrea Amador',descripcion:'Sistema entregado en operación con comité de agua capacitado.',adjuntos:[{tipo:'pdf',nombre:'informe_final.pdf'},{tipo:'img',nombre:'tanque_40m3.jpg'}]},
    ],
    hitos:[{label:'Obra completa entregada',pct:100,done:true}],
    miembros:['AA','LY'],
  },
];

// Qué miembros corresponden al usuario actual
// Se usa para filtrar proyectos para campo/empleado
const MEMBER_MAP = {
  '20221003506': ['IC'], // Isaac Carranza — campo
  '20221003100': null,   // Silvia — admin, ve todo
  '20221000395': null,   // Andrea — oficina, ve todo
  '20211022013': ['JV'], // Josue Vasquez
  'JLM001':      ['JM'], // Jose Luis Montero
  'CR007':       ['CR'], // Cristiano Ronaldo
  'LY10':        ['LY'], // Lamine Yamal
  'CC09':        ['CC'], // Carlos Costly
};

const ROLE  = sessionStorage.getItem('pron_role')    || 'campo';
const CUENTA= sessionStorage.getItem('pron_cuenta')  || '';
const esAdmin = (ROLE === 'admin_oficina' || ROLE === 'admin' || ROLE === 'oficina');

// Proyectos visibles para este usuario
function proyectosVisibles(){
  if(esAdmin) return PROYECTOS;
  const mis = MEMBER_MAP[CUENTA] || [];
  return PROYECTOS.filter(p => p.miembros.some(m => mis.includes(m)));
}

// ─────────────────────────────────────────────────────────────
// RENDER PRINCIPAL
// ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderPaginaProyectos();

  // Auto-open detail if coming from dashboard eye button
  const autoOpen = sessionStorage.getItem('pron_open_proyecto');
  if(autoOpen){
    sessionStorage.removeItem('pron_open_proyecto');
    // Small delay to let render finish
    setTimeout(() => abrirDetalle(autoOpen), 120);
  }
});

/* Convierte fechas del formato "10 ene 2026" a objeto Date (para filtros) */
const _MESES = {ene:0,feb:1,mar:2,abr:3,may:4,jun:5,jul:6,ago:7,sep:8,oct:9,nov:10,dic:11};
function parseFechaCorta(txt){
  const m = /(\d{1,2})\s+([a-záé]+)\s+(\d{4})/i.exec(txt||'');
  if(!m) return null;
  return new Date(parseInt(m[3]), _MESES[m[2].toLowerCase().slice(0,3)] ?? 0, parseInt(m[1]));
}
const fmtCorta = d => d.toLocaleDateString('es-HN',{day:'2-digit',month:'short',year:'numeric'});

/* ── Estado de los FILTROS (persistidos en sessionStorage para que
      las cajas conserven la selección entre renders y visitas) ── */
function leerFiltrosGuardados(){
  try { return JSON.parse(sessionStorage.getItem('pron_filtros_proyectos')) || {}; }
  catch(e){ return {}; }
}
function guardarFiltros(f){ sessionStorage.setItem('pron_filtros_proyectos', JSON.stringify(f)); }
function hayFiltrosActivos(f){
  return !!((f.q||'').trim() || f.tipo || f.estado || f.depto || f.fechaCond);
}

/* ══════════════════════════════════════════════════════════════
   FILTRO DE FECHA ESTILO NOTION
   Condiciones: Es / Es anterior a / Es posterior a / Es igual o
   anterior a / Es igual o posterior a / Está dentro de / Es
   relativo a la fecha de hoy (Este·Próximo·Pasado + día·semana·
   mes·año). La propiedad evaluada es el PERÍODO DE EJECUCIÓN del
   proyecto [fecha de inicio, fecha final real o estimada].
   ══════════════════════════════════════════════════════════════ */
const FECHA_CONDS = [
  ['es','Es'], ['anterior','Es anterior a'], ['posterior','Es posterior a'],
  ['ig_anterior','Es igual o anterior a'], ['ig_posterior','Es igual o posterior a'],
  ['dentro','Está dentro de'], ['relativo','Es relativo a la fecha de hoy'],
];
const REL_CUANDO = [['este','Este'],['proximo','Próximo'],['pasado','Pasado']];
const REL_UNIDAD = [['dia','día'],['semana','semana'],['mes','mes'],['anio','año']];

/* Rango [desde, hasta] para el modo relativo (Este/Próximo/Pasado + unidad) */
function rangoRelativo(cuando, unidad){
  const hoy = new Date(); hoy.setHours(0,0,0,0);
  const d = new Date(hoy);
  let desde, hasta;
  if(unidad==='dia'){
    if(cuando==='proximo') d.setDate(d.getDate()+1);
    if(cuando==='pasado')  d.setDate(d.getDate()-1);
    desde = new Date(d); hasta = new Date(d);
  } else if(unidad==='semana'){
    const lunes = new Date(d); lunes.setDate(d.getDate() - ((d.getDay()+6)%7)); // lunes de esta semana
    if(cuando==='proximo') lunes.setDate(lunes.getDate()+7);
    if(cuando==='pasado')  lunes.setDate(lunes.getDate()-7);
    desde = lunes; hasta = new Date(lunes); hasta.setDate(lunes.getDate()+6);
  } else if(unidad==='mes'){
    let m = d.getMonth() + (cuando==='proximo'?1:cuando==='pasado'?-1:0);
    desde = new Date(d.getFullYear(), m, 1);
    hasta = new Date(d.getFullYear(), m+1, 0);
  } else { // año
    let a = d.getFullYear() + (cuando==='proximo'?1:cuando==='pasado'?-1:0);
    desde = new Date(a,0,1); hasta = new Date(a,11,31);
  }
  return [desde, hasta];
}

/* Etiqueta que se muestra en la "píldora" del filtro (ej. "Este mes") */
function etiquetaFiltroFecha(f){
  if(!f.fechaCond) return 'Fecha';
  if(f.fechaCond === 'relativo'){
    const u = REL_UNIDAD.find(x=>x[0]===f.fechaUnidad)?.[1] || 'mes';
    const genero = (f.fechaUnidad==='semana');
    const c = f.fechaCuando==='proximo' ? (genero?'Próxima':'Próximo')
            : f.fechaCuando==='pasado'  ? (genero?'Pasada':'Pasado')
            : (genero?'Esta':'Este');
    return `${c} ${u}`;
  }
  const nombre = FECHA_CONDS.find(x=>x[0]===f.fechaCond)?.[1] || '';
  const f1 = f.fecha1 ? fmtCorta(new Date(f.fecha1+'T00:00:00')) : '';
  const f2 = f.fecha2 ? fmtCorta(new Date(f.fecha2+'T00:00:00')) : '';
  if(f.fechaCond==='dentro') return `${f1} → ${f2}`;
  if(f.fechaCond==='es')     return f1;
  return `${nombre.replace('Es ','')} ${f1}`.trim();
}

/* Evalúa el filtro de fecha contra el período del proyecto */
function pasaFiltroFecha(p, f){
  if(!f.fechaCond) return true;
  const ini = parseFechaCorta(p.inicio);
  const fnl = parseFechaCorta(p.finReal || p.fin) || ini;
  if(!ini) return true;

  if(f.fechaCond === 'relativo'){
    const [desde, hasta] = rangoRelativo(f.fechaCuando||'este', f.fechaUnidad||'mes');
    return ini <= hasta && fnl >= desde;                 // proyecto activo durante ese período
  }
  if(!f.fecha1) return true;
  const x  = new Date(f.fecha1 + 'T00:00:00');
  if(f.fechaCond === 'es')           return ini <= x && fnl >= x;   // en ejecución ese día
  if(f.fechaCond === 'anterior')     return ini <  x;               // inició antes de la fecha
  if(f.fechaCond === 'ig_anterior')  return ini <= x;
  if(f.fechaCond === 'posterior')    return ini >  x;               // inició después de la fecha
  if(f.fechaCond === 'ig_posterior') return ini >= x;
  if(f.fechaCond === 'dentro'){
    if(!f.fecha2) return true;
    const y = new Date(f.fecha2 + 'T00:00:00');
    return ini <= y && fnl >= x;                                    // período traslapa el rango
  }
  return true;
}

/* Aplica todos los filtros a un arreglo de proyectos */
function filtrarProyectos(lista, f){
  if(!f) return lista;
  const q = (f.q||'').toLowerCase().trim();
  return lista.filter(p=>{
    const mq = !q || [p.nombre,p.municipio,p.depto,p.supervisor||''].join(' ').toLowerCase().includes(q);
    const mtipo   = !f.tipo   || p.tipo   === f.tipo;    // "Todos los tipos" = sin filtro
    const mestado = !f.estado || p.estado === f.estado;  // incluye la opción "Finalizado"
    const mdepto  = !f.depto  || p.depto  === f.depto;
    return mq && mtipo && mestado && mdepto && pasaFiltroFecha(p, f);
  });
}

/* ══════════════════════════════════════════════════════════════
   RENDER — La página se construye UNA sola vez (renderPaginaProyectos)
   y los filtros solo actualizan la GALERÍA (renderGaleria). Así el
   tecleo en la búsqueda NO provoca ningún refresh visual de la página.
   ══════════════════════════════════════════════════════════════ */
function renderPaginaProyectos(){
  const filtros  = leerFiltrosGuardados();
  const visibles = proyectosVisibles();
  const puedeCrear = esAdmin;
  const titulo     = esAdmin ? 'Gestión de <em style="font-style:italic">Proyectos</em>' : 'Mis <em style="font-style:italic">Proyectos</em>';
  const subtitulo  = esAdmin
    ? 'Haga clic en la tarjeta del proyecto para ver detalles'
    : `Proyectos en los que participas · ${visibles.length} asignado${visibles.length!==1?'s':''}`;

  // Stats: mismas tarjetas para admin y campo; el campo cuenta
  // únicamente sobre SUS proyectos (proyectosVisibles)
  const base = esAdmin ? PROYECTOS : visibles;
  const statsHtml = `
  <div class="grid-4 mb-24 fade-up fade-up-1">
    <div class="card" style="padding:16px 20px;display:flex;align-items:center;gap:14px">
      <div style="width:36px;height:36px;background:var(--info-bg);border-radius:8px;display:flex;align-items:center;justify-content:center"><span class="material-symbols-rounded" style="color:var(--info);font-size:18px">folder_open</span></div>
      <div><div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px">Activos</div><div style="font-family:var(--font-serif);font-size:22px;color:var(--navy)">${base.filter(p=>p.estado==='activo').length}</div></div>
    </div>
    <div class="card" style="padding:16px 20px;display:flex;align-items:center;gap:14px">
      <div style="width:36px;height:36px;background:var(--danger-bg);border-radius:8px;display:flex;align-items:center;justify-content:center"><span class="material-symbols-rounded" style="color:var(--danger);font-size:18px">warning</span></div>
      <div><div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px">Retrasados</div><div style="font-family:var(--font-serif);font-size:22px;color:var(--navy)">${base.filter(p=>p.estado==='retrasado').length}</div></div>
    </div>
    <div class="card" style="padding:16px 20px;display:flex;align-items:center;gap:14px">
      <div style="width:36px;height:36px;background:var(--success-bg);border-radius:8px;display:flex;align-items:center;justify-content:center"><span class="material-symbols-rounded" style="color:var(--success);font-size:18px">check_circle</span></div>
      <div><div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px">Por finalizar</div><div style="font-family:var(--font-serif);font-size:22px;color:var(--navy)">${base.filter(p=>p.estado==='por_finalizar').length}</div></div>
    </div>
    <div class="card" style="padding:16px 20px;display:flex;align-items:center;gap:14px">
      <div style="width:36px;height:36px;background:rgba(201,168,76,0.15);border-radius:8px;display:flex;align-items:center;justify-content:center"><span class="material-symbols-rounded" style="color:var(--gold-dim);font-size:18px">inventory</span></div>
      <div><div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px">Finalizados</div><div style="font-family:var(--font-serif);font-size:22px;color:var(--navy)">${base.filter(p=>p.estado==='finalizado').length}</div></div>
    </div>
  </div>`;

  /* ── Barra de FILTROS dentro de la tarjeta (estilo Gestión de Usuarios):
        alineados a la DERECHA, "Limpiar filtros" a la IZQUIERDA del primer
        filtro (visible solo con filtros activos), y encabezado FIJO. ── */
  const filtrosHtml = `
    <div class="filtros-row" id="filtros-row"
         style="display:flex;gap:10px;align-items:center;justify-content:flex-end;flex-wrap:wrap;padding:0 0 18px;border-bottom:1px solid var(--cream-dark);margin-bottom:20px">
      <button class="btn btn-outline btn-sm" id="btn-limpiar-filtros" onclick="limpiarFiltros()"
              style="white-space:nowrap;display:none">
        <span class="material-symbols-rounded" style="font-size:13px">clear</span> Limpiar filtros
      </button>
      <div class="search-wrap" style="width:210px;flex:0 0 auto">
        <span class="material-symbols-rounded">search</span>
        <input type="text" class="search-input form-control" id="f-buscar" style="padding-left:36px"
               placeholder="Buscar proyecto..." oninput="aplicarFiltros()">
      </div>
      <select class="form-control" id="f-tipo" style="width:auto;padding:7px 32px 7px 12px;font-size:13px" onchange="aplicarFiltros()">
        <option value="">Todos los tipos</option>
        <option value="Infraestructura">Infraestructura</option>
        <option value="Agrícola">Agrícola</option>
        <option value="Social">Social</option>
      </select>
      <select class="form-control" id="f-estado" style="width:auto;padding:7px 32px 7px 12px;font-size:13px" onchange="aplicarFiltros()">
        <option value="">Todos los estados</option>
        <option value="activo">Activo</option>
        <option value="retrasado">Retrasado</option>
        <option value="por_finalizar">Por finalizar</option>
        <option value="en_revision">En revisión</option>
        <option value="finalizado">Finalizado</option>
      </select>
      <select class="form-control" id="f-depto" style="width:auto;padding:7px 32px 7px 12px;font-size:13px" onchange="aplicarFiltros()">
        <option value="">Todos los departamentos</option>
        ${[...new Set(visibles.map(p=>p.depto))].sort().map(d=>`<option value="${d}">${d}</option>`).join('')}
      </select>
      <!-- Píldora del filtro de fecha (estilo Notion) -->
      <div style="position:relative">
        <button class="btn btn-outline btn-sm" id="btn-filtro-fecha" onclick="toggleFiltroFecha(event)" style="white-space:nowrap">
          <span class="material-symbols-rounded" style="font-size:14px">calendar_month</span>
          <span id="filtro-fecha-label">Fecha</span>
          <span class="material-symbols-rounded" style="font-size:14px">expand_more</span>
        </button>
        <div id="panel-fecha" style="display:none;position:absolute;right:0;top:calc(100% + 6px);width:290px;background:var(--white);border:1px solid var(--cream-dark);border-radius:12px;box-shadow:var(--shadow-md);padding:14px;z-index:60">
          <div style="font-size:11px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.6px;margin-bottom:8px">Filtro de fecha</div>
          <select class="form-control" id="ff-cond" style="font-size:13px;margin-bottom:10px" onchange="pintarCamposFecha()">
            ${FECHA_CONDS.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}
          </select>
          <div id="ff-campos"></div>
          <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px">
            <button class="btn btn-outline btn-sm" onclick="quitarFiltroFecha()">Quitar</button>
            <button class="btn btn-gold btn-sm" onclick="aplicarFiltroFecha()">Aplicar</button>
          </div>
          <div style="font-size:10.5px;color:var(--muted);margin-top:8px">El filtro se aplica al período de ejecución del proyecto.</div>
        </div>
      </div>
    </div>`;

  // El encabezado es "sticky": el botón Nuevo Proyecto queda visible en la
  // esquina superior derecha sin importar cuánto se haga scroll.
  document.getElementById('main-proyectos').innerHTML = `
  <div class="flex-between mb-24 fade-up sticky-head">
    <div class="section-head" style="margin-bottom:0">
      <h2>${titulo}</h2>
      <p style="font-size:13px;color:var(--muted);margin-top:4px">${subtitulo}</p>
    </div>
    ${puedeCrear ? `<button class="btn btn-gold" onclick="abrirModalNuevoProyecto()"><span class="material-symbols-rounded">add</span> Nuevo Proyecto</button>` : ''}
  </div>
  ${statsHtml}
  <!-- GALERÍA dentro de una tarjeta (estructura similar a la tabla de Usuarios) -->
  <div class="card fade-up fade-up-2">
    <div class="card-header" style="margin-bottom:14px">
      <div>
        <div class="card-title">${esAdmin?"Directorio de Proyectos":"Mis Proyectos"}</div>
        <div class="card-subtitle" id="proy-contador"></div>
      </div>
    </div>
    ${filtrosHtml}
    <div class="grid-3" id="galeria-proyectos"></div>
  </div>`;

  // Restaurar la selección guardada en las cajas de filtro
  {
    const f = filtros;
    if(document.getElementById('f-buscar')) document.getElementById('f-buscar').value = f.q||'';
    if(document.getElementById('f-tipo'))   document.getElementById('f-tipo').value   = f.tipo||'';
    if(document.getElementById('f-estado')) document.getElementById('f-estado').value = f.estado||'';
    if(document.getElementById('f-depto'))  document.getElementById('f-depto').value  = f.depto||'';
    document.getElementById('filtro-fecha-label').textContent = etiquetaFiltroFecha(f);
    if(f.fechaCond) document.getElementById('btn-filtro-fecha').classList.add('btn-gold');
  }

  renderGaleria(); // primera pintura de la galería
}

/* Actualiza ÚNICAMENTE la galería y el contador (sin refresh visual
   de la página: no se reconstruyen encabezado, stats ni filtros). */
function renderGaleria(){
  const filtros  = leerFiltrosGuardados();
  // Activos y finalizados se muestran JUNTOS en la misma galería
  const data = filtrarProyectos(proyectosVisibles(), filtros);

  const cont = document.getElementById('galeria-proyectos');
  if(!cont) return;
  cont.innerHTML = data.length
    ? data.map(p => tarjetaProyecto(p)).join('')
    : `<div style="grid-column:1/-1;text-align:center;padding:44px;color:var(--muted)">
        <span class="material-symbols-rounded" style="font-size:38px;display:block;margin-bottom:10px;color:var(--cream-dark)">search_off</span>
        No se encontraron proyectos con los filtros aplicados.
       </div>`;

  const total = proyectosVisibles().length;
  const cc = document.getElementById('proy-contador');
  if(cc) cc.textContent = esAdmin
    ? `${data.length} de ${total} proyectos registrados (activos y finalizados)`
    : `${data.length} de ${total} proyectos en los que participas`;

  // "Limpiar filtros" solo visible cuando hay algún filtro aplicado
  const btn = document.getElementById('btn-limpiar-filtros');
  if(btn) btn.style.display = hayFiltrosActivos(filtros) ? '' : 'none';
}

/* ── Panel del filtro de fecha (estilo Notion) ── */
function toggleFiltroFecha(e){
  if(e) e.stopPropagation();
  const p = document.getElementById('panel-fecha');
  const abierto = p.style.display !== 'none';
  if(abierto){ p.style.display='none'; return; }
  const f = leerFiltrosGuardados();
  document.getElementById('ff-cond').value = f.fechaCond || 'relativo';
  pintarCamposFecha(f);
  p.style.display = 'block';
  // Cerrar al hacer clic fuera del panel
  setTimeout(()=>{
    const cerrar = (ev)=>{
      if(!p.contains(ev.target) && ev.target.id!=='btn-filtro-fecha' && !document.getElementById('btn-filtro-fecha').contains(ev.target)){
        p.style.display='none'; document.removeEventListener('click', cerrar);
      }
    };
    document.addEventListener('click', cerrar);
  }, 0);
}

/* Pinta los campos del panel según la condición elegida */
function pintarCamposFecha(f){
  f = f && f.fechaCond ? f : leerFiltrosGuardados();
  const cond = document.getElementById('ff-cond').value;
  const c = document.getElementById('ff-campos');
  if(cond === 'relativo'){
    c.innerHTML = `
      <div style="display:flex;gap:8px">
        <select class="form-control" id="ff-cuando" style="font-size:13px">
          ${REL_CUANDO.map(([v,l])=>`<option value="${v}" ${f.fechaCuando===v?'selected':''}>${l}</option>`).join('')}
        </select>
        <select class="form-control" id="ff-unidad" style="font-size:13px">
          ${REL_UNIDAD.map(([v,l])=>`<option value="${v}" ${(f.fechaUnidad||'mes')===v?'selected':''}>${l}</option>`).join('')}
        </select>
      </div>
      <div style="font-size:10.5px;color:var(--muted);margin-top:6px">El filtro se actualizará con la fecha actual.</div>`;
  } else if(cond === 'dentro'){
    c.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:8px">
        <input type="date" class="form-control" id="ff-fecha1" style="font-size:13px" value="${f.fecha1||''}">
        <input type="date" class="form-control" id="ff-fecha2" style="font-size:13px" value="${f.fecha2||''}">
      </div>`;
  } else {
    c.innerHTML = `<input type="date" class="form-control" id="ff-fecha1" style="font-size:13px" value="${f.fecha1||''}">`;
  }
}

/* Aplica el filtro de fecha configurado en el panel */
function aplicarFiltroFecha(){
  const f = leerFiltrosGuardados();
  f.fechaCond   = document.getElementById('ff-cond').value;
  f.fechaCuando = (document.getElementById('ff-cuando')||{}).value || 'este';
  f.fechaUnidad = (document.getElementById('ff-unidad')||{}).value || 'mes';
  f.fecha1      = (document.getElementById('ff-fecha1')||{}).value || '';
  f.fecha2      = (document.getElementById('ff-fecha2')||{}).value || '';
  // Validación mínima: las condiciones por fecha exacta requieren la fecha
  if(f.fechaCond !== 'relativo' && !f.fecha1){
    showToast('Selecciona la fecha para aplicar el filtro.','warning');
    return;
  }
  guardarFiltros(f);
  document.getElementById('filtro-fecha-label').textContent = etiquetaFiltroFecha(f);
  document.getElementById('btn-filtro-fecha').classList.add('btn-gold');
  document.getElementById('panel-fecha').style.display='none';
  renderGaleria();
}

/* Quita solo el filtro de fecha */
function quitarFiltroFecha(){
  const f = leerFiltrosGuardados();
  delete f.fechaCond; delete f.fechaCuando; delete f.fechaUnidad; delete f.fecha1; delete f.fecha2;
  guardarFiltros(f);
  document.getElementById('filtro-fecha-label').textContent = 'Fecha';
  document.getElementById('btn-filtro-fecha').classList.remove('btn-gold');
  document.getElementById('panel-fecha').style.display='none';
  renderGaleria();
}

// ─────────────────────────────────────────────────────────────
// TARJETA DE PROYECTO
// ─────────────────────────────────────────────────────────────
/* Devuelve la etiqueta de cierre de un finalizado, calculada con las
   fechas reales: "Finalizado · En tiempo" o "Finalizado · N días de retraso" */
function tagFinalizado(p){
  const plan = parseFechaCorta(p.fin), real = parseFechaCorta(p.finReal||p.fin);
  if(!plan || !real) return {texto:'Finalizado', clase:'badge-success'};
  const dias = Math.round((real - plan) / 86400000);
  return dias > 0
    ? {texto:`Finalizado · ${dias} día${dias!==1?'s':''} de retraso`, clase:'badge-warning'}
    : {texto:'Finalizado · En tiempo', clase:'badge-success'};
}

function tarjetaProyecto(p){
  const progressColor = p.avance>=75 ? 'success' : p.avance>=40 ? 'gold' : 'danger';
  // Los finalizados muestran el tag detallado (En tiempo / N días de retraso)
  const fin = p.estado==='finalizado' ? tagFinalizado(p) : null;
  // La tarjeta completa es clickeable y accesible con teclado (Enter)
  return `
  <div class="project-card" role="button" tabindex="0" style="cursor:pointer"
       onclick="abrirDetalle('${p.id}')"
       onkeydown="if(event.key==='Enter'){abrirDetalle('${p.id}')}">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:4px">
      <div class="project-type" style="color:${p.tipoColor}">${p.tipo}</div>
      <span class="badge ${fin?fin.clase:p.estadoBadge}" style="font-size:10.5px">${fin?`<span class="material-symbols-rounded" style="font-size:11px">check_circle</span>${fin.texto}`:p.estadoLabel}</span>
    </div>
    <div class="fw-600" style="font-size:15px;margin-bottom:3px;color:var(--navy)">${p.nombre}</div>
    <div style="font-size:11.5px;color:var(--muted);margin-bottom:14px;display:flex;align-items:center;gap:4px">
      <span class="material-symbols-rounded" style="font-size:13px">location_on</span>${p.municipio}, ${p.depto}
    </div>
    <div class="flex-between" style="font-size:12px;margin-bottom:6px">
      <span style="color:var(--muted)">Avance físico</span>
      <span class="fw-600">${p.avance}%</span>
    </div>
    <div class="progress-bar mb-14"><div class="progress-fill ${progressColor}" style="width:${p.avance}%"></div></div>
    <div class="flex-between" style="margin-bottom:12px">
      <div style="display:flex;gap:-4px">
        ${p.colaboradores.slice(0,4).map(c=>`<div class="avatar" style="width:24px;height:24px;font-size:9px;background:${c.color};color:${c.text};border:2px solid var(--white);margin-right:-6px" title="${c.nombre}">${c.initials}</div>`).join('')}
        ${p.colaboradores.length>4?`<div class="avatar" style="width:24px;height:24px;font-size:9px;background:var(--cream-dark);color:var(--muted);border:2px solid var(--white)">+${p.colaboradores.length-4}</div>`:''}
      </div>
      <div style="font-size:11px;color:var(--muted)">L ${(p.presupuesto/1000000).toFixed(1)}M</div>
    </div>
    <hr class="divider">
    <div class="flex-between">
      <div style="font-size:11px;color:var(--muted);display:flex;align-items:center;gap:3px">
        <span class="material-symbols-rounded" style="font-size:12px">calendar_today</span>
        ${p.inicio} — ${p.fin}
      </div>
    
    </div>
  </div>`;
}

// ─────────────────────────────────────────────────────────────
// MODAL DETALLE
// ─────────────────────────────────────────────────────────────
function abrirDetalle(id){
  const p = PROYECTOS.find(x=>x.id===id);
  if(!p) return;

  document.getElementById('detalle-tipo').textContent    = p.tipo;
  document.getElementById('detalle-tipo').style.color    = p.tipoColor;
  document.getElementById('detalle-nombre').textContent  = p.nombre;
  document.getElementById('detalle-ubicacion').innerHTML =
    `<span class="material-symbols-rounded" style="font-size:14px">location_on</span>${p.municipio}, ${p.depto}`;
  const badge = document.getElementById('detalle-badge');
  badge.className = `badge ${p.estadoBadge}`;
  badge.textContent = p.estadoLabel;

  const progressColor = p.avance>=75 ? 'success' : p.avance>=40 ? 'gold' : 'danger';
  const esFinalizado  = p.estado === 'finalizado';

  document.getElementById('detalle-body').innerHTML = `

    <!-- KPIs rápidos: Avance · Presupuesto inicial · Presupuesto ejecutado · Colaboradores -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px">
      <div style="background:var(--cream);border-radius:var(--radius);padding:14px 16px;text-align:center">
        <div style="font-family:var(--font-serif);font-size:26px;font-weight:300;color:var(--navy)">${p.avance}%</div>
        <div style="font-size:10.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px">Avance físico</div>
        <div style="height:4px;background:var(--cream-dark);border-radius:4px;margin-top:8px">
          <div style="height:4px;border-radius:4px;width:${p.avance}%;background:${p.avance>=75?'var(--success)':p.avance>=40?'var(--gold)':'var(--danger)'}"></div>
        </div>
      </div>
      <div style="background:var(--cream);border-radius:var(--radius);padding:14px 16px;text-align:center">
        <div style="font-family:var(--font-serif);font-size:22px;font-weight:300;color:var(--navy)">L ${(p.presupuesto/1000000).toFixed(2)}M</div>
        <div style="font-size:10.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px">Presupuesto inicial</div>
      </div>
      <div style="background:var(--cream);border-radius:var(--radius);padding:14px 16px;text-align:center">
        <div style="font-family:var(--font-serif);font-size:22px;font-weight:300;color:var(--navy)">L ${((p.presupuestoFinal||p.presupuestoEjecutado||0)/1000000).toFixed(2)}M</div>
        <div style="font-size:10.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px">Presupuesto ejecutado</div>
      </div>
      <div style="background:var(--cream);border-radius:var(--radius);padding:14px 16px;text-align:center">
        <div style="font-family:var(--font-serif);font-size:22px;font-weight:300;color:var(--navy)">${p.colaboradores.length}</div>
        <div style="font-size:10.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px">Colaboradores</div>
      </div>
    </div>

    <!-- Descripción -->
    <div style="margin-bottom:22px">
      <div style="font-size:11.5px;font-weight:600;text-transform:uppercase;letter-spacing:.7px;color:var(--muted);margin-bottom:8px">Descripción del proyecto</div>
      <p style="font-size:13.5px;color:var(--text);line-height:1.75">${p.descripcion}</p>
    </div>

    <!-- Fechas (los finalizados incluyen la FECHA FINAL REAL) -->
    <div style="display:grid;grid-template-columns:repeat(${esFinalizado?3:2},1fr);gap:12px;margin-bottom:22px">
      <div style="background:var(--cream);border-radius:var(--radius);padding:12px 16px;display:flex;align-items:center;gap:10px">
        <span class="material-symbols-rounded" style="color:var(--info);font-size:20px">event</span>
        <div><div style="font-size:10.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px">Fecha de inicio</div><div style="font-size:13.5px;font-weight:500">${p.inicio}</div></div>
      </div>
      <div style="background:var(--cream);border-radius:var(--radius);padding:12px 16px;display:flex;align-items:center;gap:10px">
        <span class="material-symbols-rounded" style="color:var(--warning);font-size:20px">event_busy</span>
        <div><div style="font-size:10.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px">Fecha estimada fin</div><div style="font-size:13.5px;font-weight:500">${p.fin}</div></div>
      </div>
      ${esFinalizado?`
      <div style="background:var(--cream);border-radius:var(--radius);padding:12px 16px;display:flex;align-items:center;gap:10px">
        <span class="material-symbols-rounded" style="color:var(--success);font-size:20px">event_available</span>
        <div><div style="font-size:10.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px">Fecha final real</div><div style="font-size:13.5px;font-weight:500">${p.finReal||p.fin}</div></div>
      </div>`:''}
    </div>

    <!-- Hitos / etapas -->
    <div style="margin-bottom:22px">
      <div style="font-size:11.5px;font-weight:600;text-transform:uppercase;letter-spacing:.7px;color:var(--muted);margin-bottom:10px">Etapas del proyecto</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${p.hitos.map((h,i)=>`
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:22px;height:22px;border-radius:50%;background:${h.done?'var(--success)':h.pct>0?'var(--gold)':'var(--cream-dark)'};display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <span class="material-symbols-rounded" style="font-size:13px;color:${h.done?'var(--white)':h.pct>0?'var(--navy)':'var(--muted)'}">${h.done?'check':(i+1)}</span>
          </div>
          <div style="flex:1">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:3px">
              <span style="font-size:13px;${h.done?'color:var(--success);text-decoration:line-through':'color:var(--text)'}">${h.label}</span>
              <span style="font-size:11.5px;font-weight:600;color:${h.done?'var(--success)':h.pct>0?'var(--gold)':'var(--muted)'}">${h.pct}%</span>
            </div>
            <div style="height:3px;background:var(--cream-dark);border-radius:3px">
              <div style="height:3px;border-radius:3px;width:${h.pct}%;background:${h.done?'var(--success)':h.pct>0?'var(--gold)':'transparent'}"></div>
            </div>
          </div>
        </div>`).join('')}
      </div>
    </div>

    <!-- Colaboradores -->
    <div style="margin-bottom:${p.solicitudes.length?'22px':'0'}">
      <div style="font-size:11.5px;font-weight:600;text-transform:uppercase;letter-spacing:.7px;color:var(--muted);margin-bottom:10px">Equipo del proyecto</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${p.colaboradores.map(c=>`
        <div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--cream);border-radius:var(--radius)">
          <div style="width:32px;height:32px;border-radius:50%;background:${c.color};color:${c.text};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;flex-shrink:0">${c.initials}</div>
          <div style="flex:1"><div style="font-size:13px;font-weight:500">${c.nombre}</div><div style="font-size:11.5px;color:var(--muted)">${c.rol}</div></div>
          ${c.initials===p.supervisorInitials?`<span class="badge badge-info" style="font-size:10px">Supervisor</span>`:''}
        </div>`).join('')}
      </div>
    </div>

    <!-- Reportes de avance asociados (mismo estilo de chips que las solicitudes) -->
    ${(p.reportes && p.reportes.length) ? `
    <div style="margin-bottom:22px">
      <div style="font-size:11.5px;font-weight:600;text-transform:uppercase;letter-spacing:.7px;color:var(--muted);margin-bottom:10px">Reportes asociados</div>
      <div style="display:flex;flex-wrap:wrap;gap:8px">
        ${p.reportes.map((r,i)=>`
        <button onclick="abrirDetalleReporte('${p.id}',${i})" title="Ver todos los datos del reporte"
           style="display:inline-flex;align-items:center;gap:6px;background:var(--cream);border:1px solid var(--cream-dark);border-radius:var(--radius);padding:7px 12px;cursor:pointer;font-family:var(--font-sans);font-size:12.5px;color:var(--navy);transition:var(--transition)"
           onmouseover="this.style.borderColor='var(--navy)'" onmouseout="this.style.borderColor=''">
          <span class="material-symbols-rounded" style="font-size:14px">bar_chart</span>${r.id||r.titulo}
          <span class="material-symbols-rounded" style="font-size:13px;color:var(--muted)">chevron_right</span>
        </button>`).join('')}
      </div>
    </div>` : ''}

    <!-- Solicitudes asociadas -->
    ${p.solicitudes.length ? `
    <div style="margin-top:22px">
      <div style="font-size:11.5px;font-weight:600;text-transform:uppercase;letter-spacing:.7px;color:var(--muted);margin-bottom:10px">Solicitudes de recursos asociadas</div>
      <div style="display:flex;flex-wrap:wrap;gap:8px">
        ${p.solicitudes.map(s=>`
        <button onclick="abrirDetalleSolicitud('${s}')" title="Ver todos los datos de la solicitud"
           style="display:inline-flex;align-items:center;gap:6px;background:var(--cream);border:1px solid var(--cream-dark);border-radius:var(--radius);padding:7px 12px;cursor:pointer;font-family:var(--font-sans);font-size:12.5px;color:var(--navy);transition:var(--transition)"
           onmouseover="this.style.borderColor='var(--navy)'" onmouseout="this.style.borderColor=''">
          <span class="material-symbols-rounded" style="font-size:14px">inventory_2</span>${s}
          <span class="material-symbols-rounded" style="font-size:13px;color:var(--muted)">chevron_right</span>
        </button>`).join('')}
      </div>
    </div>` : ''}

    <!-- Acciones (solo admin) -->
    ${esAdmin ? `
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:24px;padding-top:16px;border-top:1px solid var(--cream-dark)">
      <button class="btn btn-outline btn-sm" onclick="abrirEditarProyecto('${p.id}')">
        <span class="material-symbols-rounded" style="font-size:14px">edit</span> Editar
      </button>
      <button class="btn btn-outline btn-sm" onclick="exportarFichaProyecto('${p.id}')">
        <span class="material-symbols-rounded" style="font-size:14px">download</span> Exportar ficha
      </button>
    </div>` : ''}
  `;

  document.getElementById('modal-detalle').classList.add('open');
}

// ─────────────────────────────────────────────────────────────
// FILTROS
// ─────────────────────────────────────────────────────────────
/* Lee las cajas, guarda la selección (persistencia) y actualiza
   SOLO la galería. La página no se re-renderiza, por lo que el
   tecleo en la búsqueda no produce ningún parpadeo ni pérdida de foco. */
function aplicarFiltros(){
  const f = leerFiltrosGuardados();
  f.q      = (document.getElementById('f-buscar')||{}).value || '';
  f.tipo   = (document.getElementById('f-tipo')||{}).value || '';
  f.estado = (document.getElementById('f-estado')||{}).value || '';
  f.depto  = (document.getElementById('f-depto')||{}).value || '';
  guardarFiltros(f);
  renderGaleria();
}

/* Restablece todos los filtros (visible solo si hay alguno activo) */
function limpiarFiltros(){
  sessionStorage.removeItem('pron_filtros_proyectos');
  ['f-buscar','f-tipo','f-estado','f-depto'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.value='';
  });
  const lbl=document.getElementById('filtro-fecha-label'); if(lbl) lbl.textContent='Fecha';
  const bff=document.getElementById('btn-filtro-fecha');   if(bff) bff.classList.remove('btn-gold');
  renderGaleria();
}

// ─────────────────────────────────────────────────────────────
// COLABORADORES (modal nuevo proyecto)
// ─────────────────────────────────────────────────────────────
const colabsSeleccionados = new Set();

/* Filtra las opciones de colaborador por NOMBRE o por ROL.
   Ej.: escribir "empleado" muestra todos los empleados;
   "supervisor" muestra a los supervisores. */
function filtrarColabs(q){
  document.getElementById('colab-dropdown').style.display='block';
  const term = q.toLowerCase();
  document.querySelectorAll('.colab-option').forEach(o=>{
    const nombre = (o.dataset.name || '').toLowerCase();
    const rol    = (o.dataset.rol  || '').toLowerCase();
    o.style.display = (nombre.includes(term) || rol.includes(term)) ? '' : 'none';
  });
}

function agregarColab(el){
  const name=el.dataset.name, initials=el.dataset.initials;
  if(colabsSeleccionados.has(name)) return;
  colabsSeleccionados.add(name);
  el.classList.add('disabled');
  document.getElementById('colab-placeholder').style.display='none';
  const chip=document.createElement('div');
  chip.className='colab-chip';
  chip.id='chip-'+name.replace(/\s/g,'');
  chip.innerHTML=`<div class="chip-av">${initials}</div><span>${name}</span><button type="button" onclick="quitarColab('${name}','${initials}')">✕</button>`;
  document.getElementById('colab-chips').appendChild(chip);
  document.getElementById('colab-search').value='';
  document.getElementById('colab-dropdown').style.display='none';
  document.querySelectorAll('.colab-option').forEach(o=>o.style.display='');
}

function quitarColab(name){
  colabsSeleccionados.delete(name);
  const chip=document.getElementById('chip-'+name.replace(/\s/g,''));
  if(chip) chip.remove();
  document.querySelectorAll('.colab-option').forEach(o=>{if(o.dataset.name===name)o.classList.remove('disabled');});
  if(colabsSeleccionados.size===0) document.getElementById('colab-placeholder').style.display='';
}

// ─────────────────────────────────────────────────────────────
// GUARDAR PROYECTO
// ─────────────────────────────────────────────────────────────
let _proyectoEnEdicion = null; // ID del proyecto que se edita (null = creación)

/* Abre el modal de nuevo proyecto limpiando errores previos,
   pero conservando los datos que el usuario ya haya escrito. */
function abrirModalNuevoProyecto(){
  _proyectoEnEdicion = null;
  document.querySelector('#modal-nuevo .modal-title').innerHTML = 'Nuevo <em style="font-style:italic">Proyecto</em>';
  FormUtils.limpiarErrores(document.getElementById('modal-nuevo'));
  // En creación, la fecha de inicio se restringe de HOY en adelante
  const ini = document.getElementById('np-inicio');
  if(ini) ini.min = new Date().toISOString().slice(0,10);
  document.getElementById('modal-nuevo').classList.add('open');
  // Enfocar el primer campo para poder navegar con tabulador
  setTimeout(()=>document.getElementById('np-nombre').focus(), 80);
}

/* ── EDITAR PROYECTO: reutiliza el modal de creación precargado ── */
function abrirEditarProyecto(id){
  const p = PROYECTOS.find(x=>x.id===id);
  if(!p) return;
  _proyectoEnEdicion = id;
  FormUtils.limpiarErrores(document.getElementById('modal-nuevo'));
  document.querySelector('#modal-nuevo .modal-title').innerHTML =
    `Editar <em style="font-style:italic">Proyecto</em> <span style="font-size:12px;color:var(--muted)">· ${id}</span>`;

  // Precargar todos los campos con los datos actuales
  document.getElementById('np-nombre').value = p.nombre;
  document.getElementById('np-tipo').value   = p.tipo;
  document.getElementById('sel-depto').value = p.depto;
  cargarMunicipios();
  const selMun = document.getElementById('sel-municipio');
  // Defensivo: si el municipio guardado no está en el catálogo del
  // departamento, se agrega como opción para no perder el dato
  if(![...selMun.options].some(o=>o.value===p.municipio)){
    const o=document.createElement('option'); o.value=p.municipio; o.textContent=p.municipio; selMun.appendChild(o);
  }
  selMun.value = p.municipio;
  const aISO = f => { const d = parseFechaCorta(f); return d ? d.toISOString().slice(0,10) : ''; };
  const ini = document.getElementById('np-inicio');
  ini.removeAttribute('min'); // al editar se conservan fechas históricas
  ini.value = aISO(p.inicio);
  document.getElementById('np-fin').value = aISO(p.fin);
  document.getElementById('np-presupuesto').value = p.presupuesto;
  document.getElementById('np-desc').value = p.descripcion || '';

  // Colaboradores actuales como chips
  colabsSeleccionados.clear();
  document.getElementById('colab-chips').innerHTML =
    '<span style="font-size:11.5px;color:var(--muted);align-self:center" id="colab-placeholder">Ningún colaborador añadido aún</span>';
  p.colaboradores.forEach(c=>{
    colabsSeleccionados.add(c.nombre);
    document.getElementById('colab-placeholder').style.display='none';
    const chip=document.createElement('div');
    chip.className='colab-chip';
    chip.id='chip-'+c.nombre.replace(/\s/g,'');
    chip.innerHTML=`<div class="chip-av">${c.initials}</div><span>${c.nombre}</span><button type="button" onclick="quitarColab('${c.nombre}')">✕</button>`;
    document.getElementById('colab-chips').appendChild(chip);
  });

  // La evidencia ya existe: en edición no se vuelve a exigir
  document.getElementById('np-evidencia-files').innerHTML =
    `<div class="file-chip" data-filename="evidencia_registrada.pdf" style="display:flex;align-items:center;gap:8px;background:var(--cream);border:1px solid var(--cream-dark);border-radius:8px;padding:6px 10px;font-size:12px">
      <span class="material-symbols-rounded" style="font-size:16px;color:var(--success)">verified</span>
      <span style="flex:1;color:var(--text)">Evidencia de presupuesto registrada</span>
    </div>`;

  document.getElementById('modal-detalle').classList.remove('open');
  document.getElementById('modal-nuevo').classList.add('open');
}

/* ── EXPORTAR FICHA: documento imprimible (Guardar como PDF) ── */
function exportarFichaProyecto(id){
  const p = PROYECTOS.find(x=>x.id===id);
  if(!p) return;
  const win = window.open('', '_blank');
  if(!win){ showToast('Habilita las ventanas emergentes para exportar la ficha.','warning'); return; }
  const filas = (p.hitos||[]).map(h=>`<tr><td>${h.label}</td><td style="text-align:right">${h.pct}%</td></tr>`).join('');
  const equipo = p.colaboradores.map(c=>`<li>${c.nombre} — ${c.rol}</li>`).join('');
  win.document.write(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Ficha ${p.id}</title>
    <style>
      body{font-family:'Segoe UI',Arial,sans-serif;color:#1A1F35;margin:40px;font-size:13px}
      .head{display:flex;justify-content:space-between;border-bottom:3px solid #0D1B3E;padding-bottom:12px;margin-bottom:20px}
      .brand{font-size:20px;font-weight:700;color:#0D1B3E;letter-spacing:1px}
      .sub{font-size:11px;color:#777}
      h1{font-size:17px;color:#0D1B3E;margin:0 0 4px}
      .meta{color:#666;font-size:12px;margin-bottom:16px}
      table{width:100%;border-collapse:collapse;margin:8px 0 16px}
      th,td{border:1px solid #ddd;padding:7px 10px;text-align:left;font-size:12px}
      th{background:#F7F4EE;text-transform:uppercase;font-size:10px;letter-spacing:.6px}
      .grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:14px}
      .kpi{background:#F7F4EE;border-radius:8px;padding:10px;text-align:center}
      .kpi b{display:block;font-size:16px;color:#0D1B3E}
      .foot{margin-top:28px;font-size:10px;color:#999;border-top:1px solid #ddd;padding-top:8px}
    </style></head><body>
    <div class="head">
      <div><div class="brand">PRONADERS</div><div class="sub">Programa Nacional de Desarrollo Rural y Economía Social</div></div>
      <div class="sub" style="text-align:right">Ficha de proyecto · ${p.id}<br>${new Date().toLocaleDateString('es-HN')}</div>
    </div>
    <h1>${p.nombre}</h1>
    <div class="meta">${p.tipo} · ${p.municipio}, ${p.depto} · Estado: ${p.estadoLabel} · Supervisor: ${p.supervisor}</div>
    <div class="grid">
      <div class="kpi"><b>${p.avance}%</b>Avance físico</div>
      <div class="kpi"><b>L ${(p.presupuesto/1000000).toFixed(2)}M</b>Presupuesto inicial</div>
      <div class="kpi"><b>L ${((p.presupuestoFinal||p.presupuestoEjecutado||0)/1000000).toFixed(2)}M</b>Presupuesto ejecutado</div>
    </div>
    <p><strong>Descripción:</strong> ${p.descripcion}</p>
    <p><strong>Período:</strong> ${p.inicio} — ${p.fin}${p.finReal?` · Fecha final real: ${p.finReal}`:''}</p>
    <h1 style="font-size:14px">Etapas</h1>
    <table><thead><tr><th>Etapa</th><th style="text-align:right">Avance</th></tr></thead><tbody>${filas}</tbody></table>
    <h1 style="font-size:14px">Equipo del proyecto</h1>
    <ul>${equipo}</ul>
    <div class="foot">Documento generado automáticamente por el Sistema PRONADERS. Uso interno institucional.</div>
    <script>window.onload = () => { window.print(); };<\/script>
  </body></html>`);
  win.document.close();
  showToast(`Exportando la ficha del proyecto ${p.id}...`,'info');
}

/* Al cambiar la fecha de inicio, la fecha final no puede ser anterior */
function validarRangoFechas(){
  const ini = document.getElementById('np-inicio');
  const fin = document.getElementById('np-fin');
  // Restricción: la fecha de inicio no puede ser anterior a HOY
  const hoy = new Date(); hoy.setHours(0,0,0,0);
  if(ini.value && new Date(ini.value+'T00:00:00') < hoy){
    FormUtils.marcarInvalido(ini, 'La fecha de inicio debe ser de hoy en adelante.');
  } else {
    FormUtils.limpiarInvalido(ini);
  }
  if(ini.value) fin.min = ini.value; // bloquea fechas anteriores en el selector
  if(ini.value && fin.value && !FormUtils.fechasValidas(ini.value, fin.value)){
    FormUtils.marcarInvalido(fin, 'La fecha final no puede ser anterior a la fecha de inicio.');
  } else {
    FormUtils.limpiarInvalido(fin);
  }
}

/* Muestra los archivos de evidencia de presupuesto como chips */
function mostrarEvidencia(files){
  const c = document.getElementById('np-evidencia-files');
  if(!files || !files.length) return;
  Array.from(files).forEach(f=>{
    const d=document.createElement('div');
    d.className='file-chip';
    d.dataset.filename=f.name;
    d.style.cssText='display:flex;align-items:center;gap:8px;background:var(--cream);border:1px solid var(--cream-dark);border-radius:8px;padding:6px 10px;font-size:12px';
    d.innerHTML=`<span class="material-symbols-rounded" style="font-size:16px;color:var(--navy)">description</span>
      <span style="flex:1;color:var(--text)">${f.name}</span>
      <span style="color:var(--muted)">${(f.size/1024).toFixed(0)} KB</span>
      <button type="button" onclick="this.parentElement.remove()" style="background:none;border:none;cursor:pointer;color:var(--muted)">✕</button>`;
    c.appendChild(d);
  });
  // Al adjuntar evidencia se limpia el error del dropzone si existía
  const dz = document.getElementById('np-evidencia-drop');
  dz.style.borderColor='';
  const err = document.querySelector('.field-error[data-for="np-evidencia-drop"]');
  if(err) err.remove();
}

/* GUARDAR PROYECTO — Estrategia de validación (opción 2):
   el botón siempre está habilitado; al presionarlo se marcan TODOS
   los campos obligatorios pendientes con su mensaje de error y los
   datos escritos se conservan hasta que el registro sea exitoso. */
function guardarProyecto(){
  let errores = FormUtils.validar([
    {id:'np-nombre',      msg:'El nombre del proyecto es obligatorio.'},
    {id:'np-tipo',        msg:'Selecciona el tipo de proyecto.'},
    {id:'sel-depto',      msg:'Selecciona el departamento.'},
    {id:'sel-municipio',  msg:'Selecciona el municipio.'},
    {id:'np-inicio',      msg:'La fecha de inicio es obligatoria.'},
    {id:'np-fin',         msg:'La fecha estimada de fin es obligatoria.'},
    {id:'np-presupuesto', msg:'Indica un presupuesto mayor a cero.', cond:v=>parseFloat(v)>0},
  ]);

  // Validación de rango de fechas: fin no puede ser anterior a inicio
  const ini = document.getElementById('np-inicio').value;
  const fin = document.getElementById('np-fin').value;
  // La fecha de inicio debe ser de HOY en adelante (solo en CREACIÓN;
  // al editar se respetan las fechas históricas del proyecto)
  const _hoy = new Date(); _hoy.setHours(0,0,0,0);
  if(!_proyectoEnEdicion && ini && new Date(ini+'T00:00:00') < _hoy){
    FormUtils.marcarInvalido(document.getElementById('np-inicio'),
      'La fecha de inicio debe ser de hoy en adelante.');
    errores++;
  }
  if(ini && fin && !FormUtils.fechasValidas(ini, fin)){
    FormUtils.marcarInvalido(document.getElementById('np-fin'),
      'La fecha final no puede ser anterior a la fecha de inicio.');
    errores++;
  }

  // Evidencia inicial de presupuesto: OBLIGATORIA (en edición ya existe)
  const evid = document.querySelectorAll('#np-evidencia-files .file-chip');
  if(evid.length === 0 && !_proyectoEnEdicion){
    const dz = document.getElementById('np-evidencia-drop');
    dz.style.borderColor = '#C0392B';
    if(!document.querySelector('.field-error[data-for="np-evidencia-drop"]')){
      const err=document.createElement('div');
      err.className='field-error';
      err.dataset.for='np-evidencia-drop';
      err.innerHTML='<span class="material-symbols-rounded" style="font-size:13px">error</span>Adjunta la evidencia inicial de presupuesto (obligatoria).';
      dz.insertAdjacentElement('afterend', err);
    }
    errores++;
  }

  // Al menos un colaborador
  if(colabsSeleccionados.size === 0){
    showToast('Debes añadir al menos un colaborador al proyecto.','warning');
    errores++;
  }

  if(errores){
    showToast(`No se guardó el proyecto: hay ${errores} campo(s) obligatorio(s) con error. Los datos ingresados se conservaron.`,'warning');
    return; // IMPORTANTE: no se cierra el modal ni se borran los datos
  }

  const nombre = document.getElementById('np-nombre').value.trim();
  const fmt = f => new Date(f+'T00:00:00').toLocaleDateString('es-HN',{day:'2-digit',month:'short',year:'numeric'});

  // ── EDICIÓN: actualizar el proyecto existente ──
  if(_proyectoEnEdicion){
    const p = PROYECTOS.find(x=>x.id===_proyectoEnEdicion);
    if(p){
      p.nombre = nombre;
      p.tipo   = document.getElementById('np-tipo').value;
      p.depto  = document.getElementById('sel-depto').value;
      p.municipio = document.getElementById('sel-municipio').value;
      p.inicio = fmt(ini);
      p.fin    = fmt(fin);
      p.presupuesto = parseFloat(document.getElementById('np-presupuesto').value)||p.presupuesto;
      p.descripcion = document.getElementById('np-desc').value || p.descripcion;
      p.colaboradores = [...colabsSeleccionados].map(n=>{
        const previo = p.colaboradores.find(c=>c.nombre===n);
        return previo || {nombre:n,initials:n.split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase(),rol:'Colaborador',color:'var(--cream-dark)',text:'var(--text-light)'};
      });
      showToast(`Proyecto "${nombre}" actualizado correctamente (${p.id}). Cambio registrado en la bitácora.`,'success');
    }
    _proyectoEnEdicion = null;
    cerrarYLimpiarModalProyecto();
    renderGaleria();
    return;
  }

  // ── Registro del nuevo proyecto ──
  const nuevo = {
    id:'PRY-'+String(PROYECTOS.length+1).padStart(3,'0'),
    nombre, tipo:document.getElementById('np-tipo').value, tipoColor:'var(--info)',
    estado:'en_revision', estadoLabel:'En revisión', estadoBadge:'badge-warning',
    depto:document.getElementById('sel-depto').value,
    municipio:document.getElementById('sel-municipio').value,
    presupuesto:parseFloat(document.getElementById('np-presupuesto').value)||0,
    avance:0, inicio:fmt(ini), fin:fmt(fin),
    descripcion:document.getElementById('np-desc').value || 'Sin descripción registrada.',
    supervisor:[...colabsSeleccionados][0], supervisorInitials:'',
    colaboradores:[...colabsSeleccionados].map(n=>({nombre:n,initials:n.split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase(),rol:'Colaborador',color:'var(--cream-dark)',text:'var(--text-light)'})),
    solicitudes:[], reportes:[],
    hitos:[{label:'Planificación inicial',pct:0,done:false}],
    miembros:[],
  };
  PROYECTOS.push(nuevo);

  // Mensaje de registro exitoso
  showToast(`Proyecto "${nombre}" registrado correctamente con su evidencia de presupuesto (${nuevo.id}).`,'success');

  // Limpiar el formulario SOLO tras un registro exitoso
  cerrarYLimpiarModalProyecto();
  renderGaleria(); // refrescar la galería con el nuevo proyecto (sin refresh de página)
}

/* Limpia y cierra el modal de proyecto (tras guardar con éxito) */
function cerrarYLimpiarModalProyecto(){
  ['np-nombre','np-inicio','np-fin','np-presupuesto','np-desc'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('sel-depto').value='';
  cargarMunicipios();
  document.getElementById('np-evidencia-files').innerHTML='';
  colabsSeleccionados.clear();
  document.getElementById('colab-chips').innerHTML='<span style="font-size:11.5px;color:var(--muted);align-self:center" id="colab-placeholder">Ningún colaborador añadido aún</span>';
  document.querySelectorAll('.colab-option').forEach(o=>o.classList.remove('disabled'));
  document.getElementById('modal-nuevo').classList.remove('open');
}

// ─────────────────────────────────────────────────────────────
// GEO — municipios
// ─────────────────────────────────────────────────────────────
const GEO_MUNICIPIOS = {
  "Atlántida":["Arizona","El Porvenir","Esparta","Jutiapa","La Ceiba","La Masica","San Francisco","Tela"],
  "Choluteca":["Apacilagua","Choluteca","Concepción de María","Duyure","El Corpus","El Triunfo","Marcovia","Morolica","Namasigüe","Orocuina","Pespire","San Antonio de Flores","San Isidro","San José","San Marcos de Colón","Santa Ana de Yusguare"],
  "Colón":["Balfate","Bonito Oriental","Iriona","Limón","Sabá","Santa Fe","Santa Rosa de Aguán","Sonaguera","Tocoa","Trujillo"],
  "Comayagua":["Ajuterique","Comayagua","El Rosario","Esquías","Humuya","La Libertad","La Trinidad","Lamaní","Las Lajas","Lejamaní","Meámbar","Minas de Oro","Ojos de Agua","San Jerónimo","San José de Comayagua","San José del Potrero","San Luis","San Sebastián","Siguatepeque","Taulabé","Villa de San Antonio"],
  "Copán":["Cabañas","Concepción","Copán Ruinas","Corquín","Cucuyagua","Dolores","Dulce Nombre","El Paraíso","Florida","La Jigua","La Unión","Nueva Arcadia","San Agustín","San Antonio","San Jerónimo","San José","San Juan de Opoa","San Nicolás","San Pedro","Santa Rita","Santa Rosa de Copán","Trinidad de Copán","Veracruz"],
  "Cortés":["Choloma","La Lima","Omoa","Pimienta","Potrerillos","Puerto Cortés","San Antonio de Cortés","San Francisco de Yojoa","San Manuel","San Pedro Sula","Santa Cruz de Yojoa","Villanueva"],
  "El Paraíso":["Alauca","Danlí","El Paraíso","Güinope","Jacaleapa","Liure","Morocelí","Oropolí","Potrerillos","San Antonio de Flores","San Lucas","San Matías","Soledad","Teupasenti","Texiguat","Trojes","Vado Ancho","Yauyupe","Yuscarán"],
  "Francisco Morazán":["Alubarén","Cedros","Curarén","Distrito Central","El Porvenir","Guaimaca","La Libertad","La Venta","Lepaterique","Maraita","Marale","Nueva Armenia","Ojojona","Orica","Reitoca","Sabanagrande","San Antonio de Oriente","San Buenaventura","San Ignacio","San Juan de Flores","San Miguelito","Santa Ana","Santa Lucía","Talanga","Tatumbla","Valle de Ángeles","Vallecillo","Villa de San Francisco"],
  "Gracias a Dios":["Ahuas","Brus Laguna","Juan Francisco Bulnes","Puerto Lempira","Ramón Villeda Morales","Wampusirpe"],
  "Intibucá":["Camasca","Colomoncagua","Concepción","Dolores","Intibucá","Jesús de Otoro","La Esperanza","Magdalena","Masaguara","San Antonio","San Francisco de Opalaca","San Isidro","San Juan","San Marcos de la Sierra","San Miguel Guancapla","Santa Lucía","Yamaranguila"],
  "Islas de La Bahía":["Guanaja","José Santos Guardiola","Roatán","Utila"],
  "La Paz":["Aguanqueterique","Cabañas","Cane","Chinacla","Guajiquiro","La Paz","Lauterique","Marcala","Mercedes de Oriente","Opatoro","San Antonio del Norte","San José","San Juan","San Pedro de Tutule","Santa Ana","Santa Elena","Santa María","Santiago de Puringla","Yarula"],
  "Lempira":["Belén","Candelaria","Cololaca","Erandique","Gracias","Gualcince","Guarita","La Campa","La Iguala","La Unión","La Virtud","Las Flores","Lepaera","Mapulaca","Piraera","San Andrés","San Francisco","San Juan Guarita","San Manuel Colohete","San Marcos de Caiquín","San Rafael","San Sebastián","Santa Cruz","Talgua","Tambla","Tomalá","Valladolid","Virginia"],
  "Ocotepeque":["Belén Gualcho","Concepción","Dolores Merendón","Fraternidad","La Encarnación","La Labor","Lucerna","Mercedes","Nueva Ocotepeque","San Fernando","San Francisco del Valle","San Jorge","San Marcos","Santa Fe","Sensenti","Sinuapa"],
  "Olancho":["Campamento","Catacamas","Concordia","Dulce Nombre de Culmí","El Rosario","Esquipulas del Norte","Gualaco","Guarizama","Guata","Guayape","Jano","Juticalpa","La Unión","Mangulile","Manto","Patuca","Salamá","San Esteban","San Francisco de Becerra","San Francisco de la Paz","Santa María del Real","Silca","Yocón"],
  "Santa Bárbara":["Arada","Atima","Azacualpa","Ceguaca","Chinda","Concepción del Norte","Concepción del Sur","El Níspero","Gualala","Ilama","Las Vegas","Macuelizo","Naranjito","Nueva Frontera","Nuevo Celilac","Petoa","Protección","Quimistán","San Francisco de Ojuera","San José de las Colinas","San Luis","San Marcos","San Nicolás","San Pedro Zacapa","San Vicente Centenario","Santa Bárbara","Santa Rita","Trinidad"],
  "Valle":["Alianza","Amapala","Aramecina","Caridad","Goascorán","Langue","Nacaome","San Francisco de Coray","San Lorenzo"],
  "Yoro":["Arenal","El Negrito","El Progreso","Jocón","Morazán","Olanchito","Santa Rita","Sulaco","Victoria","Yorito","Yoro"]
};

function cargarMunicipios(){
  const d=document.getElementById('sel-depto').value;
  const s=document.getElementById('sel-municipio');
  s.innerHTML='<option value="">— Selecciona un municipio —</option>';
  if(!d||!GEO_MUNICIPIOS[d]){s.disabled=true;s.innerHTML='<option value="">— Primero selecciona departamento —</option>';return;}
  GEO_MUNICIPIOS[d].forEach(m=>{const o=document.createElement('option');o.value=m;o.textContent=m;s.appendChild(o);});
  s.disabled=false;
}

// ─────────────────────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────────────────────
let _tt;
function showToast(msg,tipo='success'){
  const t=document.getElementById('toast');
  const icons={success:'check_circle',warning:'warning',info:'info'};
  t.className=`toast ${tipo}`;
  document.getElementById('toast-icon').textContent=icons[tipo]||'check_circle';
  document.getElementById('toast-msg').textContent=msg;
  t.classList.add('show');
  clearTimeout(_tt);
  _tt=setTimeout(()=>t.classList.remove('show'),4000);
}

/* ──────────────────────────────────────────────
   TARJETA DE DETALLE DE UN REPORTE ASOCIADO
   Se abre al hacer clic en un reporte dentro del
   detalle del proyecto y muestra TODOS sus datos.
   ────────────────────────────────────────────── */
function abrirDetalleReporte(pid, idx){
  const p = PROYECTOS.find(x=>x.id===pid);
  const r = p && p.reportes[idx];
  if(!r) return;

  const adjuntos = (r.adjuntos||[]).length
    ? `<div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--cream-dark)">
        <div style="font-size:10.5px;font-weight:600;text-transform:uppercase;letter-spacing:.6px;color:var(--muted);margin-bottom:8px">Adjuntos del reporte</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${r.adjuntos.map(a=>`
          <div class="evidence-thumb" style="width:70px;height:52px;border-radius:8px;background:var(--cream-dark);display:flex;align-items:center;justify-content:center;font-size:22px;color:var(--muted);cursor:pointer"
               title="${a.nombre}"
               onclick='abrirVisor({tipo:"${a.tipo}",nombre:"${a.nombre}",codigo:"${r.id||""}",tipoCodigo:"reporte",descripcion:${JSON.stringify(r.titulo+" — "+(r.descripcion||""))}})'>
            <span class="material-symbols-rounded">${a.tipo==='img'?'image':a.tipo==='pdf'?'picture_as_pdf':'description'}</span>
          </div>`).join('')}
        </div>
      </div>` : '';

  mostrarSubTarjeta(`
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px">
      <div>
        <div style="font-size:11px;font-weight:600;color:var(--muted)">${r.id||'Reporte'}</div>
        <div style="font-family:var(--font-serif);font-size:19px;font-weight:300;color:var(--navy);margin-top:2px">${r.titulo}</div>
        <div class="text-xs text-muted" style="margin-top:3px">${p.nombre} · ${r.autor||p.supervisor}</div>
      </div>
      <span class="badge ${r.badge}">${r.estado}</span>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:14px">
      <div style="background:var(--cream);border-radius:var(--radius);padding:10px 12px;text-align:center">
        <div style="font-family:var(--font-serif);font-size:20px;color:var(--navy)">${r.avance}%</div>
        <div style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px">Avance físico</div>
      </div>
      <div style="background:var(--cream);border-radius:var(--radius);padding:10px 12px;text-align:center">
        <div style="font-size:12.5px;font-weight:600;color:var(--navy);margin-top:4px">${r.fecha}</div>
        <div style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px">Fecha de emisión</div>
      </div>
      <div style="background:var(--cream);border-radius:var(--radius);padding:10px 12px;text-align:center">
        <div style="font-size:12.5px;font-weight:600;color:${r.fechaRevision?'var(--success)':'var(--muted)'};margin-top:4px">${r.fechaRevision||'Pendiente'}</div>
        <div style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px">Fecha de revisión</div>
      </div>
    </div>
    <div style="font-size:10.5px;font-weight:600;text-transform:uppercase;letter-spacing:.6px;color:var(--muted);margin-bottom:6px">Descripción del avance</div>
    <p style="font-size:13px;line-height:1.7;color:var(--text)">${r.descripcion||'—'}</p>
    ${adjuntos}
    <div style="display:flex;justify-content:flex-end;margin-top:16px">
      <a href="reportes.html" class="btn btn-outline btn-sm" style="text-decoration:none"
         onclick="sessionStorage.setItem('pron_open_reporte','${r.id||''}')">
        <span class="material-symbols-rounded" style="font-size:14px">open_in_new</span> Abrir en el módulo de reportes
      </a>
    </div>`);
}

/* ──────────────────────────────────────────────
   RESUMEN DE SOLICITUDES (datos espejo del módulo
   de solicitudes, para la tarjeta de detalle)
   ────────────────────────────────────────────── */
const SOLICITUDES_INFO = {
  'SOL-2026-047':{proyecto:'Puente Choluteca',solicitante:'Isaac Carranza',fecha:'26 abr 2026',estado:'Pendiente',badge:'badge-warning',
    justificacion:'Agotamiento de materiales para continuar con la segunda columna.',
    items:[['Material','Cemento Portland 42.5 kg','150 bolsas',52500],['Material','Varilla de hierro 3/8"','200 unidades',31000],['Equipo','Mezcladora de concreto (renta)','1 mes',18000]]},
  'SOL-2026-046':{proyecto:'Puente Choluteca',solicitante:'Isaac Carranza',fecha:'24 abr 2026',estado:'Aprobada',badge:'badge-success',
    justificacion:'Equipo de altura para montaje de estructura metálica.',
    items:[['Equipo','Andamio metálico 2m','6 unidades',9600],['Equipo','Taladro percutor 1/2"','2 unidades',4200]]},
  'SOL-2026-044':{proyecto:'Riego El Paraíso',solicitante:'Isaac Carranza',fecha:'20 abr 2026',estado:'Aprobada',badge:'badge-success',
    justificacion:'Tubería para el tramo B de la red principal.',
    items:[['Material','Tubería PVC 4" x 6m','80 unidades',15200]]},
  'SOL-2026-039':{proyecto:'Centro San Pedro',solicitante:'Andrea Amador',fecha:'15 abr 2026',estado:'Rechazada',badge:'badge-danger',
    justificacion:'Material eléctrico para la fase de instalaciones.',
    motivoRechazo:'El presupuesto del Q2 no contempla materiales eléctricos. Incluir en solicitud del Q3.',
    items:[['Material','Cable THHN #12','500 metros',8500],['Material','Tablero de 12 circuitos','2 unidades',6400]]},
  'SOL-2026-035':{proyecto:'Camino Rural Copán',solicitante:'Jose Luis Montero',fecha:'10 abr 2026',estado:'En despacho',badge:'badge-dispatch',
    justificacion:'Material de base para pavimentación del km 0 al 4.',
    items:[['Material','Material selecto de base','120 m³',48000]]},
  'SOL-2026-028':{proyecto:'Riego El Paraíso',solicitante:'Isaac Carranza',fecha:'02 abr 2026',estado:'Confirmada',badge:'badge-confirmed',
    justificacion:'Bomba y accesorios de la estación de bombeo solar.',
    items:[['Equipo','Bomba sumergible solar 2HP','1 unidad',38500]]},
  'SOL-2026-020':{proyecto:'Puente Choluteca',solicitante:'Isaac Carranza',fecha:'18 mar 2026',estado:'Confirmada',badge:'badge-confirmed',
    justificacion:'Acero estructural para vigas del claro principal.',
    items:[['Material','Viga IPR 12" x 6m','14 unidades',126000]]},
};

/* Tarjeta de detalle de una solicitud asociada al proyecto */
function abrirDetalleSolicitud(id){
  const s = SOLICITUDES_INFO[id];
  if(!s){ showToast('No se encontró información de la solicitud '+id,'warning'); return; }
  // Por corrección: las solicitudes ya no muestran montos ni total estimado

  mostrarSubTarjeta(`
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px">
      <div>
        <div style="font-size:11px;font-weight:600;color:var(--muted)">${id}</div>
        <div style="font-family:var(--font-serif);font-size:19px;font-weight:300;color:var(--navy);margin-top:2px">Solicitud de recursos</div>
        <div class="text-xs text-muted" style="margin-top:3px">${s.proyecto} · ${s.solicitante} · ${s.fecha}</div>
      </div>
      <span class="badge ${s.badge}">${s.estado}</span>
    </div>
    <div class="text-sm" style="color:var(--text-light);margin-bottom:12px"><strong>Justificación:</strong> ${s.justificacion}</div>
    ${s.motivoRechazo?`
    <div style="background:var(--danger-bg);border-left:3px solid var(--danger);border-radius:var(--radius);padding:10px 14px;margin-bottom:12px">
      <div style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--danger);margin-bottom:3px">Motivo del rechazo</div>
      <div style="font-size:12.5px;color:var(--text)">${s.motivoRechazo}</div>
    </div>`:''}
    <div style="border:1px solid var(--cream-dark);border-radius:var(--radius);overflow:hidden;margin-bottom:10px">
      <table style="width:100%;border-collapse:collapse;font-size:12.5px">
        <thead><tr style="background:var(--cream)">
          <th style="padding:7px 12px;text-align:left;font-size:10px;text-transform:uppercase;color:var(--muted)">Tipo</th>
          <th style="padding:7px 12px;text-align:left;font-size:10px;text-transform:uppercase;color:var(--muted)">Recurso</th>
          <th style="padding:7px 12px;text-align:left;font-size:10px;text-transform:uppercase;color:var(--muted)">Cantidad</th>
        </tr></thead>
        <tbody>${s.items.map(i=>`<tr><td style="padding:7px 12px">${i[0]}</td><td style="padding:7px 12px">${i[1]}</td><td style="padding:7px 12px">${i[2]}</td></tr>`).join('')}</tbody>
      </table>
    </div>
    <div style="display:flex;justify-content:flex-end;margin-top:14px">
      <a href="solicitudes.html" class="btn btn-outline btn-sm" style="text-decoration:none"
         onclick="sessionStorage.setItem('pron_open_solicitud','${id}')">
        <span class="material-symbols-rounded" style="font-size:14px">open_in_new</span> Abrir en el módulo de solicitudes
      </a>
    </div>`);
}

/* Overlay reutilizable para las tarjetas de reporte/solicitud
   (se apila SOBRE el modal de detalle del proyecto). */
function mostrarSubTarjeta(html){
  let m = document.getElementById('modal-subtarjeta');
  if(!m){
    m = document.createElement('div');
    m.id = 'modal-subtarjeta';
    m.className = 'modal-overlay';
    m.style.zIndex = '300'; // sobre el modal de detalle (200)
    m.innerHTML = `<div class="modal" style="max-width:560px;position:relative">
      <button class="close-btn" style="position:absolute;top:16px;right:16px" onclick="document.getElementById('modal-subtarjeta').classList.remove('open')">
        <span class="material-symbols-rounded">close</span>
      </button>
      <div id="subtarjeta-body" style="padding-right:8px"></div>
    </div>`;
    document.body.appendChild(m);
    m.addEventListener('click', e=>{ if(e.target===m) m.classList.remove('open'); });
  }
  document.getElementById('subtarjeta-body').innerHTML = html;
  m.classList.add('open');
}

/* ──────────────────────────────────────────────
   ACCESO DIRECTO DESDE EL DASHBOARD
   "Nuevo Proyecto" del panel abre el modal directamente.
   ────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Restricción: la fecha de inicio del proyecto solo admite HOY en adelante
  const hoy = new Date().toISOString().slice(0,10);
  const ini = document.getElementById('np-inicio');
  if(ini) ini.min = hoy;

  if(sessionStorage.getItem('pron_abrir_modal_proyecto') === '1'){
    sessionStorage.removeItem('pron_abrir_modal_proyecto');
    setTimeout(() => abrirModalNuevoProyecto(), 150);
  }
});

// =============================================
// BASE DE USUARIOS DEL SISTEMA
// =============================================
const USUARIOS = {
  // ADMIN DE OFICINA
  '20221003100': {
    nombre: 'Silvia Zuniga',
    cuenta: '20221003100',
    rol: 'admin_oficina',
    password: 'admin2022',
    initials: 'SZ',
    dashboard: 'dashboard-admin.html'
  },
  // ADMIN DE OFICINA
  '20221000395': {
    nombre: 'Andrea Amador',
    cuenta: '20221000395',
    rol: 'admin_oficina',
    password: 'oficina2022',
    initials: 'AA',
    dashboard: 'dashboard-admin.html'
  },
  // SUPERVISOR DE CAMPO
  '20221003506': {
    nombre: 'Isaac Carranza',
    cuenta: '20221003506',
    rol: 'campo',
    password: 'campo2022',
    initials: 'IC',
    dashboard: 'dashboard-campo.html'
  },
  // ADMIN DE OFICINA
  '20211022013': {
    nombre: 'Josue Vasquez',
    cuenta: '20211022013',
    rol: 'admin_oficina',
    password: 'josue2021',
    initials: 'JV',
    dashboard: 'dashboard-admin.html'
  },
  'JLM001': {
    nombre: 'Jose Luis Montero',
    cuenta: 'JLM001',
    rol: 'empleado',
    password: 'montero123',
    initials: 'JL',
    dashboard: 'dashboard-campo.html'
  },
  'CR007': {
    nombre: 'Cristiano Ronaldo',
    cuenta: 'CR007',
    rol: 'empleado',
    password: 'cr7pronaders',
    initials: 'CR',
    dashboard: 'dashboard-campo.html'
  },
  'LY10': {
    nombre: 'Lamine Yamal',
    cuenta: 'LY10',
    rol: 'empleado',
    password: 'yamal2024',
    initials: 'LY',
    dashboard: 'dashboard-campo.html'
  },
  'CC09': {
    nombre: 'Carlos Costly',
    cuenta: 'CC09',
    rol: 'empleado',
    password: 'costly2024',
    initials: 'CC',
    dashboard: 'dashboard-campo.html'
  },
  // LOGÍSTICA
  'EQL01': {
    nombre: 'Equipo Logístico Centro',
    cuenta: 'EQL01',
    rol: 'logistica',
    password: 'logistica2024',
    initials: 'EL',
    dashboard: 'dashboard-logistica.html'
  }
};

/* ── Iniciar sesión presionando ENTER en cualquiera de los campos ──
   Mejora de accesibilidad: el formulario puede completarse solo con
   teclado (tabulador para avanzar y Enter para enviar). */
document.addEventListener('DOMContentLoaded', () => {
  ['username','password'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', e => {
      if(e.key === 'Enter') doLogin();
    });
  });
  // Enfocar el campo de usuario al cargar la página
  document.getElementById('username').focus();
});

/* Muestra u oculta la contraseña escrita */
function togglePw(){
  const inp = document.getElementById('password');
  const ico = document.getElementById('pw-icon');
  if(inp.type==='password'){ inp.type='text'; ico.textContent='visibility_off'; }
  else { inp.type='password'; ico.textContent='visibility'; }
}

function doLogin(){
  const username = document.getElementById('username').value.trim();
  const pass     = document.getElementById('password').value;
  const err      = document.getElementById('error-msg');

  const user = USUARIOS[username];

  if(user && user.password === pass){
    err.classList.remove('show');
    // Guardar sesión completa
    sessionStorage.setItem('pron_role',    user.rol);
    sessionStorage.setItem('pron_nombre',  user.nombre);
    sessionStorage.setItem('pron_cuenta',  user.cuenta);
    sessionStorage.setItem('pron_initials',user.initials);
    window.location.href = user.dashboard;
  } else {
    document.getElementById('error-text').textContent =
      user ? 'Contraseña incorrecta. Intenta de nuevo.' : 'Usuario no encontrado en el sistema.';
    err.classList.add('show');
    document.getElementById('password').focus();
  }
}

function demoLogin(cuenta){
  const user = USUARIOS[cuenta];
  if(!user) return;
  document.getElementById('username').value  = cuenta;
  document.getElementById('password').value  = user.password;
  sessionStorage.setItem('pron_role',    user.rol);
  sessionStorage.setItem('pron_nombre',  user.nombre);
  sessionStorage.setItem('pron_cuenta',  user.cuenta);
  sessionStorage.setItem('pron_initials',user.initials);
  setTimeout(()=>{ window.location.href = user.dashboard; }, 250);
}

document.addEventListener('keydown', e=>{ if(e.key==='Enter') doLogin(); });
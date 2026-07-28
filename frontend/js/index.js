// =============================================
// index.js LOGIN — ahora contra la API real (antes usaba
// un objeto USUARIOS simulado en memoria)
// =============================================

// Mapea el nombre_rol que devuelve la BD -> el dashboard al que redirige
const DASHBOARD_POR_ROL = {
  'Administrador de Oficina': 'dashboard-admin.html',
  'Supervisor de Campo': 'dashboard-campo.html',
  'Equipo de Logistica': 'dashboard-logistica.html'
};

/* ── Iniciar sesión presionando ENTER en cualquiera de los campos ──
   Mejora de accesibilidad: el formulario puede completarse solo con
   teclado (tabulador para avanzar y Enter para enviar). */
document.addEventListener('DOMContentLoaded', () => {
  ['correo','password'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', e => {
      if(e.key === 'Enter') doLogin();
    });
  });
  // Enfocar el campo de correo al cargar la página
  document.getElementById('correo').focus();
});

/* Muestra u oculta la contraseña escrita */
function togglePw(){
  const inp = document.getElementById('password');
  const ico = document.getElementById('pw-icon');
  if(inp.type==='password'){ inp.type='text'; ico.textContent='visibility_off'; }
  else { inp.type='password'; ico.textContent='visibility'; }
}

/* Calcula iniciales a partir del nombre completo, ej. "Andrea Amador" -> "AA" */
function calcularIniciales(nombre){
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('');
}

async function doLogin(){
  const correo = document.getElementById('correo').value.trim();
  const pass   = document.getElementById('password').value;
  const err    = document.getElementById('error-msg');
  const btn    = document.querySelector('.btn-login');

  if(!correo || !pass){
    document.getElementById('error-text').textContent = 'Ingresa tu correo y tu contraseña.';
    err.classList.add('show');
    return;
  }

  btn.disabled = true;
  try {
    const resp = await fetch('/api/usuarios/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, contrasena: pass })
    });
    const data = await resp.json();

    if(!resp.ok){
      // El backend responde 401 (credenciales inválidas) o 403 (usuario inactivo)
      document.getElementById('error-text').textContent =
        resp.status === 403 ? 'Tu usuario está inactivo. Contacta a un administrador.'
                             : 'Correo o contraseña incorrectos.';
      err.classList.add('show');
      document.getElementById('password').focus();
      return;
    }

    err.classList.remove('show');
    const { usuario, rol } = data;

    // Guardar sesión completa (mismas claves que ya usa el resto del sistema)
    sessionStorage.setItem('pron_role',     rol || 'campo');
    sessionStorage.setItem('pron_nombre',   usuario.nombre_usuario);
    sessionStorage.setItem('pron_cuenta',   usuario.correo);
    sessionStorage.setItem('pron_id_usuario', usuario.id_usuario);
    sessionStorage.setItem('pron_initials', calcularIniciales(usuario.nombre_usuario));

    window.location.href = DASHBOARD_POR_ROL[rol] || 'dashboard-campo.html';
  } catch (e) {
    document.getElementById('error-text').textContent =
      'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.';
    err.classList.add('show');
  } finally {
    btn.disabled = false;
  }
}

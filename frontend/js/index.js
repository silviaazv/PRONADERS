/*
   index.js

   Pantalla de inicio de sesión. Valida las credenciales contra la base de
   datos real, guarda los datos del usuario en sessionStorage y lo manda al
   tablero que le corresponde según su rol.

   Se usa sessionStorage y no localStorage a propósito: al cerrar el
   navegador la sesión se pierde, que es lo que conviene en las computadoras
   compartidas de las oficinas regionales.
*/

// A cada rol le toca un tablero distinto. La llave tiene que escribirse igual
// que el nombre_rol guardado en la base; si no coincide, el usuario cae en el
// tablero de campo por defecto (ver el final de doLogin).
const DASHBOARD_POR_ROL = {
  'Administrador de Oficina': 'dashboard-admin.html',
  'Supervisor de Campo': 'dashboard-campo.html',
  'Equipo de Logistica': 'dashboard-logistica.html'
};

/* Permite entrar con la tecla Enter desde cualquiera de los dos campos, sin
   tener que llegar hasta el botón. Es lo que uno espera de un login, y además
   deja usar toda la pantalla solo con el teclado: tabulador para avanzar y
   Enter para enviar. */
document.addEventListener('DOMContentLoaded', () => {
  ['correo','password'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', e => {
      if(e.key === 'Enter') doLogin();
    });
  });
  // El cursor arranca en el correo para poder escribir de una vez.
  document.getElementById('correo').focus();
});

/* Alterna entre ver y ocultar la contraseña. Sirve para que el usuario pueda
   revisar lo que escribió antes de mandarlo, sobre todo en los teléfonos donde
   es fácil equivocarse de tecla. El ícono cambia junto con el campo para que
   se note en qué modo está. */
function togglePw(){
  const inp = document.getElementById('password');
  const ico = document.getElementById('pw-icon');
  if(inp.type==='password'){ inp.type='text'; ico.textContent='visibility_off'; }
  else { inp.type='password'; ico.textContent='visibility'; }
}

/* Saca las iniciales del nombre para el circulito del avatar. Toma solo las
   dos primeras palabras, así que "Andrea Amador" queda como "AA" y un nombre
   largo como "Juan Carlos Pérez Mejía" queda como "JC" en vez de llenarse de
   letras. El filter(Boolean) descarta los espacios de más. */
function calcularIniciales(nombre){
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('');
}

/* Valida las credenciales y entra al sistema. El botón se deshabilita mientras
   se espera la respuesta para que nadie mande dos veces el formulario dándole
   clic seguido. */
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
      // El servidor distingue dos casos: 401 si el correo o la contraseña
      // están mal, y 403 si la cuenta existe pero fue desactivada. Vale la
      // pena separarlos porque a alguien con la cuenta dada de baja no le
      // sirve de nada seguir intentando la contraseña.
      document.getElementById('error-text').textContent =
        resp.status === 403 ? 'Tu usuario está inactivo. Contacta a un administrador.'
                             : 'Correo o contraseña incorrectos.';
      err.classList.add('show');
      document.getElementById('password').focus();
      return;
    }

    err.classList.remove('show');
    const { usuario, rol } = data;

    // Se guarda todo lo que las demás pantallas van a necesitar después:
    // shared.js lee estas mismas claves para armar el menú y saber quién está
    // conectado. Si se agrega una clave nueva aquí, hay que revisar que
    // shared.js también la contemple.
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

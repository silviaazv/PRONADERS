const path = require('path');
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ---------------------------------------------------------------
// 1) Servir el front-end estático (html / css / js) desde el mismo
//    servidor. Así evitas problemas de CORS y las rutas relativas
//    que ya corregimos (../css/..., ../js/...) funcionan igual.
// ---------------------------------------------------------------
const RAIZ_PROYECTO = path.join(__dirname, '..');

app.use(express.static(path.join(RAIZ_PROYECTO, 'frontend', 'html')));
app.use('/css', express.static(path.join(RAIZ_PROYECTO, 'frontend', 'css')));
app.use('/js', express.static(path.join(RAIZ_PROYECTO, 'frontend', 'js')));
app.use('/img', express.static(path.join(RAIZ_PROYECTO, 'img')));

app.get('/', (req, res) => {
  res.sendFile(path.join(RAIZ_PROYECTO, 'frontend', 'html', 'index.html'));
});

// ---------------------------------------------------------------
// 2) API REST — un router por tabla/módulo
// ---------------------------------------------------------------
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/roles', require('./routes/roles'));
app.use('/api/departamentos', require('./routes/departamentos'));
app.use('/api/municipios', require('./routes/municipios'));
app.use('/api/equipos', require('./routes/equipos'));
app.use('/api/proyectos', require('./routes/proyectos'));
//app.use('/api/proyectos-usuarios', require('./routes/proyectosUsuarios'));
app.use('/api/solicitudes', require('./routes/solicitudes'));
app.use('/api/fila-solicitud', require('./routes/filaSolicitud'));
app.use('/api/reportes', require('./routes/reportes'));
app.use('/api/archivos', require('./routes/archivos'));
app.use('/api/bitacora', require('./routes/bitacora'));

// Manejador de errores por si algo se escapa sin capturar en una ruta
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`PRONADERS backend escuchando en http://localhost:${PORT}`);
  console.log(`Front-end disponible en http://localhost:${PORT}/index.html`);
});

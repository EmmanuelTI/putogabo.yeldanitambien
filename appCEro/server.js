const express = require('express');
const path = require('path');
const app = express();
const PORT = 3274;

// Servir archivos estáticos de login y dashboard
app.use('/login', express.static(path.join(__dirname, 'login')));
app.use('/dashboard', express.static(path.join(__dirname, 'dashboard')));

// Si el usuario entra a /login sin especificar archivo, servir login.html
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login', 'login.html'));
});

// Si el usuario entra a /dashboard sin especificar archivo, servir dashboard.html
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard', 'dashboard.html'));
});

// Ruta raíz redirige a login
app.get('/', (req, res) => {
  res.redirect('/login');
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

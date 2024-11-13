// app.js
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();

// Configuración de la sesión
app.use(session({
    secret: 'tu_secreto', // Cambia esto por un secreto seguro
    resave: false,
    saveUninitialized: true
}));

// Configuración de body-parser
app.use(bodyParser.urlencoded({ extended: true }));

// Configuración de EJS
app.set('view engine', 'ejs');

// Servir archivos estáticos
app.use(express.static('public'));

// Datos en memoria
const users = []; // { username, password }
const parkingRecords = []; // { username, licensePlate, entryTime, exitTime, amount }

// Middleware para verificar si el usuario está autenticado
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login');
}

// Rutas

// Página de registro
app.get('/register', (req, res) => {
    res.render('register', { message: null });
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
        return res.render('register', { message: 'Usuario ya existe.' });
    }
    users.push({ username, password });
    res.redirect('/login');
});

// Página de login
app.get('/login', (req, res) => {
    res.render('login', { message: null });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        req.session.user = user;
        res.redirect('/dashboard');
    } else {
        res.render('login', { message: 'Credenciales inválidas.' });
    }
});

// Dashboard (Página de inicio personalizada)
app.get('/dashboard', isAuthenticated, (req, res) => {
    res.render('dashboard', { user: req.session.user });
});

// Registrar entrada de vehículo
app.get('/entry', isAuthenticated, (req, res) => {
    res.render('entry', { message: null });
});

app.post('/entry', isAuthenticated, (req, res) => {
    const { licensePlate } = req.body;
    const existingEntry = parkingRecords.find(record => record.licensePlate === licensePlate && !record.exitTime);
    if (existingEntry) {
        return res.render('entry', { message: 'El vehículo ya está registrado en el estacionamiento.' });
    }
    const entryTime = new Date();
    parkingRecords.push({
        username: req.session.user.username,
        licensePlate,
        entryTime,
        exitTime: null,
        amount: 0
    });
    res.redirect('/dashboard');
});

// Registrar salida de vehículo
app.get('/exit', isAuthenticated, (req, res) => {
    res.render('exit', { receipt: null, message: null });
});

app.post('/exit', isAuthenticated, (req, res) => {
    const { licensePlate } = req.body;
    const record = parkingRecords.find(r => r.licensePlate === licensePlate && !r.exitTime);
    if (!record) {
        return res.render('exit', { receipt: null, message: 'Vehículo no encontrado en el estacionamiento.' });
    }
    const exitTime = new Date();
    const durationMs = exitTime - record.entryTime;
    const durationHours = Math.ceil(durationMs / (1000 * 60 * 60)); // Redondear hacia arriba
    const ratePerHour = 1500; // Por ejemplo, $5 por hora
    const amount = durationHours * ratePerHour;
    record.exitTime = exitTime;
    record.amount = amount;
    res.render('receipt', { record });
});

// Cerrar sesión
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// Ruta raíz
app.get('/', (req, res) => {
    res.redirect('/login');
});

// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});

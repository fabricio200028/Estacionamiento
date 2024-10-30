const express = require('express');
const path = require('path');
const app = express();

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));



// Dependencias
const express = require('express');
const router = express.Router();
const db = require('./db'); // Módulo para interactuar con la base de datos

// Página principal
router.get('/', async (req, res) => {
    const tarifas = await db.query('SELECT * FROM Tarifas');
    const espaciosDisponibles = await db.query("SELECT * FROM EspaciosEstacionamiento WHERE estado = 'Disponible'");
    const espaciosEstacionamiento = await db.query('SELECT * FROM EspaciosEstacionamiento');

    res.render('index', {
        tarifas,
        espaciosDisponibles,
        espaciosEstacionamiento
    });
});

// Registrar entrada
router.post('/entrada', async (req, res) => {
    // Lógica para registrar la entrada del vehículo
    // ...
    res.redirect('/');
});

// Registrar salida
router.post('/salida', async (req, res) => {
    // Lógica para registrar la salida del vehículo
    // ...
    res.redirect('/');
});

// Ver historial
router.get('/historial', async (req, res) => {
    const matricula = req.query.matricula;
    const historialMovimientos = await db.query(`
        SELECT m.*, e.numero_espacio
        FROM Movimientos m
        JOIN EspaciosEstacionamiento e ON m.espacio_id = e.espacio_id
        JOIN Vehiculos v ON m.vehiculo_id = v.vehiculo_id
        WHERE v.matricula = ?
        ORDER BY m.entrada DESC
    `, [matricula]);

    res.render('index', {
        historialMovimientos,
        historialMatricula: matricula
        // Asegúrate de pasar también las otras variables necesarias
    });
});

module.exports = router;

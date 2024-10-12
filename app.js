const express = require('express');
const mysql = require('mysql');
const path = require('path');
const app = express();

// Configuración de base de datos
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Cambia si usas otro usuario
  password: '', // Coloca tu contraseña si es necesario
  database: 'parking_db'
});

db.connect(err => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
    return;
  }
  console.log('Conectado a la base de datos MySQL');
});

// Middleware para manejar JSON y formularios
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Servir archivos estáticos (HTML)
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para manejar el registro de vehículos
app.post('/register', (req, res) => {
  const { patente, horarioEntrada, horarioSalida, tipoVehiculo } = req.body;

  const query = `INSERT INTO registros (patente, horarioEntrada, horarioSalida, tipoVehiculo) VALUES (?, ?, ?, ?)`;
  db.query(query, [patente, horarioEntrada, horarioSalida, tipoVehiculo], (err, result) => {
    if (err) {
      console.error('Error al registrar vehículo:', err);
      res.status(500).send('Error en el servidor');
      return;
    }
    res.send('Vehículo registrado exitosamente');
  });
});

// Configuración de puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

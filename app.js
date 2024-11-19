// app.js

const express = require('express');
const app = express();
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const easyinvoice = require('easyinvoice');

// Configuración de la conexión a la base de datos
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',       // Reemplaza con tu usuario de MySQL
  password: '',       // Reemplaza con tu contraseña de MySQL
  database: 'estacionamiento'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Conectado a la base de datos MySQL');
});

// Configuraciones de middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'tu_secreto', // Reemplaza con una cadena secreta
  resave: false,
  saveUninitialized: true
}));
app.set('view engine', 'ejs');

// Configuración de la carpeta de vistas
app.set('views', path.join(__dirname, 'views'));

// Servir archivos estáticos (para CSS y otros recursos)
app.use(express.static(path.join(__dirname, 'public')));

// Funciones middleware para verificar autenticación y roles
function verificarAutenticacion(req, res, next) {
  if (req.session.loggedin) {
    next();
  } else {
    res.redirect('/login');
  }
}

function verificarAdmin(req, res, next) {
  if (req.session.loggedin && req.session.usuario.tipo_usuario === 'admin') {
    next();
  } else {
    res.redirect('/inicio');
  }
}

// Ruta GET para mostrar el formulario de registro
app.get('/register', (req, res) => {
  res.render('register');
});

// Ruta POST para procesar el registro
app.post('/register', (req, res) => {
  const { nombre, email, contraseña, domicilio, dni } = req.body;
  const tipo_usuario = 'cliente'; // Por defecto, los nuevos usuarios son clientes

  // Verificar que el DNI no esté ya registrado
  db.query('SELECT * FROM usuarios WHERE dni = ?', [dni], (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      res.send('El DNI ya está registrado. Por favor, verifica tus datos.');
    } else {
      bcrypt.hash(contraseña, 10, (err, hash) => {
        if (err) throw err;
        db.query(
          'INSERT INTO usuarios (nombre, email, contraseña, tipo_usuario, domicilio, dni) VALUES (?, ?, ?, ?, ?, ?)',
          [nombre, email, hash, tipo_usuario, domicilio, dni],
          (err, result) => {
            if (err) throw err;
            res.redirect('/login');
          }
        );
      });
    }
  });
});

// Ruta GET para mostrar el formulario de login
app.get('/login', (req, res) => {
  res.render('login');
});

// Ruta POST para procesar el login
app.post('/login', (req, res) => {
  const { email, contraseña } = req.body;

  db.query('SELECT * FROM usuarios WHERE email = ?', [email], (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      bcrypt.compare(contraseña, results[0].contraseña, (err, isMatch) => {
        if (err) throw err;
        if (isMatch) {
          req.session.loggedin = true;
          req.session.usuario = results[0];
          res.redirect('/inicio');
        } else {
          res.send('Contraseña incorrecta');
        }
      });
    } else {
      res.send('Usuario no encontrado');
    }
  });
});

// Ruta GET para la página de inicio
app.get('/inicio', verificarAutenticacion, (req, res) => {
  if (req.session.usuario.tipo_usuario === 'admin') {
    // Redirigir al panel de administración
    res.redirect('/admin');
  } else {
    // Redirigir a la vista del cliente
    res.redirect('/cliente');
  }
});

// Ruta GET para el panel de administración
app.get('/admin', verificarAdmin, (req, res) => {
  const query = `
      SELECT registros.*, usuarios.nombre AS nombre_usuario, usuarios.dni AS dni_usuario
      FROM registros
      JOIN usuarios ON registros.id_usuario = usuarios.id
  `;
  db.query(query, (err, registros) => {
    if (err) throw err;
    res.render('admin', { usuario: req.session.usuario, registros: registros });
  });
});

// Ruta GET para crear un nuevo registro
app.get('/admin/nuevo-registro', verificarAdmin, (req, res) => {
  res.render('nuevo-registro');
});

// Ruta POST para procesar la creación de un nuevo registro
app.post('/admin/nuevo-registro', verificarAdmin, (req, res) => {
  const { dni, hora_entrada } = req.body;

  // Buscar al usuario por DNI
  db.query('SELECT id FROM usuarios WHERE dni = ?', [dni], (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      const id_usuario = results[0].id;
      db.query('INSERT INTO registros (id_usuario, hora_entrada) VALUES (?, ?)',
        [id_usuario, hora_entrada],
        (err, result) => {
          if (err) throw err;
          res.redirect('/admin');
        });
    } else {
      res.send('No se encontró un usuario con ese DNI.');
    }
  });
});

// Ruta GET para editar un registro existente
app.get('/admin/editar-registro/:id', verificarAdmin, (req, res) => {
  const id_registro = req.params.id;
  db.query('SELECT * FROM registros WHERE id = ?', [id_registro], (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      res.render('editar-registro', { registro: results[0] });
    } else {
      res.send('Registro no encontrado');
    }
  });
});

// Ruta POST para actualizar un registro existente
app.post('/admin/editar-registro/:id', verificarAdmin, (req, res) => {
  const id_registro = req.params.id;
  const { hora_entrada, hora_salida } = req.body;
  db.query('UPDATE registros SET hora_entrada = ?, hora_salida = ? WHERE id = ?',
    [hora_entrada, hora_salida || null, id_registro],
    (err, result) => {
      if (err) throw err;
      res.redirect('/admin');
    });
});

// Ruta GET para eliminar un registro
app.get('/admin/eliminar-registro/:id', verificarAdmin, (req, res) => {
  const id_registro = req.params.id;
  db.query('DELETE FROM registros WHERE id = ?', [id_registro], (err, result) => {
    if (err) throw err;
    res.redirect('/admin');
  });
});

// Ruta GET para la vista del cliente
app.get('/cliente', verificarAutenticacion, (req, res) => {
  if (req.session.usuario.tipo_usuario === 'cliente') {
    db.query('SELECT * FROM registros WHERE id_usuario = ?', [req.session.usuario.id], (err, registros) => {
      if (err) throw err;
      res.render('cliente', { usuario: req.session.usuario, registros: registros });
    });
  } else {
    res.redirect('/inicio');
  }
});

const { promisify } = require('util');

// Convertir db.query a promesa
const query = promisify(db.query).bind(db);

// Ruta GET para mostrar el comprobante al cliente en formato PDF
app.get('/cliente/comprobante/:id', verificarAutenticacion, async (req, res) => {
    const id_registro = req.params.id;

    try {
        // Obtener el registro del usuario actual
        const registros = await query('SELECT * FROM registros WHERE id = ? AND id_usuario = ?', [id_registro, req.session.usuario.id]);

        if (registros.length > 0) {
            const registro = registros[0];

            if (registro.hora_salida) {
                const hora_entrada = new Date(registro.hora_entrada);
                const hora_salida = new Date(registro.hora_salida);
                const monto = registro.monto;

                // Obtener datos del usuario
                const usuarios = await query('SELECT nombre, domicilio, dni FROM usuarios WHERE id = ?', [req.session.usuario.id]);

                if (usuarios.length > 0) {
                    const usuarioData = usuarios[0];
                    const nombre_usuario = usuarioData.nombre;
                    const domicilio = usuarioData.domicilio;
                    const dni = usuarioData.dni;

                    // Preparar los datos para la factura
                    const data = {
                        "documentTitle": "Comprobante de Pago",
                        "currency": "ARS",
                        "taxNotation": "vat",
                        "marginTop": 25,
                        "marginRight": 25,
                        "marginLeft": 25,
                        "marginBottom": 25,
                        "logo": "", // Si tienes un logo, puedes agregar la URL aquí
                        "sender": {
                            "company": "PARKING PLUS",
                            "address": "Av. San Martín 2458",
                            "zip": "CP 5500",
                            "city": "Mendoza - Ciudad",
                            "country": "Argentina"
                        },
                        "client": {
                            "company": nombre_usuario,
                            "address": domicilio,
                            "zip": "",
                            "city": "Mendoza - Argentina",
                            "country": "",
                            "custom1": `DNI: ${dni}`
                        },
                        "invoiceNumber": registro.id.toString(),
                        "invoiceDate": hora_salida.toISOString().split('T')[0],
                        "products": [
                            {
                                "quantity": 1,
                                "description": "Servicio de Estacionamiento",
                                "tax": 0,
                                "price": monto
                            }
                        ],
                        "bottomNotice": "Gracias por utilizar nuestros servicios."
                    };

                    try {
                        // Generar el PDF
                        const result = await easyinvoice.createInvoice(data);
                        // Enviar el PDF al cliente
                        res.setHeader('Content-Type', 'application/pdf');
                        res.setHeader('Content-Disposition', `attachment; filename=comprobante_${registro.id}.pdf`);
                        res.send(Buffer.from(result.pdf, 'base64'));
                    } catch (error) {
                        console.error('Error al generar el comprobante:', error);
                        res.status(500).send('Error al generar el comprobante.');
                    }
                } else {
                    res.send('Usuario no encontrado.');
                }
            } else {
                res.send('La salida aún no ha sido registrada para este registro.');
            }
        } else {
            res.send('Registro no encontrado.');
        }
    } catch (error) {
        console.error('Error al generar el comprobante:', error);
        res.status(500).send('Error interno del servidor.');
    }
});


// Ruta POST para registrar la salida desde el panel de administración
app.post('/admin/registrar-salida', verificarAdmin, (req, res) => {
  const { id_registro } = req.body;
  const hora_salida = new Date();

  db.query('SELECT hora_entrada FROM registros WHERE id = ?', [id_registro], (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      const hora_entrada = new Date(results[0].hora_entrada);
      const tiempoEstadia = (hora_salida - hora_entrada) / (1000 * 60 * 60); // Calcula el tiempo en horas
      const monto = calcularMonto(tiempoEstadia);

      db.query('UPDATE registros SET hora_salida = ?, monto = ? WHERE id = ?',
        [hora_salida, monto, id_registro],
        (err, result) => {
          if (err) throw err;
          // Opcional: Mostrar el comprobante al administrador
          res.redirect('/admin');
        });
    } else {
      res.send('Registro no encontrado');
    }
  });
});

function calcularMonto(tiempoEstadia) {
  const tarifaPorHora = 2000; 
  return tarifaPorHora * Math.ceil(tiempoEstadia);
}

// Cerrar sesión
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// Iniciar el servidor
app.listen(3000, () => {
  console.log('Servidor iniciado en el puerto 3000');
});

// Middleware para registrar las peticiones (opcional)
app.use((req, res, next) => {
  console.log(`Petición: ${req.method} ${req.url}`);
  next();
});

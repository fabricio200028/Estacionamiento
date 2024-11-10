import express from "express";
import dotenv from "dotenv";
import mysql from 'mysql2';
import nodemon from "nodemon";
import morgan from "morgan";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { pool } from './db.js';

// Importar rutas
import customerRouter from "./router/customer.routes.js";
import authRouter from "./router/auth.routes.js";

const app = express();

// Cargar las variables de entorno
dotenv.config();

// Obtener el nombre de los archivos actuales y su dirección
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuración de la app
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));

// Configuración de la base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: '',
    database: 'parking_db'
});

// Middleware
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));

// Archivos estáticos
app.use(express.static(join(__dirname, "public")));

// Usar las rutas
app.use(customerRouter);
app.use(authRouter);

// Iniciar el servidor
app.listen(app.get('port'), () => {
    console.log(`Server on port ${app.get('port')}`);
});

import express from "express";
import dotenv from "dotenv";
import mysql from 'mysql2';
import nodemon from "nodemon";
import morgan from "morgan";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { pool } from './db.js';


//import rutas
import customerRouter from "./router/customer.routes.js";
import authRouter from "./router/auth.routes.js";

const app = express()

//cargar las variables de entorno
dotenv.config();

//Obtener el nombre de los archivos actuales y su dirección
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename) 

//setting
app.set('port', process.env.PORT || 3000); // uso .env en el port
app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'))

//Configuración base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: '',
    database: 'parking_db'
})

//middlerware
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }))

// static files
app.use(express.static(join(__dirname, "public")));

//Router
app.use(customerRouter);
app.use(authRouter);


// Servidor
app.listen(app.get('port'), () => {
    console.log(`Server on port ${app.get('port')}`);
})



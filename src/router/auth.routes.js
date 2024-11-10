import express from "express";
import { pool } from "../db.js";
import { authLogin, registerUser } from "../controllers/authController.js";

const router = express.Router();

// Rutas de Login
router.get("/login", (req, res) => {
    res.render("login");
});

// POST Login con función `authLogin`
router.post("/login", authLogin); 

// Rutas de Registro
router.get("/register", (req, res) => {
    res.render("register");
});

// POST Registro de usuario
router.post("/register", async (req, res) => {
    const { nombre, email, patente, tipo_veiculo, nombre_usuario, password } = req.body;

    try {
        // Intentar insertar el nuevo usuario en la base de datos
        const [result] = await pool.query(
            `INSERT INTO usuarios (nombre, email, patente, tipo_veiculo, nombre_usuario, password) VALUES (?, ?, ?, ?, ?, ?)`,
            [nombre, email, patente, tipo_veiculo, nombre_usuario, password]
        );

        // Redireccionar a la página de login o mostrar un mensaje de éxito
        res.redirect("/login");
    } catch (error) {
        console.error("Error en el registro:", error.message); // Mensaje de error detallado
        res.status(500).send("Error en el registro");
    }
});

// Dashboard o página principal después del login exitoso
router.get("/index", (req, res) => {
    res.render("index");
});

export default router;

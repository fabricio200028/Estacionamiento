import { pool } from "../db.js";

//login
export const authLogin = async (req, res) => {
    console.log('El login funciona')
    const { Gmail,username, password } = req.body;
    console.log(username, password)

    try {
        // Consulta a la base de datos para verificar las credenciales
        const [users] = await pool.query('SELECT * FROM users WHERE Gmail = ? AND username = ? AND password = ?', [Gmail, username, password]);

        if (users.length > 0) {
            // Si el usuario existe y las credenciales son correctas
            console.log('Login successful!');
            res.redirect("/customer");
        } else {
            // Si no coinciden las credenciales
            console.log('Invalid credentials');
            res.redirect("login");
        }
    } catch (error) {
        console.error('Error during login:', error);
    }
}

//register
export const registerUser = async (req, res) => {
    console.log('El register funciona')
    const { username, password, confirmPassword } = req.body;

    // Validar si las contraseñas coinciden
    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Las contraseñas no coinciden." });
    }

    try {
        // Guardar el usuario en la base de datos
        const [rows] = await pool.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, password]);
        // Responder con éxito
        return res.redirect('/customers');
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al registrar el usuario." });
    }
};
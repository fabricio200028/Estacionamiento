import { Router } from "express";
import { authLogin } from "../controllers/authController.js";
import { registerUser} from '../controllers/authController.js';

const router = Router();

//Login
router.get("/login", (req, res) =>{
    res.render('login');
})

router.post("/login", authLogin); 

//Register
router.get('/register', (req, res) => {
    res.render('register'); // Renderiza la plantilla register.ejs
});

router.post('/register', registerUser);

router.get('/index', (req, res) => {
    res.render('index'); // `locations` es el nombre del archivo .ejs sin la extensión
});

export default router

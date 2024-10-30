import { Router } from "express";
import { renderCustomers, createCustomers, deleteCustomer, editCustomer, updateCustomer} from "../controllers/customerController.js";
import { authLogin } from "../controllers/authController.js";
const router = Router();


//CRUD
router.get("/customers", renderCustomers);
router.post("/add", createCustomers);
router.get("/delete/:id", deleteCustomer);
router.get("/update/:id", editCustomer);
router.post("/update/:id", updateCustomer);

router.get("/index", (req, res)=>{
    res.render('index')
})

export default router
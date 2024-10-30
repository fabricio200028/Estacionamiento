import { pool } from "../db.js";

export const renderCustomers = async(req, res) => {
   const [row] =  await pool.query("SELECT * FROM reservas");
   res.render("customers", {customers: row});
}

export const createCustomers = (req, res) => {
   console.log('Esta entrando al metodo')
   const newCustomer = req.body;
   console.log(newCustomer)
   pool.query("INSERT INTO reservas set ?", [newCustomer])
   res.redirect("/customer")
}

export const deleteCustomer = async (req, res) => {
   console.log('Se eliminar!!!')
   const { id } = req.params;
   const result = await pool.query("DELETE FROM reservas WHERE idReservas = ? ", [id])
   if(result.affectedRows === 1){
      res.json({ message: "Customer Eliminado"})
   }
   res.redirect("/customer")
}

export const editCustomer = async (req, res) => {
   console.log('Este metodo es para editar')
   const { id } = req.params;
   const [result] = await pool.query("SELECT * FROM reservas WHERE idReservas = ?", [id,] );
   res.render("customers_edit", { customer: result[0]})
}

export const updateCustomer = async (req, res) => {
   const {id} = req.params;
   const updateCustomer =  req.body;
   await pool.query("UPDATE reservas set ? WHERE idReservas = ? ", [updateCustomer, id]);
   res.redirect("/customer")
}





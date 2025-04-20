import express from "express";
import bcrypt from "bcrypt"; // Para verificar la contraseña
import { generarToken } from "../controllers/auth.js";
import Clientes from "../classes/Clientes.js";


const router = express.Router();

router.post("/", async (req, res) => {
    const { email, password } = req.body;


    const clientes = new Clientes();
    await clientes.conectar();
    const cliente = await clientes.buscar(email);

    //if (!cliente || !(await bcrypt.compare(password, cliente.password))) {
    if (!cliente || password!=cliente.password) {
        
        return res.status(401).json({ mensaje: "Credenciales inválidas" });
    }

    const token = generarToken(cliente);
    res.json({ token });
});

export default router;
import express from "express";
import bcrypt from "bcrypt"; // Para verificar la contraseña de forma segura
import { generarToken } from "../controllers/auth.js";
import Clientes from "../classes/Clientes.js";

const router = express.Router();

/**
 * Endpoint POST /
 * Autentica al cliente con email y contraseña.
 * 
 * Requiere en el cuerpo:
 * - email: correo del cliente
 * - password: contraseña en texto plano
 * 
 * Respuestas:
 * - 200: Devuelve el cliente con token si las credenciales son válidas
 * - 401: Si el email no existe o la contraseña es incorrecta
 */
router.post("/", async (req, res) => {
    const { email, password } = req.body;

    const clientes = new Clientes();
    await clientes.conectar();
    const cliente = await clientes.buscar(email);

    
    if (!cliente || password !== cliente.password) {
        return res.status(401).json({ mensaje: "Credenciales inválidas" });
    }

    // Genera token y lo asigna al cliente
    const token = generarToken(cliente);
    cliente.autorizar(token);

    // Devuelve el cliente con el token
    res.json({ cliente });
});

export default router;
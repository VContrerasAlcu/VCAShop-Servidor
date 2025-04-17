import express from "express";
import bcrypt from "bcrypt"; // Para verificar la contraseña
import { generarToken } from "./auth.js";

const router = express.Router();

// Simulación de base de datos de usuarios
const usuarios = [{ id: 1, email: "vicente@email.com", password: "$2b$10$hashEjemplo" }]; // Contraseña encriptada

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const usuario = usuarios.find(u => u.email === email);

    if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
        return res.status(401).json({ mensaje: "Credenciales inválidas" });
    }

    const token = generarToken(usuario);
    res.json({ token });
});

export default router;
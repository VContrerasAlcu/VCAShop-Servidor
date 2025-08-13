import express from "express";
import { verificarToken } from "../controllers/verificarToken.js";

const router = express.Router();

/**
 * Endpoint GET /compra
 * Verifica si el usuario está autenticado mediante token.
 * 
 * Requiere:
 * - Token JWT válido (verificado por el middleware verificarToken)
 * 
 * Respuestas:
 * - 200: Si el token es válido, confirma la compra y devuelve los datos del usuario
 * - 401: Si el token es inválido, el middleware debe manejar el error
 */
router.get("/compra", verificarToken, (req, res) => {
    res.json({ mensaje: "Compra validada", usuario: req.user });
});

export default router;
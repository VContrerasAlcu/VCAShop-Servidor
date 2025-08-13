import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY;

/**
 * Genera un token JWT para un cliente autenticado.
 * @param {object} cliente - Objeto con email y password del cliente.
 * @returns {string} Token JWT válido por 1 hora.
 */
export function generarToken(cliente) {
    return jwt.sign(
        { email: cliente.email, password: cliente.password },
        SECRET_KEY,
        { expiresIn: "1h" }
    );
}

/**
 * Genera un token JWT de verificación temporal.
 * @param {string} email
 * @param {string} password
 * @returns {string} Token válido por 5 minutos.
 */
export function generarTokenVerificacion(email, password) {
    return jwt.sign(
        { email, password },
        SECRET_KEY,
        { expiresIn: "5m" }
    );
}

/**
 * Verifica si un token es válido.
 * @param {string} token
 * @returns {object} Resultado con éxito y datos o mensaje de error.
 */
export function verificarToken(token) {
    try {
        const datos = jwt.verify(token, SECRET_KEY);
        return { exito: true, datos };
    } catch (error) {
        return { exito: false, mensaje: 'Token no válido o expirado' };
    }
}
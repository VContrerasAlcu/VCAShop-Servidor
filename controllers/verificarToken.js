import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY;

/**
 * Verifica si un token JWT es válido y lo decodifica.
 * @param {string} token - Token JWT que se desea verificar.
 * @returns {object} Resultado con éxito y datos decodificados, o mensaje de error.
 */
export function verificarToken(token) {
    try {
        // Intenta verificar y decodificar el token usando la clave secreta
        const decoded = jwt.verify(token, SECRET_KEY);

        // Muestra en consola el email decodificado para fines de depuración
        console.log(`estoy dentro de verificarToken. decoded: ${decoded.email}`);

        // Devuelve un objeto indicando éxito y los datos decodificados
        return { exito: true, datos: decoded };  
    } catch (err) {
        // Si el token es inválido o ha expirado, devuelve un mensaje de error
        return { exito: false, mensaje: "Token inválido" };
    }
}
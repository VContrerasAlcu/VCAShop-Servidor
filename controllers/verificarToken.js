import jwt from "jsonwebtoken";

const SECRET_KEY = "clave_super_segura";

export function verificarToken(token) {
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        console.log(`estoy dentro de verificarToken. decoded: ${decoded.email}`);
        return { exito: true, datos: decoded };  
    } catch (err) {
        return { exito: false, mensaje: "Token inválido" };
    }
}

import jwt from "jsonwebtoken";

const SECRET_KEY = "clave_super_segura"; // 🔑 Usa variables de entorno en producción

export function generarToken(usuario) {
    return jwt.sign({ id: usuario.id, email: usuario.email }, SECRET_KEY, { expiresIn: "1h" });
}
import jwt from "jsonwebtoken";

const SECRET_KEY = "clave_super_segura";

export function verificarToken(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ mensaje: "No autorizado" });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ mensaje: "Token inválido" });
        req.user = decoded;
        next();
    });
}
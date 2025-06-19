import jwt from "jsonwebtoken";

const SECRET_KEY = "clave_super_segura"; 

export function generarToken(cliente) {
    return jwt.sign({ email: cliente.email, password: cliente.password }, SECRET_KEY, { expiresIn: "1h" });
}

export function generarTokenVerificacion(email, password){
    return jwt.sign({email: email, password: password}, SECRET_KEY, {expiresIn: "5m"})
}

export function verificarToken(token){
    try{
        const datos = jwt.verify(token, SECRET_KEY);
        return {exito: true, datos: datos};
    }
    catch (error){
        return {exito: false, mensaje: 'Token no válido o expirado'};
    }
}
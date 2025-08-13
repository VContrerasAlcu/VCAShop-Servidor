import express from 'express';
import Carros from '../classes/Carros.js';
import Carro from '../classes/Carro.js';
import { verificarToken } from '../controllers/auth.js';

const router = express.Router();

/**
 * Endpoint POST /cargar
 * Carga los datos del carro asociado al cliente autenticado.
 * 
 * Requiere en el cuerpo:
 * - email: correo del cliente
 * - token: JWT de autenticación
 * 
 * Respuestas:
 * - 200: Devuelve los datos del carro si el token es válido
 * - 400: Si el token es inválido o no autorizado
 * - 500: Si ocurre un error interno al consultar los datos
 */
router.post('/cargar', async (req, res) => {
    const cliente = req.body;
    console.log(`recibido cliente en endpoint cargar: ${cliente.email}`);

    // Verifica si el token es válido
    if (verificarToken(cliente.token).exito) {
        const carros = new Carros();
        await carros.conectar();

        try {
            // Busca el carro asociado al email del cliente
            const carro = await carros.carro(cliente.email);
            console.log(`dentro del endpoint cargar, resultado de carros.carro: ${carro}`);

            // Devuelve los datos del carro
            res.status(200).json(carro);
        } catch (err) {
            // Error interno al consultar los datos
            res.status(500).json({ error: 'Error interno en el servidor' });
        }
    } else {
        // Token inválido o no autorizado
        res.status(400).json({ error: 'No autorizado' });
    }
});

export default router;
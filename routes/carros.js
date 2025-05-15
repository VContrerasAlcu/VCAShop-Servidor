import express from 'express';
import {Carros} from '../classes/Carros.js';
import { verificarToken } from '../controllers/auth.js';


const router = express.Router();

export default (io) => {
    const listaClientes = {};
    io.on('connection', (socket) => {
        socket.on('registro', (emailCliente) => {
            console.log('cliente conectado con email: ', emailCliente);
            listaClientes[emailCliente] = socket.id;
        });

        socket.on('disconnect', () => {
            const email = Object.keys(listaClientes).find(key => listaClientes[key] == socket.id);
            delete(listaClientes[email]);

        });
    });
    router.post('/cargar', async (req,res) => {
        const {cliente} = req.body;
        if (verificarToken(cliente.token).exito){
            const carros = new Carros();
            try {
                const carro = await carros.carro(cliente.email);
                res.status(200).json({carro});
            }
            catch (err){
                res.status(500).json({error:'Error interno en el servidor'})
            }
        }

        else {
            res.status(400).json({error:'No autorizado'})
        }
       
       
    
    })

    return router;

}

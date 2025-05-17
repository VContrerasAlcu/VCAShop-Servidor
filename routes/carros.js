import express from 'express';
import Carros from '../classes/Carros.js';
import Carro from '../classes/Carro.js';
import { verificarToken } from '../controllers/auth.js';


const router = express.Router();

export default (io, listaClientes) => {
    
    
    router.post('/cargar', async (req,res) => {
        const cliente = req.body;
        if (verificarToken(cliente.token).exito){
            const carros = new Carros();
            carros.conectar();
            try {
                const carro = await carros.carro(cliente.email);
                res.status(200).json(carro);
            }
            catch (err){
                res.status(500).json({error:'Error interno en el servidor'})
            }
        }

        else {
            res.status(400).json({error:'No autorizado'})
        }
       
       
    
    })
    io.on('agregar', async (data) => {
        const cliente = data.cliente;
        let respuesta = false;
        if (verificarToken(cliente.token).exito){
            const carros = new Carros();
            await carros.conectar();
            const carro = await carros.carro(cliente.email);
            const result = await carro.agregar(data.producto,data.cantidad);
            if (result){
                await carros.agregarCarro(cliente.email, carro);
                respuesta = carro;                
            }
          
        }
        io.to(listaClientes[cliente.email]).emit('respuesta_agregar',respuesta);
    })

        io.on('quitar', async (data) => {
        const cliente = data.cliente;
        let respuesta = false;
        if (verificarToken(cliente.token).exito){
            const carros = new Carros();
            await carros.conectar();
            const carro = await carros.carro(cliente.email);
            const result = await carro.quitar(data.producto,data.cantidad);
            if (result){
                await carros.agregarCarro(cliente.email, carro);
                respuesta = carro;                
            }
          
        }
        io.to(listaClientes[cliente.email]).emit('respuesta_quitar',respuesta);
    })

    io.on('vaciar', async (data) => {
        const cliente = data.cliente;
        let respuesta = false;
        if (verificarToken(cliente.token).exito){
            const carros = new Carros();
            await carros.conectar();
            const carro = await carros.carro(cliente.email);
            const result = carro.vaciar();
            if (result){
                respuesta = await carros.agregarCarro(cliente.email, carro);

            }            
        }
        io.to(listaClientes[cliente.email]).emit('respuesta_vaciar', respuesta);

    })



    return router;

}

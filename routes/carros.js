import express from 'express';
import Carros from '../classes/Carros.js';
import Carro from '../classes/Carro.js';
import { verificarToken } from '../controllers/auth.js';


const router = express.Router();

router.post('/cargar', async (req,res) => {
        const cliente = req.body;
        console.log(`recibido cliente en endpoint cargar: ${cliente.email}`);
        if (verificarToken(cliente.token).exito){
            const carros = new Carros();
            await carros.conectar();
            try {
                const carro = await carros.carro(cliente.email);
                console.log(`dentro del endpoint cargar, resultado de carros.carro: ${carro}`);
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
    
    



export default router;

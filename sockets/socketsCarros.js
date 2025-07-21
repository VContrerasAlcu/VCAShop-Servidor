import Carros from '../classes/Carros.js';
import Carro from '../classes/Carro.js'
import { verificarToken } from '../controllers/auth.js';

export function socketCarro(io,socket) {
    console.log('estoy en socketscarros');

    socket.on('agregar', async (data) => {
        console.log('recibido el socket agregar en el servidor');
        const cliente = data.cliente;
        let respuesta = false;
       
        
        if (verificarToken(cliente.token).exito){
            
            
            const carros = new Carros();
            await carros.conectar();
            
    
            const carro = new Carro(await carros.carro(cliente.email));
            console.log(`carro antes de agregar: ${carro.cargar()}`);
            const result = await carro.agregar(data.producto,data.cantidad);
            
            console.log(`carro después de agregar: ${carro.cargar()[0].producto.nombre}`);
            if (result!==false){
                console.log(`antes del emit. ${data.producto.nombre}, ${data.producto.stock}`);
                socket.emit('stock_actualizado', result);
                if (await carros.existeCarro(cliente.email)){
                    console.log(`el carro del cliente existe`);
                    const NuevoCarro = carros.actualizar(cliente.email,carro.cargar());
                    console.log(`carro actualizado: ${NuevoCarro}`);
                }
                else {
                    console.log(`el carro del cliente no existe`);
                    await carros.agregarCarro(cliente.email, carro.cargar());

                }
                respuesta = carro.cargar();
                console.log(`carro enviado a respuesta agregar: ${respuesta[0].producto.nombre}`);

            }
            await carros.desconectar();
            
        
        }
        
        socket.emit('respuesta_agregar',respuesta);
    })

    socket.on('quitar', async (data) => {
        console.log('recibido el socket quitar en el servidor');
        const cliente = data.cliente;
        let respuesta = false;
       
        
        if (verificarToken(cliente.token).exito){
            
            
            const carros = new Carros();
            await carros.conectar();
            
    
            const carro = new Carro(await carros.carro(cliente.email));
            console.log(`carro antes de quitar: ${carro.cargar()}`);
            const result = await carro.quitar(data.producto);
            
            if (carro.cargar().length > 0) {
                console.log(`Carro después de quitar: ${carro.cargar()[0].producto.nombre}`);
            } else {
                console.log("El carrito está vacío después de quitar.");
            }
            if (result!==false){
                console.log(`antes del emit. ${data.producto.nombre}, ${data.producto.stock}`);
                socket.emit('stock_actualizado', result);
                if (await carros.existeCarro(cliente.email)){
                    console.log(`el carro del cliente existe`);
                    await carros.actualizar(cliente.email,carro.cargar());
                }
                else {
                    console.log(`el carro del cliente no existe`);
                    await carros.agregarCarro(cliente.email, carro.cargar());

                }
                respuesta = carro.cargar();
                //console.log(`carro enviado a respuesta agregar: ${respuesta[0].producto.nombre}`);

            }
            await carros.desconectar();
            
        
        }
        
        socket.emit('respuesta_quitar',respuesta);
    });

    socket.on('vaciar', async (data) => {
        const cliente = data.cliente;
        const carros = new Carros();
        await carros.conectar();
        const carroVaciado = await carros.vaciar(cliente.email);
        console.log(`estoy en socket vaciar, email= ${cliente.email}, carroVaciado = ${carroVaciado}`);
        socket.emit('respuesta_vaciar', carroVaciado);

    })

}